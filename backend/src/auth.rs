use std::env;

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

#[derive(Debug, Deserialize, Clone)]
pub struct AccessClaims {
    pub sub: String,
    #[serde(default)]
    pub roles: Vec<Role>,
    /// Email from the token (populated in dev-mode test tokens; not present in real JWTs)
    #[serde(default)]
    pub email: Option<String>,
}

#[derive(Debug, Deserialize)]
struct IdClaims {
    pub name: String,
    pub sub: String,
    #[serde(default)]
    pub email: Option<String>,
}

static AUTH_CONFIG: OnceCell<AuthConfig> = OnceCell::new();

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
                    .map(|e| e.to_string())
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

        let claims = validate_jwt(token).await.map_err(|e| {
            tracing::error!("JWT validation failed: {:?}", e);
            (StatusCode::UNAUTHORIZED, "Bad JWT").into_response()
        })?;
        Ok(claims)
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
}

/// # Errors
/// Fails if unable to get auth config, or if one of the tokens is invalid
pub async fn validate_access_and_id(
    access_token: &str,
    id_token: Option<&str>,
) -> anyhow::Result<ValidatedClient> {
    let access_claims: AccessClaims = validate_jwt(access_token).await?;
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
        id: access_claims.sub,
        roles: access_claims.roles,
        email: id_claims.as_ref().and_then(|c| c.email.clone()),
        name: id_claims.map(|c| c.name),
    })
}

/// Validate an ID token and return its email if the subject matches `expected_sub`.
///
/// # Errors
/// Fails if the token is invalid or the subject does not match.
pub async fn validate_id_token_email_for_sub(
    id_token: &str,
    expected_sub: &str,
) -> anyhow::Result<Option<String>> {
    #[cfg(feature = "dev-mode")]
    if id_token.starts_with("test::") {
        let test_client = validate_test_token(id_token)?;
        if test_client.id != expected_sub {
            anyhow::bail!("sub mismatch");
        }
        return Ok(test_client.email);
    }

    let id_claims: IdClaims = validate_jwt(id_token).await?;
    if id_claims.sub != expected_sub {
        anyhow::bail!("sub mismatch");
    }
    Ok(id_claims.email)
}

/// Test-only function to create a `ValidatedClient` from test credentials.
/// Token format: `test::<kinde_id>::<name>::<is_admin>`
/// Example: `test::user123::Test User::true`
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
            "Invalid test token format: expected test::<kinde_id>::<name>::<is_admin>[::<email>]"
        );
    }

    let kinde_id = parts[1].to_string();
    let name = parts[2].to_string();
    let is_admin = parts[3].parse::<bool>().unwrap_or(false);
    let email = parts
        .get(4)
        .map(|e| e.to_string())
        .filter(|e| !e.is_empty());

    let roles = if is_admin { vec![Role::Admin] } else { vec![] };

    Ok(ValidatedClient {
        id: kinde_id,
        roles,
        name: Some(name),
        email,
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
