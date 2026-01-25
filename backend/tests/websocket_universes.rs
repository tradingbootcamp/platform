//! WebSocket integration tests for universes functionality
//!
//! Run with: `cargo test --features dev-mode`

#![cfg(feature = "dev-mode")]

use backend::{
    test_utils::{create_test_app_state, spawn_test_server, TestClient},
    websocket_api::{
        client_message::Message as CM, server_message::Message as SM, ActAs, ClientMessage,
        CreateAccount, CreateUniverse, MakeTransfer, RequestFailed, Side,
    },
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

/// Helper to receive a response with the matching request_id, draining other messages
async fn recv_response(
    client: &mut TestClient,
    request_id: &str,
) -> anyhow::Result<backend::websocket_api::ServerMessage> {
    loop {
        let msg = client.recv().await?;
        if msg.request_id == request_id || msg.request_id.is_empty() {
            // Either matching request_id or a broadcast message
            if msg.request_id == request_id {
                return Ok(msg);
            }
        }
        // Otherwise, keep receiving
    }
}

/// Helper to send CreateUniverse and get the response
async fn create_universe(
    client: &mut TestClient,
    name: &str,
    description: &str,
) -> anyhow::Result<backend::websocket_api::ServerMessage> {
    let request_id = format!("create-universe-{}", name);
    let msg = ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::CreateUniverse(CreateUniverse {
            name: name.to_string(),
            description: description.to_string(),
        })),
    };
    client.send_raw(msg).await?;
    recv_response(client, &request_id).await
}

/// Helper to send CreateAccount and get the response
async fn create_account(
    client: &mut TestClient,
    owner_id: i64,
    name: &str,
    universe_id: i64,
    initial_balance: f64,
) -> anyhow::Result<backend::websocket_api::ServerMessage> {
    let request_id = format!("create-account-{}", name);
    let msg = ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::CreateAccount(CreateAccount {
            owner_id,
            name: name.to_string(),
            universe_id,
            initial_balance,
        })),
    };
    client.send_raw(msg).await?;
    recv_response(client, &request_id).await
}

/// Helper to send MakeTransfer and get the response
async fn make_transfer(
    client: &mut TestClient,
    from_account_id: i64,
    to_account_id: i64,
    amount: f64,
    note: &str,
) -> anyhow::Result<backend::websocket_api::ServerMessage> {
    let request_id = format!("transfer-{}-to-{}", from_account_id, to_account_id);
    let msg = ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::MakeTransfer(MakeTransfer {
            from_account_id,
            to_account_id,
            amount,
            note: note.to_string(),
        })),
    };
    client.send_raw(msg).await?;
    recv_response(client, &request_id).await
}

/// Helper to send ActAs and get the response
async fn act_as(
    client: &mut TestClient,
    account_id: i64,
) -> anyhow::Result<backend::websocket_api::ServerMessage> {
    let request_id = format!("act-as-{}", account_id);
    let msg = ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::ActAs(ActAs { account_id })),
    };
    client.send_raw(msg).await?;
    recv_response(client, &request_id).await
}

/// Drain messages with timeout until none remain
async fn drain_messages(client: &mut TestClient) {
    while client
        .try_recv_timeout(std::time::Duration::from_millis(100))
        .await
        .is_some()
    {}
}

// =============================================================================
// Universe Creation Tests
// =============================================================================

#[tokio::test]
async fn test_any_user_can_create_universe() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    let response = create_universe(&mut client, "Test Universe", "A test universe").await.unwrap();

    match response.message {
        Some(SM::Universe(universe)) => {
            assert!(universe.id > 0, "Universe should have a positive ID");
            assert_eq!(universe.name, "Test Universe");
            assert_eq!(universe.description, "A test universe");
            assert!(universe.owner_id > 0, "Universe should have an owner");
        }
        other => panic!("Expected Universe response, got {:?}", other),
    }
}

#[tokio::test]
async fn test_duplicate_universe_name_rejected() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Create first universe
    let response = create_universe(&mut client, "Unique Name", "First").await.unwrap();
    assert!(matches!(response.message, Some(SM::Universe(_))));

    // Try to create another with same name
    let response = create_universe(&mut client, "Unique Name", "Second").await.unwrap();
    assert_request_failed(
        response.message.as_ref().unwrap(),
        "CreateUniverse",
        "Universe name already exists",
    );
}

// =============================================================================
// Account Creation with Universe Tests
// =============================================================================

#[tokio::test]
async fn test_create_account_in_universe() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    let user_id = client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Create a universe
    let universe_response = create_universe(&mut client, "My Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create account in that universe (with initial balance since we own the universe)
    let response = create_account(&mut client, user_id, "Test Account", universe_id, 100.0).await.unwrap();

    match response.message {
        Some(SM::AccountCreated(account)) => {
            // Backend doesn't prefix the name - that's frontend logic
            assert_eq!(account.name, "Test Account");
            assert_eq!(account.universe_id, universe_id);
        }
        other => panic!("Expected AccountCreated response, got {:?}", other),
    }
}

#[tokio::test]
async fn test_only_universe_owner_can_set_initial_balance() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    // User1 creates a universe
    let mut user1 = TestClient::connect(&url).await.unwrap();
    let user1_id = user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    let universe_response = create_universe(&mut user1, "User1 Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // User1 can create account with initial balance (they own the universe)
    let response = create_account(&mut user1, user1_id, "Account1", universe_id, 500.0).await.unwrap();
    assert!(
        matches!(response.message, Some(SM::AccountCreated(_))),
        "Owner should be able to set initial balance"
    );

    // User2 tries to create account in User1's universe with initial balance
    let mut user2 = TestClient::connect(&url).await.unwrap();
    let user2_id = user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    let response = create_account(&mut user2, user2_id, "Account2", universe_id, 100.0).await.unwrap();
    assert_request_failed(
        response.message.as_ref().unwrap(),
        "CreateAccount",
        "Not the owner of this universe",
    );
}

#[tokio::test]
async fn test_create_account_in_main_universe_without_initial_balance() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    let user_id = client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Create account in main universe (universe_id = 0) with no initial balance
    let response = create_account(&mut client, user_id, "Main Account", 0, 0.0).await.unwrap();

    match response.message {
        Some(SM::AccountCreated(account)) => {
            assert_eq!(account.universe_id, 0);
        }
        other => panic!("Expected AccountCreated response, got {:?}", other),
    }
}

#[tokio::test]
async fn test_cannot_set_initial_balance_in_main_universe() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    let user_id = client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Try to create account in main universe with initial balance
    let response = create_account(&mut client, user_id, "Funded Account", 0, 100.0).await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "CreateAccount",
        "Not the owner of this universe",
    );
}

// =============================================================================
// Market Creation in Universe Tests
// =============================================================================

#[tokio::test]
async fn test_only_universe_owner_can_create_market_in_non_main_universe() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    // User1 creates a universe and an account in it
    let mut user1 = TestClient::connect(&url).await.unwrap();
    let user1_id = user1
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user1.drain_initial_data().await.unwrap();

    let universe_response = create_universe(&mut user1, "Market Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create account in that universe
    let account_response = create_account(&mut user1, user1_id, "User1 Account", universe_id, 1000.0).await.unwrap();
    let user1_account_id = match account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // ActAs that account
    let act_as_response = act_as(&mut user1, user1_account_id).await.unwrap();
    match act_as_response.message {
        Some(SM::ActingAs(acting_as)) => {
            assert_eq!(acting_as.account_id, user1_account_id);
            assert_eq!(acting_as.universe_id, universe_id);
        }
        other => panic!("Expected ActingAs, got {:?}", other),
    }
    drain_messages(&mut user1).await;

    // User1 should be able to create a market (they own the universe)
    let market_response = user1.create_market("Universe Market", 0.0, 100.0, false).await.unwrap();
    match market_response.message {
        Some(SM::Market(market)) => {
            assert_eq!(market.universe_id, universe_id);
        }
        other => panic!("Expected Market response, got {:?}", other),
    }

    // User2 connects - verify they CANNOT create accounts in user1's universe
    // (This prevents non-owners from ever being able to create markets)
    let mut user2 = TestClient::connect(&url).await.unwrap();
    let user2_id = user2
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();
    user2.drain_initial_data().await.unwrap();

    // User2 tries to create an account in user1's universe - should fail
    let account_response = create_account(&mut user2, user2_id, "User2 Account", universe_id, 0.0).await.unwrap();
    assert_request_failed(
        account_response.message.as_ref().unwrap(),
        "CreateAccount",
        "Not the owner of this universe",
    );
}

// =============================================================================
// Cross-Universe Transfer Tests
// =============================================================================

#[tokio::test]
async fn test_cross_universe_transfer_rejected() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates accounts in different universes
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    // Create an alt account in main universe (universe 0)
    // Admin account itself is in universe 0 with balance
    let main_account_response = create_account(&mut admin, admin_id, "Main Alt", 0, 0.0).await.unwrap();
    let main_alt_id = match main_account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Create a universe
    let universe_response = create_universe(&mut admin, "Transfer Test Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create account in the new universe
    let universe_account_response = create_account(&mut admin, admin_id, "Universe Alt", universe_id, 1000.0).await.unwrap();
    let universe_alt_id = match universe_account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Try to transfer from main universe (admin account) to universe alt
    // This is a valid transfer pattern (owner -> owned alt) but crosses universes
    let response = make_transfer(&mut admin, admin_id, universe_alt_id, 100.0, "Cross universe").await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "MakeTransfer",
        "Cannot transfer between accounts in different universes",
    );

    // Try the other direction: from universe alt back to main alt
    // First act as the universe account
    let _ = act_as(&mut admin, universe_alt_id).await.unwrap();
    drain_messages(&mut admin).await;

    // Transfer from universe_alt to main_alt (crosses universes)
    let response = make_transfer(&mut admin, universe_alt_id, main_alt_id, 50.0, "Other direction").await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "MakeTransfer",
        "Cannot transfer between accounts in different universes",
    );
}

#[tokio::test]
async fn test_same_universe_transfer_works() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user.drain_initial_data().await.unwrap();

    // Create a universe
    let universe_response = create_universe(&mut user, "Same Universe Test", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create an account in that universe with initial balance
    let account_response = create_account(&mut user, user_id, "Universe Account", universe_id, 1000.0).await.unwrap();
    let universe_account_id = match account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Create a second account in the same universe owned by the first account
    // This creates an owner relationship: universe_account -> sub_account
    let sub_account_response = create_account(&mut user, universe_account_id, "Sub Account", universe_id, 0.0).await.unwrap();
    let sub_account_id = match sub_account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Act as the universe account
    let _ = act_as(&mut user, universe_account_id).await.unwrap();
    drain_messages(&mut user).await;

    // Transfer from universe_account to sub_account (owner -> owned alt, same universe)
    let response = make_transfer(&mut user, universe_account_id, sub_account_id, 100.0, "Same universe transfer").await.unwrap();

    match response.message {
        Some(SM::TransferCreated(_)) => {
            // Success!
        }
        other => panic!("Expected TransferCreated response, got {:?}", other),
    }
}

// =============================================================================
// Cross-Universe Trading Tests
// =============================================================================

#[tokio::test]
async fn test_cross_universe_trade_rejected() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates setup
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    admin.enable_sudo().await.unwrap();
    drain_messages(&mut admin).await;

    // Create a market in main universe
    let market_response = admin.create_market("Main Universe Market", 0.0, 100.0, false).await.unwrap();
    let main_market_id = match market_response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {:?}", other),
    };

    // Create a universe and account in it
    let universe_response = create_universe(&mut admin, "Trading Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    let account_response = create_account(&mut admin, admin_id, "Universe Account", universe_id, 10000.0).await.unwrap();
    let universe_account_id = match account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Act as the universe account
    let _ = act_as(&mut admin, universe_account_id).await.unwrap();
    drain_messages(&mut admin).await;

    // Try to trade in main universe market from universe account
    let order_response = admin.create_order(main_market_id, 50.0, 10.0, Side::Bid).await.unwrap();

    assert_request_failed(
        order_response.message.as_ref().unwrap(),
        "CreateOrder",
        "Cannot trade in a market from a different universe",
    );
}

#[tokio::test]
async fn test_same_universe_trading_works() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user.drain_initial_data().await.unwrap();

    // Create a universe
    let universe_response = create_universe(&mut user, "Trading Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create account in that universe
    let account_response = create_account(&mut user, user_id, "Trader Account", universe_id, 10000.0).await.unwrap();
    let account_id = match account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Act as that account
    let _ = act_as(&mut user, account_id).await.unwrap();
    drain_messages(&mut user).await;

    // Create a market in the same universe
    let market_response = user.create_market("Universe Market", 0.0, 100.0, false).await.unwrap();
    let market_id = match market_response.message {
        Some(SM::Market(m)) => {
            assert_eq!(m.universe_id, universe_id, "Market should be in the same universe");
            m.id
        }
        other => panic!("Expected Market, got {:?}", other),
    };

    // Trading in same universe should work
    let order_response = user.create_order(market_id, 50.0, 10.0, Side::Bid).await.unwrap();

    match order_response.message {
        Some(SM::OrderCreated(_)) => {
            // Success!
        }
        other => panic!("Expected OrderCreated response, got {:?}", other),
    }
}

// =============================================================================
// ActAs Universe Switching Tests
// =============================================================================

#[tokio::test]
async fn test_act_as_to_universe_account_shows_universe_id() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user.drain_initial_data().await.unwrap();

    // Create a universe
    let universe_response = create_universe(&mut user, "ActAs Universe Test", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create account in that universe
    let account_response = create_account(&mut user, user_id, "Universe Account", universe_id, 100.0).await.unwrap();
    let universe_account_id = match account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Act as that account
    let response = act_as(&mut user, universe_account_id).await.unwrap();

    // The ActingAs response should contain the universe_id
    match response.message {
        Some(SM::ActingAs(acting_as)) => {
            assert_eq!(acting_as.account_id, universe_account_id);
            assert_eq!(acting_as.universe_id, universe_id, "Should show universe_id in ActingAs");
        }
        other => panic!("Expected ActingAs response, got {:?}", other),
    }
}

#[tokio::test]
async fn test_act_as_switches_universe_and_resends_markets() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user.drain_initial_data().await.unwrap();

    // Create a universe with account and market
    let universe_response = create_universe(&mut user, "ActAs Test Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    let account_response = create_account(&mut user, user_id, "Universe Account", universe_id, 1000.0).await.unwrap();
    let universe_account_id = match account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Act as universe account to create a market there
    let _ = act_as(&mut user, universe_account_id).await.unwrap();
    drain_messages(&mut user).await;

    let market_response = user.create_market("Universe Only Market", 0.0, 100.0, false).await.unwrap();
    let universe_market_id = match market_response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {:?}", other),
    };

    // Go back to main account
    let response = act_as(&mut user, user_id).await.unwrap();

    // Should receive ActingAs with universe_id = 0
    match response.message {
        Some(SM::ActingAs(acting_as)) => {
            assert_eq!(acting_as.universe_id, 0, "Should be in main universe now");
        }
        other => panic!("Expected ActingAs, got {:?}", other),
    }

    // Collect resent markets
    let mut received_market_ids: Vec<i64> = vec![];
    while let Some(result) = user
        .try_recv_timeout(std::time::Duration::from_millis(500))
        .await
    {
        if let Ok(msg) = result {
            if let Some(SM::Market(market)) = msg.message {
                received_market_ids.push(market.id);
            }
        }
    }

    // The universe-only market should NOT be in the received markets
    // (since we switched back to main universe)
    assert!(
        !received_market_ids.contains(&universe_market_id),
        "Universe market should not be visible from main universe"
    );
}

// =============================================================================
// Market Filtering Tests
// =============================================================================

#[tokio::test]
async fn test_initial_data_filters_markets_by_universe() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates markets in main universe
    let mut admin = TestClient::connect(&url).await.unwrap();
    let admin_id = admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();

    admin.enable_sudo().await.unwrap();
    drain_messages(&mut admin).await;

    // Create market in main universe
    let main_market_response = admin.create_market("Main Market", 0.0, 100.0, false).await.unwrap();
    let main_market_id = match main_market_response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {:?}", other),
    };

    // Create a universe
    let universe_response = create_universe(&mut admin, "Filter Test Universe", "").await.unwrap();
    let universe_id = match universe_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create account and market in that universe
    let account_response = create_account(&mut admin, admin_id, "Filter Account", universe_id, 1000.0).await.unwrap();
    let universe_account_id = match account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    let _ = act_as(&mut admin, universe_account_id).await.unwrap();
    drain_messages(&mut admin).await;

    let universe_market_response = admin.create_market("Universe Market", 0.0, 100.0, false).await.unwrap();
    let universe_market_id = match universe_market_response.message {
        Some(SM::Market(m)) => m.id,
        other => panic!("Expected Market, got {:?}", other),
    };

    // New user connects - should only see main universe market initially
    let mut user = TestClient::connect(&url).await.unwrap();
    user
        .authenticate("user2", "User Two", false)
        .await
        .unwrap();

    // Collect markets from initial data
    let mut received_market_ids: Vec<i64> = vec![];
    loop {
        let msg = user.recv().await.unwrap();
        match msg.message {
            Some(SM::Market(market)) => {
                received_market_ids.push(market.id);
            }
            Some(SM::ActingAs(_)) => break,
            _ => {}
        }
    }

    // Should have received main market but not universe market
    assert!(
        received_market_ids.contains(&main_market_id),
        "Should receive main universe market"
    );
    assert!(
        !received_market_ids.contains(&universe_market_id),
        "Should NOT receive universe market (user is in main universe)"
    );
}

#[tokio::test]
async fn test_universe_not_found_rejected() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut client = TestClient::connect(&url).await.unwrap();
    let user_id = client
        .authenticate("user1", "Regular User", false)
        .await
        .unwrap();
    client.drain_initial_data().await.unwrap();

    // Try to create account in non-existent universe
    let response = create_account(&mut client, user_id, "Bad Account", 99999, 0.0).await.unwrap();

    assert_request_failed(
        response.message.as_ref().unwrap(),
        "CreateAccount",
        "Universe not found",
    );
}

#[tokio::test]
async fn test_owner_must_be_in_same_universe_or_universe_0() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut user = TestClient::connect(&url).await.unwrap();
    let user_id = user
        .authenticate("user1", "User One", false)
        .await
        .unwrap();
    user.drain_initial_data().await.unwrap();

    // Create two universes
    let universe1_response = create_universe(&mut user, "Universe 1", "").await.unwrap();
    let universe1_id = match universe1_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    let universe2_response = create_universe(&mut user, "Universe 2", "").await.unwrap();
    let universe2_id = match universe2_response.message {
        Some(SM::Universe(u)) => u.id,
        other => panic!("Expected Universe, got {:?}", other),
    };

    // Create an account in universe 1
    let account1_response = create_account(&mut user, user_id, "Account in U1", universe1_id, 100.0).await.unwrap();
    let account1_id = match account1_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Try to create an account in universe 2 with owner from universe 1 - should fail
    let request_id = format!("create-account-cross-{}", uuid::Uuid::new_v4());
    user.send_raw(ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::CreateAccount(CreateAccount {
            owner_id: account1_id,
            name: "Cross Universe Account".to_string(),
            universe_id: universe2_id,
            initial_balance: 0.0,
            ..Default::default()
        })),
    })
    .await
    .unwrap();

    let response = recv_response(&mut user, &request_id).await.unwrap();
    assert_request_failed(
        response.message.as_ref().unwrap(),
        "CreateAccount",
        "Owner must be in universe 0 or the same universe",
    );

    // Creating account in universe 1 with owner from universe 1 should work
    let request_id = format!("create-account-same-{}", uuid::Uuid::new_v4());
    user.send_raw(ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::CreateAccount(CreateAccount {
            owner_id: account1_id,
            name: "Same Universe Account".to_string(),
            universe_id: universe1_id,
            initial_balance: 0.0,
            ..Default::default()
        })),
    })
    .await
    .unwrap();

    let response = recv_response(&mut user, &request_id).await.unwrap();
    match response.message {
        Some(SM::AccountCreated(account)) => {
            assert_eq!(account.universe_id, universe1_id);
        }
        other => panic!("Expected AccountCreated, got {:?}", other),
    }

    // Creating account in universe 1 with owner from universe 0 (main user) should work
    let account3_response = create_account(&mut user, user_id, "Owner from U0", universe1_id, 100.0).await.unwrap();
    match account3_response.message {
        Some(SM::AccountCreated(account)) => {
            assert_eq!(account.universe_id, universe1_id);
        }
        other => panic!("Expected AccountCreated, got {:?}", other),
    }

    // Try to create an account in universe 0 (main) with owner from universe 1 - should fail
    let request_id = format!("create-account-main-from-u1-{}", uuid::Uuid::new_v4());
    user.send_raw(ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::CreateAccount(CreateAccount {
            owner_id: account1_id,
            name: "Main Universe Account with U1 Owner".to_string(),
            universe_id: 0, // main universe
            initial_balance: 0.0,
            ..Default::default()
        })),
    })
    .await
    .unwrap();

    let response = recv_response(&mut user, &request_id).await.unwrap();
    assert_request_failed(
        response.message.as_ref().unwrap(),
        "CreateAccount",
        "Owner must be in universe 0 or the same universe",
    );

    // Create an alt account in universe 0 (main)
    let alt_account_response = create_account(&mut user, user_id, "Alt in Main", 0, 0.0).await.unwrap();
    let alt_account_id = match alt_account_response.message {
        Some(SM::AccountCreated(a)) => a.id,
        other => panic!("Expected AccountCreated, got {:?}", other),
    };

    // Try to create account in non-zero universe with alt account (non-user) from main as owner - should fail
    let request_id = format!("create-account-alt-owner-{}", uuid::Uuid::new_v4());
    user.send_raw(ClientMessage {
        request_id: request_id.clone(),
        message: Some(CM::CreateAccount(CreateAccount {
            owner_id: alt_account_id,
            name: "Universe Account with Alt Owner".to_string(),
            universe_id: universe1_id,
            initial_balance: 0.0,
            ..Default::default()
        })),
    })
    .await
    .unwrap();

    let response = recv_response(&mut user, &request_id).await.unwrap();
    assert_request_failed(
        response.message.as_ref().unwrap(),
        "CreateAccount",
        "Owner from main universe must be a user account",
    );
}
