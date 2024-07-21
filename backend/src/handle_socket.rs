use crate::{
    auth::{validate_jwt, Claims, Role},
    db::{
        self, CancelOrderStatus, CreateMarketStatus, CreateOrderStatus, MakePaymentStatus,
        SettleMarketStatus, DB,
    },
    subscriptions::Subscriptions,
    websocket_api::{
        client_message::Message as CM,
        order_created::OrderFill,
        request_failed::{ErrorDetails, RequestDetails},
        server_message::Message as SM,
        Authenticated, ClientMessage, Market, MarketSettled, Order, OrderCancelled, OrderCreated,
        Payment, Payments, RequestFailed, ServerMessage, Side, Trade,
    },
};
use anyhow::{anyhow, bail};
use async_stream::stream;
use axum::extract::{ws, ws::WebSocket};
use futures::{Stream, StreamExt, TryStreamExt};
use prost::{bytes::Bytes, Message};
use rust_decimal_macros::dec;
use tokio::sync::broadcast::error::RecvError;

pub async fn handle_socket(socket: WebSocket, db: DB, subscriptions: Subscriptions) {
    if let Err(e) = handle_socket_fallible(socket, db, subscriptions).await {
        tracing::error!("Error handling socket: {e}");
    } else {
        tracing::info!("Client disconnected");
    }
}

async fn handle_socket_fallible(
    mut socket: WebSocket,
    db: DB,
    subscriptions: Subscriptions,
) -> anyhow::Result<()> {
    let claims = authenticate(&mut socket).await?;
    let is_admin = claims.roles.contains(&Role::Admin);
    let initial_balance = if is_admin { dec!(1_000_000) } else { dec!(0) };
    db.ensure_user_created(&claims.sub, initial_balance).await?;
    let mut portfolio_watcher = subscriptions.subscribe_portfolio(&claims.sub);
    let mut market_receiver = subscriptions.subscribe_market_data();
    let mut payment_receiver = subscriptions.subscribe_payments(&claims.sub);
    send_initial_data(&db, &claims, &mut socket).await?;

    loop {
        tokio::select! {
            biased;
            msg = market_receiver.recv() => {
                handle_subscription_message(&mut socket, msg).await?;
            }
            msg = payment_receiver.recv() => {
                handle_subscription_message(&mut socket, msg).await?;
            }
            msg = socket.recv() => {
                let Some(msg) = msg else {
                    // client disconnected
                    break Ok(())
                };
                let msg = msg?;
                if let ws::Message::Close(_) = msg {
                    break Ok(());
                }
                handle_client_message(
                    &mut socket,
                    &db,
                    &subscriptions,
                    &claims,
                    msg,
                )
                .await?;
            }
            r = portfolio_watcher.changed() => {
                r?;
                let portfolio = db.get_portfolio(&claims.sub).await?.ok_or_else(|| anyhow!("Authenticated user not found"))?;
                let resp = server_message(SM::Portfolio(portfolio.into()));
                socket.send(resp).await?;
            }
        }
    }
}

async fn send_initial_data(db: &DB, claims: &Claims, socket: &mut WebSocket) -> anyhow::Result<()> {
    let portfolio = db
        .get_portfolio(&claims.sub)
        .await?
        .ok_or_else(|| anyhow!("Authenticated user not found"))?;
    let portfolio_msg = server_message(SM::Portfolio(portfolio.into()));
    socket.send(portfolio_msg).await?;

    let payments = db
        .get_payments(&claims.sub)
        .map(|payment| payment.map(Payment::from))
        .try_collect::<Vec<_>>()
        .await?;
    let payments_msg = server_message(SM::Payments(Payments { payments }));
    socket.send(payments_msg).await?;

    let mut markets = db.get_all_markets().map(|market| market.map(Market::from));
    let mut all_live_orders = db.get_all_live_orders().map(|order| order.map(Order::from));
    let mut all_trades = db.get_all_trades().map(|trade| trade.map(Trade::from));
    let mut next_order = all_live_orders.try_next().await?;
    let mut next_trade = all_trades.try_next().await?;
    while let Some(mut market) = markets.try_next().await? {
        let orders_stream = stream_chunk_for_market_id(
            &mut next_order,
            |order| order.market_id,
            market.id,
            &mut all_live_orders,
        );
        let trades_stream = stream_chunk_for_market_id(
            &mut next_trade,
            |trade| trade.market_id,
            market.id,
            &mut all_trades,
        );
        let (orders, trades) = tokio::join!(
            orders_stream.try_collect::<Vec<_>>(),
            trades_stream.try_collect::<Vec<_>>(),
        );
        market.orders = orders?;
        market.trades = trades?;
        let market_msg = server_message(SM::MarketData(market));
        socket.send(market_msg).await?;
    }
    Ok(())
}

async fn handle_subscription_message(
    socket: &mut WebSocket,
    msg: Result<ws::Message, RecvError>,
) -> anyhow::Result<()> {
    Ok(match msg {
        Ok(msg) => socket.send(msg).await?,
        Err(RecvError::Lagged(n)) => {
            tracing::warn!("Lagged {n}");
            // TODO: handle lagged
        }
        Err(RecvError::Closed) => {
            bail!("Market sender closed");
        }
    })
}

async fn handle_client_message(
    socket: &mut WebSocket,
    db: &DB,
    subscriptions: &Subscriptions,
    claims: &Claims,
    msg: ws::Message,
) -> anyhow::Result<()> {
    let ws::Message::Binary(msg) = msg else {
        let resp = request_failed("Unknown", "Expected Binary message");
        socket.send(resp).await?;
        return Ok(());
    };
    let Ok(ClientMessage { message: Some(msg) }) = ClientMessage::decode(Bytes::from(msg)) else {
        let resp = request_failed("Unknown", "Expected Client message");
        socket.send(resp).await?;
        return Ok(());
    };
    match msg {
        CM::CreateMarket(create_market) => {
            let Ok(min_settlement) = create_market.min_settlement.parse() else {
                let resp = request_failed("CreateMarket", "Failed parsing min_settlement");
                socket.send(resp).await?;
                return Ok(());
            };
            let Ok(max_settlement) = create_market.max_settlement.parse() else {
                let resp = request_failed("CreateMarket", "Failed parsing max_settlement");
                socket.send(resp).await?;
                return Ok(());
            };
            let CreateMarketStatus::Success(market) = db
                .create_market(
                    &create_market.name,
                    &create_market.description,
                    &claims.sub,
                    min_settlement,
                    max_settlement,
                )
                .await?
            else {
                let resp = request_failed("CreateMarket", "Invalid settlement prices");
                socket.send(resp).await?;
                return Ok(());
            };
            let resp = server_message(SM::MarketCreated(market.into()));
            subscriptions.send_market_data(resp);
        }
        CM::SettleMarket(settle_market) => {
            let Ok(settled_price) = settle_market.settle_price.parse() else {
                let resp = request_failed("SettleMarket", "Failed parsing settle_price");
                socket.send(resp).await?;
                return Ok(());
            };
            match db
                .settle_market(settle_market.id, settled_price, &claims.sub)
                .await?
            {
                SettleMarketStatus::Success { affected_users } => {
                    let resp = server_message(SM::MarketSettled(MarketSettled {
                        id: settle_market.id,
                        settle_price: settle_market.settle_price,
                    }));
                    subscriptions.send_market_data(resp);
                    for user in affected_users {
                        subscriptions.notify_user_portfolio(&user);
                    }
                }
                SettleMarketStatus::AlreadySettled => {
                    let resp = request_failed("SettleMarket", "Market already settled");
                    socket.send(resp).await?;
                }
                SettleMarketStatus::NotOwner => {
                    let resp = request_failed("SettleMarket", "Not market owner");
                    socket.send(resp).await?;
                }
                SettleMarketStatus::InvalidSettlementPrice => {
                    let resp = request_failed("SettleMarket", "Invalid settlement price");
                    socket.send(resp).await?;
                }
            }
        }
        CM::CreateOrder(create_order) => {
            let Ok(size) = create_order.size.parse() else {
                let resp = request_failed("CreateOrder", "Failed parsing size");
                socket.send(resp).await?;
                return Ok(());
            };
            let Ok(price) = create_order.price.parse() else {
                let resp = request_failed("CreateOrder", "Failed parsing price");
                socket.send(resp).await?;
                return Ok(());
            };
            let side = match create_order.side() {
                Side::Unknown => {
                    let resp = request_failed("CreateOrder", "Unknown side");
                    socket.send(resp).await?;
                    return Ok(());
                }
                Side::Bid => db::Side::Bid,
                Side::Offer => db::Side::Offer,
            };
            match db
                .create_order(create_order.market_id, &claims.sub, price, size, side)
                .await?
            {
                CreateOrderStatus::MarketSettled => {
                    let resp = request_failed("CreateOrder", "Market already settled");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::InvalidPrice => {
                    let resp = request_failed("CreateOrder", "Invalid price");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::InsufficientFunds => {
                    let resp = request_failed("CreateOrder", "Insufficient funds");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::Success {
                    order,
                    fills,
                    trades,
                } => {
                    for user_id in fills.iter().map(|fill| &fill.owner_id) {
                        subscriptions.notify_user_portfolio(user_id);
                    }
                    subscriptions.notify_user_portfolio(&claims.sub);
                    let resp = server_message(SM::OrderCreated(OrderCreated {
                        user_id: claims.sub.clone(),
                        order: order.map(Order::from),
                        fills: fills.into_iter().map(OrderFill::from).collect(),
                        trades: trades.into_iter().map(Trade::from).collect(),
                    }));
                    subscriptions.send_market_data(resp);
                }
                CreateOrderStatus::MarketNotFound => {
                    let resp = request_failed("CreateOrder", "Market not found");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::UserNotFound => {
                    tracing::error!("Authenticated user not found");
                    let resp = request_failed("CreateOrder", "User not found");
                    socket.send(resp).await?;
                }
            }
        }
        CM::CancelOrder(cancel_order) => {
            match db.cancel_order(cancel_order.id, &claims.sub).await? {
                CancelOrderStatus::Success { market_id } => {
                    let resp = server_message(SM::OrderCancelled(OrderCancelled {
                        id: cancel_order.id,
                        market_id,
                    }));
                    subscriptions.send_market_data(resp);
                    subscriptions.notify_user_portfolio(&claims.sub);
                }
                CancelOrderStatus::NotOwner => {
                    let resp = request_failed("CancelOrder", "Not order owner");
                    socket.send(resp).await?;
                }
                CancelOrderStatus::NotFound => {
                    let resp = request_failed("CancelOrder", "Order not found");
                    socket.send(resp).await?;
                }
            }
        }
        CM::MakePayment(make_payment) => {
            let Ok(amount) = make_payment.amount.parse() else {
                let resp = request_failed("MakePayment", "Failed parsing amount");
                socket.send(resp).await?;
                return Ok(());
            };
            match db
                .make_payment(
                    &claims.sub,
                    &make_payment.recipient_id,
                    amount,
                    &make_payment.note,
                )
                .await?
            {
                MakePaymentStatus::Success(payment) => {
                    let resp = server_message(SM::PaymentCreated(payment.into()));
                    subscriptions.send_payment(&claims.sub, resp.clone());
                    subscriptions.send_payment(&make_payment.recipient_id, resp);
                }
                MakePaymentStatus::InsufficientFunds => {
                    let resp = request_failed("MakePayment", "Insufficient funds");
                    socket.send(resp).await?;
                }
                MakePaymentStatus::InvalidAmount => {
                    let resp = request_failed("MakePayment", "Invalid amount");
                    socket.send(resp).await?;
                }
                MakePaymentStatus::PayerNotFound => {
                    let resp = request_failed("MakePayment", "Payer not found");
                    socket.send(resp).await?;
                }
                MakePaymentStatus::RecipientNotFound => {
                    let resp = request_failed("MakePayment", "Recipient not found");
                    socket.send(resp).await?;
                }
            }
        }
        CM::Out(out) => {
            let orders_deleted = db.out(out.market_id, &claims.sub).await?;
            for id in orders_deleted {
                let resp = server_message(SM::OrderCancelled(OrderCancelled {
                    id,
                    market_id: out.market_id,
                }));
                subscriptions.send_market_data(resp);
                subscriptions.notify_user_portfolio(&claims.sub);
            }
            let resp = server_message(SM::Out(out));
            socket.send(resp).await?;
        }
        CM::Authenticate(_) => {
            let resp = request_failed(
                "Authenticate",
                "Already authenticated, to re-authenticate open a new websocket connection",
            );
            socket.send(resp).await?;
        }
    };
    Ok(())
}

fn stream_chunk_for_market_id<'a, T>(
    next_value: &'a mut Option<T>,
    get_market_id: impl Fn(&T) -> i64 + 'a,
    market_id: i64,
    all_values: &'a mut (impl Unpin + Stream<Item = Result<T, sqlx::Error>>),
) -> impl Stream<Item = Result<T, sqlx::Error>> + 'a {
    stream! {
        let Some(value) = next_value.take() else {
            return;
        };
        if get_market_id(&value) != market_id {
            *next_value = Some(value);
            return;
        }
        yield Ok(value);
        while let Some(value) = all_values.try_next().await? {
            if get_market_id(&value) != market_id {
                *next_value = Some(value);
                break;
            }
            yield Ok(value);
        }
    }
}

async fn authenticate(socket: &mut WebSocket) -> anyhow::Result<Claims> {
    loop {
        match socket.recv().await {
            Some(Ok(ws::Message::Binary(msg))) => {
                let Ok(ClientMessage {
                    message: Some(CM::Authenticate(authenticate)),
                }) = ClientMessage::decode(Bytes::from(msg))
                else {
                    let resp = request_failed("Unknown", "Expected Authenticate message");
                    socket.send(resp).await?;
                    continue;
                };
                let Ok(claims) = validate_jwt(&authenticate.jwt).await else {
                    let resp = request_failed("Authenticate", "JWT validation failed");
                    socket.send(resp).await?;
                    continue;
                };
                let resp = ServerMessage {
                    message: Some(SM::Authenticated(Authenticated {})),
                };
                socket.send(resp.encode_to_vec().into()).await?;
                return Ok(claims);
            }
            Some(Ok(_)) => {
                let resp = request_failed("Unknown", "Expected Binary message");
                socket.send(resp).await?;
                continue;
            }
            _ => bail!("Never got Authenticate message"),
        }
    }
}

fn request_failed(kind: &str, message: &str) -> ws::Message {
    tracing::error!("Request failed: {kind}, {message}");
    server_message(SM::RequestFailed(RequestFailed {
        request_details: Some(RequestDetails { kind: kind.into() }),
        error_details: Some(ErrorDetails {
            message: message.into(),
        }),
    }))
}

fn server_message(message: SM) -> ws::Message {
    ServerMessage {
        message: Some(message),
    }
    .encode_to_vec()
    .into()
}
