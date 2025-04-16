use axum::{
    self,
    extract::{State, WebSocketUpgrade},
    response::Response,
    routing::get,
    Router,
};
use backend::{airtable_users, AppState};
use tokio::net::TcpListener;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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

    let app = Router::new()
        .route("/api", get(api))
        .route("/sync-airtable-users", get(sync_airtable_users))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:8080").await?;
    tracing::info!("Listening on {}", listener.local_addr()?);
    Ok(axum::serve(listener, app).await?)
}

#[axum::debug_handler]
async fn api(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| backend::handle_socket::handle_socket(socket, state))
}

#[axum::debug_handler]
async fn sync_airtable_users(State(state): State<AppState>) -> axum::http::StatusCode {
    match airtable_users::sync_airtable_users_to_kinde_and_db(state).await {
        Ok(()) => {
            tracing::info!("Successfully synchronized Airtable users");
            axum::http::StatusCode::OK
        }
        Err(e) => {
            tracing::error!("Failed to synchronize Airtable users: {e}");
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        }
    }
}
