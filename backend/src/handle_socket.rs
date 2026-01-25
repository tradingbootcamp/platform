use crate::{
    auth::{validate_access_and_id_or_test, Role},
    db::{self, EnsureUserCreatedSuccess, DB},
    websocket_api::{
        client_message::Message as CM,
        request_failed::{ErrorDetails, RequestDetails},
        server_message::Message as SM,
        Account, Accounts, ActingAs, Auction, AuctionDeleted, Authenticated, ClientMessage,
        GetFullOrderHistory, GetFullTradeHistory, GetMarketPositions, SetSudo,
        Market, MarketGroup, MarketGroups, MarketType, MarketTypeDeleted, MarketTypes, Order,
        Orders, OwnershipGiven, OwnershipRevoked, Portfolio, Portfolios, RequestFailed,
        ServerMessage, SettleAuction, SudoStatus, Trade, Trades, Transfer, Transfers,
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

#[allow(clippy::too_many_lines, unused_assignments)]
async fn handle_socket_fallible(mut socket: WebSocket, app_state: AppState) -> anyhow::Result<()> {
    let AuthenticatedClient {
        id: mut user_id,
        is_admin,
        act_as,
        mut owned_accounts,
    } = authenticate(&app_state, &mut socket).await?;

    let admin_id = is_admin.then_some(user_id);
    let mut acting_as = act_as.unwrap_or(user_id);
    let mut sudo_enabled = false;
    let mut subscription_receivers = app_state.subscriptions.subscribe_all(&owned_accounts);
    let db = &app_state.db;
    send_initial_private_data(db, &owned_accounts, &mut socket, false).await?;

    macro_rules! update_owned_accounts {
        () => {
            let new_owned_accounts = db.get_owned_accounts(user_id).await?;
            let added_owned_accounts: Vec<_> = new_owned_accounts
                .iter()
                .filter(|account_id| !owned_accounts.contains(account_id))
                .map(|account_id| *account_id)
                .collect();
            for &account_id in &added_owned_accounts {
                owned_accounts.push(account_id);
                app_state
                    .subscriptions
                    .add_owned_subscription(&mut subscription_receivers, account_id);
            }

            let removed_owned_accounts: Vec<_> = owned_accounts
                .iter()
                .filter(|account_id| !new_owned_accounts.contains(account_id))
                .map(|account_id| *account_id)
                .collect();
            owned_accounts.retain(|account_id| !removed_owned_accounts.contains(account_id));
            for &account_id in &removed_owned_accounts {
                app_state
                    .subscriptions
                    .remove_owned_subscription(&mut subscription_receivers, account_id);
            }
            if removed_owned_accounts.contains(&acting_as) {
                acting_as = user_id;
                let acting_as_msg = encode_server_message(
                    String::new(),
                    SM::ActingAs(ActingAs {
                        account_id: user_id,
                    }),
                );
                socket.send(acting_as_msg).await?;
            }
            send_initial_private_data(db, &owned_accounts, &mut socket, false).await?;
            // if are_new_ownership is enabled, the client will not realize that they have been revoked ownership
            // send_initial_private_data(db, &added_owned_accounts, &mut socket, true).await?;
            if !is_admin {
                send_initial_public_data(db, is_admin, &owned_accounts, &mut socket).await?;
            }
        };
    }
    update_owned_accounts!();
    if is_admin {
        // Since we're not sending it in update_owned_accounts
        // Pass false because sudo_enabled starts as false - admins must enable sudo to see hidden data
        send_initial_public_data(db, false, &owned_accounts, &mut socket).await?;
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
                        if !is_admin || !sudo_enabled {
                            conditionally_hide_user_ids(db, &owned_accounts, &mut msg).await?;
                        }
                        socket.send(msg.encode_to_vec().into()).await?;
                    },
                    Err(RecvError::Lagged(n)) => {
                        tracing::warn!("Lagged {n}");
                        send_initial_public_data(db, is_admin && sudo_enabled, &owned_accounts, &mut socket).await?;
                    }
                    Err(RecvError::Closed) => {
                        bail!("Market sender closed");
                    }
                }
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
                // admin_id is only passed as Some when sudo is enabled
                let effective_admin_id = if sudo_enabled { admin_id } else { None };
                if let Some(result) = handle_client_message(
                    &mut socket,
                    &app_state,
                    effective_admin_id,
                    user_id,
                    acting_as,
                    &owned_accounts,
                    msg,
                )
                .await? {
                if let HandleResult::SudoChange { request_id, enabled } = result {
                    if enabled && !is_admin {
                        let resp = request_failed(request_id, "SetSudo", "Only admins can enable sudo");
                        socket.send(resp).await?;
                        continue;
                    }
                    sudo_enabled = enabled;
                    let sudo_status_msg = encode_server_message(
                        request_id,
                        SM::SudoStatus(SudoStatus { enabled }),
                    );
                    socket.send(sudo_status_msg).await?;
                    // Resend public data when sudo changes - unhidden when enabled, hidden when disabled
                    send_initial_public_data(db, enabled, &owned_accounts, &mut socket).await?;
                    continue;
                }
                if let HandleResult::AdminRequired { request_id, msg_type } = result {
                    let message = if is_admin {
                        "Sudo required"
                    } else {
                        match msg_type {
                            "RevokeOwnership" => "Only admins can revoke ownership",
                            "ActAs" => "Not owner of account",
                            _ => "Admin access required",
                        }
                    };
                    let resp = request_failed(request_id, msg_type, message);
                    socket.send(resp).await?;
                    continue;
                }
                let HandleResult::ActAs(act_as) = result else {
                    continue;
                };
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
                }
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
                }
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

    // Send categories
    let market_types = db.get_all_market_types().await?;
    let market_types_msg = encode_server_message(
        String::new(),
        SM::MarketTypes(MarketTypes {
            market_types: market_types.into_iter().map(MarketType::from).collect(),
        }),
    );
    socket.send(market_types_msg).await?;

    // Send groups
    let market_groups = db.get_all_market_groups().await?;
    let market_groups_msg = encode_server_message(
        String::new(),
        SM::MarketGroups(MarketGroups {
            market_groups: market_groups.into_iter().map(MarketGroup::from).collect(),
        }),
    );
    socket.send(market_groups_msg).await?;

    let markets = db.get_all_markets().await?;
    let auctions = db.get_all_auctions().await?;
    let last_trades = db.get_last_trades_by_market().await?;
    let mut all_live_orders = db.get_all_live_orders().map(|order| order.map(Order::from));
    let mut next_order = all_live_orders.try_next().await?;

    for market in markets {
        // In-memory visibility check: market is visible if it has no restrictions
        // or if any of the user's owned accounts is in the visible_to list
        if !is_admin && !market.visible_to.is_empty() {
            let is_visible = market
                .visible_to
                .iter()
                .any(|&id| owned_accounts.contains(&id));
            if !is_visible {
                // Consume orders for this skipped market to not corrupt the stream
                let market_id = market.market.id;
                let _: Vec<_> = next_stream_chunk(
                    &mut next_order,
                    |order| order.market_id == market_id,
                    &mut all_live_orders,
                )
                .try_collect()
                .await?;
                continue;
            }
        }

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
        // Send last trade for MtM calculation (or empty if no trades yet).
        // This is needed because full trade history is only fetched on demand.
        let trades = last_trades
            .get(&market_id)
            .map(|trade| vec![Trade::from(trade.clone())])
            .unwrap_or_default();
        let mut trades_msg = server_message(
            String::new(),
            SM::Trades(Trades {
                market_id,
                trades,
                has_full_history: false,
            }),
        );
        if !is_admin {
            conditionally_hide_user_ids(db, owned_accounts, &mut trades_msg).await?;
        }
        socket.send(trades_msg.encode_to_vec().into()).await?;
    }
    for auction in auctions {
        let auction = Auction::from(auction);
        let auction_msg = encode_server_message(String::new(), SM::Auction(auction));
        socket.send(auction_msg).await?;
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
        Some(SM::MarketPositions(positions)) => {
            if !db.market_has_hide_account_ids(positions.market_id).await? {
                return Ok(());
            }
            for position in &mut positions.positions {
                hide_id(owned_accounts, &mut position.account_id);
            }
        }
        _ => {}
    }
    Ok(())
}

struct ActAsInfo {
    request_id: String,
    account_id: i64,
    admin_as_user: bool,
}

enum HandleResult {
    ActAs(ActAsInfo),
    SudoChange { request_id: String, enabled: bool },
    AdminRequired { request_id: String, msg_type: &'static str },
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
) -> anyhow::Result<Option<HandleResult>> {
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
            if admin_id.is_some() {
                if app_state
                    .admin_mutate_ratelimit
                    .check_key(&user_id)
                    .is_err()
                {
                    fail!($msg_type, "ADMIN Rate Limited");
                };
            } else {
                if app_state.mutate_ratelimit.check_key(&user_id).is_err() {
                    fail!($msg_type, "Rate Limited");
                };
            };
        };
    }
    macro_rules! check_expensive_rate_limit {
        ($msg_type:expr) => {
            if admin_id.is_some() {
                if app_state
                    .admin_expensive_ratelimit
                    .check_key(&user_id)
                    .is_err()
                {
                    fail!($msg_type, "ADMIN Rate Limited");
                };
            } else {
                if app_state.expensive_ratelimit.check_key(&user_id).is_err() {
                    fail!($msg_type, "Rate Limited");
                };
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
        CM::GetMarketPositions(GetMarketPositions { market_id }) => {
            check_expensive_rate_limit!("GetMarketPositions");
            let positions = match db.get_market_positions(market_id).await? {
                Ok(positions) => positions,
                Err(failure) => {
                    fail!("GetMarketPositions", failure.message());
                }
            };
            let mut msg = server_message(request_id, SM::MarketPositions(positions.into()));
            if admin_id.is_none() {
                conditionally_hide_user_ids(db, owned_accounts, &mut msg).await?;
            }
            socket.send(msg.encode_to_vec().into()).await?;
        }
        CM::CreateMarket(create_market) => {
            check_expensive_rate_limit!("CreateMarket");
            match db
                .create_market(admin_id.unwrap_or(user_id), create_market, admin_id.is_some())
                .await?
            {
                Ok(market) => {
                    let visible_to = market.visible_to.clone();
                    let msg = server_message(request_id, SM::Market(market.into()));
                    if visible_to.is_empty() {
                        subscriptions.send_public(msg);
                    } else {
                        for account_id in visible_to {
                            subscriptions.send_private(account_id, msg.encode_to_vec().into());
                        }
                    }
                }
                Err(failure) => {
                    fail!("CreateMarket", failure.message());
                }
            };
        }
        CM::SettleMarket(settle_market) => {
            check_expensive_rate_limit!("SettleMarket");
            match db.settle_market(user_id, admin_id, settle_market).await? {
                Ok(db::MarketSettledWithAffectedAccounts {
                    market_settled,
                    affected_accounts,
                    visible_to,
                }) => {
                    let msg = server_message(request_id, SM::MarketSettled(market_settled.into()));
                    if visible_to.is_empty() {
                        subscriptions.send_public(msg);
                    } else {
                        for account_id in visible_to {
                            subscriptions.send_private(account_id, msg.encode_to_vec().into());
                        }
                    }
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
            match db.out(acting_as, out.clone()).await? {
                Ok(orders_cancelled_list) => {
                    if !orders_cancelled_list.is_empty() {
                        subscriptions.notify_portfolio(acting_as);
                    }
                    for orders_cancelled in orders_cancelled_list {
                        let msg = server_message(String::new(), SM::OrdersCancelled(orders_cancelled.into()));
                        subscriptions.send_public(msg);
                    }
                    let resp = encode_server_message(request_id, SM::Out(out));
                    socket.send(resp).await?;
                }
                Err(failure) => {
                    fail!("Out", failure.message());
                }
            }
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
        CM::RevokeOwnership(revoke_ownership) => {
            check_mutate_rate_limit!("RevokeOwnership");
            let from_account_id = revoke_ownership.from_account_id;
            if admin_id.is_none() {
                return Ok(Some(HandleResult::AdminRequired {
                    request_id,
                    msg_type: "RevokeOwnership",
                }));
            }
            match db.revoke_ownership(revoke_ownership).await? {
                Ok(()) => {
                    subscriptions.notify_ownership(from_account_id);
                    let ownership_revoked_msg = encode_server_message(
                        request_id,
                        SM::OwnershipRevoked(OwnershipRevoked {}),
                    );
                    socket.send(ownership_revoked_msg).await?;
                }
                Err(failure) => {
                    fail!("RevokeOwnership", failure.message());
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
                    return Ok(Some(HandleResult::AdminRequired {
                        request_id,
                        msg_type: "ActAs",
                    }));
                }
                let Some(account) = db.get_account(act_as.account_id).await? else {
                    fail!("ActAs", "Account not found");
                };
                if !account.is_user {
                    fail!("ActAs", "Non owned account is not a user");
                }
                return Ok(Some(HandleResult::ActAs(ActAsInfo {
                    request_id,
                    account_id: account.id,
                    admin_as_user: true,
                })));
            }
            return Ok(Some(HandleResult::ActAs(ActAsInfo {
                request_id,
                account_id: act_as.account_id,
                admin_as_user: false,
            })));
        }
        CM::SetSudo(SetSudo { enabled }) => {
            // Permission check happens in caller (needs is_admin, not effective admin_id)
            return Ok(Some(HandleResult::SudoChange {
                request_id,
                enabled,
            }));
        }
        CM::EditMarket(edit_market) => {
            // Check if user is admin or owner of the market
            let Some((owner_id, status)) = db.get_market_owner_and_status(edit_market.id).await?
            else {
                fail!("EditMarket", "Market not found");
            };

            let is_owner = owner_id == user_id;
            let is_admin = admin_id.is_some();

            // Determine what fields are being edited
            let status_changed = status != i64::from(edit_market.status);
            let editing_admin_only_fields = edit_market.name.is_some()
                || edit_market.pinned.is_some()
                || status_changed
                || edit_market.update_visible_to.is_some()
                || edit_market.hide_account_ids.is_some()
                || edit_market.redeemable_settings.is_some();

            // Check permissions
            if editing_admin_only_fields && !is_admin {
                fail!("EditMarket", "Only admins can edit market name, status, pinned, visibility, and redeemable settings");
            }

            if edit_market.description.is_some() && !is_admin && !is_owner {
                fail!("EditMarket", "You can only edit your own market's description");
            }

            // Note: admin_id.is_some() already implies sudo is enabled

            match db.edit_market(edit_market).await? {
                Ok(market) => {
                    let visible_to = market.visible_to.clone();
                    let msg = server_message(request_id, SM::Market(market.into()));
                    if visible_to.is_empty() {
                        subscriptions.send_public(msg);
                    } else {
                        for account_id in visible_to {
                            subscriptions.send_private(account_id, msg.encode_to_vec().into());
                        }
                    }
                }
                Err(err) => {
                    fail!("EditMarket", err.message());
                }
            };
        }
        CM::CreateAuction(create_auction) => {
            check_expensive_rate_limit!("CreateMarket");
            match db
                .create_auction(admin_id.unwrap_or(user_id), create_auction)
                .await?
            {
                Ok(auction) => {
                    let msg = server_message(request_id, SM::Auction(auction.into()));
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("CreateAuction", failure.message());
                }
            };
        }
        CM::SettleAuction(settle_auction) => {
            check_expensive_rate_limit!("SettleAuction");
            match admin_id {
                None => {
                    fail!("SettleAuction", "only admins can settle auctions");
                }
                Some(admin_id) => {
                    match db.settle_auction(admin_id, settle_auction).await? {
                        Ok(db::AuctionSettledWithAffectedAccounts {
                            auction_settled,
                            affected_accounts,
                        }) => {
                            let msg = server_message(
                                request_id,
                                SM::AuctionSettled(auction_settled.into()),
                            );
                            subscriptions.send_public(msg);
                            for account in affected_accounts {
                                subscriptions.notify_portfolio(account);
                            }
                        }
                        Err(failure) => {
                            fail!("SettleAuction", failure.message());
                        }
                    }
                }
            }
        }
        CM::BuyAuction(buy_auction) => {
            check_expensive_rate_limit!("SettleAuction");
            match db
                .settle_auction(
                    0,
                    SettleAuction {
                        auction_id: buy_auction.auction_id,
                        buyer_id: user_id,
                        settle_price: -1.0,
                    },
                )
                .await?
            {
                Ok(db::AuctionSettledWithAffectedAccounts {
                    auction_settled,
                    affected_accounts,
                }) => {
                    let msg =
                        server_message(request_id, SM::AuctionSettled(auction_settled.into()));
                    subscriptions.send_public(msg);
                    for account in affected_accounts {
                        subscriptions.notify_portfolio(account);
                    }
                }
                Err(failure) => {
                    fail!("BuyAuction", failure.message());
                }
            };
        }
        CM::DeleteAuction(delete_auction) => {
            check_expensive_rate_limit!("DeleteAuction");
            match db
                .delete_auction(user_id, delete_auction, admin_id)
                .await?
            {
                Ok(auction_id) => {
                    let msg = server_message(
                        request_id,
                        SM::AuctionDeleted(AuctionDeleted { auction_id }),
                    );
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("DeleteAuction", failure.message());
                }
            }
        }
        CM::EditAuction(edit_auction) => {
            check_expensive_rate_limit!("EditAuction");
            match db
                .edit_auction(user_id, edit_auction, admin_id)
                .await?
            {
                Ok(auction) => {
                    let msg = server_message(request_id, SM::Auction(auction.into()));
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("EditAuction", failure.message());
                }
            }
        }
        CM::CreateMarketType(create_market_type) => {
            if admin_id.is_none() {
                return Ok(Some(HandleResult::AdminRequired {
                    request_id,
                    msg_type: "CreateMarketType",
                }));
            }
            check_expensive_rate_limit!("CreateMarketType");
            match db
                .create_market_type(
                    create_market_type.name,
                    create_market_type.description,
                    create_market_type.public,
                )
                .await?
            {
                Ok(market_type) => {
                    let msg = server_message(request_id, SM::MarketType(market_type.into()));
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("CreateMarketType", failure.message());
                }
            };
        }
        CM::DeleteMarketType(delete_market_type) => {
            if admin_id.is_none() {
                return Ok(Some(HandleResult::AdminRequired {
                    request_id,
                    msg_type: "DeleteMarketType",
                }));
            }
            check_expensive_rate_limit!("DeleteMarketType");
            match db
                .delete_market_type(delete_market_type.market_type_id)
                .await?
            {
                Ok(market_type_id) => {
                    let msg = server_message(
                        request_id,
                        SM::MarketTypeDeleted(MarketTypeDeleted { market_type_id }),
                    );
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("DeleteMarketType", failure.message());
                }
            };
        }
        CM::CreateMarketGroup(create_market_group) => {
            if admin_id.is_none() {
                return Ok(Some(HandleResult::AdminRequired {
                    request_id,
                    msg_type: "CreateMarketGroup",
                }));
            }
            check_expensive_rate_limit!("CreateMarketGroup");
            match db
                .create_market_group(
                    create_market_group.name,
                    create_market_group.description,
                    create_market_group.type_id,
                )
                .await?
            {
                Ok(market_group) => {
                    let msg = server_message(request_id, SM::MarketGroup(market_group.into()));
                    subscriptions.send_public(msg);
                }
                Err(failure) => {
                    fail!("CreateMarketGroup", failure.message());
                }
            };
        }
    }
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
                    match validate_access_and_id_or_test(&authenticate.jwt, id_jwt.as_deref()).await {
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
                let initial_balance = if is_admin { dec!(100_000_000) } else { dec!(0) };
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
                                name: name.clone(),
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
