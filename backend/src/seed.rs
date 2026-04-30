//! Development seed data for local testing.
//!
//! This module is only compiled when the `dev-mode` feature is enabled.
//! It populates a fresh database with test users, markets, orders, and trades
//! to make local development easier.

use rand::{rngs::StdRng, Rng, SeedableRng};
use sqlx::SqlitePool;

use crate::db::DB;
use crate::websocket_api::{
    settle_auction::Contribution, CreateAuction, CreateMarket, CreateOrder, SettleAuction, Side,
};

/// Trades to generate per seeded market. Each trade is two orders (maker + taker).
const SEED_TRADES_PER_MARKET: usize = 35;

/// Seed for the deterministic RNG used to generate seed orders and timestamp
/// offsets. Change to regenerate seed data with a different (but still
/// reproducible) pattern.
const SEED_RNG_SEED: u64 = 0xA1B0_5EED_BA3D_CAFE;

/// Initial balance for seeded non-admin accounts (in clips).
const SEED_USER_BALANCE: &str = "100000";

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

/// Random number of seconds to walk a transaction back relative to the
/// next-newer one. Mix of two uniforms — biased toward the middle of [1, 30]
/// without fully tailing off at the endpoints.
fn pick_transaction_offset(rng: &mut StdRng) -> u32 {
    if rng.gen_bool(0.5) {
        rng.gen_range(1..=30)
    } else {
        rng.gen_range(8..=22)
    }
}

/// Generate a stochastic sequence of orders for one market that produces
/// roughly `SEED_TRADES_PER_MARKET` trades while walking the price around
/// the market midpoint. Posts a fixed deep "wall" book first so the
/// orderbook always shows visible depth in dev.
fn generate_market_orders(market_idx: usize, market: &SeedMarket, rng: &mut StdRng) -> Vec<SeedOrder> {
    let range = market.max_settlement - market.min_settlement;
    // Coarsest-tick that keeps the chart legible across this range.
    let tick: f64 = if range >= 100.0 { 1.0 } else if range >= 10.0 { 0.5 } else if range >= 1.0 { 0.1 } else { 0.05 };

    let mid_start = f64::midpoint(market.min_settlement, market.max_settlement);
    let snap = |p: f64| {
        let r = (p / tick).round() * tick;
        // Keep at least one tick away from the bounds so the engine never
        // rejects a settle-bound violation.
        r.clamp(market.min_settlement + tick, market.max_settlement - tick)
    };

    let mut orders = Vec::new();

    // Deep walls for visible book depth. Far enough from mid that the price
    // walk below never touches them.
    let wall_bid = snap(mid_start - 8.0 * tick);
    let wall_offer = snap(mid_start + 8.0 * tick);
    orders.push(SeedOrder { account_idx: 0, market_idx, price: wall_bid, size: 200.0, side: Side::Bid });
    orders.push(SeedOrder { account_idx: 1, market_idx, price: wall_offer, size: 200.0, side: Side::Offer });

    // Trade pairs: maker posts at price; taker immediately crosses at the
    // same price and size. With identical size both orders fully fill, so
    // the inner book stays clean between iterations and each pair produces
    // exactly one trade.
    let mut mid = mid_start;
    for _ in 0..SEED_TRADES_PER_MARKET {
        // Random walk with mild reversion to start so price stays inside
        // the wall band.
        let bias = ((mid_start - mid) / range * 8.0).clamp(-0.5, 0.5);
        let raw_step = f64::from(rng.gen_range(-2_i32..=2)) + bias;
        mid = (mid + raw_step.round() * tick).clamp(wall_bid + tick, wall_offer - tick);

        let price = snap(mid);
        let size = f64::from(rng.gen_range(2_i32..=10));
        let maker = rng.gen_range(0..3_usize);
        let taker = (maker + 1 + rng.gen_range(0..2_usize)) % 3;
        let (maker_side, taker_side) = if rng.gen_bool(0.5) {
            (Side::Offer, Side::Bid)
        } else {
            (Side::Bid, Side::Offer)
        };

        orders.push(SeedOrder { account_idx: maker, market_idx, price, size, side: maker_side });
        orders.push(SeedOrder { account_idx: taker, market_idx, price, size, side: taker_side });
    }

    orders
}

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

    // Generate and execute orders per market via a seeded random walk.
    // All randomness in the seed flows through `rng` so seed data is
    // reproducible run-to-run; change SEED_RNG_SEED to vary it.
    let mut rng = StdRng::seed_from_u64(SEED_RNG_SEED);
    for (market_idx, market) in SEED_MARKETS.iter().enumerate() {
        if market_idx >= market_ids.len() {
            continue;
        }
        let orders = generate_market_orders(market_idx, market, &mut rng);
        for order in &orders {
            if order.account_idx >= account_ids.len() {
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
            if let Err(e) = db.create_order(account_id, create_order).await {
                tracing::warn!(
                    "Failed to create seed order for {} in market {}: {:?}",
                    SEED_ACCOUNTS[order.account_idx].name,
                    market.name,
                    e
                );
            }
        }
        tracing::info!(
            "Seeded {} orders for market {}",
            orders.len(),
            market.name
        );
    }

    if let Err(e) = seed_auctions(db, pool).await {
        tracing::error!("Failed to seed auctions: {:?}", e);
    }

    // SQLite stores `transaction.timestamp` at second granularity, so without
    // a rewrite all the seed orders/trades collide on a single x-coordinate
    // on any time-based chart. Walk every transaction back from "now" with
    // randomized 1–30s gaps, preserving id order. Dev-only — `seed_dev_data`
    // is gated on `dev-mode`.
    let max_id: i64 = sqlx::query_scalar!(
        r#"SELECT COALESCE(MAX(id), 0) as "max_id!: i64" FROM "transaction""#
    )
    .fetch_one(pool)
    .await?;
    if max_id > 0 {
        let mut tx = pool.begin().await?;
        let mut cumulative: i64 = 0;
        for id in (1..=max_id).rev() {
            let modifier = format!("-{cumulative} seconds");
            sqlx::query!(
                r#"UPDATE "transaction" SET timestamp = datetime('now', ?) WHERE id = ?"#,
                modifier,
                id
            )
            .execute(tx.as_mut())
            .await?;
            cumulative += i64::from(pick_transaction_offset(&mut rng));
        }
        tx.commit().await?;
    }

    // The seeder creates all markets back-to-back before any orders are
    // placed, so all markets share an "open time" near the start of the
    // walk-back. Snap each market's creation timestamp to 1s before its
    // first order — otherwise markets seeded later in the loop appear
    // dead for many minutes after their nominal open.
    sqlx::query!(
        r#"
            UPDATE "transaction"
            SET timestamp = datetime(
                (SELECT MIN(otx.timestamp)
                 FROM "transaction" otx
                 JOIN "order" o ON o.transaction_id = otx.id
                 WHERE o.market_id = m.id),
                '-1 seconds'
            )
            FROM market m
            WHERE m.transaction_id = "transaction".id
        "#
    )
    .execute(pool)
    .await?;

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
