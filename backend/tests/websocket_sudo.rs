//! WebSocket integration tests for sudo functionality and admin permissions
//!
//! Run with: `cargo test --features test-auth-bypass`

#![cfg(feature = "test-auth-bypass")]

use backend::{
    test_utils::{create_test_app_state, spawn_test_server, TestClient},
    websocket_api::{server_message::Message as SM, RequestFailed, Side, SudoStatus},
};

/// Helper to assert a RequestFailed response with expected kind and message substring
fn assert_request_failed(msg: &SM, expected_kind: &str, expected_message_contains: &str) {
    match msg {
        SM::RequestFailed(RequestFailed {
            request_details: Some(details),
            error_details: Some(error),
        }) => {
            assert_eq!(
                details.kind, expected_kind,
                "Expected kind '{}', got '{}'",
                expected_kind, details.kind
            );
            assert!(
                error.message.contains(expected_message_contains),
                "Expected message containing '{}', got '{}'",
                expected_message_contains,
                error.message
            );
        }
        other => panic!("Expected RequestFailed, got {:?}", other),
    }
}

/// Helper to assert a SudoStatus response
fn assert_sudo_status(msg: &SM, expected_enabled: bool) {
    match msg {
        SM::SudoStatus(SudoStatus { enabled }) => {
            assert_eq!(
                *enabled, expected_enabled,
                "Expected sudo enabled={}, got {}",
                expected_enabled, enabled
            );
        }
        other => panic!("Expected SudoStatus, got {:?}", other),
    }
}

#[tokio::test]
async fn test_non_admin_cannot_enable_sudo() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    let response = client.enable_sudo().await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "SetSudo",
        "Only admins can enable sudo",
    );
}

#[tokio::test]
async fn test_admin_can_enable_sudo() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    let response = client.enable_sudo().await.unwrap();

    assert_sudo_status(response.message.as_ref().unwrap(), true);
}

#[tokio::test]
async fn test_admin_can_disable_sudo() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Enable first
    let response = client.enable_sudo().await.unwrap();
    assert_sudo_status(response.message.as_ref().unwrap(), true);

    // Drain any resent public data
    while client
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Then disable
    let response = client.disable_sudo().await.unwrap();
    assert_sudo_status(response.message.as_ref().unwrap(), false);
}

#[tokio::test]
async fn test_non_admin_can_disable_sudo() {
    // Even non-admins should be able to disable sudo (it's a no-op if not enabled)
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    let response = client.disable_sudo().await.unwrap();

    assert_sudo_status(response.message.as_ref().unwrap(), false);
}

#[tokio::test]
async fn test_sudo_enable_resends_public_data() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    let response = client.enable_sudo().await.unwrap();
    assert_sudo_status(response.message.as_ref().unwrap(), true);

    // After enabling sudo, we should receive public data messages (Accounts, Markets, etc.)
    let mut received_accounts = false;

    // Use a timeout to avoid hanging
    while let Some(result) = client
        .try_recv_timeout(std::time::Duration::from_millis(500))
        .await
    {
        if let Ok(msg) = result {
            if let Some(SM::Accounts(_)) = msg.message {
                received_accounts = true;
                break;
            }
        }
    }

    assert!(
        received_accounts,
        "Should receive Accounts after enabling sudo"
    );
}

#[tokio::test]
async fn test_revoke_ownership_shows_sudo_required_for_admin() {
    // Test that an admin without sudo enabled gets "Sudo required" message
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    let account_id = client
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Try to revoke ownership without sudo enabled
    let response = client.revoke_ownership(account_id, 999).await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "RevokeOwnership",
        "Sudo required",
    );
}

#[tokio::test]
async fn test_revoke_ownership_shows_admin_required_for_non_admin() {
    // Test that a non-admin gets "Only admins can revoke ownership" message
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    let account_id = client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Try to revoke ownership as non-admin
    let response = client.revoke_ownership(account_id, 999).await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "RevokeOwnership",
        "Only admins can revoke ownership",
    );
}

#[tokio::test]
async fn test_act_as_shows_not_owner_for_non_admin() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Try to act as a non-existent account
    let response = client.act_as(99999).await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "ActAs",
        "Not owner of account",
    );
}

#[tokio::test]
async fn test_act_as_shows_sudo_required_for_admin() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    // Create a second user that admin will try to act as
    let _ = app_state
        .db
        .ensure_user_created("user2", Some("Second User"), rust_decimal_macros::dec!(100))
        .await
        .unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Try to act as the other user without sudo
    // Account ID 2 should be the second user (after admin's account)
    let response = client.act_as(2).await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "ActAs",
        "Sudo required",
    );
}

#[tokio::test]
async fn test_multiple_sudo_toggle_cycles() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Toggle sudo multiple times
    for _ in 0..3 {
        // Enable
        let response = client.enable_sudo().await.unwrap();
        assert_sudo_status(response.message.as_ref().unwrap(), true);

        // Drain resent data after enable
        while client
            .try_recv_timeout(std::time::Duration::from_millis(100))
            .await
            .is_some()
        {}

        // Disable
        let response = client.disable_sudo().await.unwrap();
        assert_sudo_status(response.message.as_ref().unwrap(), false);

        // Drain resent data after disable
        while client
            .try_recv_timeout(std::time::Duration::from_millis(100))
            .await
            .is_some()
        {}
    }
}

#[tokio::test]
async fn test_hide_account_ids_respects_sudo() {
    // Test that admins without sudo have account IDs hidden on markets with hide_account_ids=true
    // This tests: OrderCreated (orders + trades), and initial public data (Orders)
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    // Pre-create users with initial balance so they can place orders
    let _ = app_state
        .db
        .ensure_user_created("user1", Some("User One"), rust_decimal_macros::dec!(1000))
        .await
        .unwrap();
    let _ = app_state
        .db
        .ensure_user_created("user2", Some("User Two"), rust_decimal_macros::dec!(1000))
        .await
        .unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    // Connect as admin and create a market with hide_account_ids=true
    let mut admin = TestClient::connect(&url).await.unwrap();
    admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    // Enable sudo to create market
    admin.enable_sudo().await.unwrap();

    // Drain sudo resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create market with hide_account_ids=true
    let market_response = admin
        .create_market("Hidden IDs Market", 0.0, 100.0, true)
        .await
        .unwrap();
    let market_id = match market_response.message {
        Some(SM::Market(market)) => market.id,
        other => panic!("Expected Market response, got {:?}", other),
    };

    // Disable sudo - now admin should have account IDs hidden
    admin.disable_sudo().await.unwrap();

    // Connect user1 to place a bid
    let mut user1 = TestClient::connect(&url).await.unwrap();
    let user1_account_id = user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    // User1 places a bid
    let order_response = user1
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();
    match &order_response.message {
        Some(SM::OrderCreated(_)) => {}
        other => panic!("User1 should have received OrderCreated, got {:?}", other),
    }

    // Small delay to ensure message propagates
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    // Admin (without sudo) should receive OrderCreated with hidden account_id
    let mut found_order_created = false;
    while let Some(result) = admin
        .try_recv_timeout(std::time::Duration::from_millis(500))
        .await
    {
        if let Ok(msg) = result {
            if let Some(SM::OrderCreated(order_created)) = msg.message {
                found_order_created = true;
                assert_eq!(
                    order_created.account_id, 0,
                    "Admin without sudo should not see account_id. Got {} (user1's ID is {})",
                    order_created.account_id, user1_account_id
                );
                if let Some(order) = order_created.order {
                    assert_eq!(order.owner_id, 0, "Order owner_id should be hidden");
                }
                break;
            }
        }
    }
    assert!(found_order_created, "Admin should have received OrderCreated for bid");

    // Connect user2 to place a matching offer (creates a trade)
    let mut user2 = TestClient::connect(&url).await.unwrap();
    let user2_account_id = user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    // User2 places an offer that matches user1's bid - this creates a trade
    let trade_response = user2
        .create_order(market_id, 50.0, 10.0, Side::Offer)
        .await
        .unwrap();
    match &trade_response.message {
        Some(SM::OrderCreated(oc)) => {
            assert!(!oc.trades.is_empty(), "Should have created a trade");
        }
        other => panic!("User2 should have received OrderCreated with trade, got {:?}", other),
    }

    // Small delay
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    // Admin should receive OrderCreated with trades, all IDs hidden
    let mut found_trade = false;
    while let Some(result) = admin
        .try_recv_timeout(std::time::Duration::from_millis(500))
        .await
    {
        if let Ok(msg) = result {
            if let Some(SM::OrderCreated(order_created)) = msg.message {
                if !order_created.trades.is_empty() {
                    found_trade = true;
                    assert_eq!(
                        order_created.account_id, 0,
                        "Trade OrderCreated account_id should be hidden"
                    );
                    for trade in &order_created.trades {
                        assert_eq!(
                            trade.buyer_id, 0,
                            "Trade buyer_id should be hidden. Got {} (user1={}, user2={})",
                            trade.buyer_id, user1_account_id, user2_account_id
                        );
                        assert_eq!(
                            trade.seller_id, 0,
                            "Trade seller_id should be hidden. Got {} (user1={}, user2={})",
                            trade.seller_id, user1_account_id, user2_account_id
                        );
                    }
                    break;
                }
            }
        }
    }
    assert!(found_trade, "Admin should have received OrderCreated with trade");

    // User1 places another bid that won't be matched (stays on book)
    user1
        .create_order(market_id, 40.0, 5.0, Side::Bid)
        .await
        .unwrap();

    // Small delay
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    // Now test initial public data: connect a NEW admin without sudo
    // They should receive Orders with hidden owner_ids
    let mut admin2 = TestClient::connect(&url).await.unwrap();
    admin2
        .authenticate("admin2", "Admin Two", true)
        .await
        .unwrap();

    // Look for Orders message in initial data (before ActingAs)
    let mut found_orders_with_content = false;
    loop {
        let msg = admin2.recv().await.unwrap();
        match msg.message {
            Some(SM::Orders(orders)) => {
                if orders.market_id == market_id && !orders.orders.is_empty() {
                    found_orders_with_content = true;
                    for order in &orders.orders {
                        assert_eq!(
                            order.owner_id, 0,
                            "Initial Orders should have hidden owner_id for admin without sudo. \
                             Got {} (user1={})",
                            order.owner_id, user1_account_id
                        );
                    }
                }
            }
            Some(SM::ActingAs(_)) => break,
            _ => {}
        }
    }
    assert!(
        found_orders_with_content,
        "Admin2 should have received initial Orders with at least one order"
    );

    // Test that disabling sudo re-hides the data
    // First enable sudo on admin2 (drain_initial_data already done in the loop above that broke on ActingAs)
    admin2.enable_sudo().await.unwrap();

    // Drain the resent data with unhidden IDs
    let mut saw_unhidden = false;
    while let Some(result) = admin2
        .try_recv_timeout(std::time::Duration::from_millis(500))
        .await
    {
        if let Ok(msg) = result {
            if let Some(SM::Orders(orders)) = msg.message {
                if orders.market_id == market_id && !orders.orders.is_empty() {
                    // Should see the real owner_id now
                    for order in &orders.orders {
                        if order.owner_id == user1_account_id {
                            saw_unhidden = true;
                        }
                    }
                }
            }
        }
    }
    assert!(saw_unhidden, "Admin2 with sudo should see unhidden owner_id");

    // Now disable sudo - should resend with hidden IDs
    admin2.disable_sudo().await.unwrap();

    let mut saw_rehidden = false;
    while let Some(result) = admin2
        .try_recv_timeout(std::time::Duration::from_millis(500))
        .await
    {
        if let Ok(msg) = result {
            if let Some(SM::Orders(orders)) = msg.message {
                if orders.market_id == market_id && !orders.orders.is_empty() {
                    for order in &orders.orders {
                        assert_eq!(
                            order.owner_id, 0,
                            "After disabling sudo, owner_id should be hidden again"
                        );
                        saw_rehidden = true;
                    }
                }
            }
        }
    }
    assert!(saw_rehidden, "Admin2 should receive re-hidden Orders after disabling sudo");
}

#[tokio::test]
async fn test_hide_account_ids_in_market_positions() {
    // Test that admins without sudo have account IDs hidden in GetMarketPositions response
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    // Pre-create users with initial balance so they can place orders
    let _ = app_state
        .db
        .ensure_user_created("user1", Some("User One"), rust_decimal_macros::dec!(1000))
        .await
        .unwrap();
    let _ = app_state
        .db
        .ensure_user_created("user2", Some("User Two"), rust_decimal_macros::dec!(1000))
        .await
        .unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    // Connect as admin and create a market with hide_account_ids=true
    let mut admin = TestClient::connect(&url).await.unwrap();
    admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    // Enable sudo to create market
    admin.enable_sudo().await.unwrap();

    // Drain sudo resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create market with hide_account_ids=true
    let market_response = admin
        .create_market("Hidden Positions Market", 0.0, 100.0, true)
        .await
        .unwrap();
    let market_id = match market_response.message {
        Some(SM::Market(market)) => market.id,
        other => panic!("Expected Market response, got {:?}", other),
    };

    // Connect user1 and place an order to create a position
    let mut user1 = TestClient::connect(&url).await.unwrap();
    let user1_account_id = user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    // Connect user2 to create the other side of the trade
    let mut user2 = TestClient::connect(&url).await.unwrap();
    let user2_account_id = user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    // User1 places a bid
    user1
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();

    // User2 places a matching offer - this creates a trade and positions
    user2
        .create_order(market_id, 50.0, 10.0, Side::Offer)
        .await
        .unwrap();

    // Small delay
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    // Disable sudo on admin
    admin.disable_sudo().await.unwrap();

    // Drain any resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Admin (without sudo) requests market positions - IDs should be hidden
    let positions_response = admin.get_market_positions(market_id).await.unwrap();
    match positions_response.message {
        Some(SM::MarketPositions(positions)) => {
            assert!(
                !positions.positions.is_empty(),
                "Should have at least one position"
            );
            for position in &positions.positions {
                assert_eq!(
                    position.account_id, 0,
                    "Admin without sudo should not see account_id in positions. \
                     Got {} (user1={}, user2={})",
                    position.account_id, user1_account_id, user2_account_id
                );
            }
        }
        other => panic!("Expected MarketPositions response, got {:?}", other),
    }

    // Enable sudo and verify IDs are now visible
    admin.enable_sudo().await.unwrap();

    // Drain sudo resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    let positions_response = admin.get_market_positions(market_id).await.unwrap();
    match positions_response.message {
        Some(SM::MarketPositions(positions)) => {
            assert!(
                !positions.positions.is_empty(),
                "Should have at least one position"
            );
            let mut saw_real_id = false;
            for position in &positions.positions {
                if position.account_id == user1_account_id
                    || position.account_id == user2_account_id
                {
                    saw_real_id = true;
                }
            }
            assert!(
                saw_real_id,
                "Admin with sudo should see real account_ids in positions"
            );
        }
        other => panic!("Expected MarketPositions response, got {:?}", other),
    }
}

#[tokio::test]
async fn test_hide_account_ids_in_full_trade_history() {
    // Test that admins without sudo have account IDs hidden in GetFullTradeHistory response
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    // Pre-create users with initial balance so they can place orders
    let _ = app_state
        .db
        .ensure_user_created("user1", Some("User One"), rust_decimal_macros::dec!(1000))
        .await
        .unwrap();
    let _ = app_state
        .db
        .ensure_user_created("user2", Some("User Two"), rust_decimal_macros::dec!(1000))
        .await
        .unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    // Connect as admin and create a market with hide_account_ids=true
    let mut admin = TestClient::connect(&url).await.unwrap();
    admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    // Enable sudo to create market
    admin.enable_sudo().await.unwrap();

    // Drain sudo resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create market with hide_account_ids=true
    let market_response = admin
        .create_market("Hidden Trade History Market", 0.0, 100.0, true)
        .await
        .unwrap();
    let market_id = match market_response.message {
        Some(SM::Market(market)) => market.id,
        other => panic!("Expected Market response, got {:?}", other),
    };

    // Connect user1 and place an order
    let mut user1 = TestClient::connect(&url).await.unwrap();
    let user1_account_id = user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    // Connect user2 to create the other side of the trade
    let mut user2 = TestClient::connect(&url).await.unwrap();
    let user2_account_id = user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    // User1 places a bid
    user1
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();

    // User2 places a matching offer - this creates a trade
    user2
        .create_order(market_id, 50.0, 10.0, Side::Offer)
        .await
        .unwrap();

    // Small delay
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    // Disable sudo on admin
    admin.disable_sudo().await.unwrap();

    // Drain any resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Admin (without sudo) requests full trade history - IDs should be hidden
    let trades_response = admin.get_full_trade_history(market_id).await.unwrap();
    match trades_response.message {
        Some(SM::Trades(trades)) => {
            assert!(
                !trades.trades.is_empty(),
                "Should have at least one trade"
            );
            for trade in &trades.trades {
                assert_eq!(
                    trade.buyer_id, 0,
                    "Admin without sudo should not see buyer_id in trade history. \
                     Got {} (user1={}, user2={})",
                    trade.buyer_id, user1_account_id, user2_account_id
                );
                assert_eq!(
                    trade.seller_id, 0,
                    "Admin without sudo should not see seller_id in trade history. \
                     Got {} (user1={}, user2={})",
                    trade.seller_id, user1_account_id, user2_account_id
                );
            }
        }
        other => panic!("Expected Trades response, got {:?}", other),
    }

    // Enable sudo and verify IDs are now visible
    admin.enable_sudo().await.unwrap();

    // Drain sudo resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    let trades_response = admin.get_full_trade_history(market_id).await.unwrap();
    match trades_response.message {
        Some(SM::Trades(trades)) => {
            assert!(
                !trades.trades.is_empty(),
                "Should have at least one trade"
            );
            let mut saw_real_id = false;
            for trade in &trades.trades {
                if trade.buyer_id == user1_account_id
                    || trade.buyer_id == user2_account_id
                    || trade.seller_id == user1_account_id
                    || trade.seller_id == user2_account_id
                {
                    saw_real_id = true;
                }
            }
            assert!(
                saw_real_id,
                "Admin with sudo should see real account_ids in trade history"
            );
        }
        other => panic!("Expected Trades response, got {:?}", other),
    }
}
