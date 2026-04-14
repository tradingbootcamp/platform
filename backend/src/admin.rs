use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde::Deserialize;

use crate::{auth::AccessClaims, auth::Role, AppState};

#[derive(Deserialize)]
struct PreregisterRequest {
    emails: Vec<String>,
    initial_balance: f64,
}

async fn preregister_users(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<PreregisterRequest>,
) -> impl IntoResponse {
    if !claims.roles.contains(&Role::Admin) {
        return (StatusCode::FORBIDDEN, "Admin required").into_response();
    }

    let balance = rust_decimal::Decimal::from_str_exact(&req.initial_balance.to_string())
        .unwrap_or_default();

    match state.db.preregister_users(&req.emails, balance).await {
        Ok(results) => Json(results).into_response(),
        Err(e) => {
            tracing::error!("Failed to preregister users: {e}");
            (StatusCode::INTERNAL_SERVER_ERROR, format!("Database error: {e}")).into_response()
        }
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/api/admin/preregister", post(preregister_users))
}
