use std::path::Path;

use axum::{
    extract::{Path as AxumPath, State},
    http::StatusCode,
    routing::{delete, get, post},
    Json, Router,
};
use futures::TryStreamExt;
use serde::{Deserialize, Serialize};

use crate::{
    auth::AccessClaims,
    showcase::{self, DatabaseConfig, ShowcaseConfig, ShowcaseEntry},
    AppState,
};

/// Build the Axum router for showcase endpoints.
pub fn showcase_router() -> Router<AppState> {
    Router::new()
        .route("/api/showcase/public", get(get_public))
        .route("/api/showcase/config", get(get_config))
        .route(
            "/api/showcase/databases",
            get(list_databases).post(add_database),
        )
        .route("/api/showcase/default", post(set_default_showcase))
        .route(
            "/api/showcase/showcases",
            get(list_showcases).post(add_showcase),
        )
        .route("/api/showcase/showcases/:key", delete(delete_showcase))
        .route(
            "/api/showcase/showcases/:key/markets",
            get(list_showcase_markets).post(set_showcase_markets),
        )
        .route(
            "/api/showcase/showcases/:key/accounts",
            get(list_showcase_accounts),
        )
        .route(
            "/api/showcase/showcases/:key/market-types",
            get(list_showcase_market_types),
        )
        .route(
            "/api/showcase/showcases/:key/anonymize",
            post(set_showcase_anonymize),
        )
        .route(
            "/api/showcase/showcases/:key/non-anonymous-accounts",
            post(set_showcase_non_anonymous_accounts),
        )
        .route(
            "/api/showcase/showcases/:key/hidden-categories",
            post(toggle_showcase_hidden_category),
        )
}

fn require_admin(claims: &AccessClaims) -> Result<(), StatusCode> {
    if !claims.roles.contains(&crate::auth::Role::Admin) {
        return Err(StatusCode::FORBIDDEN);
    }
    Ok(())
}

fn internal_error<E>(_err: E) -> StatusCode {
    StatusCode::INTERNAL_SERVER_ERROR
}

fn normalize_database_key(raw: &str) -> Result<String, StatusCode> {
    showcase::normalize_key(raw).ok_or(StatusCode::BAD_REQUEST)
}

fn normalize_showcase_key(raw: &str) -> Result<String, StatusCode> {
    let key = showcase::normalize_key(raw).ok_or(StatusCode::BAD_REQUEST)?;
    if showcase::is_reserved_showcase_key(&key) {
        return Err(StatusCode::BAD_REQUEST);
    }
    Ok(key)
}

fn encode_config(config: &ShowcaseConfig) -> serde_json::Value {
    serde_json::to_value(config).unwrap_or_else(|_| serde_json::json!({}))
}

#[derive(Serialize)]
struct PublicShowcaseItem {
    key: String,
    display_name: String,
}

#[derive(Serialize)]
struct PublicShowcaseResponse {
    default_showcase: Option<String>,
    showcases: Vec<PublicShowcaseItem>,
}

async fn get_public(State(state): State<AppState>) -> Json<PublicShowcaseResponse> {
    let config = state.showcase.read().await;
    let mut showcases: Vec<PublicShowcaseItem> = config
        .showcases
        .iter()
        .map(|(key, showcase)| PublicShowcaseItem {
            key: key.clone(),
            display_name: showcase.display_name.clone(),
        })
        .collect();
    showcases.sort_by(|a, b| a.key.cmp(&b.key));
    let default_showcase = config
        .default_showcase
        .as_ref()
        .filter(|key| config.showcases.contains_key(*key))
        .cloned();

    Json(PublicShowcaseResponse {
        default_showcase,
        showcases,
    })
}

async fn get_config(
    claims: AccessClaims,
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;
    let config = state.showcase.read().await;
    Ok(Json(encode_config(&config)))
}

#[derive(Serialize)]
struct DatabaseListItem {
    key: String,
    db_path: String,
    display_name: String,
}

async fn list_databases(
    claims: AccessClaims,
    State(state): State<AppState>,
) -> Result<Json<Vec<DatabaseListItem>>, StatusCode> {
    require_admin(&claims)?;

    let config = state.showcase.read().await;
    let mut databases: Vec<DatabaseListItem> = config
        .databases
        .iter()
        .map(|(key, database)| DatabaseListItem {
            key: key.clone(),
            db_path: database.db_path.clone(),
            display_name: database.display_name.clone(),
        })
        .collect();
    databases.sort_by(|a, b| a.key.cmp(&b.key));

    Ok(Json(databases))
}

#[derive(Deserialize)]
struct AddDatabaseRequest {
    key: String,
    db_path: String,
    display_name: String,
}

async fn add_database(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<AddDatabaseRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;

    let key = normalize_database_key(&req.key)?;
    if !Path::new(&req.db_path).exists() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let config_to_save = {
        let mut config = state.showcase.write().await;
        config.databases.insert(
            key,
            DatabaseConfig {
                db_path: req.db_path,
                display_name: req.display_name,
            },
        );
        config.clone()
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Deserialize)]
struct SetDefaultRequest {
    showcase: Option<String>,
}

async fn set_default_showcase(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<SetDefaultRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;

    let requested = req
        .showcase
        .as_ref()
        .map(|key| normalize_showcase_key(key))
        .transpose()?;

    let (config_to_save, selected_database): (ShowcaseConfig, Option<(String, String)>) = {
        let mut config = state.showcase.write().await;

        if let Some(showcase_key) = requested.as_ref() {
            let showcase = config
                .showcases
                .get(showcase_key)
                .ok_or(StatusCode::NOT_FOUND)?;
            let database = config
                .databases
                .get(&showcase.database_key)
                .ok_or(StatusCode::BAD_REQUEST)?;
            let database_key = showcase.database_key.clone();
            let db_path = database.db_path.clone();
            config.default_showcase = Some(showcase_key.clone());
            (config.clone(), Some((database_key, db_path)))
        } else {
            config.default_showcase = None;
            (config.clone(), None)
        }
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    if let Some((database_key, db_path)) = selected_database {
        state
            .set_primary_database(&database_key, &db_path)
            .await
            .map_err(internal_error)?;
    }

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Serialize)]
struct ShowcaseListItem {
    key: String,
    display_name: String,
    database_key: String,
    anonymize_names: bool,
    showcase_market_ids: Vec<i64>,
    hidden_category_ids: Vec<i64>,
    non_anonymous_account_ids: Vec<i64>,
}

async fn list_showcases(
    claims: AccessClaims,
    State(state): State<AppState>,
) -> Result<Json<Vec<ShowcaseListItem>>, StatusCode> {
    require_admin(&claims)?;

    let config = state.showcase.read().await;
    let mut showcases: Vec<ShowcaseListItem> = config
        .showcases
        .iter()
        .map(|(key, showcase)| ShowcaseListItem {
            key: key.clone(),
            display_name: showcase.display_name.clone(),
            database_key: showcase.database_key.clone(),
            anonymize_names: showcase.anonymize_names,
            showcase_market_ids: showcase.showcase_market_ids.clone(),
            hidden_category_ids: showcase.hidden_category_ids.clone(),
            non_anonymous_account_ids: showcase.non_anonymous_account_ids.clone(),
        })
        .collect();
    showcases.sort_by(|a, b| a.key.cmp(&b.key));

    Ok(Json(showcases))
}

#[derive(Deserialize)]
struct AddShowcaseRequest {
    key: String,
    display_name: String,
    database_key: String,
    #[serde(default)]
    anonymize_names: bool,
    #[serde(default)]
    showcase_market_ids: Vec<i64>,
}

async fn add_showcase(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(req): Json<AddShowcaseRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;

    let key = normalize_showcase_key(&req.key)?;
    let database_key = normalize_database_key(&req.database_key)?;

    let config_to_save = {
        let mut config = state.showcase.write().await;

        if !config.databases.contains_key(&database_key) {
            return Err(StatusCode::BAD_REQUEST);
        }

        config.showcases.insert(
            key,
            ShowcaseEntry {
                display_name: req.display_name,
                database_key,
                anonymize_names: req.anonymize_names,
                showcase_market_ids: req.showcase_market_ids,
                hidden_category_ids: Vec::new(),
                non_anonymous_account_ids: Vec::new(),
            },
        );

        config.clone()
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

async fn delete_showcase(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;
    let key = normalize_showcase_key(&key)?;

    let config_to_save = {
        let mut config = state.showcase.write().await;
        if config.showcases.remove(&key).is_none() {
            return Err(StatusCode::NOT_FOUND);
        }
        if config.default_showcase.as_deref() == Some(key.as_str()) {
            config.default_showcase = None;
        }
        config.clone()
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Serialize)]
struct MarketInfo {
    id: i64,
    name: String,
}

#[derive(Serialize)]
struct MarketTypeInfo {
    id: i64,
    name: String,
}

#[derive(Serialize)]
struct AccountInfo {
    id: i64,
    name: String,
}

async fn get_showcase_database(
    state: &AppState,
    showcase_key: &str,
) -> Result<(String, ShowcaseEntry, DatabaseConfig), StatusCode> {
    let normalized_key = normalize_showcase_key(showcase_key)?;

    let (showcase, database) = {
        let config = state.showcase.read().await;
        let showcase = config
            .showcases
            .get(&normalized_key)
            .cloned()
            .ok_or(StatusCode::NOT_FOUND)?;
        let database = config
            .databases
            .get(&showcase.database_key)
            .cloned()
            .ok_or(StatusCode::BAD_REQUEST)?;
        (showcase, database)
    };

    Ok((normalized_key, showcase, database))
}

async fn list_showcase_markets(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
) -> Result<Json<Vec<MarketInfo>>, StatusCode> {
    require_admin(&claims)?;

    let (_, showcase, database) = get_showcase_database(&state, &key).await?;
    let db = state
        .get_or_load_database(&showcase.database_key, &database.db_path)
        .await
        .map_err(internal_error)?;

    let markets = db.get_all_markets().await.map_err(internal_error)?;
    let mut market_list: Vec<MarketInfo> = markets
        .into_iter()
        .map(|market| MarketInfo {
            id: market.market.id,
            name: market.market.name,
        })
        .collect();
    market_list.sort_by(|a, b| a.id.cmp(&b.id));

    Ok(Json(market_list))
}

async fn list_showcase_market_types(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
) -> Result<Json<Vec<MarketTypeInfo>>, StatusCode> {
    require_admin(&claims)?;

    let (_, showcase, database) = get_showcase_database(&state, &key).await?;
    let db = state
        .get_or_load_database(&showcase.database_key, &database.db_path)
        .await
        .map_err(internal_error)?;

    let market_types = db.get_all_market_types().await.map_err(internal_error)?;
    let mut type_list: Vec<MarketTypeInfo> = market_types
        .into_iter()
        .map(|market_type| MarketTypeInfo {
            id: market_type.id,
            name: market_type.name,
        })
        .collect();
    type_list.sort_by(|a, b| a.id.cmp(&b.id));

    Ok(Json(type_list))
}

async fn list_showcase_accounts(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
) -> Result<Json<Vec<AccountInfo>>, StatusCode> {
    require_admin(&claims)?;

    let (_, showcase, database) = get_showcase_database(&state, &key).await?;
    let db = state
        .get_or_load_database(&showcase.database_key, &database.db_path)
        .await
        .map_err(internal_error)?;

    let accounts: Vec<crate::db::Account> = db
        .get_all_accounts()
        .try_collect()
        .await
        .map_err(internal_error)?;

    let mut account_list: Vec<AccountInfo> = accounts
        .into_iter()
        .map(|account| AccountInfo {
            id: account.id,
            name: account.name,
        })
        .collect();
    account_list.sort_by(|a, b| a.id.cmp(&b.id));

    Ok(Json(account_list))
}

#[derive(Deserialize)]
struct SetMarketsRequest {
    market_ids: Vec<i64>,
}

async fn set_showcase_markets(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
    Json(req): Json<SetMarketsRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;
    let key = normalize_showcase_key(&key)?;

    let config_to_save = {
        let mut config = state.showcase.write().await;
        let showcase = config.showcases.get_mut(&key).ok_or(StatusCode::NOT_FOUND)?;
        showcase.showcase_market_ids = req.market_ids;
        config.clone()
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Deserialize)]
struct SetAnonymizeRequest {
    anonymize: bool,
}

async fn set_showcase_anonymize(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
    Json(req): Json<SetAnonymizeRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;
    let key = normalize_showcase_key(&key)?;

    let config_to_save = {
        let mut config = state.showcase.write().await;
        let showcase = config.showcases.get_mut(&key).ok_or(StatusCode::NOT_FOUND)?;
        showcase.anonymize_names = req.anonymize;
        config.clone()
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Deserialize)]
struct SetNonAnonymousRequest {
    account_ids: Vec<i64>,
}

async fn set_showcase_non_anonymous_accounts(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
    Json(req): Json<SetNonAnonymousRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;
    let key = normalize_showcase_key(&key)?;

    let config_to_save = {
        let mut config = state.showcase.write().await;
        let showcase = config.showcases.get_mut(&key).ok_or(StatusCode::NOT_FOUND)?;
        showcase.non_anonymous_account_ids = req.account_ids;
        config.clone()
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    Ok(Json(serde_json::json!({"status": "ok"})))
}

#[derive(Deserialize)]
struct ToggleHiddenCategoryRequest {
    category_id: i64,
}

async fn toggle_showcase_hidden_category(
    claims: AccessClaims,
    State(state): State<AppState>,
    AxumPath(key): AxumPath<String>,
    Json(req): Json<ToggleHiddenCategoryRequest>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    require_admin(&claims)?;
    let key = normalize_showcase_key(&key)?;

    let (config_to_save, hidden) = {
        let mut config = state.showcase.write().await;
        let showcase = config.showcases.get_mut(&key).ok_or(StatusCode::NOT_FOUND)?;

        let hidden = if let Some(pos) = showcase
            .hidden_category_ids
            .iter()
            .position(|&id| id == req.category_id)
        {
            showcase.hidden_category_ids.remove(pos);
            false
        } else {
            showcase.hidden_category_ids.push(req.category_id);
            true
        };

        (config.clone(), hidden)
    };

    showcase::save_config(&state.showcase_config_path, &config_to_save)
        .await
        .map_err(internal_error)?;

    Ok(Json(serde_json::json!({"hidden": hidden})))
}
