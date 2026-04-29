//! Development seed data for local testing.
//!
//! This module is only compiled when the `dev-mode` feature is enabled.
//! It populates a fresh database with test users, markets, orders, and trades
//! to make local development easier.

use sqlx::SqlitePool;

use crate::db::DB;
use crate::websocket_api::{
    settle_auction::Contribution, CreateAuction, CreateMarket, CreateOrder, SettleAuction, Side,
};

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

/// Seed auctions to create. These are seeded idempotently (skipped if a
/// listing with the same name already exists), so they appear after the
/// first dev startup even on databases that were already populated.
struct SeedAuction {
    name: &'static str,
    description: &'static str,
    /// `kinde_id` of the seller (must match a `SEED_ACCOUNTS` entry)
    owner_kinde_id: &'static str,
    /// Optional buy-it-now price
    bin_price: Option<f64>,
    /// If `Some`, the auction is settled at this configuration after creation.
    settle: Option<SeedAuctionSettle>,
}

struct SeedAuctionSettle {
    settle_price: f64,
    /// `kinde_id` -> contribution amount. Single entry = single buyer.
    /// Multiple entries = split sale (multi-winner).
    contributions: &'static [(&'static str, f64)],
    /// `kinde_id` of the labeled owner; required for splits.
    labeled_owner_kinde_id: Option<&'static str>,
}

const SEED_AUCTIONS: &[SeedAuction] = &[
    SeedAuction {
        name: "Vintage HP-12C Calculator",
        description: "Working condition, classic finance calculator.\n\nContact: alice@example.com",
        owner_kinde_id: "alice",
        bin_price: Some(50.0),
        settle: None,
    },
    SeedAuction {
        name: "Concert Tickets (pair)",
        description: "Two tickets, front balcony. Open bidding only.\n\nPickup: in person",
        owner_kinde_id: "bob",
        bin_price: None,
        settle: None,
    },
    SeedAuction {
        name: "Premium Coffee Beans (1lb)",
        description: "Single-origin Ethiopian, freshly roasted.\n\nContact: charlie@example.com",
        owner_kinde_id: "charlie",
        bin_price: Some(25.0),
        settle: None,
    },
    SeedAuction {
        name: "Old Textbook: Options Pricing",
        description: "Hull, 9th edition. Light highlighting.\n\nPickup: campus mailbox",
        owner_kinde_id: "bob",
        bin_price: Some(30.0),
        settle: Some(SeedAuctionSettle {
            settle_price: 30.0,
            contributions: &[("alice", 30.0)],
            labeled_owner_kinde_id: None,
        }),
    },
    SeedAuction {
        name: "Framed Painting (split)",
        description: "Watercolor landscape, ~24x36in. Settled as a group purchase.",
        owner_kinde_id: "charlie",
        bin_price: None,
        settle: Some(SeedAuctionSettle {
            settle_price: 100.0,
            contributions: &[("alice", 60.0), ("bob", 40.0)],
            labeled_owner_kinde_id: Some("alice"),
        }),
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
/// Account/market/order seeding only runs once on a fresh database (no
/// existing user accounts). Auction seeding is idempotent and runs on every
/// dev-mode startup, creating any seed auctions that aren't already present.
///
/// # Errors
/// Returns an error if database operations fail.
#[allow(clippy::too_many_lines)]
pub async fn seed_dev_data(db: &DB, pool: &SqlitePool) -> Result<(), anyhow::Error> {
    if !is_fresh_database(pool).await? {
        tracing::info!("Database already has user accounts, skipping core seed data");
        if let Err(e) = seed_auctions(db, pool).await {
            tracing::error!("Failed to seed auctions: {:?}", e);
        }
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
            option: None,
        };

        match db.create_market(admin_id, create_market, true, 0).await? {
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

    if let Err(e) = seed_auctions(db, pool).await {
        tracing::error!("Failed to seed auctions: {:?}", e);
    }

    tracing::info!("Development seed data created successfully");
    Ok(())
}

/// Idempotently seeds auctions defined in `SEED_AUCTIONS`.
///
/// Looks up the seller and buyer accounts by `kinde_id`. Skips any auction
/// whose name already exists. For settled entries, also runs `settle_auction`
/// using the configured contributions.
#[allow(clippy::too_many_lines)]
async fn seed_auctions(db: &DB, pool: &SqlitePool) -> Result<(), anyhow::Error> {
    // Resolve admin id (used as the settlement initiator). Skip auction seeding
    // entirely if no admin account exists yet.
    let Some(admin_id) = sqlx::query_scalar!(
        r#"SELECT id as "id!: i64" FROM account WHERE kinde_id = 'admin'"#
    )
    .fetch_optional(pool)
    .await?
    else {
        tracing::info!("No admin seed account found, skipping auction seeding");
        return Ok(());
    };

    for spec in SEED_AUCTIONS {
        let exists = sqlx::query_scalar!(
            r#"SELECT COUNT(*) as "count!: i64" FROM auction WHERE name = ?"#,
            spec.name
        )
        .fetch_one(pool)
        .await?
            > 0;
        if exists {
            continue;
        }

        let Some(owner_id) = lookup_account_id(pool, spec.owner_kinde_id).await? else {
            tracing::warn!(
                "Skipping seed auction '{}': owner '{}' not found",
                spec.name,
                spec.owner_kinde_id
            );
            continue;
        };

        let create = CreateAuction {
            name: spec.name.to_string(),
            description: spec.description.to_string(),
            image_filename: String::new(),
            bin_price: spec.bin_price,
        };

        let auction_id = match db.create_auction(owner_id, create).await? {
            Ok(result) => result.auction.id,
            Err(failure) => {
                tracing::warn!(
                    "Failed to create seed auction '{}': {:?}",
                    spec.name,
                    failure
                );
                continue;
            }
        };

        tracing::info!(
            "Created seed auction '{}' (id={}, owner={})",
            spec.name,
            auction_id,
            spec.owner_kinde_id
        );

        if let Some(settle) = &spec.settle {
            let mut contributions = Vec::with_capacity(settle.contributions.len());
            let mut skip = false;
            for (kinde_id, amount) in settle.contributions {
                let Some(buyer_id) = lookup_account_id(pool, kinde_id).await? else {
                    tracing::warn!(
                        "Skipping settlement of seed auction '{}': buyer '{}' not found",
                        spec.name,
                        kinde_id
                    );
                    skip = true;
                    break;
                };
                contributions.push(Contribution {
                    buyer_id,
                    amount: *amount,
                });
            }
            if skip {
                continue;
            }

            let owner_id_opt = if let Some(kid) = settle.labeled_owner_kinde_id {
                lookup_account_id(pool, kid).await?
            } else {
                None
            };

            let settle_msg = SettleAuction {
                auction_id,
                buyer_id: 0,
                settle_price: settle.settle_price,
                contributions,
                owner_id: owner_id_opt,
            };

            match db.settle_auction(admin_id, settle_msg).await? {
                Ok(_) => {
                    tracing::info!(
                        "Settled seed auction '{}' at {} clips",
                        spec.name,
                        settle.settle_price
                    );
                }
                Err(failure) => {
                    tracing::warn!(
                        "Failed to settle seed auction '{}': {:?}",
                        spec.name,
                        failure
                    );
                }
            }
        }
    }

    Ok(())
}

async fn lookup_account_id(
    pool: &SqlitePool,
    kinde_id: &str,
) -> Result<Option<i64>, sqlx::Error> {
    sqlx::query_scalar!(
        r#"SELECT id as "id!: i64" FROM account WHERE kinde_id = ?"#,
        kinde_id
    )
    .fetch_optional(pool)
    .await
}
