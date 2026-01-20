use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use serde::{Deserialize, Serialize};

use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateResponse {
    pub scenario_id: String,
    pub scenario_name: String,
    pub team_account_id: i64,
    pub market_ids: MarketIds,
    pub dice_roll: i32,
    pub funding_per_player: f64,
}

/// Request body from frontend for creating a scenario
#[derive(Debug, Deserialize)]
pub struct CreateInputRequest {
    pub funding_amount: f64,
    pub scenario_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MarketIds {
    pub min: i64,
    pub max: i64,
    pub sum: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StatusResponse {
    pub scenario_id: String,
    pub settled: bool,
    pub paused: bool,
    pub dice_roll: i32,
    pub team_account_id: i64,
    pub market_ids: MarketIds,
    pub all_dice: Option<std::collections::HashMap<String, i32>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SettleResponse {
    pub settled: bool,
    pub settlement_values: SettlementValues,
    pub all_dice: std::collections::HashMap<String, i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SettlementValues {
    pub min: i32,
    pub max: i32,
    pub sum: i32,
}

/// Request body sent to scenarios API
#[derive(Debug, Serialize)]
struct ScenariosCreateRequest {
    user_account_id: i64,
    user_name: String,
    funding_amount: f64,
    scenario_name: Option<String>,
}

pub struct SinglePlayerError(anyhow::Error);

impl IntoResponse for SinglePlayerError {
    fn into_response(self) -> Response {
        tracing::error!("Single player error: {:?}", self.0);
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Single player error: {}", self.0),
        )
            .into_response()
    }
}

impl<E: Into<anyhow::Error>> From<E> for SinglePlayerError {
    fn from(err: E) -> Self {
        Self(err.into())
    }
}

async fn get_user_info(
    state: &AppState,
    kinde_id: &str,
) -> Result<(i64, String), SinglePlayerError> {
    state
        .db
        .get_user_by_kinde_id(kinde_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("User not found").into())
}

fn get_scenarios_url(state: &AppState) -> Result<&str, SinglePlayerError> {
    state
        .scenarios_api_url
        .as_deref()
        .ok_or_else(|| anyhow::anyhow!("SCENARIOS_API_URL not configured").into())
}

/// Create a new single-player scenario for the authenticated user.
#[axum::debug_handler]
pub async fn create(
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    State(state): State<AppState>,
    Json(input): Json<CreateInputRequest>,
) -> Result<Json<CreateResponse>, SinglePlayerError> {
    let user_jwt = auth.token();

    // Validate funding amount
    if input.funding_amount <= 0.0 {
        return Err(anyhow::anyhow!("Funding amount must be positive").into());
    }

    // Decode JWT to get user info (we still need to look up the account ID)
    let claims = decode_jwt_claims(user_jwt)?;
    let (user_account_id, user_name) = get_user_info(&state, &claims.sub).await?;
    let scenarios_url = get_scenarios_url(&state)?;

    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/single_player/create", scenarios_url))
        .query(&[("token", user_jwt)])
        .json(&ScenariosCreateRequest {
            user_account_id,
            user_name,
            funding_amount: input.funding_amount,
            scenario_name: input.scenario_name,
        })
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("Scenarios API error: {}", error_text).into());
    }

    let create_response: CreateResponse = response.json().await?;
    Ok(Json(create_response))
}

/// Start the bots for a scenario.
#[axum::debug_handler]
pub async fn play(
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    State(state): State<AppState>,
    Path(scenario_id): Path<String>,
) -> Result<impl IntoResponse, SinglePlayerError> {
    let user_jwt = auth.token();
    let scenarios_url = get_scenarios_url(&state)?;

    let client = reqwest::Client::new();
    let response = client
        .post(format!(
            "{}/single_player/{}/play",
            scenarios_url, scenario_id
        ))
        .query(&[("token", user_jwt)])
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("Scenarios API error: {}", error_text).into());
    }

    Ok((StatusCode::OK, "OK"))
}

/// Pause the bots for a scenario.
#[axum::debug_handler]
pub async fn pause(
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    State(state): State<AppState>,
    Path(scenario_id): Path<String>,
) -> Result<impl IntoResponse, SinglePlayerError> {
    let user_jwt = auth.token();
    let scenarios_url = get_scenarios_url(&state)?;

    let client = reqwest::Client::new();
    let response = client
        .post(format!(
            "{}/single_player/{}/pause",
            scenarios_url, scenario_id
        ))
        .query(&[("token", user_jwt)])
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("Scenarios API error: {}", error_text).into());
    }

    Ok((StatusCode::OK, "OK"))
}

/// Settle the markets and reveal all dice rolls.
#[axum::debug_handler]
pub async fn settle(
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    State(state): State<AppState>,
    Path(scenario_id): Path<String>,
) -> Result<Json<SettleResponse>, SinglePlayerError> {
    let user_jwt = auth.token();
    let scenarios_url = get_scenarios_url(&state)?;

    let client = reqwest::Client::new();
    let response = client
        .post(format!(
            "{}/single_player/{}/settle",
            scenarios_url, scenario_id
        ))
        .query(&[("token", user_jwt)])
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("Scenarios API error: {}", error_text).into());
    }

    let settle_response: SettleResponse = response.json().await?;
    Ok(Json(settle_response))
}

/// Get the current status of a scenario.
#[axum::debug_handler]
pub async fn status(
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    State(state): State<AppState>,
    Path(scenario_id): Path<String>,
) -> Result<Json<StatusResponse>, SinglePlayerError> {
    let user_jwt = auth.token();
    let scenarios_url = get_scenarios_url(&state)?;

    let client = reqwest::Client::new();
    let response = client
        .get(format!(
            "{}/single_player/{}/status",
            scenarios_url, scenario_id
        ))
        .query(&[("token", user_jwt)])
        .send()
        .await?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(anyhow::anyhow!("Scenarios API error: {}", error_text).into());
    }

    let status_response: StatusResponse = response.json().await?;
    Ok(Json(status_response))
}

/// Minimal JWT claims extraction (without full validation - scenarios will validate)
#[derive(Debug, Deserialize)]
struct JwtClaims {
    sub: String,
}

fn decode_jwt_claims(token: &str) -> Result<JwtClaims, SinglePlayerError> {
    // JWT is base64url encoded: header.payload.signature
    // We just need to decode the payload to get the 'sub' claim
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err(anyhow::anyhow!("Invalid JWT format").into());
    }

    use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
    let payload = URL_SAFE_NO_PAD
        .decode(parts[1])
        .map_err(|e| anyhow::anyhow!("Failed to decode JWT payload: {}", e))?;

    let claims: JwtClaims = serde_json::from_slice(&payload)
        .map_err(|e| anyhow::anyhow!("Failed to parse JWT claims: {}", e))?;

    Ok(claims)
}
