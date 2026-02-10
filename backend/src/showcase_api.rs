use std::path::Path;
use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{
    auth::AccessClaims,
    db::DB,
    showcase::{self, BootcampConfig},
    AppState,
};

/// Build the Axum router for showcase admin endpoints.
pub fn showcase_router() -> Router<AppState> {
    Router::new()
        .route("/api/showcase/config", get(get_config))
        .route("/api/showcase/active", post(set_active))
        .route(
            "/api/showcase/bootcamps",
            get(list_bootcamps).post(add_bootcamp),
        )
        .route(
            "/api/showcase/bootcamps/:name/markets",
            get(list_bootcamp_markets),
        )
        .route("/api/showcase/markets", post(set_markets))
        .route("/api/showcase/anonymize", post(set_anonymize))
}

fn require_admin(claims: &AccessClaims) -> Result<(), StatusCode> {
    if !claims.roles.contains(&crate::auth::Role::Admin) {
        return Err(StatusCode::FORBIDDEN);
    }
    Ok(())
}

#[derive(Serialize)]
struct ConfigResponse {
    active_bootcamp: Option<String>,
    bootcamps: std::collections::HashMap<String, BootcampConfig>,
}

async fn get_config(
    claims: AccessClaims,
    State(state): State<AppState>,
) -> Result<Json<ConfigResponse>, StatusCode> {
    require_admin(&claims)?;
    let config = state.showcase.read().await;
    Ok(Json(ConfigResponse {
        active_bootcamp: config.active_bootcamp.clone(),
        bootcamps: config.bootcamps.clone(),
    }))
}

#[derive(Deserialize)]
struct SetActiveRequest {
    bootcamp: String,
}

async fn set_active(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<SetActiveRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;

    // Read the db_path without holding the lock across await
    let db_url = {
        let config = state.showcase.read().await;
        let bootcamp_config = config
            .bootcamps
            .get(&req.bootcamp)
            .ok_or(StatusCode::NOT_FOUND)?;
        format!("sqlite:{}", bootcamp_config.db_path)
    };

    // DB::init_with_path future is !Send (SQLite), so run on blocking thread
    let new_db = tokio::task::spawn_blocking(move || {
        tokio::runtime::Handle::current().block_on(DB::init_with_path(&db_url))
    })
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    state.db.store(Arc::new(new_db));

    let mut config = state.showcase.write().await;
    config.active_bootcamp = Some(req.bootcamp);

    showcase::save_config(&state.showcase_config_path, &config)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Serialize)]
struct BootcampListItem {
    name: String,
    path: String,
}

async fn list_bootcamps(
    claims: AccessClaims,
    State(state): State<AppState>,
) -> Result<Json<Vec<BootcampListItem>>, StatusCode> {
    require_admin(&claims)?;
    let config = state.showcase.read().await;
    let bootcamps: Vec<BootcampListItem> = config
        .bootcamps
        .iter()
        .map(|(name, bc)| BootcampListItem {
            name: name.clone(),
            path: bc.db_path.clone(),
        })
        .collect();
    Ok(Json(bootcamps))
}

#[derive(Deserialize)]
struct AddBootcampRequest {
    key: String,
    db_path: String,
    display_name: String,
    #[serde(default)]
    anonymize_names: bool,
    #[serde(default)]
    showcase_market_ids: Vec<i64>,
}

async fn add_bootcamp(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<AddBootcampRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;

    if !Path::new(&req.db_path).exists() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut config = state.showcase.write().await;
    config.bootcamps.insert(
        req.key.clone(),
        BootcampConfig {
            db_path: req.db_path,
            display_name: req.display_name,
            anonymize_names: req.anonymize_names,
            showcase_market_ids: req.showcase_market_ids,
        },
    );

    showcase::save_config(&state.showcase_config_path, &config)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Serialize)]
struct MarketInfo {
    id: i64,
    name: String,
}

async fn list_bootcamp_markets(
    claims: AccessClaims,
    State(state): State<AppState>,
    axum::extract::Path(name): axum::extract::Path<String>,
) -> Result<Json<Vec<MarketInfo>>, StatusCode> {
    require_admin(&claims)?;

    // Read the db_path without holding the lock across await
    let db_url = {
        let config = state.showcase.read().await;
        let bootcamp = config.bootcamps.get(&name).ok_or(StatusCode::NOT_FOUND)?;
        format!("sqlite:{}", bootcamp.db_path)
    };

    // DB::init_with_path future is !Send (SQLite), so run on blocking thread
    let db = tokio::task::spawn_blocking(move || {
        tokio::runtime::Handle::current().block_on(DB::init_with_path(&db_url))
    })
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let markets = db
        .get_all_markets()
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let market_list: Vec<MarketInfo> = markets
        .into_iter()
        .map(|m| MarketInfo {
            id: m.market.id,
            name: m.market.name,
        })
        .collect();

    Ok(Json(market_list))
}

#[derive(Deserialize)]
struct SetMarketsRequest {
    market_ids: Vec<i64>,
}

async fn set_markets(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<SetMarketsRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;

    let mut config = state.showcase.write().await;
    let active = config
        .active_bootcamp
        .clone()
        .ok_or(StatusCode::BAD_REQUEST)?;

    let bootcamp = config
        .bootcamps
        .get_mut(&active)
        .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

    bootcamp.showcase_market_ids = req.market_ids;

    showcase::save_config(&state.showcase_config_path, &config)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Deserialize)]
struct SetAnonymizeRequest {
    anonymize: bool,
}

async fn set_anonymize(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<SetAnonymizeRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;

    let mut config = state.showcase.write().await;
    let active = config
        .active_bootcamp
        .clone()
        .ok_or(StatusCode::BAD_REQUEST)?;

    let bootcamp = config
        .bootcamps
        .get_mut(&active)
        .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;

    bootcamp.anonymize_names = req.anonymize;

    showcase::save_config(&state.showcase_config_path, &config)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}
