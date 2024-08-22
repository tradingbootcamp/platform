#![allow(clippy::unused_async, clippy::missing_errors_doc)]

use std::borrow::Cow;

use crate::{
    auth::AccessClaims,
    db::{self, CancelOrderStatus, CreateOrderStatus, Order, OrderFill, Side, Trade},
    websocket_api::{
        self, server_message::Message as SM, CancelOrder, CreateOrder, OrderCancelled,
        OrderCreated, Out, Redeem, Redeemed, ServerMessage, Size,
    },
    AppState,
};
use axum::{
    extract::{Query, Request, State, WebSocketUpgrade},
    middleware::Next,
    response::{IntoResponse, Response},
    Extension, Json,
};
use reqwest::StatusCode;
use serde_json::json;
use utoipa::{
    openapi::{self, security::SecurityScheme},
    Modify, OpenApi,
};

#[axum::debug_handler]
pub async fn api(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| crate::handle_socket::handle_socket(socket, state))
}

#[derive(OpenApi)]
#[openapi(
    info(title = "trading-bootcamp-api", description = "Trading Bootcamp API"),
    paths(out, openapi, cancel_order, create_order, redeem),
    components(schemas(
        Out,
        OutResponse,
        CancelOrder,
        CreateOrder,
        CreateOrderResponse,
        Redeem,
        Redeemed,
        Error,
        Order,
        OrderFill,
        Trade,
        Side
    )),
    modifiers(&SecurityAddon),
    security(
        ("accessToken" = [])
    )
)]
pub struct ApiDoc;

pub struct SecurityAddon;

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
pub async fn openapi() -> Json<utoipa::openapi::OpenApi> {
    let mut spec = ApiDoc::openapi();
    spec.paths
        .paths
        .values_mut()
        .for_each(|v| v.operations.values_mut().for_each(|o| o.tags = None));
    Json(spec)
}

#[derive(Debug, Clone)]
pub struct ValidatedUserId(String);

#[derive(serde::Deserialize, utoipa::ToSchema, utoipa::IntoParams)]
#[into_params(parameter_in = Query)]
pub struct ActAsQuery {
    #[serde(default)]
    pub act_as: Option<String>,
}

pub async fn auth(
    claims: AccessClaims,
    Query(query): Query<ActAsQuery>,
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, AppError> {
    if let Some(act_as) = query.act_as {
        if !(act_as == claims.sub || state.db.is_owner_of(&claims.sub, &act_as).await?) {
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

pub async fn mutation_rate_limit(
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

#[derive(utoipa::ToSchema)]
#[allow(dead_code)]
pub struct Error {
    pub error: String,
}

#[derive(serde::Serialize, utoipa::ToSchema)]
pub struct OutResponse {
    pub canceled_orders: Vec<i64>,
}

#[axum::debug_handler]
#[utoipa::path(
    delete,
    path = "/api/out",
    request_body = Out,
    params(ActAsQuery),
    responses(
        (status = 200, description = "Orders canceled successfully", body = OutResponse),
        (status = 500, description = "Internal server error", body = Error)
    )
)]
pub async fn out(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<Out>,
) -> Result<Json<OutResponse>, AppError> {
    let orders_deleted = state.db.out(body.market_id, &user_id).await?;
    if !orders_deleted.is_empty() {
        state.subscriptions.notify_user_portfolio(&user_id);
    }
    for &id in &orders_deleted {
        let msg = ServerMessage {
            message: Some(SM::OrderCancelled(OrderCancelled {
                id,
                market_id: body.market_id,
            })),
        };
        state.subscriptions.send_public(msg);
    }
    Ok(Json(OutResponse {
        canceled_orders: orders_deleted,
    }))
}

#[axum::debug_handler]
#[utoipa::path(
    post,
    path = "/api/redeem",
    request_body = Redeem,
    params(ActAsQuery),
    responses(
        (status = 200, description = "Redeemed successfully", body = Redeemed),
        (status = 500, description = "Internal server error", body = Error),
        (status = 400, description = "Bad request", body = Error),
    )
)]
pub async fn redeem(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<Redeem>,
) -> Result<Json<Redeemed>, AppError> {
    let Ok(amount) = body.amount.parse() else {
        return Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Failed parsing amount".into(),
        ));
    };
    match state.db.redeem(body.fund_id, &user_id, amount).await? {
        db::RedeemStatus::Success { transaction_id } => {
            state.subscriptions.notify_user_portfolio(&user_id);
            let redeemed = Redeemed {
                transaction_id,
                user_id,
                fund_id: body.fund_id,
                amount: body.amount,
            };
            let msg = ServerMessage {
                message: Some(SM::Redeemed(redeemed.clone())),
            };
            state.subscriptions.send_public(msg);
            Ok(Json(redeemed))
        }
        db::RedeemStatus::MarketNotRedeemable => Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Market not redeemable".into(),
        )),
        db::RedeemStatus::InsufficientFunds => Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Insufficient funds".into(),
        )),
        db::RedeemStatus::InvalidAmount => Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Invalid amount".into(),
        )),
        db::RedeemStatus::RedeemerNotFound => {
            tracing::error!("Redeemer not found");
            Err(AppError::StatusMessage(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Redeemer not found".into(),
            ))
        }
    }
}

#[axum::debug_handler]
#[utoipa::path(
    delete,
    path = "/api/cancel-order",
    request_body = CancelOrder,
    params(ActAsQuery),
    responses(
        (status = 200, description = "Order canceled successfully"),
        (status = 500, description = "Internal server error", body = Error),
        (status = 403, description = "Not owner of order", body = Error),
        (status = 404, description = "Order not found", body = Error)
    )
)]
pub async fn cancel_order(
    Extension(ValidatedUserId(user_id)): Extension<ValidatedUserId>,
    State(state): State<AppState>,
    Json(body): Json<CancelOrder>,
) -> Result<(), AppError> {
    match state.db.cancel_order(body.id, &user_id).await? {
        CancelOrderStatus::Success { market_id } => {
            let msg = ServerMessage {
                message: Some(SM::OrderCancelled(OrderCancelled {
                    id: body.id,
                    market_id,
                })),
            };
            state.subscriptions.send_public(msg);
            state.subscriptions.notify_user_portfolio(&user_id);
            Ok(())
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
pub struct CreateOrderResponse {
    pub order: Option<Order>,
    pub fills: Vec<OrderFill>,
    pub trades: Vec<Trade>,
}

#[allow(clippy::similar_names)]
#[allow(clippy::too_many_lines)]
#[axum::debug_handler]
#[utoipa::path(
    post,
    path = "/api/create-order",
    request_body = CreateOrder,
    params(ActAsQuery),
    responses(
        (status = 201, description = "Order Created Successfully", body = CreateOrderResponse),
        (status = 500, description = "Internal server error", body = Error),
        (status = 400, description = "Invalid request", body = Error),
        (status = 404, description = "Market not found", body = Error),
        (status = 400, description = "Market settled", body = Error),
    )
)]
pub async fn create_order(
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

    let Ok(price) = body.price.parse() else {
        return Err(AppError::StatusMessage(
            StatusCode::BAD_REQUEST,
            "Failed parsing price".into(),
        ));
    };

    let side = match body.side() {
        websocket_api::Side::Unknown => {
            return Err(AppError::StatusMessage(
                StatusCode::BAD_REQUEST,
                "Unknown side".into(),
            ))
        }
        websocket_api::Side::Bid => Side::Bid,
        websocket_api::Side::Offer => Side::Offer,
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
            let resp = ServerMessage {
                message: Some(SM::OrderCreated(OrderCreated {
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
                })),
            };
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

pub enum AppError {
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
