use axum::{
    extract::{Query, Request, State, WebSocketUpgrade},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
    Extension, Json, Router,
};
use backend::{
    auth::AccessClaims,
    db::{self, CancelOrderStatus, CreateOrderStatus},
    handle_socket::server_message,
    websocket_api::{
        order_created::OrderFill, server_message::Message as SM, ActAs, CancelOrder, CreateOrder,
        Order, OrderCancelled, OrderCreated, Out, Side, Size, Trade,
    },
    AppState,
};
use reqwest::StatusCode;
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
        .route("/api/out", post(out))
        .route("/api/cancel_order", post(cancel_order))
        .route("/api/create_order", post(create_order))
        .layer(middleware::from_fn_with_state(
            state.clone(),
            mutation_rate_limit,
        ))
        .layer(middleware::from_fn_with_state(state.clone(), auth))
        .route("/api", get(api))
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

#[derive(Debug, Clone)]
struct ValidatedUserId(String);

struct InternalServerError(anyhow::Error);

async fn auth(
    claims: AccessClaims,
    act_as: Option<Query<ActAs>>,
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, InternalServerError> {
    if let Some(act_as) = act_as.map(|Query(act_as)| act_as.user_id) {
        if !state.db.is_owner_of(&claims.sub, &act_as).await? {
            return Ok((
                StatusCode::FORBIDDEN,
                Json(json!({"error": format!("You don't own {act_as}")})),
            )
                .into_response());
        }
        request.extensions_mut().insert(ValidatedUserId(act_as));
    } else {
        request
            .extensions_mut()
            .insert(ValidatedUserId(claims.sub.clone()));
    }
    request.extensions_mut().insert(claims);
    Ok(next.run(request).await.into_response())
}

async fn mutation_rate_limit(
    Extension(claims): Extension<AccessClaims>,
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    if state.mutate_ratelimit.check_key(&claims.sub).is_err() {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    };

    Ok(next.run(request).await.into_response())
}

#[axum::debug_handler]
async fn out(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<Out>,
) -> Result<Response, InternalServerError> {
    let orders_deleted = state.db.out(body.market_id, &user_id).await?;
    if !orders_deleted.is_empty() {
        state.subscriptions.notify_user_portfolio(&user_id);
    }
    for &id in &orders_deleted {
        let msg = server_message(SM::OrderCancelled(OrderCancelled {
            id,
            market_id: body.market_id,
        }));
        state.subscriptions.send_public(msg);
    }
    Ok(Json(json!({
        "orders_canceled": orders_deleted,
    }))
    .into_response())
}

#[axum::debug_handler]
async fn cancel_order(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<CancelOrder>,
) -> Result<Response, InternalServerError> {
    let resp = match state.db.cancel_order(body.id, &user_id).await? {
        CancelOrderStatus::Success { market_id } => {
            let msg = server_message(SM::OrderCancelled(OrderCancelled {
                id: body.id,
                market_id,
            }));
            state.subscriptions.send_public(msg);
            state.subscriptions.notify_user_portfolio(&user_id);
            (StatusCode::OK, Json(json!({"market_id": market_id})))
        }
        CancelOrderStatus::NotOwner => (
            StatusCode::FORBIDDEN,
            Json(json!({"error": "Not order owner"})),
        ),
        CancelOrderStatus::NotFound => (
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Order not found"})),
        ),
    };
    Ok(resp.into_response())
}

#[allow(clippy::similar_names)]
#[axum::debug_handler]
async fn create_order(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<CreateOrder>,
) -> Result<Response, InternalServerError> {
    let Ok(size) = body.size.parse() else {
        return Ok((
            StatusCode::BAD_REQUEST,
            Json(json! ({"error": "Failed parsing size"})),
        )
            .into_response());
    };

    let Ok(price) = body.size.parse() else {
        return Ok((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Failed parsing price"})),
        )
            .into_response());
    };

    let side = match body.side() {
        Side::Unknown => {
            return Ok((
                StatusCode::BAD_REQUEST,
                Json(json!({"error": "Unknown side"})),
            )
                .into_response());
        }
        Side::Bid => db::Side::Bid,
        Side::Offer => db::Side::Offer,
    };
    match state
        .db
        .create_order(body.market_id, &user_id, price, size, side)
        .await?
    {
        CreateOrderStatus::MarketSettled => Ok((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Market settled"})),
        )
            .into_response()),
        CreateOrderStatus::InvalidSize => Ok((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Invalid size"})),
        )
            .into_response()),
        CreateOrderStatus::InvalidPrice => Ok((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Invalid price"})),
        )
            .into_response()),
        CreateOrderStatus::InsufficientFunds => Ok((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Insufficient funds"})),
        )
            .into_response()),
        CreateOrderStatus::MarketNotFound => Ok((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Market not found"})),
        )
            .into_response()),
        CreateOrderStatus::UserNotFound => {
            tracing::error!("Authenticated user not found");
            Ok((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"error": "Authenticated user not found"})),
            )
                .into_response())
        }
        CreateOrderStatus::Success {
            order: db_order,
            fills,
            trades,
        } => {
            for filled_user_id in fills.iter().map(|fill| &fill.owner_id) {
                state.subscriptions.notify_user_portfolio(filled_user_id);
            }
            state.subscriptions.notify_user_portfolio(&user_id);
            let order = db_order.clone().map(|o| {
                let mut order = Order::from(o);
                order.sizes = vec![Size {
                    transaction_id: order.transaction_id,
                    size: order.size.clone(),
                }];
                order
            });
            let resp = server_message(SM::OrderCreated(OrderCreated {
                market_id: body.market_id,
                user_id,
                order,
                fills: fills.iter().cloned().map(OrderFill::from).collect(),
                trades: trades.iter().cloned().map(Trade::from).collect(),
            }));
            state.subscriptions.send_public(resp);
            Ok(Json(json!({
                "order": db_order,
                "fills": fills,
                "trades": trades,
            }))
            .into_response())
        }
    }
}

impl IntoResponse for InternalServerError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": self.0.to_string()})),
        )
            .into_response()
    }
}

impl<E> From<E> for InternalServerError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}
