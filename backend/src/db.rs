use std::{env, fmt::Display, str::FromStr};

use futures::TryStreamExt;
use futures_core::stream::BoxStream;
use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    types::{time::OffsetDateTime, Text},
    Connection, FromRow, Sqlite, SqliteConnection, SqlitePool, Transaction,
};
use tokio::sync::broadcast::error::RecvError;
use tracing::instrument;

// should hopefully keep the WAL size nice and small and avoid blocking writers
const CHECKPOINT_PAGE_LIMIT: i64 = 512;

#[derive(Clone, Debug)]
pub struct DB {
    pool: SqlitePool,
}

type SqlxResult<T> = Result<T, sqlx::Error>;

impl DB {
    #[instrument(err)]
    pub async fn init() -> anyhow::Result<Self> {
        let connection_options = SqliteConnectOptions::from_str(&env::var("DATABASE_URL")?)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .synchronous(SqliteSynchronous::Normal)
            // This should work with the default idle timeout and max lifetime
            .optimize_on_close(true, None)
            .pragma("optimize", "0x10002")
            // already checkpointing in the background
            .pragma("wal_autocheckpoint", "0");

        let mut management_conn = SqliteConnection::connect_with(&connection_options).await?;

        sqlx::migrate!().run(&mut management_conn).await?;

        sqlx::query!(
            "INSERT INTO acquire_write_lock (id, lock) VALUES (1, TRUE) ON CONFLICT DO NOTHING"
        )
        .execute(&mut management_conn)
        .await?;

        let (release_tx, mut release_rx) = tokio::sync::broadcast::channel(1);

        let pool = SqlitePoolOptions::new()
            .min_connections(8)
            .max_connections(64)
            .after_release(move |_, _| {
                let release_tx = release_tx.clone();
                Box::pin(async move {
                    if let Err(e) = release_tx.send(()) {
                        tracing::error!("release_tx.send failed: {:?}", e);
                    };
                    Ok(true)
                })
            })
            .connect_with(connection_options)
            .await?;

        // checkpointing task
        tokio::spawn(async move {
            let mut released_connections = 0;
            let mut remaining_pages = 0;
            loop {
                match release_rx.recv().await {
                    Ok(()) => {
                        released_connections += 1;
                    }
                    Err(RecvError::Lagged(n)) => {
                        released_connections += n as i64;
                    }
                    Err(RecvError::Closed) => {
                        break;
                    }
                };
                let approx_wal_pages = remaining_pages + released_connections * 8;
                if approx_wal_pages < CHECKPOINT_PAGE_LIMIT {
                    continue;
                }
                match sqlx::query_as::<_, WalCheckPointRow>("PRAGMA wal_checkpoint(PASSIVE)")
                    .fetch_one(&mut management_conn)
                    .await
                {
                    Err(e) => {
                        tracing::error!("wal_checkpoint failed: {:?}", e);
                    }
                    Ok(row) => {
                        released_connections = 0;
                        remaining_pages = row.log - row.checkpointed;
                        tracing::info!(
                            "wal_checkpoint: busy={} log={} checkpointed={}",
                            row.busy,
                            row.log,
                            row.checkpointed
                        );
                    }
                }
            }
        });

        Ok(Self { pool })
    }

    #[instrument(err, skip(self))]
    pub async fn ensure_user_created(&self, id: &str, initial_balance: Decimal) -> SqlxResult<()> {
        let balance = Text(initial_balance);
        let mut transaction = self.pool.begin().await?;
        let current_balance = sqlx::query_scalar!(
            "INSERT INTO user (id, balance) VALUES (?, ?) ON CONFLICT DO UPDATE SET id = id RETURNING balance as \"balance: Text<Decimal>\"",
            id,
            balance
        )
        .fetch_one(transaction.as_mut())
        .await?;
        if current_balance.0.is_zero() && !initial_balance.is_zero() {
            sqlx::query!("UPDATE user SET balance = ? WHERE id = ?", balance, id)
                .execute(transaction.as_mut())
                .await?;
        }
        transaction.commit().await?;
        Ok(())
    }

    pub async fn get_portfolio(&self, user_id: &str) -> SqlxResult<Option<Portfolio>> {
        get_portfolio(&mut self.pool.begin().await?, user_id).await
    }

    pub fn get_all_markets(&self) -> BoxStream<SqlxResult<Market>> {
        sqlx::query_as!(Market, r#"SELECT id, name, description, owner_id, created_at, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _" FROM market ORDER BY id"#)
            .fetch(&self.pool)
    }

    pub fn get_all_live_orders(&self) -> BoxStream<SqlxResult<Order>> {
        // TODO: when we start keeping dead orders in the table, we should filter them out here
        sqlx::query_as!(Order, r#"SELECT id as "id!", market_id, owner_id, created_at, size as "size: _", price as "price: _", side as "side: _" FROM "order" ORDER BY market_id"#)
            .fetch(&self.pool)
    }

    pub fn get_all_trades(&self) -> BoxStream<SqlxResult<Trade>> {
        sqlx::query_as!(Trade, r#"SELECT id as "id!", market_id, buyer_id, seller_id, size as "size: _", price as "price: _", created_at FROM trade ORDER BY market_id"#)
            .fetch(&self.pool)
    }

    pub async fn get_market_orders(&self, market_id: i64) -> SqlxResult<Vec<Order>> {
        sqlx::query_as!(Order, r#"SELECT id as "id!", market_id, owner_id, created_at, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE market_id = ?"#, market_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_market_trades(&self, market_id: i64) -> SqlxResult<Vec<Trade>> {
        sqlx::query_as!(Trade, r#"SELECT id as "id!", market_id, buyer_id, seller_id, size as "size: _", price as "price: _", created_at FROM trade WHERE market_id = ?"#, market_id)
            .fetch_all(&self.pool)
            .await
    }

    pub fn get_payments<'a>(&'a self, user_id: &'a str) -> BoxStream<'a, SqlxResult<Payment>> {
        // Can't use the macro due to https://github.com/launchbadge/sqlx/issues/1151
        // sqlx::query_as!(Payment, r#"SELECT id, payer_id, recipient_id, amount as "amount: _", note, created_at FROM payment WHERE payer_id = ? OR recipient_id = ?"#, user_id, user_id)
        //     .fetch(&self.pool)
        sqlx::query_as::<_, Payment>(r#"SELECT id, payer_id, recipient_id, amount, note, created_at FROM payment WHERE payer_id = ? OR recipient_id = ?"#)
        .bind(user_id)
        .bind(user_id)
        .fetch(&self.pool)
    }

    #[instrument(err, skip(self))]
    pub async fn market_exists(&self, id: i64) -> SqlxResult<bool> {
        sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM market WHERE id = ?) as "exists!: bool""#,
            id
        )
        .fetch_one(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn make_payment(
        &self,
        payer_id: &str,
        recipient_id: &str,
        amount: Decimal,
        note: &str,
    ) -> SqlxResult<MakePaymentStatus> {
        if payer_id == recipient_id {
            return Ok(MakePaymentStatus::SameUser);
        }

        if amount.is_sign_negative() {
            return Ok(MakePaymentStatus::InvalidAmount);
        }

        let mut transaction = self.begin_immediate().await?;

        let Some(payer_portfolio) = get_portfolio(&mut transaction, payer_id).await? else {
            return Ok(MakePaymentStatus::PayerNotFound);
        };

        if payer_portfolio.available_balance < amount {
            return Ok(MakePaymentStatus::InsufficientFunds);
        }

        let recipient_balance = sqlx::query_scalar!(
            r#"SELECT balance as "balance: Text<Decimal>" FROM user WHERE id = ?"#,
            recipient_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(Text(recipient_balance)) = recipient_balance else {
            return Ok(MakePaymentStatus::RecipientNotFound);
        };

        let payer_new_balance = Text(payer_portfolio.total_balance - amount);
        let recipient_new_balance = Text(recipient_balance + amount);

        sqlx::query!(
            r#"UPDATE user SET balance = ? WHERE id = ?"#,
            payer_new_balance,
            payer_id
        )
        .execute(transaction.as_mut())
        .await?;

        sqlx::query!(
            r#"UPDATE user SET balance = ? WHERE id = ?"#,
            recipient_new_balance,
            recipient_id
        )
        .execute(transaction.as_mut())
        .await?;

        let amount = Text(amount);

        let payment = sqlx::query_as!(
            Payment,
            r#"INSERT INTO payment (payer_id, recipient_id, amount, note) VALUES (?, ?, ?, ?) RETURNING id, payer_id, recipient_id, amount as "amount: _", note, created_at"#,
            payer_id,
            recipient_id,
            amount,
            note
        )
        .fetch_one(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(MakePaymentStatus::Success(payment))
    }

    #[instrument(err, skip(self))]
    pub async fn create_market(
        &self,
        name: &str,
        description: &str,
        owner_id: &str,
        min_settlement: Decimal,
        max_settlement: Decimal,
    ) -> SqlxResult<CreateMarketStatus> {
        if min_settlement >= max_settlement || min_settlement.is_sign_negative() {
            return Ok(CreateMarketStatus::InvalidSettlements);
        }
        let min_settlement = Text(min_settlement);
        let max_settlement = Text(max_settlement);
        let market = sqlx::query_as!(
            Market,
            r#"INSERT INTO market (name, description, owner_id, min_settlement, max_settlement) VALUES (?, ?, ?, ?, ?) RETURNING id, name, description, owner_id, created_at, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _""#,
            name,
            description,
            owner_id,
            min_settlement,
            max_settlement
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(CreateMarketStatus::Success(market))
    }

    #[instrument(err, skip(self))]
    pub async fn settle_market(
        &self,
        id: i64,
        settled_price: Decimal,
        owner_id: &str,
    ) -> SqlxResult<SettleMarketStatus> {
        let mut transaction = self.begin_immediate().await?;

        let mut market = sqlx::query_as!(
            Market,
            r#"SELECT id, name, description, owner_id, created_at, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _" FROM market WHERE id = ? AND owner_id = ?"#,
            id,
            owner_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if market.settled_price.is_some() {
            return Ok(SettleMarketStatus::AlreadySettled);
        }

        if market.owner_id != owner_id {
            return Ok(SettleMarketStatus::NotOwner);
        }

        if market.min_settlement.0 > settled_price || market.max_settlement.0 < settled_price {
            return Ok(SettleMarketStatus::InvalidSettlementPrice);
        }

        let settled_price = Text(settled_price);
        sqlx::query!(
            r#"UPDATE market SET settled_price = ? WHERE id = ?"#,
            settled_price,
            id,
        )
        .execute(transaction.as_mut())
        .await?;

        market.settled_price = Some(settled_price);

        sqlx::query!(r#"DELETE FROM "order" WHERE market_id = ?"#, id)
            .execute(transaction.as_mut())
            .await?;

        let user_positions = sqlx::query!(
            r#"DELETE FROM exposure_cache WHERE market_id = ? RETURNING user_id, position as "position: Text<Decimal>""#,
            id
        )
        .fetch_all(transaction.as_mut()).await?;

        for user_position in &user_positions {
            let Text(current_balance) = sqlx::query_scalar!(
                r#"SELECT balance as "balance: Text<Decimal>" FROM user WHERE id = ?"#,
                user_position.user_id
            )
            .fetch_one(transaction.as_mut())
            .await?;

            let new_balance = Text(current_balance + user_position.position.0 * settled_price.0);
            sqlx::query!(
                r#"UPDATE user SET balance = ? WHERE id = ?"#,
                new_balance,
                user_position.user_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        transaction.commit().await?;

        let affected_users = user_positions.into_iter().map(|row| row.user_id).collect();
        Ok(SettleMarketStatus::Success { affected_users })
    }

    #[instrument(err, skip(self))]
    pub async fn create_order(
        &self,
        market_id: i64,
        owner_id: &str,
        price: Decimal,
        size: Decimal,
        side: Side,
    ) -> SqlxResult<CreateOrderStatus> {
        let mut transaction = self.begin_immediate().await?;
        let market = sqlx::query!(
            r#"SELECT min_settlement as "min_settlement: Text<Decimal>", max_settlement as "max_settlement: Text<Decimal>", settled_price IS NOT NULL as "settled: bool" FROM market WHERE id = ?"#,
            market_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(market) = market else {
            return Ok(CreateOrderStatus::MarketNotFound);
        };

        if market.settled {
            return Ok(CreateOrderStatus::MarketSettled);
        }
        if price < market.min_settlement.0 || price > market.max_settlement.0 {
            return Ok(CreateOrderStatus::InvalidPrice);
        }

        update_exposure_cache(
            &mut transaction,
            true,
            &OrderFill {
                id: 0,
                owner_id: owner_id.to_string(),
                market_id,
                size_filled: Decimal::ZERO,
                size_remaining: size,
                price,
                side,
            },
        )
        .await?;

        let portfolio = get_portfolio(&mut transaction, owner_id).await?;

        let Some(portfolio) = portfolio else {
            return Ok(CreateOrderStatus::UserNotFound);
        };

        if portfolio.available_balance.is_sign_negative() {
            return Ok(CreateOrderStatus::InsufficientFunds);
        }

        let side = Text(side);

        // Overfetch to avoid floating point issues
        let condition_price = match side.0 {
            Side::Bid => Text(price + dec!(0.000001)),
            Side::Offer => Text(price - dec!(0.000001)),
        };

        // check for potential fills
        let mut potential_fills = match side.0 {
            Side::Bid => {
                sqlx::query_as!(
                    Order,
                    r#"SELECT id as "id!", market_id, owner_id, created_at, size as "size: _", price as "price: _", side as "side: Text<Side>" FROM "order" WHERE market_id = ? AND side != ? AND CAST(price AS REAL) <= ? ORDER BY CAST(price AS REAL), created_at"#,
                    market_id,
                    side,
                    condition_price
                ).fetch(transaction.as_mut())
            }
            Side::Offer => {
                sqlx::query_as!(
                    Order,
                    r#"SELECT id as "id!", market_id, owner_id, created_at, size as "size: _", price as "price: _", side as "side: Text<Side>" FROM "order" WHERE market_id = ? AND side != ? AND CAST(price AS REAL) >= ? ORDER BY CAST(price AS REAL) DESC, created_at"#,
                    market_id,
                    side,
                    condition_price
                ).fetch(transaction.as_mut())
            }
        };

        let mut size_remaining = size;
        let mut order_fills = Vec::new();

        while let Some(other) = potential_fills.try_next().await? {
            if matches!(side.0, Side::Bid) && other.price.0 > price
                || matches!(side.0, Side::Offer) && other.price.0 < price
            {
                continue;
            }
            let size_filled = size_remaining.min(other.size.0);
            size_remaining -= size_filled;
            order_fills.push(OrderFill {
                id: other.id,
                market_id: other.market_id,
                owner_id: other.owner_id,
                size_filled,
                size_remaining: other.size.0 - size_filled,
                price: other.price.0,
                side: other.side.0,
            });
            if size_remaining.is_zero() {
                break;
            }
        }
        drop(potential_fills);

        let order = if size_remaining > Decimal::ZERO {
            let size_remaining = Text(size_remaining);
            let price = Text(price);
            Some(
                sqlx::query_as!(
                    Order,
                    r#"INSERT INTO "order" (market_id, owner_id, size, price, side) VALUES (?, ?, ?, ?, ?) RETURNING id, market_id, owner_id, created_at, size as "size: _", price as "price: _", side as "side: _""#,
                    market_id,
                    owner_id,
                    size_remaining,
                    price,
                    side
                )
                .fetch_one(transaction.as_mut())
                .await?
            )
        } else {
            None
        };
        update_exposure_cache(
            &mut transaction,
            false,
            &OrderFill {
                id: 0,
                owner_id: owner_id.to_string(),
                market_id,
                size_remaining,
                size_filled: size - size_remaining,
                price,
                side: side.0,
            },
        )
        .await?;
        let mut balance_change = Decimal::ZERO;
        let mut trades = Vec::new();
        for fill in &order_fills {
            let size = Text(fill.size_filled);
            let price = Text(fill.price);
            let (buyer_id, seller_id) = match side.0 {
                Side::Bid => (owner_id, fill.owner_id.as_str()),
                Side::Offer => (fill.owner_id.as_str(), owner_id),
            };
            let trade = sqlx::query_as!(
                Trade,
                r#"INSERT INTO trade (market_id, buyer_id, seller_id, size, price) VALUES (?, ?, ?, ?, ?) RETURNING id, market_id, buyer_id, seller_id, size as "size: _", price as "price: _", created_at"#,
                market_id,
                buyer_id,
                seller_id,
                size,
                price
            )
            .fetch_one(transaction.as_mut())
            .await?;
            if fill.size_remaining.is_zero() {
                sqlx::query!(r#"DELETE FROM "order" WHERE id = ?"#, fill.id)
                    .execute(transaction.as_mut())
                    .await?;
            } else {
                let size = Text(fill.size_remaining);
                sqlx::query!(r#"UPDATE "order" SET size = ? WHERE id = ?"#, size, fill.id)
                    .execute(transaction.as_mut())
                    .await?;
            }
            update_exposure_cache(&mut transaction, false, &fill).await?;
            let trade_balance_change = match side.0 {
                Side::Bid => -trade.size.0 * trade.price.0,
                Side::Offer => trade.size.0 * trade.price.0,
            };
            balance_change += trade_balance_change;
            let other_balance_change = -trade_balance_change;
            let Text(other_current_balance) = sqlx::query_scalar!(
                r#"SELECT balance as "balance: Text<Decimal>" FROM user WHERE id = ?"#,
                fill.owner_id
            )
            .fetch_one(transaction.as_mut())
            .await?;
            let other_new_balance = Text(other_current_balance + other_balance_change);
            sqlx::query!(
                r#"UPDATE user SET balance = ? WHERE id = ?"#,
                other_new_balance,
                fill.owner_id
            )
            .execute(transaction.as_mut())
            .await?;
            trades.push(trade);
        }
        let Text(current_balance) = sqlx::query_scalar!(
            r#"SELECT balance as "balance: Text<Decimal>" FROM user WHERE id = ?"#,
            owner_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        let new_balance = Text(current_balance + balance_change);
        sqlx::query!(
            r#"UPDATE user SET balance = ? WHERE id = ?"#,
            new_balance,
            owner_id
        )
        .execute(transaction.as_mut())
        .await?;

        transaction.commit().await?;

        Ok(CreateOrderStatus::Success {
            order,
            fills: order_fills,
            trades,
        })
    }

    #[instrument(err, skip(self))]
    pub async fn cancel_order(&self, id: i64, owner_id: &str) -> SqlxResult<CancelOrderStatus> {
        let mut transaction = self.pool.begin().await?;

        let order =
            sqlx::query_as!(Order, r#"DELETE FROM "order" WHERE id = ? RETURNING id, market_id, owner_id, created_at, size as "size: _", price as "price: _", side as "side: _""#, id)
                .fetch_optional(transaction.as_mut())
                .await?;

        let Some(order) = order else {
            return Ok(CancelOrderStatus::NotFound);
        };

        if order.owner_id != owner_id {
            return Ok(CancelOrderStatus::NotOwner);
        }

        update_exposure_cache(
            &mut transaction,
            true,
            &OrderFill {
                id: order.id,
                owner_id: order.owner_id,
                market_id: order.market_id,
                size_filled: Decimal::ZERO,
                size_remaining: -order.size.0,
                price: order.price.0,
                side: order.side.0,
            },
        )
        .await?;

        transaction.commit().await?;

        Ok(CancelOrderStatus::Success {
            market_id: order.market_id,
        })
    }

    #[instrument(err, skip(self))]
    pub async fn out(&self, market_id: i64, owner_id: &str) -> SqlxResult<Vec<i64>> {
        let mut transaction = self.pool.begin().await?;

        let orders_affected = sqlx::query_scalar!(
            r#"DELETE FROM "order" WHERE market_id = ? AND owner_id = ? RETURNING id as "id!""#,
            market_id,
            owner_id
        )
        .fetch_all(transaction.as_mut())
        .await?;

        if orders_affected.len() > 0 {
            sqlx::query!(
                r#"UPDATE exposure_cache SET total_bid_size = '0', total_offer_size = '0', total_bid_value = '0', total_offer_value = '0' WHERE user_id = ? AND market_id = ?"#,
                owner_id,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        Ok(orders_affected)
    }

    async fn begin_immediate(&self) -> SqlxResult<sqlx::Transaction<Sqlite>> {
        let mut transaction = self.pool.begin().await?;

        // ensure the transaction is started as a write transaction
        sqlx::query!("UPDATE acquire_write_lock SET lock = TRUE WHERE id = 1")
            .execute(transaction.as_mut())
            .await?;

        Ok(transaction)
    }
}

#[instrument(err, skip(transaction))]
async fn get_portfolio(
    transaction: &mut Transaction<'_, Sqlite>,
    user_id: &str,
) -> SqlxResult<Option<Portfolio>> {
    let total_balance = sqlx::query_scalar!(
        r#"SELECT balance as "balance: Text<Decimal>" FROM user WHERE id = ?"#,
        user_id
    )
    .fetch_optional(transaction.as_mut())
    .await?;

    let Some(total_balance) = total_balance else {
        return Ok(None);
    };

    let market_exposures = sqlx::query_as!(
        MarketExposure,
        r#"SELECT market_id, position as "position: _", total_bid_size as "total_bid_size: _", total_offer_size as "total_offer_size: _", total_bid_value as "total_bid_value: _", total_offer_value as "total_offer_value: _", min_settlement as "min_settlement: _", max_settlement as "max_settlement: _" FROM exposure_cache JOIN market on (market_id = market.id) WHERE user_id = ?"#,
        user_id
    )
    .fetch_all(transaction.as_mut())
    .await?;

    let available_balance = total_balance.0
        + market_exposures
            .iter()
            .map(MarketExposure::worst_case_outcome)
            .sum::<Decimal>();

    Ok(Some(Portfolio {
        total_balance: total_balance.0,
        available_balance,
        market_exposures,
    }))
}

#[instrument(err, skip(transaction))]
async fn update_exposure_cache<'a>(
    transaction: &mut Transaction<'a, Sqlite>,
    is_new: bool,
    OrderFill {
        id: _,
        owner_id,
        market_id,
        size_filled,
        size_remaining,
        price,
        side,
    }: &OrderFill,
) -> SqlxResult<()> {
    struct Exposure {
        position: Text<Decimal>,
        total_bid_size: Text<Decimal>,
        total_offer_size: Text<Decimal>,
        total_bid_value: Text<Decimal>,
        total_offer_value: Text<Decimal>,
    }

    let existing_market_exposure = sqlx::query_as!(Exposure,
        r#"SELECT position as "position: Text<Decimal>", total_bid_size as "total_bid_size: Text<Decimal>", total_offer_size as "total_offer_size: Text<Decimal>", total_bid_value as "total_bid_value: Text<Decimal>", total_offer_value as "total_offer_value: Text<Decimal>" FROM exposure_cache WHERE user_id = ? AND market_id = ?"#,
        owner_id,
        market_id,
    )
    .fetch_optional(transaction.as_mut())
    .await?;

    let current_market_exposure = if let Some(exposure) = existing_market_exposure {
        exposure
    } else {
        sqlx::query_as!(
            Exposure,
            r#"INSERT INTO exposure_cache (user_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value) VALUES (?, ?, '0', '0', '0', '0', '0') RETURNING position as "position: Text<Decimal>", total_bid_size as "total_bid_size: Text<Decimal>", total_offer_size as "total_offer_size: Text<Decimal>", total_bid_value as "total_bid_value: Text<Decimal>", total_offer_value as "total_offer_value: Text<Decimal>""#,
            owner_id,
            market_id,
        )
        .fetch_one(transaction.as_mut())
        .await?
    };

    let size_change = if is_new {
        *size_remaining
    } else {
        -size_filled
    };
    Ok(match side {
        Side::Bid => {
            let total_bid_size = Text(current_market_exposure.total_bid_size.0 + size_change);
            let total_bid_value =
                Text(current_market_exposure.total_bid_value.0 + size_change * price);
            let position = Text(current_market_exposure.position.0 + size_filled);
            sqlx::query!(
                r#"UPDATE exposure_cache SET total_bid_size = ?, total_bid_value = ?, position = ? WHERE user_id = ? AND market_id = ?"#,
                total_bid_size,
                total_bid_value,
                position,
                owner_id,
                market_id,
            )
            .execute(transaction.as_mut())
            .await?;
        }
        Side::Offer => {
            let total_offer_size = Text(current_market_exposure.total_offer_size.0 + size_change);
            let total_offer_value =
                Text(current_market_exposure.total_offer_value.0 + size_change * price);
            let position = Text(current_market_exposure.position.0 - size_filled);
            sqlx::query!(
                r#"UPDATE exposure_cache SET total_offer_size = ?, total_offer_value = ?, position = ? WHERE user_id = ? AND market_id = ?"#,
                total_offer_size,
                total_offer_value,
                position,
                owner_id,
                market_id,
            )
            .execute(transaction.as_mut())
            .await?;
        }
    })
}

impl MarketExposure {
    pub fn worst_case_outcome(&self) -> Decimal {
        let resolves_min_case = self.min_settlement.0 * (self.position.0 + self.total_bid_size.0)
            - self.total_bid_value.0;
        let resolves_max_case = self.max_settlement.0 * (self.position.0 - self.total_offer_size.0)
            + self.total_offer_value.0;
        resolves_min_case.min(resolves_max_case)
    }
}

#[derive(Debug)]
pub enum GetPortfolioStatus {
    Success(Portfolio),
    NotFound,
}

#[derive(Debug)]
pub enum CreateOrderStatus {
    MarketNotFound,
    MarketSettled,
    InvalidPrice,
    InsufficientFunds,
    UserNotFound,
    Success {
        order: Option<Order>,
        fills: Vec<OrderFill>,
        trades: Vec<Trade>,
    },
}

#[derive(Debug)]
pub struct OrderFill {
    pub id: i64,
    pub market_id: i64,
    pub owner_id: String,
    pub size_filled: Decimal,
    pub size_remaining: Decimal,
    pub price: Decimal,
    pub side: Side,
}

#[derive(Debug)]
pub enum CreateMarketStatus {
    Success(Market),
    InvalidSettlements,
}

#[derive(Debug)]
pub enum CancelOrderStatus {
    Success { market_id: i64 },
    NotOwner,
    NotFound,
}

#[derive(Debug)]
pub enum SettleMarketStatus {
    Success { affected_users: Vec<String> },
    AlreadySettled,
    NotOwner,
    InvalidSettlementPrice,
}

#[derive(Debug)]
pub enum MakePaymentStatus {
    Success(Payment),
    InsufficientFunds,
    InvalidAmount,
    PayerNotFound,
    RecipientNotFound,
    SameUser,
}

#[derive(Debug, FromRow)]
pub struct Payment {
    pub id: i64,
    pub payer_id: String,
    pub recipient_id: String,
    pub amount: Text<Decimal>,
    pub note: String,
    pub created_at: OffsetDateTime,
}

#[derive(Debug)]
pub struct Portfolio {
    pub total_balance: Decimal,
    pub available_balance: Decimal,
    pub market_exposures: Vec<MarketExposure>,
}

#[derive(Debug, PartialEq, Eq, Default)]
pub struct MarketExposure {
    pub market_id: i64,
    pub position: Text<Decimal>,
    pub total_bid_size: Text<Decimal>,
    pub total_offer_size: Text<Decimal>,
    pub total_bid_value: Text<Decimal>,
    pub total_offer_value: Text<Decimal>,
    pub min_settlement: Text<Decimal>,
    pub max_settlement: Text<Decimal>,
}

#[derive(FromRow, Debug)]
pub struct Trade {
    pub id: i64,
    pub market_id: i64,
    pub buyer_id: String,
    pub seller_id: String,
    pub price: Text<Decimal>,
    pub size: Text<Decimal>,
    pub created_at: OffsetDateTime,
}

#[derive(FromRow, Debug)]
pub struct Order {
    pub id: i64,
    pub market_id: i64,
    pub owner_id: String,
    pub created_at: OffsetDateTime,
    pub size: Text<Decimal>,
    pub price: Text<Decimal>,
    pub side: Text<Side>,
}

#[derive(Debug, Clone, Copy)]
pub enum Side {
    Bid,
    Offer,
}

impl FromStr for Side {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> anyhow::Result<Self> {
        match s {
            "bid" => Ok(Side::Bid),
            "offer" => Ok(Side::Offer),
            _ => Err(anyhow::anyhow!("invalid side {s}")),
        }
    }
}

impl Display for Side {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Side::Bid => write!(f, "bid"),
            Side::Offer => write!(f, "offer"),
        }
    }
}

#[derive(Debug)]
pub struct Market {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub owner_id: String,
    pub created_at: OffsetDateTime,
    pub min_settlement: Text<Decimal>,
    pub max_settlement: Text<Decimal>,
    pub settled_price: Option<Text<Decimal>>,
}

#[derive(FromRow, Debug)]
struct WalCheckPointRow {
    busy: i64,
    log: i64,
    checkpointed: i64,
}

#[cfg(test)]
mod tests {
    use std::{assert_matches::assert_matches, collections::HashSet};

    use itertools::Itertools;

    use super::*;

    #[sqlx::test(fixtures("users"))]
    async fn test_make_payment(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };
        let payment_status = db
            .make_payment("a", "b", dec!(1000), "test payment")
            .await?;
        assert_matches!(payment_status, MakePaymentStatus::InsufficientFunds);
        let payment_status = db.make_payment("a", "b", dec!(-10), "test payment").await?;
        assert_matches!(payment_status, MakePaymentStatus::InvalidAmount);
        let payment_status = db.make_payment("a", "b", dec!(10), "test payment").await?;
        assert_matches!(payment_status, MakePaymentStatus::Success(_));

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(90));
        assert_eq!(a_portfolio.available_balance, dec!(90));

        let b_portfolio = db.get_portfolio("b").await?.unwrap();
        assert_eq!(b_portfolio.total_balance, dec!(110));
        assert_eq!(b_portfolio.available_balance, dec!(110));
        Ok(())
    }

    #[sqlx::test(fixtures("users", "markets"))]
    async fn test_invalid_orders_rejected(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let order_status = db
            .create_order(1, "a", dec!(30), dec!(1), Side::Bid)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InvalidPrice);

        let order_status = db
            .create_order(1, "a", dec!(15), dec!(100), Side::Bid)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InsufficientFunds);

        let order_status = db
            .create_order(1, "a", dec!(15), dec!(100), Side::Offer)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InsufficientFunds);

        Ok(())
    }

    #[sqlx::test(fixtures("users", "markets"))]
    async fn test_create_and_cancel_single_bid(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let order_status = db
            .create_order(1, "a", dec!(15), dec!(1), Side::Bid)
            .await?;
        let order = match order_status {
            CreateOrderStatus::Success {
                order: Some(order), ..
            } => order,
            _ => panic!("expected success order"),
        };

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(95));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 1,
                total_bid_size: Text(dec!(1)),
                total_bid_value: Text(dec!(15)),
                min_settlement: Text(dec!(10)),
                max_settlement: Text(dec!(20)),
                ..Default::default()
            }]
        );

        db.cancel_order(order.id, "a").await?;
        let all_orders = db.get_market_orders(1).await.unwrap();
        assert_eq!(all_orders.len(), 0);

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(100));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 1,
                min_settlement: Text(dec!(10)),
                max_settlement: Text(dec!(20)),
                ..Default::default()
            }]
        );
        Ok(())
    }

    #[sqlx::test(fixtures("users", "markets"))]
    async fn test_create_single_offer(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let order_status = db
            .create_order(1, "a", dec!(15), dec!(1), Side::Offer)
            .await?;
        assert_matches!(
            order_status,
            CreateOrderStatus::Success { order: Some(_), .. }
        );

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(95));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 1,
                total_offer_size: Text(dec!(1)),
                total_offer_value: Text(dec!(15)),
                min_settlement: Text(dec!(10)),
                max_settlement: Text(dec!(20)),
                ..Default::default()
            }]
        );

        Ok(())
    }

    #[sqlx::test(fixtures("users", "markets"))]
    async fn test_create_three_orders_one_fill(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db
            .create_order(1, "a", dec!(12), dec!(1), Side::Bid)
            .await?;
        let _ = db
            .create_order(1, "a", dec!(16), dec!(1), Side::Offer)
            .await?;

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(96));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 1,
                total_bid_size: Text(dec!(1)),
                total_bid_value: Text(dec!(12)),
                total_offer_size: Text(dec!(1)),
                total_offer_value: Text(dec!(16)),
                min_settlement: Text(dec!(10)),
                max_settlement: Text(dec!(20)),
                ..Default::default()
            }]
        );

        let order_status = db
            .create_order(1, "b", dec!(11), dec!(0.5), Side::Offer)
            .await?;
        let CreateOrderStatus::Success {
            trades,
            fills,
            order: None,
        } = order_status
        else {
            panic!("expected success with no order");
        };
        assert_eq!(trades.len(), 1);
        assert_eq!(fills.len(), 1);
        let trade = &trades[0];
        let fill = &fills[0];
        assert_eq!(trade.buyer_id, "a");
        assert_eq!(trade.seller_id, "b");
        assert_eq!(trade.size.0, dec!(0.5));
        assert_eq!(trade.price.0, dec!(12));
        assert_eq!(fill.size_filled, dec!(0.5));
        assert_eq!(fill.size_remaining, dec!(0.5));
        assert_eq!(fill.price, dec!(12));
        assert_matches!(fill.side, Side::Bid);

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(94));
        assert_eq!(a_portfolio.available_balance, dec!(98));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 1,
                position: Text(dec!(0.5)),
                total_bid_size: Text(dec!(0.5)),
                total_bid_value: Text(dec!(6)),
                total_offer_size: Text(dec!(1)),
                total_offer_value: Text(dec!(16)),
                min_settlement: Text(dec!(10)),
                max_settlement: Text(dec!(20)),
                ..Default::default()
            }]
        );

        let b_portfolio = db.get_portfolio("b").await?.unwrap();
        assert_eq!(b_portfolio.total_balance, dec!(106));
        assert_eq!(b_portfolio.available_balance, dec!(96));
        assert_eq!(
            &b_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 1,
                position: Text(dec!(-0.5)),
                min_settlement: Text(dec!(10)),
                max_settlement: Text(dec!(20)),
                ..Default::default()
            }]
        );

        Ok(())
    }

    #[sqlx::test(fixtures("users", "markets"))]
    async fn test_multiple_market_exposure(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db
            .create_order(1, "a", dec!(15), dec!(10), Side::Bid)
            .await?;

        let order_status = db
            .create_order(2, "a", dec!(5), dec!(15), Side::Bid)
            .await?;

        assert_matches!(order_status, CreateOrderStatus::InsufficientFunds);

        let _ = db
            .create_order(2, "a", dec!(5), dec!(10), Side::Bid)
            .await?;

        let a_portfolio = db.get_portfolio("a").await?.unwrap();

        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(0));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[
                MarketExposure {
                    market_id: 1,
                    total_bid_size: Text(dec!(10)),
                    total_bid_value: Text(dec!(150)),
                    min_settlement: Text(dec!(10)),
                    max_settlement: Text(dec!(20)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 2,
                    total_bid_size: Text(dec!(10)),
                    total_bid_value: Text(dec!(50)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                }
            ]
        );

        Ok(())
    }

    #[sqlx::test(fixtures("users", "markets"))]
    async fn test_multiple_fills_and_settle(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db.create_order(2, "a", dec!(3), dec!(1), Side::Bid).await?;
        let _ = db.create_order(2, "a", dec!(4), dec!(1), Side::Bid).await?;
        let _ = db.create_order(2, "a", dec!(5), dec!(1), Side::Bid).await?;
        let _ = db.create_order(2, "a", dec!(6), dec!(1), Side::Bid).await?;

        let order_status = db
            .create_order(2, "b", dec!(3.5), dec!(4), Side::Offer)
            .await?;

        let CreateOrderStatus::Success {
            trades,
            fills,
            order: Some(order),
        } = order_status
        else {
            panic!("expected success order");
        };

        assert_eq!(order.size.0, dec!(1));
        assert_eq!(order.price.0, dec!(3.5));
        assert_matches!(order.side.0, Side::Offer);

        assert_eq!(trades.len(), 3);
        let first_trade = &trades[0];
        assert_eq!(first_trade.size.0, dec!(1));
        assert_eq!(first_trade.price.0, dec!(6));
        assert_eq!(first_trade.buyer_id, "a");
        assert_eq!(first_trade.seller_id, "b");

        assert_eq!(fills.len(), 3);
        let first_fill = &fills[0];
        assert_eq!(first_fill.size_filled, dec!(1));
        assert_eq!(first_fill.size_remaining, dec!(0));
        assert_eq!(first_fill.price, dec!(6));
        assert_matches!(first_fill.side, Side::Bid);

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(85));
        assert_eq!(a_portfolio.available_balance, dec!(82));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 2,
                position: Text(dec!(3)),
                total_bid_size: Text(dec!(1)),
                total_bid_value: Text(dec!(3)),
                max_settlement: Text(dec!(10)),
                ..Default::default()
            }]
        );

        let b_portfolio = db.get_portfolio("b").await?.unwrap();
        assert_eq!(b_portfolio.total_balance, dec!(115));
        assert_eq!(b_portfolio.available_balance, dec!(78.5));
        assert_eq!(
            &b_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 2,
                position: Text(dec!(-3)),
                total_offer_size: Text(dec!(1)),
                total_offer_value: Text(dec!(3.5)),
                max_settlement: Text(dec!(10)),
                ..Default::default()
            }]
        );

        let market = db.settle_market(2, dec!(7), "a").await?;
        assert_matches!(market, SettleMarketStatus::Success { .. });

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(106));
        assert_eq!(a_portfolio.available_balance, dec!(106));
        assert_eq!(a_portfolio.market_exposures.len(), 0);

        let b_portfolio = db.get_portfolio("b").await?.unwrap();
        assert_eq!(b_portfolio.total_balance, dec!(94));
        assert_eq!(b_portfolio.available_balance, dec!(94));
        assert_eq!(b_portfolio.market_exposures.len(), 0);

        let all_orders = db.get_market_orders(2).await.unwrap();
        assert_eq!(all_orders.len(), 0);

        let trades = db.get_market_trades(2).await.unwrap();
        assert_eq!(trades.len(), 3);
        assert_eq!(
            trades.iter().map(|t| t.size.0).all_equal_value(),
            Ok(dec!(1))
        );
        assert_eq!(
            trades.iter().map(|t| t.price.0).collect::<HashSet<_>>(),
            HashSet::from([dec!(4), dec!(5), dec!(6)])
        );

        Ok(())
    }
}
