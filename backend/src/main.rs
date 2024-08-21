use axum::{
    extract::{State, WebSocketUpgrade},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use backend::{
    auth::AccessClaims,
    db::{CancelOrderStatus, CreateOrderStatus, Side},
    websocket_api::Order,
    AppState,
};
use reqwest::StatusCode;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde_json::json;
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
        .route("/api/out", post(api_out))
        .route("/api/cancel_order", post(api_cancel_order))
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

#[derive(Debug, Deserialize)]
struct OutBody {
    market_id: i64,
}

#[axum::debug_handler]
async fn api_out(
    claim: AccessClaims,
    State(state): State<AppState>,
    body: Json<OutBody>,
) -> Response {
    if state.mutate_ratelimit.check_key(&claim.sub).is_err() {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            "Mutation rate limit reached.",
        )
            .into_response();
    };

    match state.db.out(body.market_id, &claim.sub).await {
        Ok(x) => {
            state.subscriptions.notify_user_portfolio(&claim.sub);
            Json(json!({
                "orders_cancelled": x,
            }))
            .into_response()
        }

        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response(),
    }
}

#[derive(Debug, Deserialize)]
struct CancelOrderBody {
    order_id: i64,
}

#[axum::debug_handler]
async fn api_cancel_order(
    claim: AccessClaims,
    State(state): State<AppState>,
    body: Json<CancelOrderBody>,
) -> Response {
    if state.mutate_ratelimit.check_key(&claim.sub).is_err() {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            "Mutation rate limit reached.",
        )
            .into_response();
    };

    match state.db.cancel_order(body.order_id, &claim.sub).await {
        Ok(s) => match s {
            CancelOrderStatus::Success { market_id } => {
                state.subscriptions.notify_user_portfolio(&claim.sub);
                Json(json!({"market_id": market_id})).into_response()
            }
            CancelOrderStatus::NotOwner => {
                (StatusCode::FORBIDDEN, "You don't own this order.").into_response()
            }
            CancelOrderStatus::NotFound => {
                (StatusCode::NOT_FOUND, "Order not found.").into_response()
            }
        },
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response(),
    }
}

#[derive(Debug, Deserialize)]
struct CreateOrderBody {
    market_id: i64,
    price: String,
    size: String,
    side: String,
}

#[axum::debug_handler]
async fn api_create_order(
    claim: AccessClaims,
    State(state): State<AppState>,
    body: Json<CreateOrderBody>,
) -> Response {
    let side = match body.side.as_str() {
        "bid" => Side::Bid,
        "offer" => Side::Offer,
        _ => return (StatusCode::BAD_REQUEST, "Side must be 'bid' or 'offer'.").into_response(),
    };

    let Ok(size) = body.size.parse() else {
        return (StatusCode::BAD_REQUEST, "Failed parsing size").into_response();
    };

    let Ok(price) = body.size.parse() else {
        return (StatusCode::BAD_REQUEST, "Failed parsing price").into_response();
    };

    if state.mutate_ratelimit.check_key(&claim.sub).is_err() {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            "Mutation rate limit reached.",
        )
            .into_response();
    };

    match state
        .db
        .create_order(body.market_id, &claim.sub, price, size, side)
        .await
    {
        Ok(s) => match s {
            CreateOrderStatus::MarketSettled => {
                (StatusCode::FORBIDDEN, "Market already settled").into_response()
            }
            CreateOrderStatus::InvalidSize => {
                (StatusCode::BAD_REQUEST, "Invalid size").into_response()
            }
            CreateOrderStatus::InvalidPrice => {
                (StatusCode::BAD_REQUEST, "Invalid price").into_response()
            }
            CreateOrderStatus::InsufficientFunds => {
                (StatusCode::FORBIDDEN, "Insufficient funds").into_response()
            }
            CreateOrderStatus::MarketNotFound => {
                (StatusCode::NOT_FOUND, "Market not found").into_response()
            }
            CreateOrderStatus::UserNotFound => {
                (StatusCode::INTERNAL_SERVER_ERROR, "User not found").into_response()
            }

            CreateOrderStatus::Success {
                order,
                fills,
                trades,
            } => {
                for user_id in fills.iter().map(|fill| &fill.owner_id) {
                    state.subscriptions.notify_user_portfolio(user_id);
                }
                state.subscriptions.notify_user_portfolio(&claim.sub);
                let order = order.map(|o| {
                    json!({
                        "id": o.id,
                        "market_id": o.market_id,
                        "owner_id": o.owner_id,
                        "transaction_id": o.transaction_id,
                        "size": o.size.to_string(),
                        "sizes": vec![json!({
                            "transaction_id": o.transaction_id,
                            "size": o.size.to_string()
                        })],
                        "price": o.price.to_string(),
                        "side": o.side.to_string()
                    })
                });

                Json(json!({
                    "order": order,
                }))
                .into_response()
            }
        },
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response(),
    }
}
