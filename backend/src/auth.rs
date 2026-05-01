use std::env;
use std::sync::OnceLock;

use anyhow::Context;
use async_once_cell::OnceCell;
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    RequestPartsExt,
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use jsonwebtoken::{jwk::JwkSet, Algorithm, DecodingKey, Validation};
use serde::{de::DeserializeOwned, Deserialize};

struct AuthConfig {
    issuer: String,
    audiences: Vec<String>,
    jwk_set: JwkSet,
}

// TODO: Trader role not currently used
#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
#[serde(tag = "key")]
pub enum Role {
    #[serde(rename = "admin")]
    Admin,
    #[serde(rename = "trader")]
    Trader,
}

#[derive(Debug, Clone)]
pub struct AccessClaims {
    /// Caller identity. Kinde user tokens carry `sub` (the user's kinde_id);
    /// Kinde M2M tokens omit `sub` and instead identify the calling app via
    /// `azp` (authorized party = client_id). We accept either, preferring
    /// `sub` when both are present (real user tokens often carry both).
    pub sub: String,
    pub roles: Vec<Role>,
    /// Email from the token (populated in dev-mode test tokens; not present in real JWTs)
    pub email: Option<String>,
}

impl<'de> Deserialize<'de> for AccessClaims {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        #[derive(Deserialize)]
        struct Raw {
            #[serde(default)]
            sub: Option<String>,
            #[serde(default)]
            azp: Option<String>,
            #[serde(default)]
            roles: Vec<Role>,
            #[serde(default)]
            email: Option<String>,
        }
        let raw = Raw::deserialize(deserializer)?;
        let sub = raw
            .sub
            .filter(|s| !s.is_empty())
            .or(raw.azp)
            .ok_or_else(|| serde::de::Error::custom("token missing both `sub` and `azp` claims"))?;
        Ok(AccessClaims {
            sub,
            roles: raw.roles,
            email: raw.email,
        })
    }
}

#[derive(Debug, Deserialize)]
struct IdClaims {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub given_name: Option<String>,
    #[serde(default)]
    pub family_name: Option<String>,
    pub sub: String,
    #[serde(default)]
    pub email: Option<String>,
}

impl IdClaims {
    /// Best-effort display name from `id_token` claims. Prefers `name`, then
    /// `given_name` + `family_name` joined, ignoring empty values. Returns
    /// `None` when none of these claims yield a non-empty string.
    fn resolve_name(&self) -> Option<String> {
        if let Some(name) = self
            .name
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty())
        {
            return Some(name.to_owned());
        }
        let given = self
            .given_name
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty());
        let family = self
            .family_name
            .as_deref()
            .map(str::trim)
            .filter(|s| !s.is_empty());
        match (given, family) {
            (Some(g), Some(f)) => Some(format!("{g} {f}")),
            (Some(g), None) => Some(g.to_owned()),
            (None, Some(f)) => Some(f.to_owned()),
            (None, None) => None,
        }
    }
}

static AUTH_CONFIG: OnceCell<AuthConfig> = OnceCell::new();

/// Set of Kinde M2M application client IDs that should be granted the admin role.
/// Read once from the `KINDE_ADMIN_M2M_CLIENT_IDS` env var (comma-separated).
/// Empty when the env var is unset, which disables the allowlist entirely.
static ADMIN_M2M_CLIENT_IDS: OnceLock<Vec<String>> = OnceLock::new();

fn admin_m2m_client_ids() -> &'static [String] {
    ADMIN_M2M_CLIENT_IDS.get_or_init(|| {
        env::var("KINDE_ADMIN_M2M_CLIENT_IDS")
            .ok()
            .map(|raw| {
                raw.split(',')
                    .map(str::trim)
                    .filter(|s| !s.is_empty())
                    .map(String::from)
                    .collect()
            })
            .unwrap_or_default()
    })
}

/// Kinde M2M tokens have no `roles` claim, so admin-flagged service apps are
/// recognised by matching `sub` (the M2M client_id) against
/// `KINDE_ADMIN_M2M_CLIENT_IDS`. When matched, we inject the admin role so
/// downstream code (`is_kinde_admin`) treats the connection as admin without
/// caring whether it came from a user JWT or an M2M token.
fn apply_admin_m2m_allowlist(claims: AccessClaims) -> AccessClaims {
    apply_admin_m2m_allowlist_with(claims, admin_m2m_client_ids())
}

fn apply_admin_m2m_allowlist_with(mut claims: AccessClaims, allowlist: &[String]) -> AccessClaims {
    if allowlist.iter().any(|id| id == &claims.sub) && !claims.roles.contains(&Role::Admin) {
        claims.roles.push(Role::Admin);
    }
    claims
}

#[async_trait]
impl<S> FromRequestParts<S> for AccessClaims {
    type Rejection = Response;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let TypedHeader(Authorization(bearer)) = parts
            .extract::<TypedHeader<Authorization<Bearer>>>()
            .await
            .map_err(|_| {
                (StatusCode::UNAUTHORIZED, "Missing Authorization header").into_response()
            })?;
        let token = bearer.token();

        // Dev-mode: support test tokens for REST endpoints
        #[cfg(feature = "dev-mode")]
        if let Some(rest) = token.strip_prefix("test::") {
            let parts: Vec<&str> = rest.split("::").collect();
            if parts.len() >= 3 {
                let kinde_id = parts[0];
                let is_admin = parts[2].eq_ignore_ascii_case("true");
                let email = parts
                    .get(3)
                    .map(ToString::to_string)
                    .filter(|e| !e.is_empty());
                let mut roles = vec![Role::Trader];
                if is_admin {
                    roles.push(Role::Admin);
                }
                return Ok(AccessClaims {
                    sub: kinde_id.to_string(),
                    roles,
                    email,
                });
            }
        }

        let claims: AccessClaims = validate_jwt(token).await.map_err(|e| {
            tracing::error!("JWT validation failed: {:?}", e);
            (StatusCode::UNAUTHORIZED, "Bad JWT").into_response()
        })?;
        Ok(apply_admin_m2m_allowlist(claims))
    }
}

async fn validate_jwt<Claims: DeserializeOwned>(token: &str) -> anyhow::Result<Claims> {
    let auth_config = AUTH_CONFIG
        .get_or_try_init::<anyhow::Error>(async {
            let issuer = env::var("KINDE_ISSUER").context("Missing KINDE_ISSUER env var")?;
            let audiences = env::var("KINDE_AUDIENCE")
                .context("Missing KINDE_AUDIENCE env var")?
                .split(',')
                .map(String::from)
                .collect();
            let url = format!("{issuer}/.well-known/jwks.json");
            let jwk_set: JwkSet = reqwest::get(url)
                .await
                .context("Getting JWK set")?
                .json()
                .await
                .context("Parsing JWK set")?;
            tracing::info!("Auth module initialized");
            Ok(AuthConfig {
                issuer,
                audiences,
                jwk_set,
            })
        })
        .await?;
    let header = jsonwebtoken::decode_header(token)?;
    let Some(kid) = header.kid else {
        anyhow::bail!("Missing kid")
    };
    println!("kid: {kid:?}");
    println!("auth_config.jwk_set: {:?}", auth_config.jwk_set);
    let Some(jwk) = auth_config.jwk_set.find(&kid) else {
        anyhow::bail!("kid not in JwkSet")
    };
    let decoding_key = DecodingKey::from_jwk(jwk)?;
    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&auth_config.audiences);
    validation.set_issuer(&[&auth_config.issuer]);
    let token = jsonwebtoken::decode::<Claims>(token, &decoding_key, &validation)?;
    Ok(token.claims)
}

pub struct ValidatedClient {
    pub id: String,
    pub roles: Vec<Role>,
    pub name: Option<String>,
    pub email: Option<String>,
    /// Dev-mode override: if `Some(false)`, suppress the auto-add-as-cohort-member
    /// behavior so the connection authenticates as a non-member (public-auction guest).
    /// `None` means "no opinion" and the dev-mode auto-add applies normally.
    pub auto_join_cohort: Option<bool>,
}

/// # Errors
/// Fails if unable to get auth config, or if one of the tokens is invalid
pub async fn validate_access_and_id(
    access_token: &str,
    id_token: Option<&str>,
) -> anyhow::Result<ValidatedClient> {
    let access_claims: AccessClaims = validate_jwt(access_token).await?;
    let access_claims = apply_admin_m2m_allowlist(access_claims);
    let id_claims: Option<IdClaims> = if let Some(token) = id_token {
        validate_jwt(token).await?
    } else {
        None
    };
    if id_claims
        .as_ref()
        .is_some_and(|claims| claims.sub != access_claims.sub)
    {
        anyhow::bail!("sub mismatch");
    }
    Ok(ValidatedClient {
        auto_join_cohort: None,
        id: access_claims.sub,
        roles: access_claims.roles,
        email: id_claims.as_ref().and_then(|c| c.email.clone()),
        name: id_claims.as_ref().and_then(IdClaims::resolve_name),
    })
}

pub struct IdTokenInfo {
    pub name: Option<String>,
    pub email: Option<String>,
}

/// Validate an ID token and return its name and email if the subject matches `expected_sub`.
///
/// # Errors
/// Fails if the token is invalid or the subject does not match.
pub async fn validate_id_token_for_sub(
    id_token: &str,
    expected_sub: &str,
) -> anyhow::Result<IdTokenInfo> {
    #[cfg(feature = "dev-mode")]
    if id_token.starts_with("test::") {
        let test_client = validate_test_token(id_token)?;
        if test_client.id != expected_sub {
            anyhow::bail!("sub mismatch");
        }
        return Ok(IdTokenInfo {
            name: test_client.name,
            email: test_client.email,
        });
    }

    let id_claims: IdClaims = validate_jwt(id_token).await?;
    if id_claims.sub != expected_sub {
        anyhow::bail!("sub mismatch");
    }
    Ok(IdTokenInfo {
        name: id_claims.resolve_name(),
        email: id_claims.email,
    })
}

/// Test-only function to create a `ValidatedClient` from test credentials.
/// Token format: `test::<kinde_id>::<name>::<is_admin>[::<email>[::<join_cohort>]]`
/// Example: `test::user123::Test User::true`
/// Example with explicit guest mode: `test::guest1::Guest::false::::false`
///
/// # Errors
/// Returns an error if the token format is invalid.
#[cfg(feature = "dev-mode")]
pub fn validate_test_token(token: &str) -> anyhow::Result<ValidatedClient> {
    if !token.starts_with("test::") {
        anyhow::bail!("Invalid test token format");
    }

    let parts: Vec<&str> = token.split("::").collect();
    if parts.len() < 4 {
        anyhow::bail!(
            "Invalid test token format: expected test::<kinde_id>::<name>::<is_admin>[::<email>[::<join_cohort>]]"
        );
    }

    let kinde_id = parts[1].to_string();
    let name = parts[2].to_string();
    let is_admin = parts[3].parse::<bool>().unwrap_or(false);
    let email = parts
        .get(4)
        .map(ToString::to_string)
        .filter(|e| !e.is_empty());
    let auto_join_cohort = parts.get(5).and_then(|s| s.parse::<bool>().ok());

    let roles = if is_admin { vec![Role::Admin] } else { vec![] };

    Ok(ValidatedClient {
        id: kinde_id,
        roles,
        name: Some(name),
        email,
        auto_join_cohort,
    })
}

/// Wrapper that uses test bypass when feature is enabled.
/// # Errors
/// Fails if unable to validate the token.
#[cfg(feature = "dev-mode")]
pub async fn validate_access_and_id_or_test(
    access_token: &str,
    id_token: Option<&str>,
) -> anyhow::Result<ValidatedClient> {
    if access_token.starts_with("test::") {
        return validate_test_token(access_token);
    }
    validate_access_and_id(access_token, id_token).await
}

/// Wrapper that just calls the real validation when test feature is disabled.
/// # Errors
/// Fails if unable to validate the token.
#[cfg(not(feature = "dev-mode"))]
pub async fn validate_access_and_id_or_test(
    access_token: &str,
    id_token: Option<&str>,
) -> anyhow::Result<ValidatedClient> {
    validate_access_and_id(access_token, id_token).await
}

#[cfg(test)]
mod tests {
    use super::*;

    fn claims(sub: &str, roles: Vec<Role>) -> AccessClaims {
        AccessClaims {
            sub: sub.to_string(),
            roles,
            email: None,
        }
    }

    #[test]
    fn allowlist_grants_admin_to_matching_sub() {
        let allowlist = vec!["m2m_scenarios".to_string()];
        let result = apply_admin_m2m_allowlist_with(claims("m2m_scenarios", vec![]), &allowlist);
        assert!(result.roles.contains(&Role::Admin));
    }

    #[test]
    fn allowlist_leaves_non_matching_sub_unchanged() {
        let allowlist = vec!["m2m_scenarios".to_string()];
        let result = apply_admin_m2m_allowlist_with(claims("kinde_user_42", vec![]), &allowlist);
        assert!(!result.roles.contains(&Role::Admin));
    }

    #[test]
    fn allowlist_does_not_duplicate_admin_role() {
        let allowlist = vec!["m2m_scenarios".to_string()];
        let result = apply_admin_m2m_allowlist_with(
            claims("m2m_scenarios", vec![Role::Admin]),
            &allowlist,
        );
        let admin_count = result.roles.iter().filter(|r| **r == Role::Admin).count();
        assert_eq!(admin_count, 1);
    }

    #[test]
    fn empty_allowlist_grants_nothing() {
        let result = apply_admin_m2m_allowlist_with(claims("m2m_scenarios", vec![]), &[]);
        assert!(!result.roles.contains(&Role::Admin));
    }

    #[test]
    fn access_claims_falls_back_to_azp_when_sub_missing() {
        // Real Kinde M2M token payload shape (sub is absent, azp identifies
        // the calling app). Without the alias, serde would fail to
        // deserialize and the token would never reach the allowlist.
        let m2m_payload = serde_json::json!({
            "aud": ["trading-server-api"],
            "azp": "7286aeea55f84e81acbe5bfc5aef8ff8",
            "iss": "https://account.trading.camp",
            "exp": 1777754010_i64,
            "iat": 1777667610_i64,
            "gty": ["client_credentials"],
        });
        let parsed: AccessClaims = serde_json::from_value(m2m_payload).expect("M2M token deserialize");
        assert_eq!(parsed.sub, "7286aeea55f84e81acbe5bfc5aef8ff8");
        assert!(parsed.roles.is_empty());
    }

    #[test]
    fn access_claims_prefers_sub_over_azp_when_both_present() {
        let user_payload = serde_json::json!({
            "sub": "kinde_user_42",
            "azp": "client_app_xyz",
            "roles": [{"key": "admin"}],
        });
        let parsed: AccessClaims = serde_json::from_value(user_payload).expect("user token deserialize");
        assert_eq!(parsed.sub, "kinde_user_42");
        assert!(parsed.roles.contains(&Role::Admin));
    }
}
