use std::sync::Arc;

use axum::{
    self,
    extract::{Multipart, Path as AxumPath, State, WebSocketUpgrade},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{delete, get, post, put},
    Json, Router,
};
use backend::{auth::AccessClaims, global_db::CohortInfo, AppState};
use serde::{Deserialize, Serialize};
use std::{env, path::Path, str::FromStr};
use tokio::{fs::create_dir_all, net::TcpListener};
use tower_http::{cors::CorsLayer, limit::RequestBodyLimitLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use uuid::Uuid;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = AppState::new().await?;

    // Get upload directory from environment variable or use default
    let uploads_dir = env::var("UPLOAD_DIR").unwrap_or_else(|_| "/data/uploads".to_string());
    let uploads_dir = Path::new(&uploads_dir);
    tracing::info!("Upload directory: {}", uploads_dir.display());
    if !uploads_dir.exists() {
        tracing::info!("Creating upload directory: {}", uploads_dir.display());
        create_dir_all(uploads_dir).await?;
    }

    let app = Router::new()
        // Per-cohort WebSocket route
        .route("/api/ws/:cohort_name", get(cohort_ws))
        // REST endpoints
        .route("/api/cohorts", get(list_cohorts))
        // Admin REST endpoints
        .route("/api/admin/overview", get(get_admin_overview))
        .route("/api/admin/cohorts", post(create_cohort))
        .route("/api/admin/cohorts/:name", put(update_cohort))
        .route(
            "/api/admin/cohorts/:name/members",
            get(list_members).post(batch_add_members),
        )
        .route(
            "/api/admin/cohorts/:name/members/:id",
            put(update_member).delete(remove_member),
        )
        .route("/api/admin/config", put(update_config))
        .route("/api/admin/users/:id/admin", put(toggle_admin))
        .route(
            "/api/admin/users/:id/display-name",
            put(admin_update_display_name),
        )
        .route("/api/admin/users/:id", delete(delete_user_endpoint))
        // Authenticated user endpoints
        .route("/api/users/me/display-name", put(update_my_display_name))
        // Utility routes
        .route("/api/upload-image", post(upload_image))
        .route("/api/images/:filename", get(serve_image))
        .layer(TraceLayer::new_for_http())
        .layer(RequestBodyLimitLayer::new(50 * 1024 * 1024))
        .layer(
            CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any)
                .allow_private_network(true),
        )
        .with_state(AppState {
            uploads_dir: uploads_dir.to_path_buf(),
            ..state
        });

    // Get starting port from environment variable or use default
    let start_port: u16 = env::var("EXCHANGE_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(8080);

    // Try to bind to ports, incrementing on failure
    let mut port = start_port;
    let listener = loop {
        match TcpListener::bind(format!("0.0.0.0:{port}")).await {
            Ok(listener) => break listener,
            Err(e) if e.kind() == std::io::ErrorKind::AddrInUse => {
                tracing::warn!("Port {} is in use, trying {}", port, port + 1);
                port += 1;
                if port > start_port + 100 {
                    anyhow::bail!("Could not find available port after 100 attempts");
                }
            }
            Err(e) => return Err(e.into()),
        }
    };

    // Log in a parseable format for the dev script
    tracing::info!("BACKEND_READY port={}", listener.local_addr()?.port());
    Ok(axum::serve(listener, app).await?)
}

// --- WebSocket Handler ---

#[axum::debug_handler]
async fn cohort_ws(
    ws: WebSocketUpgrade,
    AxumPath(cohort_name): AxumPath<String>,
    State(state): State<AppState>,
) -> Response {
    let Some(cohort) = state.cohorts.get(&cohort_name).map(|c| Arc::clone(&c)) else {
        return (StatusCode::NOT_FOUND, "Cohort not found").into_response();
    };
    ws.on_upgrade(move |socket| backend::handle_socket::handle_socket(socket, state, cohort))
}

// --- REST Endpoints ---

#[derive(Serialize)]
struct CohortsResponse {
    cohorts: Vec<CohortInfo>,
    active_auction_cohort: Option<String>,
    default_cohort: Option<String>,
    public_auction_enabled: bool,
}

#[axum::debug_handler]
async fn list_cohorts(
    claims: AccessClaims,
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Json<CohortsResponse>, (StatusCode, String)> {
    // Prefer email from validated ID token when provided; fall back to access-token claims.
    let id_token_email = headers
        .get("x-id-token")
        .and_then(|v| v.to_str().ok())
        .filter(|v| !v.is_empty())
        .map(str::to_owned);

    let (resolved_email, id_token_name) = if let Some(id_token) = id_token_email {
        match backend::auth::validate_id_token_for_sub(&id_token, &claims.sub).await {
            Ok(info) => (info.email, info.name),
            Err(e) => {
                tracing::warn!("Invalid x-id-token for /api/cohorts: {e}");
                (claims.email.clone(), None)
            }
        }
    } else {
        (claims.email.clone(), None)
    };

    // Ensure global user exists. Prefer the display name from the id_token so
    // users who log in but haven't been added to any cohort still get their
    // real name persisted. In either path we also sync `is_kinde_admin` from
    // the JWT role so the Admin-page toggle and admin checks can rely on the
    // single effective `is_admin` field.
    let is_kinde_admin = claims.roles.contains(&backend::auth::Role::Admin);
    let global_user = if let Some(name) = id_token_name.as_deref().filter(|n| !n.is_empty()) {
        state
            .global_db
            .ensure_global_user(&claims.sub, name, resolved_email.as_deref(), is_kinde_admin)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    } else {
        state
            .global_db
            .find_or_create_global_user(
                &claims.sub,
                &claims.sub,
                resolved_email.as_deref(),
                is_kinde_admin,
            )
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    };

    // Link email-based pre-authorizations if we have an email
    if let Some(email) = &resolved_email {
        if let Err(e) = state
            .global_db
            .link_email_to_user(email, global_user.id)
            .await
        {
            tracing::warn!("Failed to link email to user in list_cohorts: {e}");
        }
    }

    let is_admin = global_user.is_admin;

    let cohorts = if is_admin {
        state
            .global_db
            .get_all_cohorts()
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    } else {
        state
            .global_db
            .get_user_cohorts(global_user.id)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
    };

    let public_auction_enabled = state
        .global_db
        .get_config("public_auction_enabled")
        .await
        .unwrap_or(None)
        .is_some_and(|v| v == "true");

    let active_auction_cohort = get_active_auction_cohort_name(&state).await;
    let default_cohort = get_cohort_name_by_config_key(&state, "default_cohort_id").await;

    Ok(Json(CohortsResponse {
        cohorts,
        active_auction_cohort,
        default_cohort,
        public_auction_enabled,
    }))
}

async fn get_cohort_name_by_config_key(state: &AppState, config_key: &str) -> Option<String> {
    let cohort_id = state
        .global_db
        .get_config(config_key)
        .await
        .ok()
        .flatten()
        .and_then(|v| v.parse::<i64>().ok())?;

    let all_cohorts = state.global_db.get_all_cohorts().await.ok()?;
    all_cohorts
        .into_iter()
        .find(|c| c.id == cohort_id)
        .map(|c| c.name)
}

async fn get_active_auction_cohort_name(state: &AppState) -> Option<String> {
    get_cohort_name_by_config_key(state, "active_auction_cohort_id").await
}

// --- Admin Endpoints ---

async fn check_admin(state: &AppState, claims: &AccessClaims) -> Result<(), (StatusCode, String)> {
    // Sync the Kinde admin role into `global_user.is_admin` and then read the DB field as the
    // single source of truth. `claims.sub` is used as a fallback display_name; the WS auth flow
    // will update it with the real name on the next connection.
    let is_kinde_admin = claims.roles.contains(&backend::auth::Role::Admin);
    let global_user = state
        .global_db
        .ensure_global_user(
            &claims.sub,
            &claims.sub,
            claims.email.as_deref(),
            is_kinde_admin,
        )
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if global_user.is_admin {
        Ok(())
    } else {
        Err((StatusCode::FORBIDDEN, "Admin access required".to_string()))
    }
}

#[derive(Serialize)]
struct AdminOverview {
    cohorts: Vec<CohortInfo>,
    config: GlobalConfig,
    available_dbs: Vec<String>,
    users: Vec<UserWithCohorts>,
}

#[axum::debug_handler]
async fn get_admin_overview(
    claims: AccessClaims,
    State(state): State<AppState>,
) -> Result<Json<AdminOverview>, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    let cohorts = state
        .global_db
        .get_all_cohorts()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let active_auction_cohort_id = state
        .global_db
        .get_config("active_auction_cohort_id")
        .await
        .unwrap_or(None)
        .and_then(|v| v.parse().ok());
    let default_cohort_id = state
        .global_db
        .get_config("default_cohort_id")
        .await
        .unwrap_or(None)
        .and_then(|v| v.parse().ok());
    let public_auction_enabled = state
        .global_db
        .get_config("public_auction_enabled")
        .await
        .unwrap_or(None)
        .is_some_and(|v| v == "true");
    let config = GlobalConfig {
        active_auction_cohort_id,
        default_cohort_id,
        public_auction_enabled,
    };

    let data_dir = std::env::var("DATABASE_URL")
        .ok()
        .and_then(|url| {
            let path = url.trim_start_matches("sqlite://");
            Path::new(path)
                .parent()
                .map(|p| p.to_string_lossy().into_owned())
        })
        .unwrap_or_else(|| "/data".to_string());
    let used: std::collections::HashSet<String> =
        cohorts.iter().map(|c| c.db_path.clone()).collect();
    let mut available_dbs = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&data_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().is_some_and(|ext| ext == "sqlite") {
                let full_path = path.to_string_lossy().to_string();
                if !used.contains(&full_path) {
                    if let Some(stem) = path.file_stem() {
                        available_dbs.push(stem.to_string_lossy().to_string());
                    }
                }
            }
        }
    }
    available_dbs.sort();

    let users_raw = state
        .global_db
        .get_all_users()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    let mut users = Vec::with_capacity(users_raw.len());
    for user in users_raw {
        let user_cohort_infos = state
            .global_db
            .get_user_cohorts(user.id)
            .await
            .unwrap_or_default();
        let cohorts = user_cohort_infos
            .into_iter()
            .map(|ci| UserCohortDetail {
                cohort_name: ci.name,
                cohort_display_name: ci.display_name,
            })
            .collect();
        users.push(UserWithCohorts { user, cohorts });
    }

    Ok(Json(AdminOverview {
        cohorts,
        config,
        available_dbs,
        users,
    }))
}

#[derive(Deserialize)]
struct CreateCohortRequest {
    name: String,
    display_name: String,
    #[serde(default)]
    existing_db: bool,
}

#[axum::debug_handler]
async fn create_cohort(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(body): Json<CreateCohortRequest>,
) -> Result<Json<CohortInfo>, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    // Determine data directory from DATABASE_URL or default
    let data_dir = std::env::var("DATABASE_URL")
        .ok()
        .and_then(|url| {
            let path = url.trim_start_matches("sqlite://");
            Path::new(path)
                .parent()
                .map(|p| p.to_string_lossy().into_owned())
        })
        .unwrap_or_else(|| "/data".to_string());

    let db_path = format!("{}/{}.sqlite", data_dir, body.name);

    // If using existing DB, verify the file exists first
    if body.existing_db && !Path::new(&db_path).exists() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Database file not found: {db_path}"),
        ));
    }
    if !body.existing_db && Path::new(&db_path).exists() {
        return Err((
            StatusCode::BAD_REQUEST,
            format!(
                "Database file already exists: {db_path}. Check 'Use existing database' to adopt it."
            ),
        ));
    }

    let cohort_info = state
        .global_db
        .create_cohort(&body.name, &body.display_name, &db_path)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Initialize and add the cohort at runtime; clean up global row on failure
    if let Err(e) = state
        .add_cohort(cohort_info.clone(), !body.existing_db)
        .await
    {
        // Roll back the global DB row so retries don't hit UNIQUE constraint
        if let Err(del_err) = state.global_db.delete_cohort(cohort_info.id).await {
            tracing::error!("Failed to clean up cohort row after init failure: {del_err}");
        }
        return Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string()));
    }

    Ok(Json(cohort_info))
}

#[derive(Deserialize)]
struct UpdateCohortRequest {
    display_name: Option<String>,
    is_read_only: Option<bool>,
}

#[axum::debug_handler]
async fn update_cohort(
    claims: AccessClaims,
    AxumPath(name): AxumPath<String>,
    State(state): State<AppState>,
    Json(body): Json<UpdateCohortRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    let cohort = state
        .global_db
        .get_cohort_by_name(&name)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Cohort not found".to_string()))?;

    state
        .global_db
        .update_cohort(cohort.id, body.display_name.as_deref(), body.is_read_only)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Update in-memory read-only flag (takes effect immediately for all connections)
    if let Some(is_read_only) = body.is_read_only {
        if let Some(cohort_state) = state.cohorts.get(&name) {
            cohort_state
                .is_read_only
                .store(is_read_only, std::sync::atomic::Ordering::Relaxed);
        }
    }

    Ok(StatusCode::OK)
}

#[derive(Serialize)]
struct MemberWithBalance {
    #[serde(flatten)]
    member: backend::global_db::CohortMember,
    balance: Option<f64>,
}

#[axum::debug_handler]
async fn list_members(
    claims: AccessClaims,
    AxumPath(name): AxumPath<String>,
    State(state): State<AppState>,
) -> Result<Json<Vec<MemberWithBalance>>, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    let cohort = state
        .global_db
        .get_cohort_by_name(&name)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Cohort not found".to_string()))?;

    let members = state
        .global_db
        .get_cohort_members(cohort.id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let cohort_state = state.cohorts.get(&name);

    let mut result = Vec::with_capacity(members.len());
    for member in members {
        let balance =
            if let (Some(global_user_id), Some(cs)) = (member.global_user_id, &cohort_state) {
                cs.db
                    .get_balance_by_global_user_id(global_user_id)
                    .await
                    .ok()
                    .flatten()
            } else {
                None
            };
        result.push(MemberWithBalance { member, balance });
    }

    Ok(Json(result))
}

#[derive(Deserialize)]
struct BatchAddMembersRequest {
    #[serde(default)]
    emails: Vec<String>,
    #[serde(default)]
    user_ids: Vec<i64>,
    initial_balance: Option<String>,
}

#[derive(Serialize)]
struct BatchAddMembersResponse {
    added: usize,
}

#[axum::debug_handler]
async fn batch_add_members(
    claims: AccessClaims,
    AxumPath(name): AxumPath<String>,
    State(state): State<AppState>,
    Json(body): Json<BatchAddMembersRequest>,
) -> Result<Json<BatchAddMembersResponse>, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    let cohort = state
        .global_db
        .get_cohort_by_name(&name)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Cohort not found".to_string()))?;

    let mut added = 0;

    if !body.emails.is_empty() {
        added += state
            .global_db
            .batch_add_members(cohort.id, &body.emails, body.initial_balance.as_deref())
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    for user_id in &body.user_ids {
        state
            .global_db
            .add_member_by_user_id(cohort.id, *user_id, body.initial_balance.as_deref())
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        added += 1;
    }

    Ok(Json(BatchAddMembersResponse { added }))
}

#[axum::debug_handler]
async fn remove_member(
    claims: AccessClaims,
    AxumPath((name, member_id)): AxumPath<(String, i64)>,
    State(state): State<AppState>,
) -> Result<StatusCode, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    let cohort = state
        .global_db
        .get_cohort_by_name(&name)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Cohort not found".to_string()))?;

    state
        .global_db
        .remove_member(cohort.id, member_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::OK)
}

#[derive(Serialize)]
struct GlobalConfig {
    active_auction_cohort_id: Option<i64>,
    default_cohort_id: Option<i64>,
    public_auction_enabled: bool,
}

#[derive(Deserialize)]
#[allow(clippy::option_option)] // Intentional: distinguishes "not provided" from "set to null"
struct UpdateConfigRequest {
    active_auction_cohort_id: Option<Option<i64>>,
    default_cohort_id: Option<Option<i64>>,
    public_auction_enabled: Option<bool>,
}

#[axum::debug_handler]
async fn update_config(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(body): Json<UpdateConfigRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    if let Some(maybe_id) = body.active_auction_cohort_id {
        let value = match maybe_id {
            Some(id) => id.to_string(),
            None => String::new(),
        };
        state
            .global_db
            .set_config("active_auction_cohort_id", &value)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }
    if let Some(maybe_id) = body.default_cohort_id {
        let value = match maybe_id {
            Some(id) => id.to_string(),
            None => String::new(),
        };
        state
            .global_db
            .set_config("default_cohort_id", &value)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }
    if let Some(enabled) = body.public_auction_enabled {
        state
            .global_db
            .set_config("public_auction_enabled", &enabled.to_string())
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    Ok(StatusCode::OK)
}

#[derive(Serialize)]
struct UserCohortDetail {
    cohort_name: String,
    cohort_display_name: String,
}

#[derive(Serialize)]
struct UserWithCohorts {
    #[serde(flatten)]
    user: backend::global_db::GlobalUser,
    cohorts: Vec<UserCohortDetail>,
}

#[derive(Deserialize)]
struct ToggleAdminRequest {
    is_admin: bool,
}

#[axum::debug_handler]
async fn toggle_admin(
    claims: AccessClaims,
    AxumPath(user_id): AxumPath<i64>,
    State(state): State<AppState>,
    Json(body): Json<ToggleAdminRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    let result = state
        .global_db
        .set_user_admin(user_id, body.is_admin)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    match result {
        backend::global_db::SetUserAdminResult::Ok => Ok(StatusCode::OK),
        backend::global_db::SetUserAdminResult::UserNotFound => {
            Err((StatusCode::NOT_FOUND, "User not found".to_string()))
        }
        backend::global_db::SetUserAdminResult::BlockedByKindeRole => Err((
            StatusCode::CONFLICT,
            "Cannot revoke admin: this user has the Kinde admin role. Revoke the role in Kinde instead.".to_string(),
        )),
    }
}

#[derive(Deserialize)]
struct UpdateDisplayNameRequest {
    display_name: String,
}

#[axum::debug_handler]
async fn update_my_display_name(
    claims: AccessClaims,
    State(state): State<AppState>,
    Json(body): Json<UpdateDisplayNameRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let display_name = body.display_name.trim();
    if display_name.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            "Display name cannot be empty".to_string(),
        ));
    }
    let is_kinde_admin = claims.roles.contains(&backend::auth::Role::Admin);
    let global_user = state
        .global_db
        .ensure_global_user(
            &claims.sub,
            &claims.sub,
            claims.email.as_deref(),
            is_kinde_admin,
        )
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    state
        .global_db
        .update_user_display_name(global_user.id, display_name)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::OK)
}

#[axum::debug_handler]
async fn admin_update_display_name(
    claims: AccessClaims,
    AxumPath(user_id): AxumPath<i64>,
    State(state): State<AppState>,
    Json(body): Json<UpdateDisplayNameRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    check_admin(&state, &claims).await?;
    let display_name = body.display_name.trim();
    if display_name.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            "Display name cannot be empty".to_string(),
        ));
    }
    state
        .global_db
        .update_user_display_name(user_id, display_name)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(StatusCode::OK)
}

#[axum::debug_handler]
async fn delete_user_endpoint(
    claims: AccessClaims,
    AxumPath(user_id): AxumPath<i64>,
    State(state): State<AppState>,
) -> Result<StatusCode, (StatusCode, String)> {
    check_admin(&state, &claims).await?;
    state
        .global_db
        .delete_user(user_id)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(StatusCode::OK)
}

#[derive(Deserialize)]
struct UpdateMemberRequest {
    initial_balance: Option<String>,
}

#[axum::debug_handler]
async fn update_member(
    claims: AccessClaims,
    AxumPath((name, member_id)): AxumPath<(String, i64)>,
    State(state): State<AppState>,
    Json(body): Json<UpdateMemberRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    check_admin(&state, &claims).await?;

    let cohort = state
        .global_db
        .get_cohort_by_name(&name)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        .ok_or((StatusCode::NOT_FOUND, "Cohort not found".to_string()))?;

    let updated = state
        .global_db
        .update_member_initial_balance(cohort.id, member_id, body.initial_balance.as_deref())
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if !updated {
        return Err((
            StatusCode::NOT_FOUND,
            "Member not found in cohort".to_string(),
        ));
    }

    Ok(StatusCode::OK)
}

// --- Utility Endpoints ---

#[axum::debug_handler]
async fn upload_image(
    State(state): State<AppState>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let Some(field) = multipart.next_field().await.map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            format!("Failed to process form data: {e}"),
        )
    })?
    else {
        return Err((
            StatusCode::BAD_REQUEST,
            "No file found in request".to_string(),
        ));
    };

    let content_type = field
        .content_type()
        .ok_or((StatusCode::BAD_REQUEST, "Missing content type".to_string()))?;

    // Validate content type
    if !content_type.starts_with("image/") {
        return Err((
            StatusCode::BAD_REQUEST,
            "Invalid file type. Only images are allowed.".to_string(),
        ));
    }

    // Generate a unique filename with the correct extension
    let extension = mime::Mime::from_str(content_type)
        .map_err(|_| (StatusCode::BAD_REQUEST, "Invalid content type".to_string()))?
        .subtype()
        .as_str()
        .to_string();

    let filename = format!("{}.{}", Uuid::new_v4(), extension);
    let filepath = state.uploads_dir.join(&filename);

    // Read the file data and write it to disk
    let data = field.bytes().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to read file data: {e}"),
        )
    })?;

    tokio::fs::write(&filepath, &data).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to save file: {e}"),
        )
    })?;

    // Return the filename that can be used to access the image
    Ok(axum::Json(serde_json::json!({
        "filename": filename,
        "url": format!("/api/images/{filename}")
    })))
}

#[axum::debug_handler]
async fn serve_image(
    State(state): State<AppState>,
    AxumPath(filename): AxumPath<String>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let filepath = state.uploads_dir.join(filename);

    // Validate the path to prevent directory traversal
    if !filepath.starts_with(&state.uploads_dir) {
        return Err((StatusCode::BAD_REQUEST, "Invalid filename".to_string()));
    }

    let data = tokio::fs::read(&filepath)
        .await
        .map_err(|e| (StatusCode::NOT_FOUND, format!("Image not found: {e}")))?;

    // Try to determine the content type from the file extension
    let content_type = match filepath.extension().and_then(|e| e.to_str()) {
        Some("jpg" | "jpeg") => "image/jpeg",
        Some("png") => "image/png",
        Some("gif") => "image/gif",
        Some("webp") => "image/webp",
        _ => "application/octet-stream",
    };

    Ok(([(axum::http::header::CONTENT_TYPE, content_type)], data))
}
