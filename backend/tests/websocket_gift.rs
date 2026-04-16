//! WebSocket integration tests for the Gift and RedistributeOwnerCredit features
//!
//! Run with: `cargo test --features dev-mode`

#![cfg(feature = "dev-mode")]

use backend::{
    test_utils::{create_test_app_state, spawn_test_server, TestClient},
    websocket_api::{self, server_message::Message as SM, RequestFailed, Side},
};
use rust_decimal_macros::dec;

/// Receive messages from `client` until `matcher` returns `Some(T)` or the
/// overall timeout elapses. Skips broadcasts / unrelated messages that race
/// with the expected response.
async fn recv_until<T>(
    label: &str,
    client: &mut TestClient,
    overall_timeout: std::time::Duration,
    mut matcher: impl FnMut(&SM) -> Option<T>,
) -> T {
    let deadline = tokio::time::Instant::now() + overall_timeout;
    let mut seen = Vec::new();
    loop {
        let remaining = deadline.saturating_duration_since(tokio::time::Instant::now());
        assert!(
            !remaining.is_zero(),
            "recv_until({label}) timed out; saw: {seen:?}"
        );
        let Some(result) = client.try_recv_timeout(remaining).await else {
            panic!("recv_until({label}) timed out; saw: {seen:?}");
        };
        let msg = result.expect("recv error");
        if let Some(variant) = msg.message.as_ref() {
            seen.push(std::mem::discriminant(variant));
            if let Some(inner) = matcher(variant) {
                return inner;
            }
        }
    }
}

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

#[tokio::test]
async fn test_gift_bypasses_shared_ownership_open_positions() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    // Pre-create users: alice (will own alt), bob (co-owner), carol (trade counter-party)
    let alice_id = app_state
        .db
        .ensure_user_created("alice", Some("Alice"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;
    let bob_id = app_state
        .db
        .ensure_user_created("bob", Some("Bob"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;
    let _carol_id = app_state
        .db
        .ensure_user_created("carol", Some("Carol"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;

    // Create alt account owned by alice
    let alt = app_state
        .db
        .create_account(
            alice_id,
            websocket_api::CreateAccount {
                owner_id: alice_id,
                name: "Shared Team".into(),
                universe_id: 0,
                initial_balance: 0.0,
                color: None,
            },
        )
        .await
        .unwrap()
        .unwrap();
    let alt_id = alt.id;

    // Fund the alt from alice before sharing (single-owner transfer path)
    app_state
        .db
        .make_transfer(
            None,
            alice_id,
            websocket_api::MakeTransfer {
                from_account_id: alice_id,
                to_account_id: alt_id,
                amount: 2000.0,
                note: "seed".into(),
            },
        )
        .await
        .unwrap()
        .unwrap();

    // Share ownership with bob — alt is now a shared-ownership account
    app_state
        .db
        .share_ownership(
            alice_id,
            websocket_api::ShareOwnership {
                of_account_id: alt_id,
                to_account_id: bob_id,
            },
        )
        .await
        .unwrap()
        .unwrap();

    // Clone DB so we can read balances after spawning the server
    let db = app_state.db.clone();
    let url = spawn_test_server(app_state).await.unwrap();

    // Admin creates a market (needs sudo on)
    let mut admin = TestClient::connect(&url).await.unwrap();
    admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();

    admin
        .create_market("Gift Test Market", 0.0, 100.0, false)
        .await
        .unwrap();
    let market_id = recv_until("create_market->Market", &mut admin, std::time::Duration::from_secs(2), |m| match m {
        SM::Market(market) if market.name == "Gift Test Market" => Some(market.id),
        _ => None,
    })
    .await;

    // Alice connects and acts as the shared alt account, places a bid
    let mut alice = TestClient::connect(&url).await.unwrap();
    alice.authenticate("alice", "Alice", false).await.unwrap();
    alice.drain_initial_data().await.unwrap();
    alice.act_as(alt_id).await.unwrap();
    alice
        .create_order(market_id, 50.0, 10.0, Side::Bid)
        .await
        .unwrap();

    // Carol sells into alice's bid, creating a trade (open position on alt)
    let mut carol = TestClient::connect(&url).await.unwrap();
    carol.authenticate("carol", "Carol", false).await.unwrap();
    carol.drain_initial_data().await.unwrap();
    let trade_resp = carol
        .create_order(market_id, 50.0, 10.0, Side::Offer)
        .await
        .unwrap();
    match &trade_resp.message {
        Some(SM::OrderCreated(oc)) => {
            assert!(!oc.trades.is_empty(), "Expected the offer to trade");
        }
        other => panic!("Expected OrderCreated with trades, got {:?}", other),
    }

    tokio::time::sleep(std::time::Duration::from_millis(50)).await;

    // Sanity: alt now has an open position
    let portfolio_before = db.get_portfolio(alt_id).await.unwrap().unwrap();
    assert!(
        portfolio_before
            .market_exposures
            .iter()
            .any(|e| e.market_id == market_id && e.position.0 != dec!(0)),
        "Alt should have an open position on the test market"
    );
    let balance_before = portfolio_before.total_balance;

    // Alice acts back as herself, then tries make_transfer TO the shared alt — must fail
    alice.act_as(alice_id).await.unwrap();

    alice
        .make_transfer(alice_id, alt_id, 500.0, "blocked transfer")
        .await
        .unwrap();
    let transfer_err = recv_until("make_transfer->RequestFailed", &mut alice, std::time::Duration::from_secs(2), |m| match m {
        SM::RequestFailed(rf) if rf.request_details.as_ref().map(|d| d.kind.as_str()) == Some("MakeTransfer") => {
            Some(rf.clone())
        }
        _ => None,
    })
    .await;
    assert!(
        transfer_err
            .error_details
            .as_ref()
            .is_some_and(|e| e.message.contains("Shared ownership account has open positions")),
        "expected shared-ownership failure, got {:?}",
        transfer_err
    );

    // Balance unchanged after failed transfer
    let portfolio_mid = db.get_portfolio(alt_id).await.unwrap().unwrap();
    assert_eq!(portfolio_mid.total_balance, balance_before);

    // Admin gifts clips to the shared alt — must succeed
    admin.gift(alt_id, 500.0, "bonus").await.unwrap();
    let gift_transfer = recv_until("gift->TransferCreated", &mut admin, std::time::Duration::from_secs(2), |m| match m {
        SM::TransferCreated(t) if t.to_account_id == alt_id && (t.amount - 500.0).abs() < 1e-9 => {
            Some(t.clone())
        }
        _ => None,
    })
    .await;
    assert_eq!(gift_transfer.to_account_id, alt_id);

    // Balance increased by exactly the gift amount
    let portfolio_after = db.get_portfolio(alt_id).await.unwrap().unwrap();
    assert_eq!(
        portfolio_after.total_balance,
        balance_before + dec!(500),
        "Gift should add 500 clips to the shared account's balance"
    );

    // And ownership credits are untouched: bob still has 0 credit, alice still has
    // whatever credit she had before (the gift does not alter owner_credits).
    assert_eq!(
        portfolio_after.owner_credits.len(),
        portfolio_before.owner_credits.len(),
        "Gift must not change the number of owner credit rows"
    );
    for before in &portfolio_before.owner_credits {
        let after = portfolio_after
            .owner_credits
            .iter()
            .find(|c| c.owner_id == before.owner_id)
            .expect("owner credit row should still exist");
        assert_eq!(
            after.credit.0, before.credit.0,
            "owner_credit for {} should be unchanged by gift",
            before.owner_id
        );
    }
}

#[tokio::test]
async fn test_gift_rejected_for_non_admin_in_main_universe() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let alice_id = app_state
        .db
        .ensure_user_created("alice", Some("Alice"), dec!(1000))
        .await
        .unwrap()
        .unwrap()
        .id;
    let alt = app_state
        .db
        .create_account(
            alice_id,
            websocket_api::CreateAccount {
                owner_id: alice_id,
                name: "Alice Alt".into(),
                universe_id: 0,
                initial_balance: 0.0,
                color: None,
            },
        )
        .await
        .unwrap()
        .unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    let mut alice = TestClient::connect(&url).await.unwrap();
    alice.authenticate("alice", "Alice", false).await.unwrap();
    alice.drain_initial_data().await.unwrap();

    let resp = alice.gift(alt.id, 100.0, "nope").await.unwrap();
    assert_request_failed(
        resp.message.as_ref().unwrap(),
        "Gift",
        "Not the owner of this universe",
    );
}

#[tokio::test]
async fn test_redistribute_owner_credit_proportional() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let alice_id = app_state
        .db
        .ensure_user_created("alice", Some("Alice"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;
    let bob_id = app_state
        .db
        .ensure_user_created("bob", Some("Bob"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;

    // Create shared team account owned by alice
    let team = app_state
        .db
        .create_account(
            alice_id,
            websocket_api::CreateAccount {
                owner_id: alice_id,
                name: "Team".into(),
                universe_id: 0,
                initial_balance: 0.0,
                color: None,
            },
        )
        .await
        .unwrap()
        .unwrap();
    let team_id = team.id;

    // Alice contributes 600 (gets credit=600)
    app_state
        .db
        .make_transfer(
            None,
            alice_id,
            websocket_api::MakeTransfer {
                from_account_id: alice_id,
                to_account_id: team_id,
                amount: 600.0,
                note: "alice contribution".into(),
            },
        )
        .await
        .unwrap()
        .unwrap();

    // Share with bob
    app_state
        .db
        .share_ownership(
            alice_id,
            websocket_api::ShareOwnership {
                of_account_id: team_id,
                to_account_id: bob_id,
            },
        )
        .await
        .unwrap()
        .unwrap();

    // Bob contributes 400 (gets credit=400)
    app_state
        .db
        .make_transfer(
            None,
            bob_id,
            websocket_api::MakeTransfer {
                from_account_id: bob_id,
                to_account_id: team_id,
                amount: 400.0,
                note: "bob contribution".into(),
            },
        )
        .await
        .unwrap()
        .unwrap();

    // Verify credits before: alice=600, bob=400
    let portfolio = app_state.db.get_portfolio(team_id).await.unwrap().unwrap();
    let alice_credit_before = portfolio
        .owner_credits
        .iter()
        .find(|c| c.owner_id == alice_id)
        .unwrap()
        .credit
        .0;
    let bob_credit_before = portfolio
        .owner_credits
        .iter()
        .find(|c| c.owner_id == bob_id)
        .unwrap()
        .credit
        .0;
    assert_eq!(alice_credit_before, dec!(600));
    assert_eq!(bob_credit_before, dec!(400));

    let db = app_state.db.clone();
    let url = spawn_test_server(app_state).await.unwrap();

    // Admin connects, enables sudo, redistributes alice's credit
    let mut admin = TestClient::connect(&url).await.unwrap();
    admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();

    admin
        .redistribute_owner_credit(team_id, alice_id)
        .await
        .unwrap();
    recv_until(
        "redistribute->OwnerCreditRedistributed",
        &mut admin,
        std::time::Duration::from_secs(2),
        |m| match m {
            SM::OwnerCreditRedistributed(_) => Some(()),
            _ => None,
        },
    )
    .await;

    // Alice's credit should be 0, bob should have all 1000
    let portfolio_after = db.get_portfolio(team_id).await.unwrap().unwrap();
    let alice_credit_after = portfolio_after
        .owner_credits
        .iter()
        .find(|c| c.owner_id == alice_id)
        .unwrap()
        .credit
        .0;
    let bob_credit_after = portfolio_after
        .owner_credits
        .iter()
        .find(|c| c.owner_id == bob_id)
        .unwrap()
        .credit
        .0;
    assert_eq!(alice_credit_after, dec!(0));
    assert_eq!(bob_credit_after, dec!(1000));
}

#[tokio::test]
async fn test_redistribute_owner_credit_even_split_when_others_zero() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let pixie_id = app_state
        .db
        .ensure_user_created("pixie", Some("Pixie"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;
    let alice_id = app_state
        .db
        .ensure_user_created("alice", Some("Alice"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;
    let bob_id = app_state
        .db
        .ensure_user_created("bob", Some("Bob"), dec!(10000))
        .await
        .unwrap()
        .unwrap()
        .id;

    // Create team owned by pixie
    let team = app_state
        .db
        .create_account(
            pixie_id,
            websocket_api::CreateAccount {
                owner_id: pixie_id,
                name: "Team Zero".into(),
                universe_id: 0,
                initial_balance: 0.0,
                color: None,
            },
        )
        .await
        .unwrap()
        .unwrap();
    let team_id = team.id;

    // Pixie funds the team (gets credit=1000)
    app_state
        .db
        .make_transfer(
            None,
            pixie_id,
            websocket_api::MakeTransfer {
                from_account_id: pixie_id,
                to_account_id: team_id,
                amount: 1000.0,
                note: "admin funding".into(),
            },
        )
        .await
        .unwrap()
        .unwrap();

    // Share with alice and bob (they have credit=0)
    app_state
        .db
        .share_ownership(
            pixie_id,
            websocket_api::ShareOwnership {
                of_account_id: team_id,
                to_account_id: alice_id,
            },
        )
        .await
        .unwrap()
        .unwrap();
    app_state
        .db
        .share_ownership(
            pixie_id,
            websocket_api::ShareOwnership {
                of_account_id: team_id,
                to_account_id: bob_id,
            },
        )
        .await
        .unwrap()
        .unwrap();

    let db = app_state.db.clone();
    let url = spawn_test_server(app_state).await.unwrap();

    let mut admin = TestClient::connect(&url).await.unwrap();
    admin
        .authenticate("admin1", "Admin User", true)
        .await
        .unwrap();
    admin.drain_initial_data().await.unwrap();
    admin.enable_sudo().await.unwrap();

    // Redistribute pixie's 1000 credit to alice and bob (both at 0 → even split)
    admin
        .redistribute_owner_credit(team_id, pixie_id)
        .await
        .unwrap();
    recv_until(
        "redistribute->OwnerCreditRedistributed",
        &mut admin,
        std::time::Duration::from_secs(2),
        |m| match m {
            SM::OwnerCreditRedistributed(_) => Some(()),
            _ => None,
        },
    )
    .await;

    let portfolio = db.get_portfolio(team_id).await.unwrap().unwrap();
    let pixie_credit = portfolio
        .owner_credits
        .iter()
        .find(|c| c.owner_id == pixie_id)
        .unwrap()
        .credit
        .0;
    let alice_credit = portfolio
        .owner_credits
        .iter()
        .find(|c| c.owner_id == alice_id)
        .unwrap()
        .credit
        .0;
    let bob_credit = portfolio
        .owner_credits
        .iter()
        .find(|c| c.owner_id == bob_id)
        .unwrap()
        .credit
        .0;

    assert_eq!(pixie_credit, dec!(0));
    assert_eq!(alice_credit, dec!(500));
    assert_eq!(bob_credit, dec!(500));
}

#[tokio::test]
async fn test_redistribute_owner_credit_requires_admin() {
    let (app_state, _temp) = create_test_app_state().await.unwrap();

    let alice_id = app_state
        .db
        .ensure_user_created("alice", Some("Alice"), dec!(1000))
        .await
        .unwrap()
        .unwrap()
        .id;
    let team = app_state
        .db
        .create_account(
            alice_id,
            websocket_api::CreateAccount {
                owner_id: alice_id,
                name: "Team Auth".into(),
                universe_id: 0,
                initial_balance: 0.0,
                color: None,
            },
        )
        .await
        .unwrap()
        .unwrap();

    let url = spawn_test_server(app_state).await.unwrap();

    let mut alice = TestClient::connect(&url).await.unwrap();
    alice.authenticate("alice", "Alice", false).await.unwrap();
    alice.drain_initial_data().await.unwrap();

    let resp = alice
        .redistribute_owner_credit(team.id, alice_id)
        .await
        .unwrap();
    assert_request_failed(
        resp.message.as_ref().unwrap(),
        "RedistributeOwnerCredit",
        "Admin access required",
    );
}
