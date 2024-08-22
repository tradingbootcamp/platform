use std::{env, future::Future, pin::Pin};

use async_once_cell::Lazy;
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
}

#[derive(Debug, Deserialize)]
struct IdClaims {
    pub name: String,
    pub sub: String,
}

type AuthConfigFuture = impl Future<Output = AuthConfig>;
static AUTH_CONFIG: Lazy<AuthConfig, AuthConfigFuture> = Lazy::new(async {
    let issuer = env::var("KINDE_ISSUER").expect("KINDE_ISSUER env var");
    let audiences = env::var("KINDE_AUDIENCE")
        .expect("KINDE_AUDIENCE env var")
        .split(',')
        .map(String::from)
        .collect();
    let url = format!("{issuer}/.well-known/jwks.json");
    let jwk_set: JwkSet = reqwest::get(url)
        .await
        .expect("jwk_set request failed")
        .json()
        .await
        .expect("jwk_set json failed");
    tracing::info!("Auth module initialized");
    AuthConfig {
        issuer,
        audiences,
        jwk_set,
    }
});

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
        let claims = validate_jwt(token).await.map_err(|e| {
            tracing::error!("JWT validation failed: {:?}", e);
            (StatusCode::UNAUTHORIZED, "Bad JWT").into_response()
        })?;
        Ok(claims)
    }
}

async fn validate_jwt<Claims: DeserializeOwned>(token: &str) -> anyhow::Result<Claims> {
    let auth_config = &*Pin::static_ref(&AUTH_CONFIG).get().await;
    let header = jsonwebtoken::decode_header(token)?;
    let Some(kid) = header.kid else {
        anyhow::bail!("Missing kid")
    };
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
    pub name: String,
}

/// # Errors
/// Fails if unable to get auth config, or if one of the tokens is invalid
pub async fn validate_access_and_id(
    access_token: &str,
    id_token: &str,
) -> anyhow::Result<ValidatedClient> {
    let access_claims: AccessClaims = validate_jwt(access_token).await?;
    let id_claims: IdClaims = validate_jwt(id_token).await?;
    if access_claims.sub != id_claims.sub {
        anyhow::bail!("sub mismatch");
    }
    Ok(ValidatedClient {
        id: access_claims.sub,
        roles: access_claims.roles,
        name: id_claims.name,
    })
}
