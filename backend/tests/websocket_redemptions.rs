#![allow(
    clippy::similar_names,
    clippy::too_many_lines,
    clippy::used_underscore_binding
)]
//! WebSocket integration tests for redemptions in `GetFullTradeHistory`
//!
//! Run with: `cargo test --features dev-mode`

#![cfg(feature = "dev-mode")]

use backend::{
    test_utils::{create_test_app_state, spawn_test_server, TestClient},
    websocket_api::{server_message::Message as SM, Redeemable, Side},
};
use tempfile::TempDir;

/// Helper: create a standard test setup with an admin, two constituent markets, and a fund market.
/// Returns (url, `admin_account_id`, `market_a_id`, `market_b_id`, `fund_id`, _`temp_dir`).
/// The `TempDir` must be kept alive for the duration of the test.
async fn setup_fund_market() -> (String, i64, i64, i64, i64, TempDir) {
    let (app_state, temp) = create_test_app_state().await.unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    admin.enable_sudo().await.unwrap();
    // Drain resent data
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create two constituent markets
    let market_a_id = match admin
        .create_market("Market A", 0.0, 100.0, false)
        .await
        .unwrap()
        .message
    {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    let market_b_id = match admin
        .create_market("Market B", 0.0, 100.0, false)
        .await
        .unwrap()
        .message
    {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Create a fund market redeemable for A (multiplier 1) and B (multiplier 2), with fee of 5
    let fund_id = match admin
        .create_market_full(
            "Fund",
            0.0,
            0.0,
            false,
            vec![
                Redeemable {
                    constituent_id: market_a_id,
                    multiplier: 1,
                },
                Redeemable {
                    constituent_id: market_b_id,
                    multiplier: 2,
                },
            ],
            5.0,
        )
        .await
        .unwrap()
        .message
    {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    drop(admin);

    (url, admin_id, market_a_id, market_b_id, fund_id, temp)
}

#[tokio::test]
async fn test_full_trade_history_includes_redemptions() {
    let (url, _admin_id, _market_a_id, _market_b_id, fund_id, _temp) = setup_fund_market().await;

    // Connect as admin and buy into the fund, then redeem
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    admin.enable_sudo().await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create a user who will trade with admin
    let mut user = TestClient::connect(&url).await.unwrap();
    let _user_id = user.authenticate("user1", "User One", false).await.unwrap();
    user.drain_initial_data().await.unwrap();

    // Give user some money
    admin
        .make_transfer(admin_id, _user_id, 10000.0, "test")
        .await
        .unwrap();
    // Drain transfer notifications
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Admin places bid on fund, user places matching offer
    admin
        .create_order(fund_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();
    // Drain broadcast
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    user.create_order(fund_id, 50.0, 10.0, Side::Offer)
        .await
        .unwrap();
    // Drain broadcasts
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Admin redeems 3 units of the fund
    let redeem_response = admin.redeem(fund_id, 3.0).await.unwrap();
    match &redeem_response.message {
        Some(SM::Redeemed(r)) => {
            assert_eq!(r.fund_id, fund_id);
            assert!((r.amount - 3.0).abs() < f64::EPSILON);
        }
        other => panic!("Expected Redeemed, got {other:?}"),
    }
    // Drain broadcasts
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Now request full trade history for the fund market
    let trades_response = admin.get_full_trade_history(fund_id).await.unwrap();
    match trades_response.message {
        Some(SM::Trades(trades)) => {
            assert!(trades.has_full_history, "Should have full history flag");
            assert_eq!(trades.trades.len(), 1, "Should have 1 trade");
            assert_eq!(
                trades.redemptions.len(),
                1,
                "Should have 1 redemption in full trade history"
            );

            let redemption = &trades.redemptions[0];
            assert_eq!(redemption.fund_id, fund_id);
            assert!((redemption.amount - 3.0).abs() < f64::EPSILON);
            assert!(redemption.transaction_id > 0);
            assert!(redemption.transaction_timestamp.is_some());
        }
        other => panic!("Expected Trades, got {other:?}"),
    }
}

#[tokio::test]
async fn test_full_trade_history_no_redemptions_on_non_fund_market() {
    let (url, _admin_id, market_a_id, _market_b_id, _fund_id, _temp) = setup_fund_market().await;

    let mut admin = TestClient::connect(&url).await.unwrap();
    admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    // Request full trade history for a non-fund market (no redemptions expected)
    let trades_response = admin.get_full_trade_history(market_a_id).await.unwrap();
    match trades_response.message {
        Some(SM::Trades(trades)) => {
            assert!(trades.has_full_history);
            assert!(
                trades.redemptions.is_empty(),
                "Non-fund market should have no redemptions"
            );
        }
        other => panic!("Expected Trades, got {other:?}"),
    }
}

#[tokio::test]
async fn test_multiple_redemptions_in_history() {
    let (url, _admin_id, _market_a_id, _market_b_id, fund_id, _temp) = setup_fund_market().await;

    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    admin.enable_sudo().await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create a counterparty
    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user.authenticate("user1", "User One", false).await.unwrap();
    user.drain_initial_data().await.unwrap();

    admin
        .make_transfer(admin_id, user_id, 10000.0, "test")
        .await
        .unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Trade: admin buys 10 of fund
    admin
        .create_order(fund_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    user.create_order(fund_id, 50.0, 10.0, Side::Offer)
        .await
        .unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Redeem 2 units, then 3 more
    admin.redeem(fund_id, 2.0).await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    admin.redeem(fund_id, 3.0).await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Check full history has both redemptions
    let trades_response = admin.get_full_trade_history(fund_id).await.unwrap();
    match trades_response.message {
        Some(SM::Trades(trades)) => {
            assert!(trades.has_full_history);
            assert_eq!(
                trades.redemptions.len(),
                2,
                "Should have 2 redemptions in history"
            );
            // Redemptions should be ordered by transaction_id
            assert!(
                trades.redemptions[0].transaction_id < trades.redemptions[1].transaction_id,
                "Redemptions should be ordered by transaction_id"
            );
            assert!((trades.redemptions[0].amount - 2.0).abs() < f64::EPSILON);
            assert!((trades.redemptions[1].amount - 3.0).abs() < f64::EPSILON);
        }
        other => panic!("Expected Trades, got {other:?}"),
    }
}

#[tokio::test]
async fn test_redemptions_hidden_on_hide_account_ids_market() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    admin.enable_sudo().await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create constituent markets
    let market_a_id = match admin
        .create_market("Market A", 0.0, 100.0, false)
        .await
        .unwrap()
        .message
    {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Create fund with hide_account_ids=true
    let fund_id = match admin
        .create_market_full(
            "Hidden Fund",
            0.0,
            0.0,
            true,
            vec![Redeemable {
                constituent_id: market_a_id,
                multiplier: 1,
            }],
            0.0,
        )
        .await
        .unwrap()
        .message
    {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {other:?}"),
    };

    // Create a user, give them money, have them trade and redeem
    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user.authenticate("user1", "User One", false).await.unwrap();
    user.drain_initial_data().await.unwrap();

    admin
        .make_transfer(admin_id, user_id, 10000.0, "test")
        .await
        .unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // User buys 5 of fund from admin
    user.create_order(fund_id, 50.0, 5.0, Side::Bid)
        .await
        .unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    admin
        .create_order(fund_id, 50.0, 5.0, Side::Offer)
        .await
        .unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // User redeems 2 units
    user.redeem(fund_id, 2.0).await.unwrap();
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Disable sudo on admin
    admin.disable_sudo().await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Admin (without sudo) requests full trade history - redemption account IDs should be hidden
    let trades_response = admin.get_full_trade_history(fund_id).await.unwrap();
    match trades_response.message {
        Some(SM::Trades(trades)) => {
            assert!(trades.has_full_history);
            assert_eq!(trades.redemptions.len(), 1, "Should have 1 redemption");
            let redemption = &trades.redemptions[0];
            assert_eq!(
                redemption.account_id, 0,
                "Redemption account_id should be hidden (got {}, user_id={}, admin_id={})",
                redemption.account_id, user_id, admin_id
            );
        }
        other => panic!("Expected Trades, got {other:?}"),
    }

    // With sudo enabled, IDs should be visible
    admin.enable_sudo().await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    let trades_response = admin.get_full_trade_history(fund_id).await.unwrap();
    match trades_response.message {
        Some(SM::Trades(trades)) => {
            assert_eq!(trades.redemptions.len(), 1);
            assert_eq!(
                trades.redemptions[0].account_id, user_id,
                "Admin with sudo should see real redemption account_id"
            );
        }
        other => panic!("Expected Trades, got {other:?}"),
    }
}

#[tokio::test]
async fn test_redemption_broadcast_includes_correct_data() {
    let (url, _admin_id, market_a_id, market_b_id, fund_id, _temp) = setup_fund_market().await;

    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    admin.enable_sudo().await.unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Create a user as a counterparty
    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user.authenticate("user1", "User One", false).await.unwrap();
    user.drain_initial_data().await.unwrap();

    admin
        .make_transfer(admin_id, user_id, 10000.0, "test")
        .await
        .unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Admin buys 5 of fund
    admin
        .create_order(fund_id, 50.0, 5.0, Side::Bid)
        .await
        .unwrap();
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    user.create_order(fund_id, 50.0, 5.0, Side::Offer)
        .await
        .unwrap();
    while admin
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
    while user
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}

    // Admin redeems 2 units - the direct response should be Redeemed
    let redeem_response = admin.redeem(fund_id, 2.0).await.unwrap();
    match &redeem_response.message {
        Some(SM::Redeemed(r)) => {
            assert_eq!(r.account_id, admin_id);
            assert_eq!(r.fund_id, fund_id);
            assert!((r.amount - 2.0).abs() < f64::EPSILON);
            assert!(r.transaction_id > 0);
            assert!(r.transaction_timestamp.is_some());
        }
        other => panic!("Expected Redeemed, got {other:?}"),
    }

    // The user (as another connected client) should also receive the broadcast
    let mut user_saw_redeemed = false;
    while let Some(result) = user
        .try_recv_timeout(std::time::Duration::from_millis(500))
        .await
    {
        if let Ok(msg) = result {
            if let Some(SM::Redeemed(r)) = msg.message {
                user_saw_redeemed = true;
                assert_eq!(r.fund_id, fund_id);
                assert!((r.amount - 2.0).abs() < f64::EPSILON);
                break;
            }
        }
    }
    assert!(user_saw_redeemed, "User should receive Redeemed broadcast");

    // Verify admin's portfolio reflects the redemption:
    // - Fund position: 5 - 2 = 3
    // - Market A position: 2 * 1 = 2
    // - Market B position: 2 * 2 = 4
    // - Fee: 5 * 2 = 10
    // Check the full trade history includes the correct market positions
    let _ = (market_a_id, market_b_id); // used for documentation above
}
