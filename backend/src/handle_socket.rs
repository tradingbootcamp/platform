use crate::{
    auth::{validate_access_and_id, Role},
    db::{
        self, CancelOrderStatus, CreateAccountStatus, CreateMarketStatus, CreateOrderStatus,
        EnsureUserCreatedStatus, MakeTransferStatus, SettleMarketStatus, DB,
    },
    websocket_api::{
        client_message::Message as CM,
        order_created::OrderFill,
        request_failed::{ErrorDetails, RequestDetails},
        server_message::Message as SM,
        Account, Accounts, ActingAs, Authenticated, ClientMessage, GetFullOrderHistory,
        GetFullTradeHistory, Market, MarketSettled, Order, OrderCreated, Orders, OrdersCancelled,
        OwnershipGiven, Portfolio, Portfolios, Redeem, Redeemed, RequestFailed, ServerMessage,
        Side, Size, Trade, Trades, Transaction, Transactions, Transfer, Transfers,
    },
    AppState, HIDE_USER_IDS,
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

    let mut acting_as = act_as.unwrap_or(user_id);
    let mut subscription_receivers = app_state.subscriptions.subscribe_all(&owned_accounts);
    send_initial_private_data(&app_state.db, &owned_accounts, &mut socket, false).await?;

    macro_rules! update_owned_accounts {
        () => {
            let new_owned_accounts = app_state.db.get_owned_accounts(user_id).await?;
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
            send_initial_private_data(&app_state.db, &added_owned_accounts, &mut socket, true)
                .await?;
            if !is_admin {
                send_initial_public_data(&app_state.db, is_admin, &owned_accounts, &mut socket)
                    .await?;
            }
        };
    }
    update_owned_accounts!();
    if is_admin {
        // Since we're not sending it in update_owned_accounts
        send_initial_public_data(&app_state.db, is_admin, &owned_accounts, &mut socket).await?;
    }

    // Important that this is last - it doubles as letting the client know we're done sending initial data
    let acting_as_msg = server_message(
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
                            conditionally_hide_user_ids(&owned_accounts, &mut msg);
                        }
                        socket.send(msg.encode_to_vec().into()).await?;
                    },
                    Err(RecvError::Lagged(n)) => {
                        tracing::warn!("Lagged {n}");
                        send_initial_public_data(&app_state.db, is_admin, &owned_accounts, &mut socket).await?;
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
                    is_admin,
                    user_id,
                    &mut acting_as,
                    &owned_accounts,
                    msg,
                )
                .await? {
                    if act_as.admin_as_user {
                        user_id = act_as.account_id;
                        owned_accounts = app_state.db.get_owned_accounts(user_id).await?;
                        subscription_receivers = app_state.subscriptions.subscribe_all(&owned_accounts);
                        // TODO: somehow notify the client to get rid of existing portfolios
                        send_initial_private_data(&app_state.db, &owned_accounts, &mut socket, false).await?;
                        update_owned_accounts!();
                    }
                    acting_as = act_as.account_id;
                    let acting_as_msg = server_message(
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
                        send_initial_private_data(&app_state.db, &[target_account_id], &mut socket, false).await?;
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
                let portfolio = app_state
                    .db
                    .get_portfolio(account_id)
                    .await?
                    .ok_or_else(|| anyhow!("Account {account_id} not found"))?;
                let resp = server_message(String::new(), SM::PortfolioUpdated(portfolio.into()));
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
    let transfers_msg = server_message(
        String::new(),
        SM::Transfers(Transfers {
            transfers: transfers.into_iter().unique_by(|t| t.id).collect(),
        }),
    );
    socket.send(transfers_msg).await?;
    let portfolios_msg = server_message(
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
    let accounts_msg = server_message(String::new(), SM::Accounts(Accounts { accounts }));
    socket.send(accounts_msg).await?;

    let transactions = db
        .get_all_transactions()
        .map(|transaction_info| transaction_info.map(Transaction::from))
        .try_collect::<Vec<_>>()
        .await?;
    let transactions_msg = server_message(
        String::new(),
        SM::Transactions(Transactions { transactions }),
    );
    socket.send(transactions_msg).await?;

    let markets = db.get_all_markets().await?;
    let mut all_live_orders = db.get_all_live_orders().map(|order| order.map(Order::from));
    let mut next_order = all_live_orders.try_next().await?;

    for market in markets {
        let market = Market::from(market);
        let market_id = market.id;
        let market_msg = server_message(String::new(), SM::Market(market));
        socket.send(market_msg).await?;

        let mut orders = next_stream_chunk(
            &mut next_order,
            |order| order.market_id == market_id,
            &mut all_live_orders,
        )
        .try_collect::<Vec<_>>()
        .await?;
        if !is_admin {
            for order in &mut orders {
                hide_id(owned_accounts, &mut order.owner_id);
            }
        }
        let orders_msg = server_message(
            String::new(),
            SM::Orders(Orders {
                market_id,
                orders,
                has_full_history: false,
            }),
        );
        socket.send(orders_msg).await?;
        // Send empty trades for the case this send_initial_public_data
        // is called due to a lagged public subscription.
        let trades_msg = server_message(
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
    if *HIDE_USER_IDS && !owned_accounts.contains(id) {
        *id = 0;
    }
}

fn conditionally_hide_user_ids(owned_accounts: &[i64], msg: &mut ServerMessage) {
    if let ServerMessage {
        message: Some(SM::OrderCreated(order_created)),
        ..
    } = msg
    {
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
    };
    if let ServerMessage {
        message: Some(SM::Redeemed(Redeemed { account_id, .. })),
        ..
    } = msg
    {
        hide_id(owned_accounts, account_id);
    }
}

struct ActAs {
    request_id: String,
    account_id: i64,
    admin_as_user: bool,
}

#[allow(clippy::too_many_lines)]
#[allow(clippy::similar_names)]
async fn handle_client_message(
    socket: &mut WebSocket,
    app_state: &AppState,
    is_admin: bool,
    user_id: i64,
    acting_as: &mut i64,
    owned_accounts: &[i64],
    msg: ws::Message,
) -> anyhow::Result<Option<ActAs>> {
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
    match msg {
        CM::CreateMarket(create_market) => {
            let Ok(min_settlement) = create_market.min_settlement.try_into() else {
                let resp = request_failed(
                    request_id,
                    "CreateMarket",
                    "Failed converting min_settlement to decimal",
                );
                socket.send(resp).await?;
                return Ok(None);
            };
            let Ok(max_settlement) = create_market.max_settlement.try_into() else {
                let resp = request_failed(
                    request_id,
                    "CreateMarket",
                    "Failed converting max_settlement to decimal",
                );
                socket.send(resp).await?;
                return Ok(None);
            };
            let Ok(redeem_fee) = create_market.redeem_fee.try_into() else {
                let resp = request_failed(
                    request_id,
                    "CreateMarket",
                    "Failed converting redeem_fee to decimal",
                );
                socket.send(resp).await?;
                return Ok(None);
            };
            if app_state
                .large_request_ratelimit
                .check_key(&user_id)
                .is_err()
            {
                let resp = request_failed(request_id, "CreateMarket", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            let market = match app_state
                .db
                .create_market(
                    &create_market.name,
                    &create_market.description,
                    user_id,
                    min_settlement,
                    max_settlement,
                    &create_market.redeemable_for,
                    redeem_fee,
                )
                .await?
            {
                CreateMarketStatus::Success(market) => market,
                CreateMarketStatus::InvalidSettlements => {
                    let resp =
                        request_failed(request_id, "CreateMarket", "Invalid settlement prices");
                    socket.send(resp).await?;
                    return Ok(None);
                }
                CreateMarketStatus::ConstituentNotFound => {
                    let resp = request_failed(request_id, "CreateMarket", "Constituent not found");
                    socket.send(resp).await?;
                    return Ok(None);
                }
                CreateMarketStatus::InvalidMultiplier => {
                    let resp = request_failed(request_id, "CreateMarket", "Invalid multiplier");
                    socket.send(resp).await?;
                    return Ok(None);
                }
                CreateMarketStatus::ConstituentSettled => {
                    let resp =
                        request_failed(request_id, "CreateMarket", "Constituent already settled");
                    socket.send(resp).await?;
                    return Ok(None);
                }
                CreateMarketStatus::InvalidRedeemFee => {
                    let resp = request_failed(request_id, "CreateMarket", "Invalid redeem fee");
                    socket.send(resp).await?;
                    return Ok(None);
                }
            };
            let msg = ServerMessage {
                request_id,
                message: Some(SM::Market(market.into())),
            };
            app_state.subscriptions.send_public(msg);
        }
        CM::SettleMarket(settle_market) => {
            let Ok(settled_price) = settle_market.settle_price.try_into() else {
                let resp = request_failed(
                    request_id,
                    "SettleMarket",
                    "Failed converting settle_price to decimal",
                );
                socket.send(resp).await?;
                return Ok(None);
            };
            if app_state
                .large_request_ratelimit
                .check_key(&user_id)
                .is_err()
            {
                let resp = request_failed(request_id, "SettleMarket", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            match app_state
                .db
                .settle_market(settle_market.market_id, settled_price, user_id)
                .await?
            {
                SettleMarketStatus::Success {
                    affected_accounts: affected_users,
                    transaction_info,
                } => {
                    let msg = ServerMessage {
                        request_id,
                        message: Some(SM::MarketSettled(MarketSettled {
                            id: settle_market.market_id,
                            settle_price: settle_market.settle_price,
                            transaction: Some(transaction_info.into()),
                        })),
                    };
                    app_state.subscriptions.send_public(msg);
                    for user in affected_users {
                        app_state.subscriptions.notify_portfolio(user);
                    }
                }
                SettleMarketStatus::AlreadySettled => {
                    let resp = request_failed(request_id, "SettleMarket", "Market already settled");
                    socket.send(resp).await?;
                }
                SettleMarketStatus::NotOwner => {
                    let resp = request_failed(request_id, "SettleMarket", "Not market owner");
                    socket.send(resp).await?;
                }
                SettleMarketStatus::InvalidSettlementPrice => {
                    let resp =
                        request_failed(request_id, "SettleMarket", "Invalid settlement price");
                    socket.send(resp).await?;
                }
                SettleMarketStatus::ConstituentNotSettled => {
                    let resp =
                        request_failed(request_id, "SettleMarket", "Constituent not settled");
                    socket.send(resp).await?;
                }
            }
        }
        CM::CreateOrder(create_order) => {
            let Ok(size) = create_order.size.try_into() else {
                let resp = request_failed(
                    request_id,
                    "CreateOrder",
                    "Failed converting size to decimal",
                );
                socket.send(resp).await?;
                return Ok(None);
            };
            let Ok(price) = create_order.price.try_into() else {
                let resp = request_failed(
                    request_id,
                    "CreateOrder",
                    "Failed converting price to decimal",
                );
                socket.send(resp).await?;
                return Ok(None);
            };
            let side = match create_order.side() {
                Side::Unknown => {
                    let resp = request_failed(request_id, "CreateOrder", "Unknown side");
                    socket.send(resp).await?;
                    return Ok(None);
                }
                Side::Bid => db::Side::Bid,
                Side::Offer => db::Side::Offer,
            };
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                let resp = request_failed(request_id, "CreateOrder", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            match app_state
                .db
                .create_order(create_order.market_id, *acting_as, price, size, side)
                .await?
            {
                CreateOrderStatus::MarketSettled => {
                    let resp = request_failed(request_id, "CreateOrder", "Market already settled");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::InvalidSize => {
                    let resp = request_failed(request_id, "CreateOrder", "Invalid size");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::InvalidPrice => {
                    let resp = request_failed(request_id, "CreateOrder", "Invalid price");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::InsufficientFunds => {
                    let resp = request_failed(request_id, "CreateOrder", "Insufficient funds");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::Success {
                    order,
                    fills,
                    trades,
                    transaction_info,
                } => {
                    for user_id in fills.iter().map(|fill| &fill.owner_id) {
                        app_state.subscriptions.notify_portfolio(*user_id);
                    }
                    app_state.subscriptions.notify_portfolio(*acting_as);
                    let order = order.map(|o| {
                        let mut order = Order::from(o);
                        order.sizes = vec![Size {
                            transaction_id: order.transaction_id,
                            size: order.size,
                        }];
                        order
                    });
                    let msg = ServerMessage {
                        request_id,
                        message: Some(SM::OrderCreated(OrderCreated {
                            market_id: create_order.market_id,
                            account_id: *acting_as,
                            order,
                            fills: fills.into_iter().map(OrderFill::from).collect(),
                            trades: trades.into_iter().map(Trade::from).collect(),
                            transaction: Some(transaction_info.into()),
                        })),
                    };
                    app_state.subscriptions.send_public(msg);
                }
                CreateOrderStatus::MarketNotFound => {
                    let resp = request_failed(request_id, "CreateOrder", "Market not found");
                    socket.send(resp).await?;
                }
                CreateOrderStatus::AccountNotFound => {
                    tracing::error!("Authenticated user not found");
                    let resp = request_failed(request_id, "CreateOrder", "User not found");
                    socket.send(resp).await?;
                }
            }
        }
        CM::CancelOrder(cancel_order) => {
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                let resp = request_failed(request_id, "CancelOrder", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            match app_state
                .db
                .cancel_order(cancel_order.id, *acting_as)
                .await?
            {
                CancelOrderStatus::Success {
                    market_id,
                    transaction_info,
                } => {
                    let resp = ServerMessage {
                        request_id,
                        message: Some(SM::OrdersCancelled(OrdersCancelled {
                            order_ids: vec![cancel_order.id],
                            market_id,
                            transaction: Some(transaction_info.into()),
                        })),
                    };
                    app_state.subscriptions.send_public(resp);
                    app_state.subscriptions.notify_portfolio(*acting_as);
                }
                CancelOrderStatus::NotOwner => {
                    let resp = request_failed(request_id, "CancelOrder", "Not order owner");
                    socket.send(resp).await?;
                }
                CancelOrderStatus::NotFound => {
                    let resp = request_failed(request_id, "CancelOrder", "Order not found");
                    socket.send(resp).await?;
                }
            }
        }
        CM::MakeTransfer(make_transfer) => {
            let Ok(amount) = make_transfer.amount.try_into() else {
                let resp = request_failed(request_id, "MakeTransfer", "Failed parsing amount");
                socket.send(resp).await?;
                return Ok(None);
            };
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                let resp = request_failed(request_id, "MakeTransfer", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            match app_state
                .db
                .make_transfer(
                    user_id,
                    make_transfer.from_account_id,
                    make_transfer.to_account_id,
                    amount,
                    &make_transfer.note,
                )
                .await?
            {
                MakeTransferStatus::Success(transfer) => {
                    let resp = server_message(request_id, SM::TransferCreated(transfer.into()));
                    // TODO: if the transfer is between two owned accounts,
                    // only send_private to the one lower on the ownership chain.
                    app_state
                        .subscriptions
                        .send_private(make_transfer.from_account_id, resp.clone());
                    app_state
                        .subscriptions
                        .send_private(make_transfer.to_account_id, resp);
                    app_state
                        .subscriptions
                        .notify_portfolio(make_transfer.from_account_id);
                    app_state
                        .subscriptions
                        .notify_portfolio(make_transfer.to_account_id);
                }
                MakeTransferStatus::InsufficientFunds => {
                    let resp = request_failed(request_id, "MakeTransfer", "Insufficient funds");
                    socket.send(resp).await?;
                }
                MakeTransferStatus::InvalidAmount => {
                    let resp = request_failed(request_id, "MakeTransfer", "Invalid amount");
                    socket.send(resp).await?;
                }
                MakeTransferStatus::FromAccountNotFound => {
                    let resp = request_failed(request_id, "MakeTransfer", "Payer not found");
                    socket.send(resp).await?;
                }
                MakeTransferStatus::ToAccountNotFound => {
                    let resp = request_failed(request_id, "MakeTransfer", "Recipient not found");
                    socket.send(resp).await?;
                }
                MakeTransferStatus::SameAccount => {
                    let resp = request_failed(request_id, "MakeTransfer", "Cannot pay yourself");
                    socket.send(resp).await?;
                }
                MakeTransferStatus::InitiatorNotUser => {
                    tracing::error!("Initiator not user");
                    let resp = request_failed(request_id, "MakeTransfer", "Initiator not user");
                    socket.send(resp).await?;
                }
                MakeTransferStatus::AccountNotOwned => {
                    let resp = request_failed(request_id, "MakeTransfer", "Account not owned");
                    socket.send(resp).await?;
                }
                MakeTransferStatus::SharedOwnershipAccountHasOpenPositions => {
                    let resp = request_failed(
                        request_id,
                        "MakeTransfer",
                        "Shared ownership account has open positions",
                    );
                    socket.send(resp).await?;
                }
                MakeTransferStatus::InsufficientCredit => {
                    let resp = request_failed(request_id, "MakeTransfer", "Insufficient credit");
                    socket.send(resp).await?;
                }
            }
        }
        CM::Out(out) => {
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                let resp = request_failed(request_id, "Out", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            let db::Out {
                orders_affected,
                transaction_info,
            } = app_state.db.out(out.market_id, *acting_as).await?;
            if !orders_affected.is_empty() {
                app_state.subscriptions.notify_portfolio(*acting_as);
            }
            let msg = ServerMessage {
                request_id: String::new(),
                message: Some(SM::OrdersCancelled(OrdersCancelled {
                    order_ids: orders_affected,
                    market_id: out.market_id,
                    transaction: Some(transaction_info.into()),
                })),
            };
            app_state.subscriptions.send_public(msg);
            let resp = server_message(request_id, SM::Out(out));
            socket.send(resp).await?;
        }
        CM::Authenticate(_) => {
            let resp = request_failed(
                request_id,
                "Authenticate",
                "Already authenticated, to re-authenticate open a new websocket connection",
            );
            socket.send(resp).await?;
        }
        CM::ActAs(act_as) => {
            if !owned_accounts.contains(&act_as.account_id) {
                if !is_admin {
                    let resp = request_failed(request_id, "ActAs", "Not owner of account");
                    socket.send(resp).await?;
                    return Ok(None);
                }
                let Some(account) = app_state.db.get_account(act_as.account_id).await? else {
                    let resp = request_failed(request_id, "ActAs", "Account not found");
                    socket.send(resp).await?;
                    return Ok(None);
                };
                if !account.is_user {
                    let resp =
                        request_failed(request_id, "ActAs", "Non owned account is not a user");
                    socket.send(resp).await?;
                    return Ok(None);
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
        CM::CreateAccount(create_account) => {
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                let resp = request_failed(request_id, "CreateAccount", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            let status = app_state
                .db
                .create_account(user_id, create_account.owner_id, create_account.name)
                .await?;
            match status {
                CreateAccountStatus::Success(account) => {
                    app_state
                        .subscriptions
                        .notify_ownership(create_account.owner_id);
                    app_state.subscriptions.send_public(ServerMessage {
                        request_id,
                        message: Some(SM::AccountCreated(account.into())),
                    });
                }
                CreateAccountStatus::NameAlreadyExists => {
                    let resp =
                        request_failed(request_id, "CreateAccount", "Bot name already exists");
                    socket.send(resp).await?;
                }
                CreateAccountStatus::EmptyName => {
                    let resp =
                        request_failed(request_id, "CreateAccount", "Bot name cannot be empty");
                    socket.send(resp).await?;
                }
                CreateAccountStatus::InvalidOwner => {
                    let resp = request_failed(request_id, "CreateAccount", "Invalid owner");
                    socket.send(resp).await?;
                }
            }
        }
        CM::ShareOwnership(share_ownership) => {
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                let resp = request_failed(request_id, "ShareOwnership", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            match app_state
                .db
                .share_ownership(
                    user_id,
                    share_ownership.of_account_id,
                    share_ownership.to_account_id,
                )
                .await?
            {
                db::ShareOwnershipStatus::Success => {
                    app_state
                        .subscriptions
                        .notify_ownership(share_ownership.to_account_id);
                    let ownership_given_msg =
                        server_message(request_id, SM::OwnershipGiven(OwnershipGiven {}));
                    socket.send(ownership_given_msg).await?;
                }
                db::ShareOwnershipStatus::AlreadyOwner => {
                    let resp = request_failed(request_id, "ShareOwnership", "Already owner");
                    socket.send(resp).await?;
                }
                db::ShareOwnershipStatus::NotOwner => {
                    let resp = request_failed(request_id, "ShareOwnership", "Not owner");
                    socket.send(resp).await?;
                }
                db::ShareOwnershipStatus::OwnerNotAUser => {
                    let resp = request_failed(request_id, "ShareOwnership", "Owner not a user");
                    socket.send(resp).await?;
                }
                db::ShareOwnershipStatus::RecipientNotAUser => {
                    let resp = request_failed(request_id, "ShareOwnership", "Recipient not a user");
                    socket.send(resp).await?;
                }
            }
        }
        CM::GetFullTradeHistory(GetFullTradeHistory { market_id }) => {
            let mut trades = match app_state.db.get_market_trades(market_id).await? {
                db::GetMarketTradesStatus::Success(trades) => trades,
                db::GetMarketTradesStatus::MarketNotFound => {
                    let resp =
                        request_failed(request_id, "GetFullTradeHistory", "Market not found");
                    socket.send(resp).await?;
                    return Ok(None);
                }
            };
            if !is_admin {
                for trade in &mut trades {
                    hide_id(owned_accounts, &mut trade.buyer_id);
                    hide_id(owned_accounts, &mut trade.seller_id);
                }
            }
            let msg = server_message(
                request_id,
                SM::Trades(Trades {
                    market_id,
                    trades: trades.into_iter().map(Trade::from).collect(),
                    has_full_history: true,
                }),
            );
            socket.send(msg).await?;
        }
        CM::GetFullOrderHistory(GetFullOrderHistory { market_id }) => {
            let mut orders = match app_state.db.get_full_market_orders(market_id).await? {
                db::GetMarketOrdersStatus::Success(orders) => orders,
                db::GetMarketOrdersStatus::MarketNotFound => {
                    let resp =
                        request_failed(request_id, "GetFullTradeHistory", "Market not found");
                    socket.send(resp).await?;
                    return Ok(None);
                }
            };
            if !is_admin {
                for order in &mut orders {
                    hide_id(owned_accounts, &mut order.0.owner_id);
                }
            }
            let msg = server_message(
                request_id,
                SM::Orders(Orders {
                    market_id,
                    orders: orders.into_iter().map(Order::from).collect(),
                    has_full_history: true,
                }),
            );
            socket.send(msg).await?;
        }
        CM::Redeem(Redeem {
            fund_id,
            amount: amount_float,
        }) => {
            if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                let resp = request_failed(request_id, "Redeem", "Rate Limited (mutating)");
                socket.send(resp).await?;
                return Ok(None);
            };
            let Ok(amount) = amount_float.try_into() else {
                let resp =
                    request_failed(request_id, "Redeem", "Failed converting amount to decimal");
                socket.send(resp).await?;
                return Ok(None);
            };
            match app_state.db.redeem(fund_id, *acting_as, amount).await? {
                db::RedeemStatus::Success { transaction_info } => {
                    let msg = ServerMessage {
                        request_id,
                        message: Some(SM::Redeemed(Redeemed {
                            transaction: Some(transaction_info.into()),
                            account_id: *acting_as,
                            fund_id,
                            amount: amount_float,
                        })),
                    };
                    app_state.subscriptions.send_public(msg);
                    app_state.subscriptions.notify_portfolio(*acting_as);
                }
                db::RedeemStatus::MarketNotRedeemable => {
                    let resp = request_failed(request_id, "Redeem", "Fund not found");
                    socket.send(resp).await?;
                }
                db::RedeemStatus::MarketSettled => {
                    let resp = request_failed(
                        request_id,
                        "Redeem",
                        "One of the redeemed funds is already settled",
                    );
                    socket.send(resp).await?;
                }
                db::RedeemStatus::InsufficientFunds => {
                    let resp = request_failed(request_id, "Redeem", "Insufficient funds");
                    socket.send(resp).await?;
                }
                db::RedeemStatus::InvalidAmount => {
                    let resp = request_failed(request_id, "Redeem", "Invalid amount");
                    socket.send(resp).await?;
                }
                db::RedeemStatus::RedeemerNotFound => {
                    tracing::error!("Redeemer not found");
                    let resp = request_failed(request_id, "Redeem", "Redeemer not found");
                    socket.send(resp).await?;
                }
            }
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
                let initial_balance = if is_admin { dec!(1_000_000) } else { dec!(0) };
                let status = app_state
                    .db
                    .ensure_user_created(
                        &valid_client.id,
                        valid_client.name.as_deref(),
                        initial_balance,
                    )
                    .await?;

                let id = match status {
                    EnsureUserCreatedStatus::CreatedOrUpdated { id, name } => {
                        app_state.subscriptions.send_public(ServerMessage {
                            request_id: String::new(),
                            message: Some(SM::AccountCreated(Account {
                                id,
                                name: name.to_string(),
                                is_user: true,
                            })),
                        });
                        id
                    }
                    EnsureUserCreatedStatus::Unchanged { id } => id,
                    EnsureUserCreatedStatus::NoNameProvidedForNewUser => {
                        let resp = request_failed(
                            request_id,
                            "Authenticate",
                            "No name provided for new user",
                        );
                        socket.send(resp).await?;
                        continue;
                    }
                };
                if app_state.large_request_ratelimit.check_key(&id).is_err() {
                    let resp =
                        request_failed(request_id, "Authenticate", "Rate Limited (connecting)");
                    socket.send(resp).await?;
                    return Err(anyhow::anyhow!("Rate Limited (connecting)"));
                }
                let owned_accounts = app_state.db.get_owned_accounts(id).await?;
                if let Some(act_as) = act_as {
                    if !owned_accounts.contains(&act_as) {
                        let resp =
                            request_failed(request_id, "Authenticate", "Not owner of account");
                        socket.send(resp).await?;
                        continue;
                    }
                }
                let resp = ServerMessage {
                    request_id,
                    message: Some(SM::Authenticated(Authenticated { account_id: id })),
                };
                socket.send(resp.encode_to_vec().into()).await?;
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
    server_message(
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
pub fn server_message(request_id: String, message: SM) -> ws::Message {
    ServerMessage {
        request_id,
        message: Some(message),
    }
    .encode_to_vec()
    .into()
}
