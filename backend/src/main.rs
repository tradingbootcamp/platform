use std::borrow::Cow;

use axum::{
    extract::{Query, Request, State, WebSocketUpgrade},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{delete, get, post},
    Extension, Json, Router,
};
use backend::{
    auth::AccessClaims,
    db::{self, CancelOrderStatus, CreateOrderStatus, Order, OrderFill, Trade},
    handle_socket::server_message,
    websocket_api::{
        self, server_message::Message as SM, CancelOrder, CreateOrder, OrderCancelled,
        OrderCreated, Out, Side, Size,
    },
    AppState,
};
use reqwest::StatusCode;
use serde_json::json;
use tokio::net::TcpListener;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use utoipa::{
    openapi::{self, security::SecurityScheme},
    Modify, OpenApi,
};

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
        .route("/api/cancel_order", delete(cancel_order))
        .route("/api/create_order", post(create_order))
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

#[axum::debug_handler]
async fn api(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| backend::handle_socket::handle_socket(socket, state))
}

#[derive(OpenApi)]
#[openapi(
    info(description = "Trading Bootcamp API"),
    paths(out, openapi, cancel_order, create_order),
    components(schemas(Out, OutResponse, CancelOrder, CancelOrderResponse, CreateOrder, CreateOrderResponse, Error, Order, OrderFill, Trade)),
    modifiers(&SecurityAddon),
    security(
        ("accessToken" = [])
    )
)]
struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "accessToken",
                SecurityScheme::Http(
                    openapi::security::HttpBuilder::new()
                        .scheme(openapi::security::HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            );
        }
    }
}

#[utoipa::path(
    get,
    path = "/openapi.json",
    responses(
        (status = 200, description = "JSON file", body = ())
    )
)]
async fn openapi() -> Json<utoipa::openapi::OpenApi> {
    Json(ApiDoc::openapi())
}

#[derive(Debug, Clone)]
struct ValidatedUserId(String);

#[derive(serde::Deserialize, utoipa::ToSchema)]
struct ActAsQuery {
    act_as: Option<String>,
}

async fn auth(
    claims: AccessClaims,
    Query(query): Query<ActAsQuery>,
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if let Some(act_as) = query.act_as {
        if !state.db.is_owner_of(&claims.sub, &act_as).await? {
            return Err(AppError::StatusMessage(
                StatusCode::FORBIDDEN,
                format!("Not owner of {act_as}").into(),
            ));
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

#[derive(serde::Serialize, utoipa::ToSchema)]
struct OutResponse {
    canceled_orders: Vec<i64>,
}

#[derive(utoipa::ToSchema)]
struct Error {
    error: String,
}

#[axum::debug_handler]
#[utoipa::path(
    delete,
    path = "/api/out",
    request_body = Out,
    responses(
        (status = 200, description = "Orders canceled successfully", body = OutResponse),
        (status = 500, description = "Internal server error", body = Error)
    )
)]
async fn out(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<Out>,
) -> Result<Json<OutResponse>, AppError> {
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
    Ok(Json(OutResponse {
        canceled_orders: orders_deleted,
    }))
}

#[derive(serde::Serialize, utoipa::ToSchema)]
struct CancelOrderResponse;

#[axum::debug_handler]
#[utoipa::path(
    delete,
    path = "/api/cancel-order",
    request_body = CancelOrder,
    responses(
        (status = 200, description = "Order canceled successfully", body = CanceledOrderResponse),
        (status = 500, description = "Internal server error", body = Error),
        (status = 403, description = "Not owner of order", body = Error),
        (status = 404, description = "Order not found", body = Error)
    )
)]
async fn cancel_order(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<CancelOrder>,
) -> Result<Json<CancelOrderResponse>, AppError> {
    match state.db.cancel_order(body.id, &user_id).await? {
        CancelOrderStatus::Success { market_id } => {
            let msg = server_message(SM::OrderCancelled(OrderCancelled {
                id: body.id,
                market_id,
            }));
            state.subscriptions.send_public(msg);
            state.subscriptions.notify_user_portfolio(&user_id);
            Ok(Json(CancelOrderResponse))
        }
        CancelOrderStatus::NotOwner => Err(AppError::StatusMessage(
            StatusCode::FORBIDDEN,
            "Not owner of order".into(),
        )),
        CancelOrderStatus::NotFound => Err(AppError::StatusMessage(
            StatusCode::NOT_FOUND,
            "Order not found".into(),
        )),
    }
}

#[derive(serde::Serialize, utoipa::ToSchema)]
struct CreateOrderResponse {
    order: Option<Order>,
    fills: Vec<OrderFill>,
    trades: Vec<Trade>,
}

#[allow(clippy::similar_names)]
#[axum::debug_handler]
#[utoipa::path(
    post,
    path = "/api/create-order",
    request_body = CreateOrder,
    responses(
        (status = 201, description = "Order Created Successfully", body = CreateOrderResponse),
        (status = 500, description = "Internal server error", body = Error),
        (status = 400, description = "Invalid request", body = Error),
        (status = 404, description = "Market not found", body = Error),
        (status = 400, description = "Market settled", body = Error),
    )
)]
async fn create_order(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<CreateOrder>,
) -> Result<(StatusCode, Json<CreateOrderResponse>), AppError> {
    let Ok(size) = body.size.parse() else {
        return Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Failed parsing size".into(),
        ));
    };

    let Ok(price) = body.size.parse() else {
        return Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Failed parsing price".into(),
        ));
    };

    let side = match body.side() {
        Side::Unknown => {
            return Err(AppError::StatusMessage(
                StatusCode::BAD_REQUEST,
                "Unknown side".into(),
            ))
        }
        Side::Bid => db::Side::Bid,
        Side::Offer => db::Side::Offer,
    };
    match state
        .db
        .create_order(body.market_id, &user_id, price, size, side)
        .await?
    {
        CreateOrderStatus::MarketSettled => Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Market settled".into(),
        )),
        CreateOrderStatus::InvalidSize => Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Invalid size".into(),
        )),
        CreateOrderStatus::InvalidPrice => Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Invalid price".into(),
        )),
        CreateOrderStatus::InsufficientFunds => Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Insufficient funds".into(),
        )),
        CreateOrderStatus::MarketNotFound => Err(AppError::StatusMessage(
            StatusCode::NOT_FOUND,
            "Market not found".into(),
        )),
        CreateOrderStatus::UserNotFound => {
            tracing::error!("Authenticated user not found");
            Err(AppError::StatusMessage(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Authenticated user not found".into(),
            ))
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
                let mut order = websocket_api::Order::from(o);
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
                fills: fills
                    .iter()
                    .cloned()
                    .map(websocket_api::order_created::OrderFill::from)
                    .collect(),
                trades: trades
                    .iter()
                    .cloned()
                    .map(websocket_api::Trade::from)
                    .collect(),
            }));
            state.subscriptions.send_public(resp);
            Ok((
                StatusCode::CREATED,
                Json(CreateOrderResponse {
                    order: db_order,
                    fills,
                    trades,
                }),
            ))
        }
    }
}

enum AppError {
    InternalServerError(anyhow::Error),
    StatusMessage(StatusCode, Cow<'static, str>),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::InternalServerError(err) => {
                tracing::error!("Internal server error: {:?}", err);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({"error": "Internal server error"})),
                )
                    .into_response()
            }
            AppError::StatusMessage(status, message) => {
                (status, Json(json!({"error": message}))).into_response()
            }
        }
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self::InternalServerError(err.into())
    }
}
