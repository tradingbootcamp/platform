use std::{env, fmt::Display, str::FromStr};

use futures::TryStreamExt;
use futures_core::stream::BoxStream;
use itertools::Itertools;
use rust_decimal::{Decimal, RoundingStrategy};
use rust_decimal_macros::dec;
use serde::{Serialize, Serializer};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    types::{time::OffsetDateTime, Text},
    Connection, FromRow, Sqlite, SqliteConnection, SqlitePool, Transaction,
};
use tokio::sync::broadcast::error::RecvError;
use tracing::instrument;
use utoipa::ToSchema;

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
                    #[allow(clippy::cast_possible_wrap)]
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
    pub async fn get_full_market_data(
        &self,
        market_id: i64,
    ) -> SqlxResult<GetFullMarketDataStatus> {
        let mut transaction = self.pool.begin().await?;
        let market = sqlx::query_as!(
            Market,
            r#"SELECT id, name, description, owner_id, transaction_id, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _" FROM market WHERE id = ?"#,
            market_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;
        let Some(market) = market else {
            return Ok(GetFullMarketDataStatus::NotFound);
        };
        let orders = sqlx::query_as!(
            Order,
            r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE market_id = ? ORDER BY id"#,
            market_id
        )
        .fetch_all(transaction.as_mut())
        .await?;
        let trades = sqlx::query_as!(
            Trade,
            r#"SELECT id as "id!", market_id, buyer_id, seller_id, transaction_id, size as "size: _", price as "price: _" FROM trade WHERE market_id = ?"#,
            market_id
        )
        .fetch_all(transaction.as_mut())
        .await?;
        let sizes = sqlx::query_as!(
            Size,
            r#"SELECT transaction_id, order_id, size as "size: _" FROM order_size WHERE order_id IN (SELECT id FROM "order" WHERE market_id = ?) ORDER BY order_id"#,
            market_id
        )
        .fetch_all(transaction.as_mut())
        .await?;
        let orders = orders
            .into_iter()
            .zip_eq(sizes.into_iter().chunk_by(|size| size.order_id).into_iter())
            .map(|(order, (order_id, sizes))| {
                debug_assert_eq!(order_id, order.id);
                let sizes = sizes.collect();
                (order, sizes)
            })
            .collect();
        Ok(GetFullMarketDataStatus::Success(FullMarketData {
            market,
            orders,
            trades,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn redeem(
        &self,
        fund_id: i64,
        redeemer_id: &str,
        amount: Decimal,
    ) -> SqlxResult<RedeemStatus> {
        if amount.scale() > 2 || amount.is_zero() {
            return Ok(RedeemStatus::InvalidAmount);
        }
        let (mut transaction, transaction_info) = self.begin_write().await?;
        let redeemables =
            sqlx::query!(r#"SELECT * FROM "redeemable" WHERE "fund_id" = ?"#, fund_id)
                .fetch_all(transaction.as_mut())
                .await?;
        if redeemables.is_empty() {
            return Ok(RedeemStatus::MarketNotRedeemable);
        }
        let fund_position_change = -amount;
        let constituent_position_change = if amount.is_sign_positive() {
            (amount * dec!(0.99)).round_dp_with_strategy(2, RoundingStrategy::ToZero)
        } else {
            (amount * dec!(1.01)).round_dp_with_strategy(2, RoundingStrategy::AwayFromZero)
        };
        let amount = Text(amount);
        sqlx::query!(
            r#"INSERT INTO "redemption" ("redeemer_id", "fund_id", "transaction_id", "amount") VALUES (?, ?, ?, ?)"#,
            redeemer_id,
            fund_id,
            transaction_info.id,
            amount
        ).execute(transaction.as_mut())
        .await?;
        let Text(current_fund_position) = sqlx::query_scalar!(
            r#"SELECT position as "position: Text<Decimal>" FROM "exposure_cache" WHERE "user_id" = ? AND "market_id" = ?"#,
            redeemer_id,
            fund_id,
        )
        .fetch_optional(transaction.as_mut())
        .await?
        .unwrap_or_default();
        let new_fund_position = Text(current_fund_position + fund_position_change);
        sqlx::query!(
            r#"INSERT INTO exposure_cache (user_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value) VALUES (?, ?, ?, '0', '0', '0', '0') ON CONFLICT DO UPDATE SET position = ?"#,
            redeemer_id,
            fund_id,
            new_fund_position,
            new_fund_position
        ).execute(transaction.as_mut()).await?;
        for redeemable in redeemables {
            let Text(current_exposure) = sqlx::query_scalar!(
                r#"SELECT position as "position: Text<Decimal>" FROM "exposure_cache" WHERE "user_id" = ? AND "market_id" = ?"#,
                redeemer_id,
                redeemable.constituent_id,
            )
            .fetch_optional(transaction.as_mut())
            .await?
            .unwrap_or_default();
            let new_exposure = Text(current_exposure + constituent_position_change);
            sqlx::query!(
                r#"INSERT INTO exposure_cache (user_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value) VALUES (?, ?, ?, '0', '0', '0', '0') ON CONFLICT DO UPDATE SET position = ?"#,
                redeemer_id,
                redeemable.constituent_id,
                new_exposure,
                new_exposure
            ).execute(transaction.as_mut()).await?;
        }
        let Some(portfolio) = get_portfolio(&mut transaction, redeemer_id).await? else {
            return Ok(RedeemStatus::RedeemerNotFound);
        };
        if portfolio.available_balance < dec!(0) {
            return Ok(RedeemStatus::InsufficientFunds);
        }
        transaction.commit().await?;
        Ok(RedeemStatus::Success {
            transaction_id: transaction_info.id,
        })
    }

    #[instrument(err, skip(self))]
    pub async fn is_owner_of(&self, owner_id: &str, bot_id: &str) -> SqlxResult<bool> {
        sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM bot_owner where owner_id = ? AND bot_id = ?) as "exists!: bool""#,
            owner_id,
            bot_id
        )
        .fetch_one(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn get_bot_owners(&self, bot_id: &str) -> SqlxResult<Vec<String>> {
        sqlx::query_scalar!(r#"SELECT owner_id FROM bot_owner WHERE bot_id = ?"#, bot_id)
            .fetch_all(&self.pool)
            .await
    }

    #[instrument(err, skip(self))]
    pub async fn create_bot(&self, owner_id: &str, bot_name: &str) -> SqlxResult<User> {
        let bot_id = uuid::Uuid::new_v4().to_string();
        let bot_name = format!("bot:{bot_name}");
        let mut transaction = self.pool.begin().await?;
        sqlx::query!(
            r#"INSERT INTO user (id, name, balance, is_bot) VALUES (?, ?, '0', TRUE)"#,
            bot_id,
            bot_name
        )
        .execute(transaction.as_mut())
        .await?;
        sqlx::query!(
            r#"INSERT INTO bot_owner (owner_id, bot_id) VALUES (?, ?)"#,
            owner_id,
            bot_id
        )
        .execute(transaction.as_mut())
        .await?;
        transaction.commit().await?;
        Ok(User {
            id: bot_id,
            name: bot_name,
            is_bot: true,
        })
    }

    #[instrument(err, skip(self))]
    pub async fn give_ownership(
        &self,
        existing_owner_id: &str,
        of_bot_id: &str,
        to_user_id: &str,
    ) -> SqlxResult<GiveOwnershipStatus> {
        // Transaction isn't necessary because ownership can't be revoked
        if !self.is_owner_of(existing_owner_id, of_bot_id).await? {
            return Ok(GiveOwnershipStatus::NotOwner);
        }
        let res = sqlx::query!(
            r#"INSERT INTO bot_owner (bot_id, owner_id) VALUES (?, ?) ON CONFLICT DO NOTHING"#,
            of_bot_id,
            to_user_id
        )
        .execute(&self.pool)
        .await?;
        if res.rows_affected() == 0 {
            Ok(GiveOwnershipStatus::AlreadyOwner)
        } else {
            Ok(GiveOwnershipStatus::Success)
        }
    }

    #[must_use]
    pub fn get_ownerships<'a>(&'a self, owner_id: &'a str) -> BoxStream<'a, SqlxResult<Ownership>> {
        sqlx::query_as::<_, Ownership>("SELECT bot_id FROM bot_owner WHERE owner_id = ?")
            .bind(owner_id)
            .fetch(&self.pool)
    }

    #[instrument(err, skip(self))]
    pub async fn ensure_user_created(
        &self,
        id: &str,
        name: &str,
        initial_balance: Decimal,
    ) -> SqlxResult<EnsureUserCreatedStatus> {
        let balance = Text(initial_balance);
        let existing_user_name = sqlx::query_scalar!(r#"SELECT name FROM user WHERE id = ?"#, id)
            .fetch_optional(&self.pool)
            .await?;
        if existing_user_name.is_some_and(|existing_name| existing_name == name) {
            return Ok(EnsureUserCreatedStatus::Unchanged);
        }
        sqlx::query!(
            "INSERT INTO user (id, name, balance) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET name = ?",
            id,
            name,
            balance,
            name,
        )
        .execute(&self.pool)
        .await?;
        Ok(EnsureUserCreatedStatus::CreatedOrUpdated)
    }

    /// # Errors
    /// Fails is there's a database error
    pub async fn get_portfolio(&self, user_id: &str) -> SqlxResult<Option<Portfolio>> {
        get_portfolio(&mut self.pool.begin().await?, user_id).await
    }

    #[must_use]
    pub fn get_all_users(&self) -> BoxStream<SqlxResult<User>> {
        sqlx::query_as!(User, r#"SELECT id, name, is_bot FROM user"#).fetch(&self.pool)
    }

    #[must_use]
    pub fn get_all_markets(&self) -> BoxStream<SqlxResult<Market>> {
        sqlx::query_as!(Market, r#"SELECT id, name, description, owner_id, transaction_id, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _" FROM market ORDER BY id"#)
            .fetch(&self.pool)
    }

    #[must_use]
    pub fn get_all_live_orders(&self) -> BoxStream<SqlxResult<Order>> {
        sqlx::query_as!(Order, r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE CAST(size AS REAL) > 0 ORDER BY market_id"#)
            .fetch(&self.pool)
    }

    #[must_use]
    pub fn get_all_trades(&self) -> BoxStream<SqlxResult<Trade>> {
        sqlx::query_as!(Trade, r#"SELECT id as "id!", market_id, buyer_id, seller_id, transaction_id, size as "size: _", price as "price: _" FROM trade ORDER BY market_id"#)
            .fetch(&self.pool)
    }

    /// # Errors
    /// Fails if there's a database error
    pub async fn get_live_market_orders(&self, market_id: i64) -> SqlxResult<Vec<Order>> {
        sqlx::query_as!(Order, r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE market_id = ? AND CAST(size AS REAL) > 0"#, market_id)
            .fetch_all(&self.pool)
            .await
    }

    /// # Errors
    /// Fails if there's a database error
    pub async fn get_market_trades(&self, market_id: i64) -> SqlxResult<Vec<Trade>> {
        sqlx::query_as!(Trade, r#"SELECT id as "id!", market_id, buyer_id, seller_id, transaction_id, size as "size: _", price as "price: _" FROM trade WHERE market_id = ?"#, market_id)
            .fetch_all(&self.pool)
            .await
    }

    #[must_use]
    pub fn get_payments<'a>(&'a self, user_id: &'a str) -> BoxStream<'a, SqlxResult<Payment>> {
        // Can't use the macro due to https://github.com/launchbadge/sqlx/issues/1151
        // sqlx::query_as!(Payment, r#"SELECT id, payer_id, recipient_id, transaction_id, amount as "amount: _", note FROM payment WHERE payer_id = ? OR recipient_id = ?"#, user_id, user_id)
        //     .fetch(&self.pool)
        sqlx::query_as::<_, Payment>("SELECT id, payer_id, recipient_id, transaction_id, amount, note FROM payment WHERE payer_id = ? OR recipient_id = ?")
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

        let amount = amount.normalize();

        if amount <= dec!(0) || amount.scale() > 4 {
            return Ok(MakePaymentStatus::InvalidAmount);
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

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
            r#"INSERT INTO payment (payer_id, recipient_id, transaction_id, amount, note) VALUES (?, ?, ?, ?, ?) RETURNING id, payer_id, recipient_id, transaction_id, amount as "amount: _", note"#,
            payer_id,
            recipient_id,
            transaction_info.id,
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
        let min_settlement = min_settlement.normalize();
        let max_settlement = max_settlement.normalize();

        if min_settlement >= max_settlement || min_settlement.is_sign_negative() {
            return Ok(CreateMarketStatus::InvalidSettlements);
        }

        if min_settlement.scale() > 2 || max_settlement.scale() > 2 {
            return Ok(CreateMarketStatus::InvalidSettlements);
        }

        if max_settlement.mantissa() > 1_000_000_000_000
            || min_settlement.mantissa() > 1_000_000_000_000
        {
            return Ok(CreateMarketStatus::InvalidSettlements);
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;
        let min_settlement = Text(min_settlement);
        let max_settlement = Text(max_settlement);
        let market = sqlx::query_as!(
            Market,
            r#"INSERT INTO market (name, description, owner_id, transaction_id, min_settlement, max_settlement) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, name, description, owner_id, transaction_id, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _""#,
            name,
            description,
            owner_id,
            transaction_info.id,
            min_settlement,
            max_settlement
        )
        .fetch_one(transaction.as_mut())
        .await?;
        transaction.commit().await?;
        Ok(CreateMarketStatus::Success(market))
    }

    #[instrument(err, skip(self))]
    pub async fn settle_market(
        &self,
        id: i64,
        settled_price: Decimal,
        owner_id: &str,
    ) -> SqlxResult<SettleMarketStatus> {
        let settled_price = settled_price.normalize();

        if settled_price.scale() > 2 {
            return Ok(SettleMarketStatus::InvalidSettlementPrice);
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

        let mut market = sqlx::query_as!(
            Market,
            r#"SELECT id, name, description, owner_id, transaction_id, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _" FROM market WHERE id = ? AND owner_id = ?"#,
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

        let canceled_orders = sqlx::query_scalar!(
            r#"UPDATE "order" SET size = '0' WHERE market_id = ? AND CAST(size AS REAL) > 0 RETURNING id"#,
            id
        )
            .fetch_all(transaction.as_mut())
            .await?;

        for canceled_order_id in canceled_orders {
            sqlx::query!(
                r#"INSERT INTO order_size (order_id, transaction_id, size) VALUES (?, ?, '0')"#,
                canceled_order_id,
                transaction_info.id
            )
            .execute(transaction.as_mut())
            .await?;
        }

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
        let price = price.normalize();
        let size = size.normalize();

        if price.scale() > 2 || price.mantissa() > 1_000_000_000_000 {
            return Ok(CreateOrderStatus::InvalidPrice);
        }

        if size <= dec!(0) || size.scale() > 2 || size.mantissa() > 1_000_000_000_000 {
            return Ok(CreateOrderStatus::InvalidSize);
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;
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
                    r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: Text<Side>" FROM "order" WHERE market_id = ? AND side != ? AND CAST(size AS REAL) > 0 AND CAST(price AS REAL) <= ? ORDER BY CAST(price AS REAL), transaction_id"#,
                    market_id,
                    side,
                    condition_price
                ).fetch(transaction.as_mut())
            }
            Side::Offer => {
                sqlx::query_as!(
                    Order,
                    r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: Text<Side>" FROM "order" WHERE market_id = ? AND side != ? AND CAST(size AS REAL) > 0 AND CAST(price AS REAL) >= ? ORDER BY CAST(price AS REAL) DESC, transaction_id"#,
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
            let order = sqlx::query_as!(
                    Order,
                    r#"INSERT INTO "order" (market_id, owner_id, transaction_id, size, price, side) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _""#,
                    market_id,
                    owner_id,
                    transaction_info.id,
                    size_remaining,
                    price,
                    side
                )
                .fetch_one(transaction.as_mut())
                .await?;
            sqlx::query!(
                r#"INSERT INTO order_size (order_id, transaction_id, size) VALUES (?, ?, ?)"#,
                order.id,
                transaction_info.id,
                size_remaining
            )
            .execute(transaction.as_mut())
            .await?;
            Some(order)
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
            if owner_id != fill.owner_id {
                let (buyer_id, seller_id) = match side.0 {
                    Side::Bid => (owner_id, fill.owner_id.as_str()),
                    Side::Offer => (fill.owner_id.as_str(), owner_id),
                };
                let trade = sqlx::query_as!(
                    Trade,
                    r#"INSERT INTO trade (market_id, buyer_id, seller_id, transaction_id, size, price) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, market_id, buyer_id, seller_id, transaction_id, size as "size: _", price as "price: _""#,
                    market_id,
                    buyer_id,
                    seller_id,
                    transaction_info.id,
                    size,
                    price
                )
                .fetch_one(transaction.as_mut())
                .await?;
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

            let size = Text(fill.size_remaining);
            sqlx::query!(r#"UPDATE "order" SET size = ? WHERE id = ?"#, size, fill.id)
                .execute(transaction.as_mut())
                .await?;
            sqlx::query!(
                r#"INSERT INTO order_size (order_id, transaction_id, size) VALUES (?, ?, ?)"#,
                fill.id,
                transaction_info.id,
                size
            )
            .execute(transaction.as_mut())
            .await?;

            update_exposure_cache(&mut transaction, false, fill).await?;
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
        let (mut transaction, transaction_info) = self.begin_write().await?;

        let order =
            sqlx::query_as!(
                Order,
                r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE id = ?"#,
                id
            )
                .fetch_optional(transaction.as_mut())
                .await?;

        let Some(order) = order else {
            return Ok(CancelOrderStatus::NotFound);
        };

        if order.size.is_zero() {
            return Ok(CancelOrderStatus::NotFound);
        }

        if order.owner_id != owner_id {
            return Ok(CancelOrderStatus::NotOwner);
        }

        sqlx::query!(r#"UPDATE "order" SET size = '0' WHERE id = ?"#, id)
            .execute(transaction.as_mut())
            .await?;
        sqlx::query!(
            r#"INSERT INTO order_size (order_id, transaction_id, size) VALUES (?, ?, '0')"#,
            id,
            transaction_info.id
        )
        .execute(transaction.as_mut())
        .await?;

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
        let (mut transaction, transaction_info) = self.begin_write().await?;

        let orders_affected = sqlx::query_scalar!(
            r#"UPDATE "order" SET size = '0' WHERE market_id = ? AND owner_id = ? AND CAST(size AS REAL) > 0 RETURNING id as "id!""#,
            market_id,
            owner_id
        )
        .fetch_all(transaction.as_mut())
        .await?;

        for order_id in &orders_affected {
            sqlx::query!(
                r#"INSERT INTO order_size (order_id, transaction_id, size) VALUES (?, ?, '0')"#,
                order_id,
                transaction_info.id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        if !orders_affected.is_empty() {
            sqlx::query!(
                r#"UPDATE exposure_cache SET total_bid_size = '0', total_offer_size = '0', total_bid_value = '0', total_offer_value = '0' WHERE user_id = ? AND market_id = ?"#,
                owner_id,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        transaction.commit().await?;

        Ok(orders_affected)
    }

    async fn begin_write(&self) -> SqlxResult<(sqlx::Transaction<Sqlite>, TransactionInfo)> {
        let mut transaction = self.pool.begin().await?;

        // ensure the transaction is started as a write transaction
        let info = sqlx::query_as!(
            TransactionInfo,
            r#"INSERT INTO "transaction" DEFAULT VALUES RETURNING id, timestamp"#
        )
        .fetch_one(transaction.as_mut())
        .await?;

        Ok((transaction, info))
    }
}

#[derive(Debug)]
struct TransactionInfo {
    id: i64,
    // TODO: actually use this for something
    #[allow(dead_code)]
    timestamp: OffsetDateTime,
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
    match side {
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
    };
    Ok(())
}

pub enum EnsureUserCreatedStatus {
    CreatedOrUpdated,
    Unchanged,
}

impl MarketExposure {
    #[must_use]
    pub fn worst_case_outcome(&self) -> Decimal {
        let resolves_min_case = self.min_settlement.0 * (self.position.0 + self.total_bid_size.0)
            - self.total_bid_value.0;
        let resolves_max_case = self.max_settlement.0 * (self.position.0 - self.total_offer_size.0)
            + self.total_offer_value.0;
        resolves_min_case.min(resolves_max_case)
    }
}

pub enum GetFullMarketDataStatus {
    Success(FullMarketData),
    NotFound,
}

#[derive(Debug)]
pub struct FullMarketData {
    pub market: Market,
    pub orders: Vec<(Order, Vec<Size>)>,
    pub trades: Vec<Trade>,
}

#[derive(Debug)]
pub struct Size {
    pub order_id: i64,
    pub transaction_id: i64,
    pub size: Text<Decimal>,
}

#[derive(Debug)]
pub enum GetPortfolioStatus {
    Success(Portfolio),
    NotFound,
}

#[derive(Debug)]
pub enum RedeemStatus {
    Success { transaction_id: i64 },
    InvalidAmount,
    MarketNotRedeemable,
    InsufficientFunds,
    RedeemerNotFound,
}

#[derive(Debug)]
pub enum CreateOrderStatus {
    MarketNotFound,
    MarketSettled,
    InvalidPrice,
    InvalidSize,
    InsufficientFunds,
    UserNotFound,
    Success {
        order: Option<Order>,
        fills: Vec<OrderFill>,
        trades: Vec<Trade>,
    },
}

#[derive(Debug, Clone, Serialize, ToSchema)]
pub struct OrderFill {
    pub id: i64,
    pub market_id: i64,
    pub owner_id: String,
    #[schema(value_type = String)]
    pub size_filled: Decimal,
    #[schema(value_type = String)]
    pub size_remaining: Decimal,
    #[schema(value_type = String)]
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

#[derive(Debug)]
pub struct User {
    pub id: String,
    pub name: String,
    pub is_bot: bool,
}

#[derive(Debug, FromRow)]
pub struct Payment {
    pub id: i64,
    pub payer_id: String,
    pub recipient_id: String,
    pub transaction_id: i64,
    pub amount: Text<Decimal>,
    pub note: String,
}

#[derive(Debug, FromRow)]
pub struct Ownership {
    pub bot_id: String,
}

pub enum GiveOwnershipStatus {
    Success,
    AlreadyOwner,
    NotOwner,
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

#[derive(FromRow, Debug, Clone, Serialize, ToSchema)]
pub struct Trade {
    pub id: i64,
    pub market_id: i64,
    pub buyer_id: String,
    pub seller_id: String,
    pub transaction_id: i64,
    #[serde(serialize_with = "serialize_text")]
    #[schema(value_type = String)]
    pub price: Text<Decimal>,
    #[serde(serialize_with = "serialize_text")]
    #[schema(value_type = String)]
    pub size: Text<Decimal>,
}

#[derive(FromRow, Debug, Serialize, Clone, ToSchema)]
pub struct Order {
    pub id: i64,
    pub market_id: i64,
    pub owner_id: String,
    pub transaction_id: i64,
    #[serde(serialize_with = "serialize_text")]
    #[schema(value_type = String)]
    pub size: Text<Decimal>,
    #[serde(serialize_with = "serialize_text")]
    #[schema(value_type = String)]
    pub price: Text<Decimal>,
    #[serde(serialize_with = "serialize_text")]
    #[schema(value_type = Side)]
    pub side: Text<Side>,
}

fn serialize_text<S, T: Serialize>(text: &Text<T>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serde::Serialize::serialize(&text.0, serializer)
}

#[derive(Debug, Clone, Copy, Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
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
    pub transaction_id: i64,
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

    #[sqlx::test(fixtures("users", "etf_markets"))]
    async fn test_redeem(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };
        let redeem_status = db.redeem(2, "a", dec!(1)).await?;
        assert_matches!(redeem_status, RedeemStatus::MarketNotRedeemable);
        let redeem_status = db.redeem(1, "a", dec!(1000)).await?;
        assert_matches!(redeem_status, RedeemStatus::InsufficientFunds);
        let redeem_status = db.redeem(1, "a", dec!(1)).await?;
        assert_matches!(redeem_status, RedeemStatus::Success { .. });
        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(80.0));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[
                MarketExposure {
                    market_id: 1,
                    position: Text(dec!(-1)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(20)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 2,
                    position: Text(dec!(0.99)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 3,
                    position: Text(dec!(0.99)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                }
            ]
        );
        let redeem_status = db.redeem(1, "a", dec!(-1)).await?;
        assert_matches!(redeem_status, RedeemStatus::Success { .. });
        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(99.6));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[
                MarketExposure {
                    market_id: 1,
                    position: Text(dec!(0)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(20)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 2,
                    position: Text(dec!(-0.02)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 3,
                    position: Text(dec!(-0.02)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                }
            ]
        );
        Ok(())
    }

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

        let order_status = db
            .create_order(1, "a", dec!(15), dec!(-1), Side::Bid)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InvalidSize);

        let order_status = db
            .create_order(1, "a", dec!(15.001), dec!(1), Side::Bid)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InvalidPrice);

        let order_status = db
            .create_order(1, "a", dec!(15.0100), dec!(1), Side::Offer)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::Success { .. });

        Ok(())
    }

    #[sqlx::test(fixtures("users", "markets"))]
    async fn test_create_and_cancel_single_bid(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let order_status = db
            .create_order(1, "a", dec!(15), dec!(1), Side::Bid)
            .await?;
        let CreateOrderStatus::Success {
            order: Some(order), ..
        } = order_status
        else {
            panic!("expected success order");
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

        let all_orders = db.get_live_market_orders(1).await.unwrap();
        assert_eq!(all_orders.len(), 1);

        db.cancel_order(order.id, "a").await?;
        let all_orders = db.get_live_market_orders(1).await.unwrap();
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
    async fn test_self_fill(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db
            .create_order(1, "a", dec!(12), dec!(1), Side::Bid)
            .await?;

        let order_status = db
            .create_order(1, "a", dec!(11), dec!(0.5), Side::Offer)
            .await?;

        let CreateOrderStatus::Success {
            trades,
            fills,
            order: None,
        } = order_status
        else {
            panic!("expected success with no order");
        };

        assert_eq!(trades.len(), 0);
        assert_eq!(fills.len(), 1);
        let fill = &fills[0];
        assert_eq!(fill.size_filled, dec!(0.5));
        assert_eq!(fill.size_remaining, dec!(0.5));

        let a_portfolio = db.get_portfolio("a").await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(a_portfolio.available_balance, dec!(99));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[MarketExposure {
                market_id: 1,
                position: Text(dec!(0)),
                total_bid_size: Text(dec!(0.5)),
                total_bid_value: Text(dec!(6)),
                total_offer_size: Text(dec!(0)),
                total_offer_value: Text(dec!(0)),
                min_settlement: Text(dec!(10)),
                max_settlement: Text(dec!(20)),
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

        let all_orders = db.get_live_market_orders(2).await.unwrap();
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
