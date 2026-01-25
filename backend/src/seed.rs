//! Development seed data for local testing.
//!
//! This module is only compiled when the `dev-mode` feature is enabled.
//! It populates a fresh database with test users, markets, orders, and trades
//! to make local development easier.

use sqlx::SqlitePool;

use crate::db::DB;
use crate::websocket_api::{CreateMarket, CreateOrder, Side};

/// Initial balance for seeded non-admin accounts (in clips).
const SEED_USER_BALANCE: &str = "10000";

/// Initial balance for seeded admin accounts (in clips).
const SEED_ADMIN_BALANCE: &str = "100000000";

/// Seed accounts to create.
struct SeedAccount {
    kinde_id: &'static str,
    name: &'static str,
    is_admin: bool,
}

const SEED_ACCOUNTS: &[SeedAccount] = &[
    SeedAccount {
        kinde_id: "alice",
        name: "Alice",
        is_admin: false,
    },
    SeedAccount {
        kinde_id: "bob",
        name: "Bob",
        is_admin: false,
    },
    SeedAccount {
        kinde_id: "charlie",
        name: "Charlie",
        is_admin: false,
    },
    SeedAccount {
        kinde_id: "admin",
        name: "Admin",
        is_admin: true,
    },
];

/// Seed markets to create.
struct SeedMarket {
    name: &'static str,
    description: &'static str,
    min_settlement: f64,
    max_settlement: f64,
}

const SEED_MARKETS: &[SeedMarket] = &[
    SeedMarket {
        name: "BTC > $100k by EOY",
        description: "Will Bitcoin exceed $100,000 USD by end of year?",
        min_settlement: 0.0,
        max_settlement: 100.0,
    },
    SeedMarket {
        name: "Rain Tomorrow",
        description: "Will it rain in San Francisco tomorrow?",
        min_settlement: 0.0,
        max_settlement: 100.0,
    },
    SeedMarket {
        name: "AAPL Price",
        description: "Apple stock price at market close Friday (in USD)",
        min_settlement: 100.0,
        max_settlement: 300.0,
    },
    SeedMarket {
        name: "World Cup Winner",
        description: "Points scored by the winning team in the final",
        min_settlement: 0.0,
        max_settlement: 10.0,
    },
];

/// Seed orders to create. Some will match to create trades.
struct SeedOrder {
    /// Index into `SEED_ACCOUNTS`
    account_idx: usize,
    /// Index into `SEED_MARKETS`
    market_idx: usize,
    price: f64,
    size: f64,
    side: Side,
}

const SEED_ORDERS: &[SeedOrder] = &[
    // BTC market - create an order book
    SeedOrder {
        account_idx: 0, // Alice
        market_idx: 0,
        price: 45.0,
        size: 10.0,
        side: Side::Bid,
    },
    SeedOrder {
        account_idx: 0, // Alice
        market_idx: 0,
        price: 40.0,
        size: 20.0,
        side: Side::Bid,
    },
    SeedOrder {
        account_idx: 1, // Bob
        market_idx: 0,
        price: 55.0,
        size: 15.0,
        side: Side::Offer,
    },
    SeedOrder {
        account_idx: 1, // Bob
        market_idx: 0,
        price: 60.0,
        size: 25.0,
        side: Side::Offer,
    },
    // Create a trade: Charlie crosses the spread
    SeedOrder {
        account_idx: 2, // Charlie
        market_idx: 0,
        price: 55.0,
        size: 5.0,
        side: Side::Bid, // This will match Bob's offer at 55
    },
    // Rain market - order book
    SeedOrder {
        account_idx: 1, // Bob
        market_idx: 1,
        price: 30.0,
        size: 50.0,
        side: Side::Bid,
    },
    SeedOrder {
        account_idx: 0, // Alice
        market_idx: 1,
        price: 35.0,
        size: 30.0,
        side: Side::Offer,
    },
    // Create a trade
    SeedOrder {
        account_idx: 2, // Charlie
        market_idx: 1,
        price: 35.0,
        size: 10.0,
        side: Side::Bid, // Matches Alice's offer
    },
    // AAPL market - order book
    SeedOrder {
        account_idx: 0, // Alice
        market_idx: 2,
        price: 180.0,
        size: 5.0,
        side: Side::Bid,
    },
    SeedOrder {
        account_idx: 1, // Bob
        market_idx: 2,
        price: 190.0,
        size: 5.0,
        side: Side::Offer,
    },
    // World Cup market
    SeedOrder {
        account_idx: 2, // Charlie
        market_idx: 3,
        price: 3.0,
        size: 100.0,
        side: Side::Bid,
    },
    SeedOrder {
        account_idx: 0, // Alice
        market_idx: 3,
        price: 4.0,
        size: 100.0,
        side: Side::Offer,
    },
];

/// Checks if the database is fresh (no user accounts besides Arbor Pixie).
async fn is_fresh_database(pool: &SqlitePool) -> Result<bool, sqlx::Error> {
    let count = sqlx::query_scalar!(
        r#"SELECT COUNT(*) as "count!: i64" FROM account WHERE kinde_id IS NOT NULL AND name != 'Arbor Pixie'"#
    )
    .fetch_one(pool)
    .await?;

    Ok(count == 0)
}

/// Seeds the database with development data.
///
/// Only runs if the database is fresh (no existing user accounts).
///
/// # Errors
/// Returns an error if database operations fail.
#[allow(clippy::too_many_lines)]
pub async fn seed_dev_data(db: &DB, pool: &SqlitePool) -> Result<(), anyhow::Error> {
    if !is_fresh_database(pool).await? {
        tracing::info!("Database already has user accounts, skipping seed data");
        return Ok(());
    }

    tracing::info!("Seeding development data...");

    // Create accounts directly via SQL since we don't have auth context
    let mut account_ids = Vec::new();
    for account in SEED_ACCOUNTS {
        let balance = if account.is_admin {
            SEED_ADMIN_BALANCE
        } else {
            SEED_USER_BALANCE
        };

        let id = sqlx::query_scalar!(
            r#"
                INSERT INTO account (kinde_id, name, balance)
                VALUES (?, ?, ?)
                RETURNING id as "id!"
            "#,
            account.kinde_id,
            account.name,
            balance
        )
        .fetch_one(pool)
        .await?;

        account_ids.push(id);
        tracing::info!(
            "Created seed account: {} (id={}, admin={})",
            account.name,
            id,
            account.is_admin
        );
    }

    // Create markets (owned by admin)
    let admin_id = account_ids[3]; // Admin account
    let mut market_ids = Vec::new();
    for market in SEED_MARKETS {
        let create_market = CreateMarket {
            name: market.name.to_string(),
            description: market.description.to_string(),
            min_settlement: market.min_settlement,
            max_settlement: market.max_settlement,
            redeemable_for: vec![],
            redeem_fee: 0.0,
            hide_account_ids: false,
            visible_to: vec![],
            type_id: 0,
            group_id: 0,
        };

        match db.create_market(admin_id, create_market, true).await? {
            Ok(market_result) => {
                market_ids.push(market_result.market.id);
                tracing::info!(
                    "Created seed market: {} (id={})",
                    market.name,
                    market_result.market.id
                );
            }
            Err(e) => {
                tracing::warn!("Failed to create seed market {}: {:?}", market.name, e);
            }
        }
    }

    // Create orders (some will match and create trades)
    for order in SEED_ORDERS {
        if order.account_idx >= account_ids.len() || order.market_idx >= market_ids.len() {
            continue;
        }

        let account_id = account_ids[order.account_idx];
        let market_id = market_ids[order.market_idx];

        let create_order = CreateOrder {
            market_id,
            price: order.price,
            size: order.size,
            side: order.side.into(),
        };

        match db.create_order(account_id, create_order).await? {
            Ok(result) => {
                let trades_count = result.trades.len();
                if trades_count > 0 {
                    tracing::info!(
                        "Created seed order for {} in market {} - {} trade(s) executed",
                        SEED_ACCOUNTS[order.account_idx].name,
                        SEED_MARKETS[order.market_idx].name,
                        trades_count
                    );
                } else {
                    tracing::info!(
                        "Created seed order for {} in market {} at {}",
                        SEED_ACCOUNTS[order.account_idx].name,
                        SEED_MARKETS[order.market_idx].name,
                        order.price
                    );
                }
            }
            Err(e) => {
                tracing::warn!(
                    "Failed to create seed order for {} in market {}: {:?}",
                    SEED_ACCOUNTS[order.account_idx].name,
                    SEED_MARKETS[order.market_idx].name,
                    e
                );
            }
        }
    }

    tracing::info!("Development seed data created successfully");
    Ok(())
}
