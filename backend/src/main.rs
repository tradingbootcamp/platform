use axum::{
    self,
    middleware::{self},
    routing::{delete, get, post},
    Router,
};
use backend::{
    endpoints::{api, auth, cancel_order, create_order, mutation_rate_limit, openapi, out, redeem},
    AppState,
};
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
        .route("/api/out", delete(out))
        .route("/api/cancel-order", delete(cancel_order))
        .route("/api/create-order", post(create_order))
        .route("/api/redeem", post(redeem))
        .layer(middleware::from_fn_with_state(
            state.clone(),
            mutation_rate_limit,
        ))
        .layer(middleware::from_fn_with_state(state.clone(), auth))
        .route("/api", get(api))
        .route("/openapi.json", get(openapi))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:8080").await?;
    tracing::info!("Listening on {}", listener.local_addr()?);
    Ok(axum::serve(listener, app).await?)
}
