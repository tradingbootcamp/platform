use axum::{
    extract::State,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{auth::AccessClaims, AppState};

#[derive(Serialize)]
struct TcStatusResponse {
    accepted: bool,
    tc_version: Option<String>,
}

#[derive(Deserialize)]
struct AcceptTcRequest {
    tc_version: String,
}

#[derive(Serialize)]
struct AcceptTcResponse {
    success: bool,
}

async fn tc_status(
    claims: AccessClaims,
    State(state): State<AppState>,
) -> impl IntoResponse {
    let result = state.db.get_tc_status_by_kinde_id(&claims.sub).await;
    match result {
        Ok(Some((accepted, tc_version))) => Json(TcStatusResponse {
            accepted,
            tc_version,
        })
        .into_response(),
        Ok(None) => Json(TcStatusResponse {
            accepted: false,
            tc_version: None,
        })
        .into_response(),
        Err(e) => {
            tracing::error!("Failed to get T&C status: {e}");
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error",
            )
                .into_response()
        }
    }
}

async fn accept_tc(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(body): Json<AcceptTcRequest>,
) -> impl IntoResponse {
    let result = state
        .db
        .accept_tc_by_kinde_id(&claims.sub, &body.tc_version)
        .await;
    match result {
        Ok(true) => Json(AcceptTcResponse { success: true }).into_response(),
        Ok(false) => (
            axum::http::StatusCode::NOT_FOUND,
            "Account not found",
        )
            .into_response(),
        Err(e) => {
            tracing::error!("Failed to accept T&C: {e}");
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error",
            )
                .into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/tc/status", get(tc_status))
        .route("/api/tc/accept", post(accept_tc))
}
