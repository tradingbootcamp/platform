//! WebSocket integration tests for market visibility subscription bugs
//!
//! Tests two bugs:
//! 1. Sudoed admins don't receive real-time updates for visibility-restricted markets
//!    (`CreateMarket`, `SettleMarket`, `EditMarket` are sent via `send_private` to `visible_to` accounts only)
//! 2. Non-admin users receive broadcast updates (orders/trades/settlements) for markets
//!    they shouldn't see (these go via `send_public` with no visibility filtering)
//!
//! Run with: `cargo test --features dev-mode`

#![cfg(feature = "dev-mode")]

use backend::{
    test_utils::{create_test_app_state, spawn_test_server, TestClient},
    websocket_api::{server_message::Message as SM, ClientMessage, EditMarket, ServerMessage, Side,
        client_message::Message as CM, SettleMarket},
    AppState,
};

const TIMEOUT: std::time::Duration = std::time::Duration::from_millis(500);
const SHORT_DELAY: std::time::Duration = std::time::Duration::from_millis(50);

/// Helper to create a user via the multi-cohort `global_db` + cohort db pattern.
/// Returns the cohort-local account ID.
async fn create_test_user(app_state: &AppState, kinde_id: &str, name: &str, balance: rust_decimal::Decimal) -> i64 {
    let global_user = app_state.global_db.ensure_global_user(kinde_id, name, None, false).await.unwrap();
    let cohort = app_state.cohorts.get("test").unwrap();
    let result = cohort.db.ensure_user_created_by_global_id(global_user.id, name, balance).await.unwrap().unwrap();
    result.id
}

/// Drain all pending messages, returning them
async fn drain_messages(client: &mut TestClient) -> Vec<SM> {
    let mut messages = vec![];
    while let Some(result) = client.try_recv_timeout(TIMEOUT).await {
        if let Ok(msg) = result {
            if let Some(m) = msg.message {
                messages.push(m);
            }
        }
    }
    messages
}

/// Send a request and recv messages until we find one with our `request_id`
async fn send_and_recv(client: &mut TestClient, request_id: String, cm: CM) -> ServerMessage {
    client
        .send_raw(ClientMessage {
            request_id: request_id.clone(),
            message: Some(cm),
        })
        .await
        .unwrap();
    loop {
        let msg = client.recv().await.unwrap();
        if msg.request_id == request_id {
            return msg;
        }
    }
}

// ============================================================
// Bug 1: Sudoed admins missing updates for visible_to markets
// ============================================================

#[tokio::test]
async fn test_sudoed_admin_receives_create_market_with_visible_to() {
    // Admin1 creates a visible_to market. Admin2 (sudoed, NOT in visible_to)
    // should receive the Market broadcast.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Connect BOTH admins first (so AccountCreated broadcasts are out of the way)
    let mut admin1 = TestClient::connect(&url).await.unwrap();
    let admin1_account_id = admin1
        .authenticate("admin1", "Admin One", true)
        .await
        .unwrap();
    admin1.drain_initial_data().await.unwrap();

    let mut admin2 = TestClient::connect(&url).await.unwrap();
    admin2
        .authenticate("admin2", "Admin Two", true)
        .await
        .unwrap();
    admin2.drain_initial_data().await.unwrap();

    // Enable sudo on both and drain
    admin1.enable_sudo().await.unwrap();
    drain_messages(&mut admin1).await;
    admin2.enable_sudo().await.unwrap();
    drain_messages(&mut admin2).await;

    // Admin1 creates market visible to user1 + admin1 (admin1 must be in list to get response)
    let response = admin1
        .create_market_with_visible_to(
            "Restricted Market",
            0.0,
            100.0,
            false,
            vec![user1_id, admin1_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market response, got {other:?}"),
    };

    // Admin2 (sudoed, NOT in visible_to) should receive the Market message
    tokio::time::sleep(SHORT_DELAY).await;
    let messages = drain_messages(&mut admin2).await;
    let found_market = messages
        .iter()
        .any(|m| matches!(m, SM::Market(market) if market.id == market_id));
    assert!(
        found_market,
        "Sudoed admin2 should receive Market broadcast for visible_to-restricted market. \
         Got messages: {messages:#?}"
    );
}

#[tokio::test]
async fn test_sudoed_admin_receives_settle_market_with_visible_to() {
    // When a visible_to-restricted market is settled, sudoed admins (NOT in visible_to)
    // should receive MarketSettled.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Connect both admins first
    let mut admin1 = TestClient::connect(&url).await.unwrap();
    let admin1_account_id = admin1
        .authenticate("admin1", "Admin One", true)
        .await
        .unwrap();
    admin1.drain_initial_data().await.unwrap();

    let mut admin2 = TestClient::connect(&url).await.unwrap();
    admin2
        .authenticate("admin2", "Admin Two", true)
        .await
        .unwrap();
    admin2.drain_initial_data().await.unwrap();

    // Enable sudo on both
    admin1.enable_sudo().await.unwrap();
    drain_messages(&mut admin1).await;
    admin2.enable_sudo().await.unwrap();
    drain_messages(&mut admin2).await;

    // Admin1 creates restricted market
    let response = admin1
        .create_market_with_visible_to(
            "Settle Test Market",
            0.0,
            100.0,
            false,
            vec![user1_id, admin1_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };
    // Drain market creation broadcast from admin2
    drain_messages(&mut admin2).await;

    // Admin1 settles the market (use send_and_recv to skip interleaved broadcasts)
    let settle_response = send_and_recv(
        &mut admin1,
        "settle-req".to_string(),
        CM::SettleMarket(SettleMarket {
            market_id,
            settle_price: 50.0,
        }),
    )
    .await;
    match &settle_response.message {
        Some(SM::MarketSettled(_)) => {}
        other => panic!("Expected MarketSettled, got {other:?}"),
    }

    // Admin2 should receive MarketSettled
    tokio::time::sleep(SHORT_DELAY).await;
    let messages = drain_messages(&mut admin2).await;
    let found_settled = messages
        .iter()
        .any(|m| matches!(m, SM::MarketSettled(ms) if ms.id == market_id));
    assert!(
        found_settled,
        "Sudoed admin2 should receive MarketSettled for visible_to-restricted market. \
         Got messages: {messages:#?}"
    );
}

#[tokio::test]
async fn test_sudoed_admin_receives_edit_market_with_visible_to() {
    // When a visible_to-restricted market is edited, sudoed admins (NOT in visible_to)
    // should receive the Market update.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Connect both admins first
    let mut admin1 = TestClient::connect(&url).await.unwrap();
    let admin1_account_id = admin1
        .authenticate("admin1", "Admin One", true)
        .await
        .unwrap();
    admin1.drain_initial_data().await.unwrap();

    let mut admin2 = TestClient::connect(&url).await.unwrap();
    admin2
        .authenticate("admin2", "Admin Two", true)
        .await
        .unwrap();
    admin2.drain_initial_data().await.unwrap();

    // Enable sudo on both
    admin1.enable_sudo().await.unwrap();
    drain_messages(&mut admin1).await;
    admin2.enable_sudo().await.unwrap();
    drain_messages(&mut admin2).await;

    // Admin1 creates restricted market
    let response = admin1
        .create_market_with_visible_to(
            "Edit Test Market",
            0.0,
            100.0,
            false,
            vec![user1_id, admin1_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };
    // Drain market creation broadcast from admin2
    drain_messages(&mut admin2).await;

    // Admin1 edits the market description
    let edit_response = send_and_recv(
        &mut admin1,
        "edit-req".to_string(),
        CM::EditMarket(EditMarket {
            id: market_id,
            description: Some("Updated description".to_string()),
            ..Default::default()
        }),
    )
    .await;
    match &edit_response.message {
        Some(SM::Market(_)) => {}
        other => panic!("Expected Market, got {other:?}"),
    }

    // Admin2 should receive the Market update
    tokio::time::sleep(SHORT_DELAY).await;
    let messages = drain_messages(&mut admin2).await;
    let found_market = messages.iter().any(|m| {
        matches!(m, SM::Market(market) if market.id == market_id && market.description == "Updated description")
    });
    assert!(
        found_market,
        "Sudoed admin2 should receive Market update for visible_to-restricted market. \
         Got messages: {messages:#?}"
    );
}

// ============================================================
// Bug 2: Non-admin users receiving updates for invisible markets
// ============================================================

#[tokio::test]
async fn test_non_visible_user_does_not_receive_order_updates() {
    // A user NOT in visible_to should not receive OrderCreated broadcasts.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;
    let _ = create_test_user(&app_state, "user2", "User Two", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates market visible only to user1 + admin
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_account_id = admin
        .authenticate("admin1", "Admin", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();
    drain_messages(&mut admin).await;

    let response = admin
        .create_market_with_visible_to(
            "Private Market",
            0.0,
            100.0,
            false,
            vec![user1_id, admin_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Connect user1 and user2 (do this AFTER market creation to avoid broadcast interleaving)
    let mut user2 = TestClient::connect(&url).await.unwrap();
    user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    let mut user1 = TestClient::connect(&url).await.unwrap();
    user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    // Drain any AccountCreated broadcasts from user connections
    drain_messages(&mut user2).await;

    // User1 places an order
    user1
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();

    // User2 should NOT receive any OrderCreated for this market
    tokio::time::sleep(SHORT_DELAY).await;
    let messages = drain_messages(&mut user2).await;
    let found_order = messages
        .iter()
        .any(|m| matches!(m, SM::OrderCreated(oc) if oc.market_id == market_id));
    assert!(
        !found_order,
        "User2 (not in visible_to) should NOT receive OrderCreated for restricted market"
    );
}

#[tokio::test]
async fn test_non_visible_user_does_not_receive_trade_broadcasts() {
    // A user NOT in visible_to should not receive trade broadcasts.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;
    let user2_id = create_test_user(&app_state, "user2", "User Two", rust_decimal_macros::dec!(1000)).await;
    let _ = create_test_user(&app_state, "user3", "User Three", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates market visible to user1 and user2 (+ admin for response)
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_account_id = admin
        .authenticate("admin1", "Admin", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();
    drain_messages(&mut admin).await;

    let response = admin
        .create_market_with_visible_to(
            "Private Trading Market",
            0.0,
            100.0,
            false,
            vec![user1_id, user2_id, admin_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Connect all users AFTER market creation
    let mut user3 = TestClient::connect(&url).await.unwrap();
    user3
        .authenticate("user3", "User Three", false)
        .await
        .unwrap();
    user3.drain_initial_data().await.unwrap();

    let mut user1 = TestClient::connect(&url).await.unwrap();
    user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    let mut user2 = TestClient::connect(&url).await.unwrap();
    user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    // Drain AccountCreated broadcasts
    drain_messages(&mut user3).await;

    // User1 bids, user2 offers → trade
    user1
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();

    // Use send_and_recv to skip the broadcast of user1's order
    let trade_resp = send_and_recv(
        &mut user2,
        "trade-order".to_string(),
        CM::CreateOrder(backend::websocket_api::CreateOrder {
            market_id,
            price: 50.0,
            size: 10.0,
            side: Side::Offer.into(),
        }),
    )
    .await;
    match &trade_resp.message {
        Some(SM::OrderCreated(oc)) => {
            assert!(!oc.trades.is_empty(), "Should have created a trade");
        }
        other => panic!("Expected OrderCreated with trades, got {other:?}"),
    }

    // User3 should NOT receive any OrderCreated for this market
    tokio::time::sleep(SHORT_DELAY).await;
    let messages = drain_messages(&mut user3).await;
    let found_order = messages
        .iter()
        .any(|m| matches!(m, SM::OrderCreated(oc) if oc.market_id == market_id));
    assert!(
        !found_order,
        "User3 (not in visible_to) should NOT receive trade broadcasts for restricted market"
    );
}

#[tokio::test]
async fn test_non_visible_user_does_not_receive_settle_broadcast() {
    // A user NOT in visible_to should not receive MarketSettled or OrdersCancelled.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;
    let _ = create_test_user(&app_state, "user2", "User Two", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates market visible only to user1 + admin
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_account_id = admin
        .authenticate("admin1", "Admin", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();
    drain_messages(&mut admin).await;

    let response = admin
        .create_market_with_visible_to(
            "Settle Test Market",
            0.0,
            100.0,
            false,
            vec![user1_id, admin_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Connect users AFTER market creation
    let mut user2 = TestClient::connect(&url).await.unwrap();
    user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    let mut user1 = TestClient::connect(&url).await.unwrap();
    user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    // Drain AccountCreated broadcasts from user2
    drain_messages(&mut user2).await;

    // User1 places an order
    user1
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();

    // Drain any order broadcasts from user2
    tokio::time::sleep(SHORT_DELAY).await;
    drain_messages(&mut user2).await;

    // Settle the market (use send_and_recv to skip interleaved order broadcasts)
    let settle_response = send_and_recv(
        &mut admin,
        "settle-req".to_string(),
        CM::SettleMarket(SettleMarket {
            market_id,
            settle_price: 50.0,
        }),
    )
    .await;
    match &settle_response.message {
        Some(SM::MarketSettled(_)) => {}
        other => panic!("Expected MarketSettled, got {other:?}"),
    }

    // User2 should NOT receive MarketSettled or OrdersCancelled
    tokio::time::sleep(SHORT_DELAY).await;
    let messages = drain_messages(&mut user2).await;
    let found_settled = messages
        .iter()
        .any(|m| matches!(m, SM::MarketSettled(ms) if ms.id == market_id));
    let found_cancelled = messages
        .iter()
        .any(|m| matches!(m, SM::OrdersCancelled(oc) if oc.market_id == market_id));
    assert!(
        !found_settled,
        "User2 (not in visible_to) should NOT receive MarketSettled for restricted market"
    );
    assert!(
        !found_cancelled,
        "User2 (not in visible_to) should NOT receive OrdersCancelled for restricted market"
    );
}

// ============================================================
// Regression tests: ensure visible users still work correctly
// ============================================================

#[tokio::test]
async fn test_visible_user_receives_order_updates() {
    // A user IN visible_to should receive OrderCreated broadcasts normally.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;
    let user2_id = create_test_user(&app_state, "user2", "User Two", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates market visible to user1 and user2 + admin
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_account_id = admin
        .authenticate("admin1", "Admin", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();
    drain_messages(&mut admin).await;

    let response = admin
        .create_market_with_visible_to(
            "Visible Market",
            0.0,
            100.0,
            false,
            vec![user1_id, user2_id, admin_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Connect users AFTER market creation
    let mut user2 = TestClient::connect(&url).await.unwrap();
    user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    let mut user1 = TestClient::connect(&url).await.unwrap();
    user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    // Drain any AccountCreated broadcasts
    drain_messages(&mut user2).await;

    // User1 places an order
    user1
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();

    // User2 (in visible_to) SHOULD receive OrderCreated
    tokio::time::sleep(SHORT_DELAY).await;
    let messages = drain_messages(&mut user2).await;
    let found_order = messages
        .iter()
        .any(|m| matches!(m, SM::OrderCreated(oc) if oc.market_id == market_id));
    assert!(
        found_order,
        "User2 (in visible_to) should receive OrderCreated for the restricted market"
    );
}

#[tokio::test]
async fn test_non_visible_user_does_not_see_market_in_initial_data() {
    // A user NOT in visible_to should not see the market in initial data.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;
    let _ = create_test_user(&app_state, "user2", "User Two", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates a restricted market
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_account_id = admin
        .authenticate("admin1", "Admin", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();
    drain_messages(&mut admin).await;

    let response = admin
        .create_market_with_visible_to(
            "Secret Market",
            0.0,
            100.0,
            false,
            vec![user1_id, admin_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // User2 connects - should NOT see the market in initial data
    let mut user2 = TestClient::connect(&url).await.unwrap();
    user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();

    let mut saw_restricted_market = false;
    loop {
        let msg = user2.recv().await.unwrap();
        match msg.message {
            Some(SM::Market(market)) if market.id == market_id => {
                saw_restricted_market = true;
            }
            Some(SM::ActingAs(_)) => break,
            _ => {}
        }
    }
    assert!(
        !saw_restricted_market,
        "User2 (not in visible_to) should NOT see restricted market in initial data"
    );
}

#[tokio::test]
async fn test_sudoed_admin_sees_visible_to_market_in_initial_data() {
    // When a sudoed admin connects AFTER a visible_to market exists,
    // they should see it in initial data.
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let user1_id = create_test_user(&app_state, "user1", "User One", rust_decimal_macros::dec!(1000)).await;

    let url = spawn_test_server(app_state).await.unwrap();

    // Admin1 creates a restricted market
    let mut admin1 = TestClient::connect(&url).await.unwrap();
    let admin1_account_id = admin1
        .authenticate("admin1", "Admin One", true)
        .await
        .unwrap();
    admin1.drain_initial_data().await.unwrap();
    admin1.enable_sudo().await.unwrap();
    drain_messages(&mut admin1).await;

    let response = admin1
        .create_market_with_visible_to(
            "Already Existing Market",
            0.0,
            100.0,
            false,
            vec![user1_id, admin1_account_id],
        )
        .await
        .unwrap();
    let market_id = match &response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Admin2 connects, enables sudo → should see the market in resent data
    let mut admin2 = TestClient::connect(&url).await.unwrap();
    admin2
        .authenticate("admin2", "Admin Two", true)
        .await
        .unwrap();
    admin2.drain_initial_data().await.unwrap();

    admin2.enable_sudo().await.unwrap();

    let messages = drain_messages(&mut admin2).await;
    let found_market = messages
        .iter()
        .any(|m| matches!(m, SM::Market(market) if market.id == market_id));
    assert!(
        found_market,
        "Sudoed admin2 should see visible_to-restricted market in resent initial data"
    );
}
