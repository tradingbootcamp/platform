use crate::{
    auth::{validate_access_and_id, Role},
    db::{self, EnsureUserCreatedSuccess, DB},
    websocket_api::{
        client_message::Message as CM,
        request_failed::{ErrorDetails, RequestDetails},
        server_message::Message as SM,
        Account, Accounts, ActingAs, Authenticated, ClientMessage, GetFullOrderHistory,
        GetFullTradeHistory, Market, Order, Orders, OwnershipGiven, Portfolio, Portfolios,
        RequestFailed, ServerMessage, Trades, Transfer, Transfers,
    },
    AppState,
};
use anyhow::{anyhow, bail};
use async_stream::stream;
use axum::extract::{ws, ws::WebSocket};
use futures::{Stream, StreamExt, TryStreamExt};
use itertools::Itertools;
use prost::{bytes::Bytes, Message};
use rust_decimal_macros::dec;
use tokio::sync::broadcast::error::RecvError;
use tokio_stream::wrappers::errors::BroadcastStreamRecvError;

pub async fn handle_socket(socket: WebSocket, app_state: AppState) {
    if let Err(e) = handle_socket_fallible(socket, app_state).await {
        tracing::error!("Error handling socket: {e}");
    } else {
        tracing::info!("Client disconnected");
    }
}

#[allow(clippy::too_many_lines)]
async fn handle_socket_fallible(mut socket: WebSocket, app_state: AppState) -> anyhow::Result<()> {
    let AuthenticatedClient {
        id: mut user_id,
        is_admin,
        act_as,
        mut owned_accounts,
    } = authenticate(&app_state, &mut socket).await?;

    let admin_id = is_admin.then_some(user_id);
    let mut acting_as = act_as.unwrap_or(user_id);
    let mut subscription_receivers = app_state.subscriptions.subscribe_all(&owned_accounts);
    let db = &app_state.db;
    send_initial_private_data(db, &owned_accounts, &mut socket, false).await?;

    macro_rules! update_owned_accounts {
        () => {
            let new_owned_accounts = db.get_owned_accounts(user_id).await?;
            let added_owned_accounts: Vec<_> = new_owned_accounts
                .into_iter()
                .filter(|account_id| !owned_accounts.contains(account_id))
                .collect();
            for &account_id in &added_owned_accounts {
                owned_accounts.push(account_id);
                app_state
                    .subscriptions
                    .add_owned_subscription(&mut subscription_receivers, account_id);
            }
            send_initial_private_data(db, &added_owned_accounts, &mut socket, true).await?;
            if !is_admin {
                send_initial_public_data(db, is_admin, &owned_accounts, &mut socket).await?;
            }
        };
    }
    update_owned_accounts!();
    if is_admin {
        // Since we're not sending it in update_owned_accounts
        send_initial_public_data(db, is_admin, &owned_accounts, &mut socket).await?;
    }

    // Important that this is last - it doubles as letting the client know we're done sending initial data
    let acting_as_msg = encode_server_message(
        String::new(),
        SM::ActingAs(ActingAs {
            account_id: acting_as,
        }),
    );
    socket.send(acting_as_msg).await?;

    loop {
        tokio::select! {
            biased;
            msg = subscription_receivers.public.recv() => {
                match msg {
                    Ok(mut msg) => {
                        if !is_admin {
                            conditionally_hide_user_ids(db, &owned_accounts, &mut msg).await?;
                        }
                        socket.send(msg.encode_to_vec().into()).await?;
                    },
                    Err(RecvError::Lagged(n)) => {
                        tracing::warn!("Lagged {n}");
                        send_initial_public_data(db, is_admin, &owned_accounts, &mut socket).await?;
                    }
                    Err(RecvError::Closed) => {
                        bail!("Market sender closed");
                    }
                };
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
                if let Some(act_as) = handle_client_message(
                    &mut socket,
                    &app_state,
                    admin_id,
                    user_id,
                    acting_as,
                    &owned_accounts,
                    msg,
                )
                .await? {
                    if act_as.admin_as_user {
                        user_id = act_as.account_id;
                        owned_accounts = db.get_owned_accounts(user_id).await?;
                        subscription_receivers = app_state.subscriptions.subscribe_all(&owned_accounts);
                        // TODO: somehow notify the client to get rid of existing portfolios
                        send_initial_private_data(db, &owned_accounts, &mut socket, false).await?;
                        update_owned_accounts!();
                    }
                    acting_as = act_as.account_id;
                    let acting_as_msg = encode_server_message(
                        act_as.request_id,
                        SM::ActingAs(ActingAs {
                            account_id: act_as.account_id,
                        }),
                    );
                    socket.send(acting_as_msg).await?;
                };
            }
            msg = subscription_receivers.private.next() => {
                let Some((target_account_id, msg)) = msg else {
                    bail!("Private sender closed or lagged");
                };
                match msg {
                    Ok(msg) => socket.send(msg).await?,
                    Err(BroadcastStreamRecvError::Lagged(n)) => {
                        tracing::warn!("Private receiver lagged {n}");
                        send_initial_private_data(db, &[target_account_id], &mut socket, false).await?;
                    }
                };
            }
            msg = subscription_receivers.ownership.next() => {
                let Some((_, ())) = msg else {
                    bail!("Ownership sender closed");
                };
                update_owned_accounts!();
            }
            msg = subscription_receivers.portfolios.next() => {
                let Some((account_id, ())) = msg else {
                    bail!("Portfolio sender closed or lagged");
                };
                let portfolio = db
                    .get_portfolio(account_id)
                    .await?
                    .ok_or_else(|| anyhow!("Account {account_id} not found"))?;
                let resp = encode_server_message(String::new(), SM::PortfolioUpdated(portfolio.into()));
                socket.send(resp).await?;
            }
        }
    }
}

async fn send_initial_private_data(
    db: &DB,
    accounts: &[i64],
    socket: &mut WebSocket,
    are_new_ownerships: bool,
) -> anyhow::Result<()> {
    let mut transfers = Vec::new();
    let mut portfolios = Vec::new();
    for &account_id in accounts {
        let Some(portfolio) = db.get_portfolio(account_id).await? else {
            tracing::warn!("Account {account_id} not found");
            continue;
        };
        portfolios.push(Portfolio::from(portfolio));
        transfers.extend(
            db.get_transfers(account_id)
                .await?
                .into_iter()
                .map(Transfer::from),
        );
    }
    let transfers_msg = encode_server_message(
        String::new(),
        SM::Transfers(Transfers {
            transfers: transfers.into_iter().unique_by(|t| t.id).collect(),
        }),
    );
    socket.send(transfers_msg).await?;
    let portfolios_msg = encode_server_message(
        String::new(),
        SM::Portfolios(Portfolios {
            portfolios,
            are_new_ownerships,
        }),
    );
    socket.send(portfolios_msg).await?;
    Ok(())
}

async fn send_initial_public_data(
    db: &DB,
    is_admin: bool,
    owned_accounts: &[i64],
    socket: &mut WebSocket,
) -> anyhow::Result<()> {
    let accounts = db
        .get_all_accounts()
        .map(|account| account.map(Account::from))
        .try_collect::<Vec<_>>()
        .await?;
    let accounts_msg = encode_server_message(String::new(), SM::Accounts(Accounts { accounts }));
    socket.send(accounts_msg).await?;

    let markets = db.get_all_markets().await?;
    let mut all_live_orders = db.get_all_live_orders().map(|order| order.map(Order::from));
    let mut next_order = all_live_orders.try_next().await?;

    for market in markets {
        let market = Market::from(market);
        let market_id = market.id;
        let market_msg = encode_server_message(String::new(), SM::Market(market));
        socket.send(market_msg).await?;

        let orders = next_stream_chunk(
            &mut next_order,
            |order| order.market_id == market_id,
            &mut all_live_orders,
        )
        .try_collect::<Vec<_>>()
        .await?;
        let mut orders_msg = server_message(
            String::new(),
            SM::Orders(Orders {
                market_id,
                orders,
                has_full_history: false,
            }),
        );
        if !is_admin {
            conditionally_hide_user_ids(db, owned_accounts, &mut orders_msg).await?;
        }
        socket.send(orders_msg.encode_to_vec().into()).await?;
        // Send empty trades for the case this send_initial_public_data
        // is called due to a lagged public subscription.
        let trades_msg = encode_server_message(
            String::new(),
            SM::Trades(Trades {
                market_id,
                trades: vec![],
                has_full_history: false,
            }),
        );
        socket.send(trades_msg).await?;
    }
    Ok(())
}

fn hide_id(owned_accounts: &[i64], id: &mut i64) {
    if !owned_accounts.contains(id) {
        *id = 0;
    }
}

async fn conditionally_hide_user_ids(
    db: &DB,
    owned_accounts: &[i64],
    msg: &mut ServerMessage,
) -> anyhow::Result<()> {
    match &mut msg.message {
        Some(SM::OrderCreated(order_created)) => {
            if !db
                .market_has_hide_account_ids(order_created.market_id)
                .await?
            {
                return Ok(());
            }
            hide_id(owned_accounts, &mut order_created.account_id);
            if let Some(order) = order_created.order.as_mut() {
                hide_id(owned_accounts, &mut order.owner_id);
            }
            for fill in &mut order_created.fills {
                hide_id(owned_accounts, &mut fill.owner_id);
            }
            for trade in &mut order_created.trades {
                hide_id(owned_accounts, &mut trade.buyer_id);
                hide_id(owned_accounts, &mut trade.seller_id);
            }
        }
        Some(SM::Redeemed(redeemed)) => {
            if !db.market_has_hide_account_ids(redeemed.fund_id).await? {
                return Ok(());
            }
            hide_id(owned_accounts, &mut redeemed.account_id);
        }
        Some(SM::Orders(orders)) => {
            if !db.market_has_hide_account_ids(orders.market_id).await? {
                return Ok(());
            }
            for order in &mut orders.orders {
                hide_id(owned_accounts, &mut order.owner_id);
            }
        }
        Some(SM::Trades(trades)) => {
            if !db.market_has_hide_account_ids(trades.market_id).await? {
                return Ok(());
            }
            for trade in &mut trades.trades {
                hide_id(owned_accounts, &mut trade.buyer_id);
                hide_id(owned_accounts, &mut trade.seller_id);
            }
        }
        _ => {}
    };
    Ok(())
}

struct ActAs {
    request_id: String,
    account_id: i64,
    admin_as_user: bool,
}

#[allow(clippy::too_many_lines)]
async fn handle_client_message(
    socket: &mut WebSocket,
    app_state: &AppState,
    admin_id: Option<i64>,
    user_id: i64,
    acting_as: i64,
    owned_accounts: &[i64],
    msg: ws::Message,
) -> anyhow::Result<Option<ActAs>> {
    let db = &app_state.db;
    let subscriptions = &app_state.subscriptions;

    let ws::Message::Binary(msg) = msg else {
        let resp = request_failed(String::new(), "Unknown", "Expected Binary message");
        socket.send(resp).await?;
        return Ok(None);
    };
    let Ok(ClientMessage {
        request_id,
        message: Some(msg),
    }) = ClientMessage::decode(Bytes::from(msg))
    else {
        let resp = request_failed(String::new(), "Unknown", "Expected Client message");
        socket.send(resp).await?;
        return Ok(None);
    };

    macro_rules! fail {
        ($msg_type:expr, $failure_message:expr) => {
            let resp = request_failed(request_id, $msg_type, $failure_message);
            socket.send(resp).await?;
            return Ok(None);
        };
    }
    macro_rules! check_mutate_rate_limit {
        ($msg_type:expr) => {
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                fail!($msg_type, "Rate Limited");
            };
        };
    }
    macro_rules! check_expensive_rate_limit {
        ($msg_type:expr) => {
            if app_state.expensive_ratelimit.check_key(&user_id).is_err() {
                fail!($msg_type, "Rate Limited");
            };
        };
    }
    match msg {
        CM::GetFullTradeHistory(GetFullTradeHistory { market_id }) => {
            check_expensive_rate_limit!("GetFullTradeHistory");
            let trades = match db.get_market_trades(market_id).await? {
                Ok(trades) => trades,
                Err(failure) => {
                    fail!("GetFullTradeHistory", failure.message());
                }
            };
            let mut msg = server_message(request_id, SM::Trades(trades.into()));
            if admin_id.is_none() {
                conditionally_hide_user_ids(db, owned_accounts, &mut msg).await?;
            }
            socket.send(msg.encode_to_vec().into()).await?;
        }
        CM::GetFullOrderHistory(GetFullOrderHistory { market_id }) => {
            check_expensive_rate_limit!("GetFullOrderHistory");
            let orders = match db.get_full_market_orders(market_id).await? {
                Ok(orders) => orders,
                Err(failure) => {
                    fail!("GetFullTradeHistory", failure.message());
                }
            };
            let mut msg = server_message(request_id, SM::Orders(orders.into()));
            if admin_id.is_none() {
                conditionally_hide_user_ids(db, owned_accounts, &mut msg).await?;
            }
            socket.send(msg.encode_to_vec().into()).await?;
        }
        CM::CreateMarket(create_market) => {
            check_expensive_rate_limit!("CreateMarket");
            match db
                .create_market(admin_id.unwrap_or(user_id), create_market)
                .await?
            {
                Ok(market) => {
                    let msg = server_message(request_id, SM::Market(market.into()));
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("CreateMarket", failure.message());
                }
            };
        }
        CM::SettleMarket(settle_market) => {
            check_expensive_rate_limit!("SettleMarket");
            match db.settle_market(user_id, settle_market).await? {
                Ok(db::MarketSettledWithAffectedAccounts {
                    market_settled,
                    affected_accounts,
                }) => {
                    let msg = server_message(request_id, SM::MarketSettled(market_settled.into()));
                    subscriptions.send_public(msg);
                    for account in affected_accounts {
                        subscriptions.notify_portfolio(account);
                    }
                }
                Err(failure) => {
                    fail!("SettleMarket", failure.message());
                }
            }
        }
        CM::CreateOrder(create_order) => {
            check_mutate_rate_limit!("CreateOrder");
            match db.create_order(acting_as, create_order).await? {
                Ok(order_created) => {
                    for user_id in order_created.fills.iter().map(|fill| &fill.owner_id) {
                        subscriptions.notify_portfolio(*user_id);
                    }
                    subscriptions.notify_portfolio(acting_as);
                    let msg = server_message(request_id, SM::OrderCreated(order_created.into()));
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("CreateOrder", failure.message());
                }
            }
        }
        CM::CancelOrder(cancel_order) => {
            check_mutate_rate_limit!("CancelOrder");
            match db.cancel_order(acting_as, cancel_order).await? {
                Ok(order_cancelled) => {
                    let msg =
                        server_message(request_id, SM::OrdersCancelled(order_cancelled.into()));
                    subscriptions.send_public(msg);
                    subscriptions.notify_portfolio(acting_as);
                }
                Err(failure) => {
                    fail!("CancelOrder", failure.message());
                }
            }
        }
        CM::MakeTransfer(make_transfer) => {
            check_mutate_rate_limit!("MakeTransfer");
            let from_account_id = make_transfer.from_account_id;
            let to_account_id = make_transfer.to_account_id;
            match db.make_transfer(admin_id, user_id, make_transfer).await? {
                Ok(transfer) => {
                    let resp =
                        encode_server_message(request_id, SM::TransferCreated(transfer.into()));
                    // TODO: if the transfer is between two owned accounts,
                    // only send_private to the one lower on the ownership chain.
                    subscriptions.send_private(from_account_id, resp.clone());
                    subscriptions.send_private(to_account_id, resp);
                    subscriptions.notify_portfolio(from_account_id);
                    subscriptions.notify_portfolio(to_account_id);
                }
                Err(failure) => {
                    fail!("MakeTransfer", failure.message());
                }
            }
        }
        CM::Out(out) => {
            check_mutate_rate_limit!("Out");
            let orders_cancelled = db.out(acting_as, out.clone()).await?;
            if !orders_cancelled.orders_affected.is_empty() {
                subscriptions.notify_portfolio(acting_as);
            }
            let msg = server_message(String::new(), SM::OrdersCancelled(orders_cancelled.into()));
            subscriptions.send_public(msg);
            let resp = encode_server_message(request_id, SM::Out(out));
            socket.send(resp).await?;
        }
        CM::CreateAccount(create_account) => {
            check_mutate_rate_limit!("CreateAccount");
            let owner_id = create_account.owner_id;
            let status = db.create_account(user_id, create_account).await?;
            match status {
                Ok(account) => {
                    subscriptions.notify_ownership(owner_id);
                    let msg = server_message(request_id, SM::AccountCreated(account.into()));
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("CreateAccount", failure.message());
                }
            }
        }
        CM::ShareOwnership(share_ownership) => {
            check_mutate_rate_limit!("ShareOwnership");
            let to_account_id = share_ownership.to_account_id;
            match db.share_ownership(user_id, share_ownership).await? {
                Ok(()) => {
                    subscriptions.notify_ownership(to_account_id);
                    let ownership_given_msg =
                        encode_server_message(request_id, SM::OwnershipGiven(OwnershipGiven {}));
                    socket.send(ownership_given_msg).await?;
                }
                Err(failure) => {
                    fail!("ShareOwnership", failure.message());
                }
            }
        }
        CM::Redeem(redeem) => {
            check_mutate_rate_limit!("Redeem");
            match db.redeem(acting_as, redeem).await? {
                Ok(redeemed) => {
                    let msg = server_message(request_id, SM::Redeemed(redeemed.into()));
                    subscriptions.send_public(msg);
                    subscriptions.notify_portfolio(acting_as);
                }
                Err(failure) => {
                    fail!("Redeem", failure.message());
                }
            }
        }
        CM::Authenticate(_) => {
            fail!("Authenticate", "Already authenticated");
        }
        CM::ActAs(act_as) => {
            if !owned_accounts.contains(&act_as.account_id) {
                if admin_id.is_none() {
                    fail!("ActAs", "Not owner of account");
                }
                let Some(account) = db.get_account(act_as.account_id).await? else {
                    fail!("ActAs", "Account not found");
                };
                if !account.is_user {
                    fail!("ActAs", "Non owned account is not a user");
                }
                return Ok(Some(ActAs {
                    request_id,
                    account_id: account.id,
                    admin_as_user: true,
                }));
            }
            return Ok(Some(ActAs {
                request_id,
                account_id: act_as.account_id,
                admin_as_user: false,
            }));
        }
    };
    Ok(None)
}

fn next_stream_chunk<'a, T>(
    next_value: &'a mut Option<T>,
    chunk_pred: impl Fn(&T) -> bool + 'a,
    all_values: &'a mut (impl Unpin + Stream<Item = Result<T, sqlx::Error>>),
) -> impl Stream<Item = Result<T, sqlx::Error>> + 'a {
    stream! {
        let Some(value) = next_value.take_if(|v| chunk_pred(v)) else {
            return;
        };
        yield Ok(value);
        while let Some(value) = all_values.try_next().await? {
            if !chunk_pred(&value) {
                *next_value = Some(value);
                break;
            }
            yield Ok(value);
        }
    }
}

struct AuthenticatedClient {
    id: i64,
    is_admin: bool,
    act_as: Option<i64>,
    owned_accounts: Vec<i64>,
}

async fn authenticate(
    app_state: &AppState,
    socket: &mut WebSocket,
) -> anyhow::Result<AuthenticatedClient> {
    let db = &app_state.db;
    loop {
        match socket.recv().await {
            Some(Ok(ws::Message::Binary(msg))) => {
                let Ok(ClientMessage {
                    request_id,
                    message: Some(CM::Authenticate(authenticate)),
                }) = ClientMessage::decode(Bytes::from(msg))
                else {
                    let resp =
                        request_failed(String::new(), "Unknown", "Expected Authenticate message");
                    socket.send(resp).await?;
                    continue;
                };
                let id_jwt = (!authenticate.id_jwt.is_empty()).then_some(authenticate.id_jwt);
                let act_as = (authenticate.act_as != 0).then_some(authenticate.act_as);
                let valid_client =
                    match validate_access_and_id(&authenticate.jwt, id_jwt.as_deref()).await {
                        Ok(valid_client) => valid_client,
                        Err(e) => {
                            tracing::error!("JWT validation failed: {e}");
                            let resp =
                                request_failed(request_id, "Authenticate", "JWT validation failed");
                            socket.send(resp).await?;
                            continue;
                        }
                    };
                let is_admin = valid_client.roles.contains(&Role::Admin);
                let initial_balance = if is_admin {
                    dec!(100_000_000)
                } else {
                    dec!(2000)
                };
                let result = db
                    .ensure_user_created(
                        &valid_client.id,
                        valid_client.name.as_deref(),
                        initial_balance,
                    )
                    .await?;

                let id = match result {
                    Ok(db::EnsureUserCreatedSuccess {
                        id,
                        name: Some(name),
                    }) => {
                        let msg = server_message(
                            String::new(),
                            SM::AccountCreated(Account {
                                id,
                                name: name.to_string(),
                                is_user: true,
                            }),
                        );
                        app_state.subscriptions.send_public(msg);
                        id
                    }
                    Ok(EnsureUserCreatedSuccess { id, name: None }) => id,
                    Err(failure) => {
                        let resp = request_failed(request_id, "Authenticate", failure.message());
                        socket.send(resp).await?;
                        continue;
                    }
                };
                if app_state.expensive_ratelimit.check_key(&id).is_err() {
                    let resp = request_failed(request_id, "Authenticate", "Rate Limited");
                    socket.send(resp).await?;
                    return Err(anyhow::anyhow!("Rate Limited"));
                }
                let owned_accounts = db.get_owned_accounts(id).await?;
                if let Some(act_as) = act_as {
                    if !owned_accounts.contains(&act_as) {
                        let resp =
                            request_failed(request_id, "Authenticate", "Not owner of account");
                        socket.send(resp).await?;
                        continue;
                    }
                }
                let resp = encode_server_message(
                    request_id,
                    SM::Authenticated(Authenticated { account_id: id }),
                );
                socket.send(resp).await?;
                return Ok(AuthenticatedClient {
                    id,
                    is_admin,
                    act_as,
                    owned_accounts,
                });
            }
            Some(Ok(_)) => {
                let resp = request_failed(String::new(), "Unknown", "Expected Binary message");
                socket.send(resp).await?;
            }
            _ => bail!("Never got Authenticate message"),
        }
    }
}

fn request_failed(request_id: String, kind: &str, message: &str) -> ws::Message {
    tracing::error!("Request failed: {kind}, {message}");
    encode_server_message(
        request_id,
        SM::RequestFailed(RequestFailed {
            request_details: Some(RequestDetails { kind: kind.into() }),
            error_details: Some(ErrorDetails {
                message: message.into(),
            }),
        }),
    )
}

#[must_use]
pub fn encode_server_message(request_id: String, message: SM) -> ws::Message {
    server_message(request_id, message).encode_to_vec().into()
}

fn server_message(request_id: String, message: SM) -> ServerMessage {
    ServerMessage {
        request_id,
        message: Some(message),
    }
}
