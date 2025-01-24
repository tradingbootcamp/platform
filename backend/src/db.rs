use std::{env, fmt::Display, path::Path, str::FromStr};

use futures::TryStreamExt;
use futures_core::stream::BoxStream;
use itertools::Itertools;
use rand::{distributions::WeightedIndex, prelude::Distribution};
use rust_decimal::{Decimal, RoundingStrategy};
use rust_decimal_macros::dec;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    types::{time::OffsetDateTime, Text},
    Connection, FromRow, Sqlite, SqliteConnection, SqlitePool, Transaction,
};
use tokio::sync::broadcast::error::RecvError;
use tracing::instrument;

use crate::websocket_api;

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

        // Ignore missing to enable migration squashing
        let mut migrator = sqlx::migrate::Migrator::new(Path::new("./migrations")).await?;
        migrator
            .set_ignore_missing(true)
            .run(&mut management_conn)
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
    pub async fn get_account(&self, account_id: i64) -> SqlxResult<Option<Account>> {
        sqlx::query_as!(
            Account,
            r#"SELECT id, name, kinde_id IS NOT NULL as "is_user: bool" FROM account WHERE id = ?"#,
            account_id
        )
        .fetch_optional(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn redeem(
        &self,
        fund_id: i64,
        redeemer_id: i64,
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

        let settled = sqlx::query!(
            r#"WITH fund_and_constituents AS (
                SELECT ? AS fund_id
                UNION ALL
                SELECT constituent_id
                FROM redeemable
                WHERE fund_id = ?
            ) SELECT id FROM market WHERE id IN (SELECT id FROM fund_and_constituents) AND settled_price IS NOT NULL"#,
            fund_id,
            fund_id
        ).fetch_all(transaction.as_mut())
        .await?;

        if !settled.is_empty() {
            return Ok(RedeemStatus::MarketSettled);
        }

        let fund_position_change = -amount;
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
            r#"SELECT position as "position: Text<Decimal>" FROM "exposure_cache" WHERE "account_id" = ? AND "market_id" = ?"#,
            redeemer_id,
            fund_id,
        )
        .fetch_optional(transaction.as_mut())
        .await?
        .unwrap_or_default();
        let new_fund_position = Text(current_fund_position + fund_position_change);
        sqlx::query!(
            r#"INSERT INTO exposure_cache (account_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value) VALUES (?, ?, ?, '0', '0', '0', '0') ON CONFLICT DO UPDATE SET position = ?"#,
            redeemer_id,
            fund_id,
            new_fund_position,
            new_fund_position
        ).execute(transaction.as_mut()).await?;
        for redeemable in redeemables {
            let amount_multiplied = amount.0 * Decimal::from(redeemable.multiplier);
            let constituent_position_change = if amount_multiplied.is_sign_positive() {
                (amount_multiplied * dec!(0.99)).round_dp_with_strategy(2, RoundingStrategy::ToZero)
            } else {
                (amount_multiplied * dec!(1.01))
                    .round_dp_with_strategy(2, RoundingStrategy::AwayFromZero)
            };
            let Text(current_exposure) = sqlx::query_scalar!(
                r#"SELECT position as "position: Text<Decimal>" FROM "exposure_cache" WHERE "account_id" = ? AND "market_id" = ?"#,
                redeemer_id,
                redeemable.constituent_id,
            )
            .fetch_optional(transaction.as_mut())
            .await?
            .unwrap_or_default();
            let new_exposure = Text(current_exposure + constituent_position_change);
            sqlx::query!(
                r#"INSERT INTO exposure_cache (account_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value) VALUES (?, ?, ?, '0', '0', '0', '0') ON CONFLICT DO UPDATE SET position = ?"#,
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
        Ok(RedeemStatus::Success { transaction_info })
    }

    #[instrument(err, skip(self))]
    pub async fn create_account(
        &self,
        user_id: i64,
        owner_id: i64,
        account_name: String,
    ) -> SqlxResult<CreateAccountStatus> {
        if account_name.trim().is_empty() {
            return Ok(CreateAccountStatus::EmptyName);
        }

        let mut transaction = self.pool.begin().await?;

        let result = sqlx::query_scalar!(
            r#"INSERT INTO account (name, balance) VALUES (?, '0') RETURNING id"#,
            account_name
        )
        .fetch_one(transaction.as_mut())
        .await;

        let is_valid_owner = owner_id == user_id
            || sqlx::query_scalar!(
                r#"SELECT EXISTS(SELECT 1 FROM account_owner WHERE account_id = ? AND owner_id = ?) as "exists!: bool""#,
                owner_id,
                user_id
            )
            .fetch_one(transaction.as_mut())
            .await?;

        if !is_valid_owner {
            return Ok(CreateAccountStatus::InvalidOwner);
        }

        match result {
            Ok(account_id) => {
                sqlx::query!(
                    r#"INSERT INTO account_owner (owner_id, account_id) VALUES (?, ?)"#,
                    owner_id,
                    account_id
                )
                .execute(transaction.as_mut())
                .await?;

                transaction.commit().await?;

                Ok(CreateAccountStatus::Success(Account {
                    id: account_id,
                    name: account_name,
                    is_user: false,
                }))
            }
            Err(sqlx::Error::Database(db_err)) => {
                if db_err.message().contains("UNIQUE constraint failed") {
                    transaction.rollback().await?;
                    Ok(CreateAccountStatus::NameAlreadyExists)
                } else {
                    Err(sqlx::Error::Database(db_err))
                }
            }
            Err(e) => Err(e),
        }
    }

    #[instrument(err, skip(self))]
    pub async fn share_ownership(
        &self,
        existing_owner_id: i64,
        of_account_id: i64,
        to_account_id: i64,
    ) -> SqlxResult<ShareOwnershipStatus> {
        let owner_is_user = sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM account WHERE id = ? AND kinde_id IS NOT NULL) as "exists!: bool""#,
            existing_owner_id
        )
        .fetch_one(&self.pool)
        .await?;

        if !owner_is_user {
            return Ok(ShareOwnershipStatus::OwnerNotAUser);
        }

        let is_direct_owner = sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM account_owner WHERE owner_id = ? AND account_id = ?) as "exists!: bool""#,
            existing_owner_id,
            of_account_id
        )
        .fetch_one(&self.pool)
        .await?;

        if !is_direct_owner {
            return Ok(ShareOwnershipStatus::NotOwner);
        }

        let recipient_is_user = sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM account WHERE id = ? AND kinde_id IS NOT NULL) as "exists!: bool""#,
            to_account_id
        )
        .fetch_one(&self.pool)
        .await?;

        if !recipient_is_user {
            return Ok(ShareOwnershipStatus::RecipientNotAUser);
        }
        let res = sqlx::query!(
            r#"INSERT INTO account_owner (account_id, owner_id) VALUES (?, ?) ON CONFLICT DO NOTHING"#,
            of_account_id,
            to_account_id
        )
        .execute(&self.pool)
        .await?;
        if res.rows_affected() == 0 {
            Ok(ShareOwnershipStatus::AlreadyOwner)
        } else {
            Ok(ShareOwnershipStatus::Success)
        }
    }

    #[instrument(err, skip(self))]
    pub async fn get_owned_accounts(&self, user_id: i64) -> SqlxResult<Vec<i64>> {
        sqlx::query_scalar!(
            r#"SELECT ao2.account_id as "account_id!" FROM account_owner ao1 JOIN account_owner ao2 ON ao1.account_id = ao2.owner_id WHERE ao1.owner_id = ? UNION SELECT account_id FROM account_owner WHERE owner_id = ? UNION SELECT ?"#,
            user_id,
            user_id,
            user_id
        )
        .fetch_all(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn ensure_user_created<'a>(
        &self,
        kinde_id: &str,
        requested_name: Option<&str>,
        initial_balance: Decimal,
    ) -> SqlxResult<EnsureUserCreatedStatus> {
        let balance = Text(initial_balance);

        // First try to find user by kinde_id
        let existing_user = sqlx::query!(
            r#"SELECT id as "id!", name FROM account WHERE kinde_id = ?"#,
            kinde_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(user) = existing_user {
            if requested_name.is_none_or(|requested_name| user.name == requested_name) {
                return Ok(EnsureUserCreatedStatus::Unchanged { id: user.id });
            }
        }

        let Some(requested_name) = requested_name else {
            return Ok(EnsureUserCreatedStatus::NoNameProvidedForNewUser);
        };

        let conflicting_account = sqlx::query!(
            r#"SELECT id FROM account WHERE name = ? AND (kinde_id != ? OR kinde_id IS NULL)"#,
            requested_name,
            kinde_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let final_name = if conflicting_account.is_some() {
            format!("{}-{}", requested_name, &kinde_id[3..10])
        } else {
            requested_name.to_string()
        };

        let id = sqlx::query_scalar!(
            "INSERT INTO account (kinde_id, name, balance) VALUES (?, ?, ?) ON CONFLICT DO UPDATE SET name = ? RETURNING id",
            kinde_id,
            final_name,
            balance,
            final_name,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(EnsureUserCreatedStatus::CreatedOrUpdated {
            id,
            name: final_name,
        })
    }

    /// # Errors
    /// Fails is there's a database error
    pub async fn get_portfolio(&self, account_id: i64) -> SqlxResult<Option<Portfolio>> {
        let mut transaction = self.pool.begin().await?;
        match get_portfolio_with_credits(&mut transaction, account_id).await {
            Ok(result) => {
                transaction.commit().await?;
                Ok(result)
            }
            Err(sqlx::Error::Database(db_err)) => {
                // Probably credits need to be updated
                tracing::warn!("get portfolio database error: {db_err:?}");
                let mut transaction = self.pool.begin().await?;
                // Ensure write mode with a no-op write query
                sqlx::query!(r#"INSERT INTO "transaction" (id) VALUES (0) ON CONFLICT DO NOTHING"#)
                    .execute(transaction.as_mut())
                    .await?;
                let result = get_portfolio_with_credits(&mut transaction, account_id).await;
                transaction.commit().await?;
                result
            }
            Err(error) => Err(error),
        }
    }

    #[must_use]
    pub fn get_all_accounts(&self) -> BoxStream<SqlxResult<Account>> {
        sqlx::query_as!(
            Account,
            r#"SELECT id, name, kinde_id IS NOT NULL as "is_user: bool" FROM account"#
        )
        .fetch(&self.pool)
    }

    #[instrument(err, skip(self))]
    pub async fn get_all_markets(&self) -> SqlxResult<Vec<MarketWithRedeemables>> {
        let markets = sqlx::query_as!(Market, r#"SELECT market.id as id, name, description, owner_id, transaction_id, "transaction".timestamp as transaction_timestamp, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _" FROM market join "transaction" on (market.transaction_id = "transaction".id) ORDER BY market.id"#)
            .fetch_all(&self.pool)
            .await?;
        let redeemables = sqlx::query_as!(
            Redeemable,
            r#"SELECT fund_id, constituent_id, multiplier FROM redeemable ORDER BY fund_id"#
        )
        .fetch_all(&self.pool)
        .await?;
        let redeemables_chunked = redeemables
            .into_iter()
            .chunk_by(|redeemable| redeemable.fund_id);
        markets
            .into_iter()
            .merge_join_by(redeemables_chunked.into_iter(), |market, (fund_id, _)| {
                market.id.cmp(fund_id)
            })
            .map(|joined| {
                let (left, right) = joined.left_and_right();
                let Some(market) = left else {
                    return Err(sqlx::Error::RowNotFound);
                };
                Ok(MarketWithRedeemables {
                    market,
                    redeemables: right
                        .map(|(_, redeemables)| redeemables.collect())
                        .unwrap_or_default(),
                })
            })
            .collect()
    }

    #[must_use]
    pub fn get_all_live_orders(&self) -> BoxStream<SqlxResult<Order>> {
        sqlx::query_as!(Order, r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE CAST(size AS REAL) > 0 ORDER BY market_id"#)
            .fetch(&self.pool)
    }

    #[must_use]
    pub fn get_all_transactions(&self) -> BoxStream<SqlxResult<TransactionInfo>> {
        sqlx::query_as!(
            TransactionInfo,
            r#"SELECT id, timestamp FROM "transaction" ORDER BY id"#
        )
        .fetch(&self.pool)
    }

    #[instrument(err, skip(self))]
    pub async fn get_live_market_orders(&self, market_id: i64) -> SqlxResult<Vec<Order>> {
        sqlx::query_as!(Order, r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE market_id = ? AND CAST(size AS REAL) > 0"#, market_id)
            .fetch_all(&self.pool)
            .await
    }

    #[instrument(err, skip(self))]
    pub async fn get_market_trades(&self, market_id: i64) -> SqlxResult<GetMarketTradesStatus> {
        if !self.market_exists(market_id).await? {
            return Ok(GetMarketTradesStatus::MarketNotFound);
        };
        let trades = sqlx::query_as!(Trade, r#"SELECT t.id as "id!", t.market_id, t.buyer_id, t.seller_id, t.transaction_id, t.size as "size: _", t.price as "price: _", tr.timestamp as "transaction_timestamp" FROM trade t JOIN "transaction" tr ON t.transaction_id = tr.id WHERE t.market_id = ?"#, market_id)
            .fetch_all(&self.pool)
            .await?;
        Ok(GetMarketTradesStatus::Success(trades))
    }

    #[instrument(err, skip(self))]
    pub async fn get_full_market_orders(
        &self,
        market_id: i64,
    ) -> SqlxResult<GetMarketOrdersStatus> {
        if !self.market_exists(market_id).await? {
            return Ok(GetMarketOrdersStatus::MarketNotFound);
        };
        let mut transaction = self.pool.begin().await?;
        let orders = sqlx::query_as!(
            Order,
            r#"SELECT id as "id!", market_id, owner_id, transaction_id, size as "size: _", price as "price: _", side as "side: _" FROM "order" WHERE market_id = ? ORDER BY id"#,
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
        Ok(GetMarketOrdersStatus::Success(orders))
    }

    #[instrument(err, skip(self))]
    pub async fn get_transfers(&self, account_id: i64) -> SqlxResult<Vec<Transfer>> {
        sqlx::query_as!(Transfer, r#"
            SELECT transfer.id as "id!", initiator_id, from_account_id, to_account_id, transaction_id, amount as "amount: _", note, "transaction".timestamp as "transaction_timestamp" 
            FROM transfer 
            JOIN "transaction" ON (transfer.transaction_id = "transaction".id)
            WHERE from_account_id = ? OR to_account_id = ?"#,
            account_id,
            account_id)
            .fetch_all(&self.pool)
            .await
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
    pub async fn make_transfer(
        &self,
        initiator_id: i64,
        from_account_id: i64,
        to_account_id: i64,
        amount: Decimal,
        note: &str,
    ) -> SqlxResult<MakeTransferStatus> {
        if from_account_id == to_account_id {
            return Ok(MakeTransferStatus::SameAccount);
        }

        let amount = amount.normalize();

        if amount <= dec!(0) || amount.scale() > 4 {
            return Ok(MakeTransferStatus::InvalidAmount);
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

        let initiator_is_user = sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM account WHERE id = ? AND kinde_id IS NOT NULL) as "exists!: bool""#,
            initiator_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if !initiator_is_user {
            return Ok(MakeTransferStatus::InitiatorNotUser);
        }

        let Some(from_account_portfolio) =
            get_portfolio_with_credits(&mut transaction, from_account_id).await?
        else {
            return Ok(MakeTransferStatus::FromAccountNotFound);
        };

        if from_account_portfolio.available_balance < amount {
            return Ok(MakeTransferStatus::InsufficientFunds);
        }

        let Some(to_account_portfolio) =
            get_portfolio_with_credits(&mut transaction, to_account_id).await?
        else {
            return Ok(MakeTransferStatus::ToAccountNotFound);
        };

        let is_user_to_user_transfer =
            initiator_id == from_account_id && to_account_portfolio.owner_credits.is_empty();

        if let Some(withdrawal_owner_credit) = from_account_portfolio
            .owner_credits
            .iter()
            .find(|credit| credit.owner_id == to_account_id)
        {
            if withdrawal_owner_credit.credit.0 < amount {
                return Ok(MakeTransferStatus::InsufficientCredit);
            }
            let new_credit = withdrawal_owner_credit.credit.0 - amount;
            if let Some(status) = execute_credit_transfer(
                &mut transaction,
                initiator_id,
                &to_account_portfolio,
                &from_account_portfolio,
                new_credit,
            )
            .await?
            {
                return Ok(status);
            }
        } else if let Some(deposit_owner_credit) = to_account_portfolio
            .owner_credits
            .iter()
            .find(|credit| credit.owner_id == from_account_id)
        {
            let new_credit = deposit_owner_credit.credit.0 + amount;
            if let Some(status) = execute_credit_transfer(
                &mut transaction,
                initiator_id,
                &from_account_portfolio,
                &to_account_portfolio,
                new_credit,
            )
            .await?
            {
                return Ok(status);
            }
        } else if !is_user_to_user_transfer {
            return Ok(MakeTransferStatus::AccountNotOwned);
        }

        let from_account_new_balance = Text(from_account_portfolio.total_balance - amount);
        let to_account_new_balance = Text(to_account_portfolio.total_balance + amount);

        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            from_account_new_balance,
            from_account_id
        )
        .execute(transaction.as_mut())
        .await?;

        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            to_account_new_balance,
            to_account_id
        )
        .execute(transaction.as_mut())
        .await?;

        let amount = Text(amount);

        let transfer = sqlx::query_as!(
            Transfer,
            r#"INSERT INTO transfer (initiator_id, from_account_id, to_account_id, transaction_id, amount, note) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, initiator_id, from_account_id, to_account_id, transaction_id, ? as "transaction_timestamp!: _", amount as "amount: _", note"#,
            initiator_id,
            from_account_id,
            to_account_id,
            transaction_info.id,
            amount,
            note,
            transaction_info.timestamp
        )
        .fetch_one(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(MakeTransferStatus::Success(transfer))
    }

    #[instrument(err, skip(self))]
    pub async fn create_market(
        &self,
        name: &str,
        description: &str,
        owner_id: i64,
        mut min_settlement: Decimal,
        mut max_settlement: Decimal,
        redeemable_for: &[websocket_api::Redeemable],
    ) -> SqlxResult<CreateMarketStatus> {
        if redeemable_for
            .iter()
            .any(|redeemable| redeemable.multiplier == 0)
        {
            return Ok(CreateMarketStatus::InvalidMultiplier);
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

        if !redeemable_for.is_empty() {
            min_settlement = Decimal::ZERO;
            max_settlement = Decimal::ZERO;

            for redeemable in redeemable_for {
                let Some(constituent) = sqlx::query!(
                    r#"SELECT min_settlement as "min_settlement: Text<Decimal>", max_settlement as "max_settlement: Text<Decimal>", settled_price IS NOT NULL as "settled: bool" FROM market WHERE id = ?"#,
                    redeemable.constituent_id
                )
                .fetch_optional(transaction.as_mut())
                .await? else {
                    return Ok(CreateMarketStatus::ConstituentNotFound);
                };

                if constituent.settled {
                    return Ok(CreateMarketStatus::ConstituentSettled);
                }

                // This makes it hard to know which way to round as payment
                if constituent.min_settlement.0.is_sign_negative() {
                    return Ok(CreateMarketStatus::ConstituentWithNegativePrices);
                }

                // Handle negative multipliers correctly
                let min_settlement_payout =
                    constituent.min_settlement.0 * Decimal::from(redeemable.multiplier);
                let max_settlement_payout =
                    constituent.max_settlement.0 * Decimal::from(redeemable.multiplier);

                min_settlement += min_settlement_payout.min(max_settlement_payout);
                max_settlement += min_settlement_payout.max(max_settlement_payout);
            }
        }
        min_settlement = min_settlement.normalize();
        max_settlement = max_settlement.normalize();

        if min_settlement >= max_settlement {
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

        let min_settlement = Text(min_settlement);
        let max_settlement = Text(max_settlement);

        let market = sqlx::query_as!(
            Market,
            r#"INSERT INTO market (name, description, owner_id, transaction_id, min_settlement, max_settlement) VALUES (?, ?, ?, ?, ?, ?) RETURNING id, name, description, owner_id, transaction_id, ? as "transaction_timestamp!: _", min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _""#,
            name,
            description,
            owner_id,
            transaction_info.id,
            min_settlement,
            max_settlement,
            transaction_info.timestamp
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let mut redeemables = Vec::new();
        for redeemable in redeemable_for {
            let redeemable = sqlx::query_as!(
                Redeemable,
                r#"INSERT INTO redeemable (fund_id, constituent_id, multiplier) VALUES (?, ?, ?) RETURNING fund_id, constituent_id, multiplier as "multiplier: _""#,
                market.id,
                redeemable.constituent_id,
                redeemable.multiplier,
            )
            .fetch_one(transaction.as_mut())
            .await?;
            redeemables.push(redeemable);
        }

        transaction.commit().await?;
        Ok(CreateMarketStatus::Success(MarketWithRedeemables {
            market,
            redeemables,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn settle_market(
        &self,
        id: i64,
        mut settled_price: Decimal,
        owner_id: i64,
    ) -> SqlxResult<SettleMarketStatus> {
        let (mut transaction, transaction_info) = self.begin_write().await?;

        let mut market = sqlx::query_as!(
            Market,
            r#"SELECT market.id as id, name, description, owner_id, transaction_id, "transaction".timestamp as transaction_timestamp, min_settlement as "min_settlement: _", max_settlement as "max_settlement: _", settled_price as "settled_price: _" FROM market join "transaction" on (market.transaction_id = "transaction".id) WHERE market.id = ? AND owner_id = ?"#,
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

        let constituent_settlements = sqlx::query!(
            r#"SELECT settled_price as "settled_price: Text<Decimal>", multiplier FROM redeemable JOIN market ON (constituent_id = market.id) WHERE fund_id = ?"#,
            id
        )
        .fetch_all(transaction.as_mut())
        .await?;

        if !constituent_settlements.is_empty() {
            if let Some(constituent_sum) = constituent_settlements
                .iter()
                .map(|c| c.settled_price.map(|p| p.0 * Decimal::from(c.multiplier)))
                .sum::<Option<Decimal>>()
            {
                settled_price = constituent_sum;
            } else {
                return Ok(SettleMarketStatus::ConstituentNotSettled);
            };
        }
        let settled_price = settled_price.normalize();

        if settled_price.scale() > 2 {
            return Ok(SettleMarketStatus::InvalidSettlementPrice);
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

        let account_positions = sqlx::query!(
            r#"DELETE FROM exposure_cache WHERE market_id = ? RETURNING account_id, position as "position: Text<Decimal>""#,
            id
        )
        .fetch_all(transaction.as_mut())
        .await?;

        for account_position in &account_positions {
            let Text(current_balance) = sqlx::query_scalar!(
                r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
                account_position.account_id
            )
            .fetch_one(transaction.as_mut())
            .await?;

            let new_balance = Text(current_balance + account_position.position.0 * settled_price.0);
            sqlx::query!(
                r#"UPDATE account SET balance = ? WHERE id = ?"#,
                new_balance,
                account_position.account_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        transaction.commit().await?;

        let affected_accounts = account_positions
            .into_iter()
            .map(|row| row.account_id)
            .collect();
        Ok(SettleMarketStatus::Success {
            affected_accounts,
            transaction_info,
        })
    }

    #[instrument(err, skip(self))]
    pub async fn create_order(
        &self,
        market_id: i64,
        owner_id: i64,
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
                owner_id,
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
            return Ok(CreateOrderStatus::AccountNotFound);
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
                owner_id,
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
                    Side::Bid => (owner_id, fill.owner_id),
                    Side::Offer => (fill.owner_id, owner_id),
                };
                let trade = sqlx::query_as!(
                    Trade,
                    r#"INSERT INTO trade (market_id, buyer_id, seller_id, transaction_id, size, price) VALUES (?, ?, ?, ?, ?, ?) RETURNING id as "id!", market_id, buyer_id, seller_id, transaction_id, size as "size: _", price as "price: _", ? as "transaction_timestamp!: _""#,
                    market_id,
                    buyer_id,
                    seller_id,
                    transaction_info.id,
                    size,
                    price,
                    transaction_info.timestamp
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
                    r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
                    fill.owner_id
                )
                .fetch_one(transaction.as_mut())
                .await?;
                let other_new_balance = Text(other_current_balance + other_balance_change);
                sqlx::query!(
                    r#"UPDATE account SET balance = ? WHERE id = ?"#,
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
            r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
            owner_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        let new_balance = Text(current_balance + balance_change);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
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
            transaction_info,
        })
    }

    #[instrument(err, skip(self))]
    pub async fn cancel_order(&self, id: i64, owner_id: i64) -> SqlxResult<CancelOrderStatus> {
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
            transaction_info,
        })
    }

    #[instrument(err, skip(self))]
    pub async fn out(&self, market_id: i64, owner_id: i64) -> SqlxResult<Out> {
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
                r#"UPDATE exposure_cache SET total_bid_size = '0', total_offer_size = '0', total_bid_value = '0', total_offer_value = '0' WHERE account_id = ? AND market_id = ?"#,
                owner_id,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        transaction.commit().await?;

        Ok(Out {
            orders_affected,
            transaction_info,
        })
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

async fn get_portfolio_with_credits(
    transaction: &mut Transaction<'_, Sqlite>,
    account_id: i64,
) -> SqlxResult<Option<Portfolio>> {
    let Some(mut portfolio) = get_portfolio(transaction, account_id).await? else {
        return Ok(None);
    };
    portfolio.update_owner_credits(transaction).await?;
    Ok(Some(portfolio))
}

/// # Errors
/// If the transaction is started in read and credits need to be updated,
/// the transaction will need to be upgraded to write mode, which can fail
/// if another write transaction has started since this one started.
#[instrument(err, skip(transaction))]
async fn get_portfolio(
    transaction: &mut Transaction<'_, Sqlite>,
    account_id: i64,
) -> SqlxResult<Option<Portfolio>> {
    let total_balance = sqlx::query_scalar!(
        r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
        account_id
    )
    .fetch_optional(transaction.as_mut())
    .await?;

    let Some(total_balance) = total_balance else {
        return Ok(None);
    };

    let market_exposures = sqlx::query_as!(
        MarketExposure,
        r#"SELECT market_id, position as "position: _", total_bid_size as "total_bid_size: _", total_offer_size as "total_offer_size: _", total_bid_value as "total_bid_value: _", total_offer_value as "total_offer_value: _", min_settlement as "min_settlement: _", max_settlement as "max_settlement: _" FROM exposure_cache JOIN market on (market_id = market.id) WHERE account_id = ?"#,
        account_id
    )
    .fetch_all(transaction.as_mut())
    .await?;

    let available_balance = total_balance.0
        + market_exposures
            .iter()
            .map(MarketExposure::worst_case_outcome)
            .sum::<Decimal>();
    Ok(Some(Portfolio {
        account_id,
        total_balance: total_balance.0,
        available_balance,
        market_exposures,
        owner_credits: vec![],
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
        r#"SELECT position as "position: Text<Decimal>", total_bid_size as "total_bid_size: Text<Decimal>", total_offer_size as "total_offer_size: Text<Decimal>", total_bid_value as "total_bid_value: Text<Decimal>", total_offer_value as "total_offer_value: Text<Decimal>" FROM exposure_cache WHERE account_id = ? AND market_id = ?"#,
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
            r#"INSERT INTO exposure_cache (account_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value) VALUES (?, ?, '0', '0', '0', '0', '0') RETURNING position as "position: Text<Decimal>", total_bid_size as "total_bid_size: Text<Decimal>", total_offer_size as "total_offer_size: Text<Decimal>", total_bid_value as "total_bid_value: Text<Decimal>", total_offer_value as "total_offer_value: Text<Decimal>""#,
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
                r#"UPDATE exposure_cache SET total_bid_size = ?, total_bid_value = ?, position = ? WHERE account_id = ? AND market_id = ?"#,
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
                r#"UPDATE exposure_cache SET total_offer_size = ?, total_offer_value = ?, position = ? WHERE account_id = ? AND market_id = ?"#,
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

impl Portfolio {
    fn has_open_positions(&self) -> bool {
        self.market_exposures.iter().any(|m| !m.position.is_zero())
    }

    async fn has_open_positions_recursive(
        &self,
        transaction: &mut Transaction<'_, Sqlite>,
    ) -> SqlxResult<bool> {
        if self.has_open_positions() {
            return Ok(true);
        }
        let owned_accounts = sqlx::query_scalar!(
            r#"SELECT account_id FROM account_owner WHERE owner_id = ?"#,
            self.account_id,
        )
        .fetch_all(transaction.as_mut())
        .await?;
        for owned_account in owned_accounts {
            let Some(owned_portfolio) = get_portfolio(transaction, owned_account).await? else {
                tracing::warn!("owned portfolio not found for account {}", owned_account);
                continue;
            };
            // No need for deep recursion, since only one level of recursive ownership is supported
            if owned_portfolio.has_open_positions() {
                return Ok(true);
            }
        }
        Ok(false)
    }

    async fn update_owner_credits(
        &mut self,
        transaction: &mut Transaction<'_, Sqlite>,
    ) -> SqlxResult<()> {
        self.owner_credits = sqlx::query_as!(
            OwnerCredit,
            r#"SELECT owner_id, credit as "credit: _" FROM account_owner WHERE account_id = ?"#,
            self.account_id,
        )
        .fetch_all(transaction.as_mut())
        .await?;
        if self.owner_credits.is_empty() {
            return Ok(());
        }
        if self.has_open_positions_recursive(transaction).await? {
            return Ok(());
        }
        let sum_current_owner_credit = self
            .owner_credits
            .iter()
            .map(|o| o.credit.0)
            .sum::<Decimal>();
        if sum_current_owner_credit.is_zero() {
            return Ok(());
        }
        let owned_credits = sqlx::query_scalar!(
            r#"SELECT credit as "credit: Text<Decimal>" FROM account_owner WHERE owner_id = ?"#,
            self.account_id,
        )
        .fetch_all(transaction.as_mut())
        .await?;
        let sum_owned_credit = owned_credits.iter().map(|credit| credit.0).sum::<Decimal>();
        let credit_should_sum_to = self.total_balance + sum_owned_credit;
        if sum_current_owner_credit == credit_should_sum_to {
            return Ok(());
        }
        let (mut new_credits, remainders): (Vec<_>, Vec<_>) = self
            .owner_credits
            .iter()
            .map(|o| {
                let new_credit = o.credit.0 * credit_should_sum_to / sum_current_owner_credit;
                let new_credit_rounded = new_credit
                    .round_dp_with_strategy(4, RoundingStrategy::ToNegativeInfinity)
                    .normalize();
                let remainder = new_credit - new_credit_rounded;
                (new_credit_rounded, remainder)
            })
            .unzip();
        if let Ok(dist) = WeightedIndex::new(&remainders) {
            let idx = dist.sample(&mut rand::thread_rng());
            new_credits[idx] += remainders.iter().sum::<Decimal>();
            new_credits[idx] = new_credits[idx].round_dp(4).normalize();
        };
        debug_assert!(new_credits.iter().sum::<Decimal>() == credit_should_sum_to);
        for (owner_credit, new_credit) in self.owner_credits.iter_mut().zip(new_credits) {
            let new_credit = Text(new_credit);
            owner_credit.credit = new_credit;
            sqlx::query!(
                r#"UPDATE account_owner SET credit = ? WHERE owner_id = ? AND account_id = ?"#,
                new_credit,
                owner_credit.owner_id,
                self.account_id
            )
            .execute(transaction.as_mut())
            .await?;
        }
        Ok(())
    }
}

#[instrument(err, skip(transaction))]
async fn execute_credit_transfer(
    transaction: &mut Transaction<'_, Sqlite>,
    initiator_id: i64,
    owner_portfolio: &Portfolio,
    owned_portfolio: &Portfolio,
    new_credit: Decimal,
) -> SqlxResult<Option<MakeTransferStatus>> {
    if owner_portfolio.account_id != initiator_id
        && !owner_portfolio
            .owner_credits
            .iter()
            .any(|credit| credit.owner_id == initiator_id)
    {
        return Ok(Some(MakeTransferStatus::AccountNotOwned));
    }
    let is_shared_ownership = owned_portfolio.owner_credits.len() > 1;
    if is_shared_ownership
        && owned_portfolio
            .has_open_positions_recursive(transaction)
            .await?
    {
        return Ok(Some(
            MakeTransferStatus::SharedOwnershipAccountHasOpenPositions,
        ));
    }
    let new_credit = Text(new_credit);
    sqlx::query!(
        r#"UPDATE account_owner SET credit = ? WHERE account_id = ? AND owner_id = ?"#,
        new_credit,
        owned_portfolio.account_id,
        owner_portfolio.account_id
    )
    .execute(transaction.as_mut())
    .await?;
    Ok(None)
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

#[derive(Debug)]
pub struct TransactionInfo {
    pub id: i64,
    pub timestamp: OffsetDateTime,
}

pub enum EnsureUserCreatedStatus {
    NoNameProvidedForNewUser,
    CreatedOrUpdated { id: i64, name: String },
    Unchanged { id: i64 },
}

#[derive(Debug)]
pub struct MarketWithRedeemables {
    pub market: Market,
    pub redeemables: Vec<Redeemable>,
}

pub enum GetMarketOrdersStatus {
    Success(Vec<(Order, Vec<Size>)>),
    MarketNotFound,
}

pub enum GetMarketTradesStatus {
    Success(Vec<Trade>),
    MarketNotFound,
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
    Success { transaction_info: TransactionInfo },
    InvalidAmount,
    MarketNotRedeemable,
    MarketSettled,
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
    AccountNotFound,
    Success {
        order: Option<Order>,
        fills: Vec<OrderFill>,
        trades: Vec<Trade>,
        transaction_info: TransactionInfo,
    },
}

#[derive(Debug, Clone)]
pub struct OrderFill {
    pub id: i64,
    pub market_id: i64,
    pub owner_id: i64,
    pub size_filled: Decimal,
    pub size_remaining: Decimal,
    pub price: Decimal,
    pub side: Side,
}

#[derive(Debug)]
pub enum CreateMarketStatus {
    Success(MarketWithRedeemables),
    InvalidSettlements,
    ConstituentNotFound,
    InvalidMultiplier,
    ConstituentWithNegativePrices,
    ConstituentSettled,
}

#[derive(Debug)]
pub enum CancelOrderStatus {
    Success {
        market_id: i64,
        transaction_info: TransactionInfo,
    },
    NotOwner,
    NotFound,
}

#[derive(Debug)]
pub enum SettleMarketStatus {
    Success {
        affected_accounts: Vec<i64>,
        transaction_info: TransactionInfo,
    },
    AlreadySettled,
    NotOwner,
    InvalidSettlementPrice,
    ConstituentNotSettled,
}

#[derive(Debug)]
pub enum MakeTransferStatus {
    Success(Transfer),
    InsufficientFunds,
    InvalidAmount,
    FromAccountNotFound,
    ToAccountNotFound,
    SameAccount,
    InitiatorNotUser,
    AccountNotOwned,
    SharedOwnershipAccountHasOpenPositions,
    InsufficientCredit,
}

#[derive(Debug)]
pub struct Account {
    pub id: i64,
    pub name: String,
    pub is_user: bool,
}

#[derive(Debug, FromRow)]
pub struct Transfer {
    pub id: i64,
    pub initiator_id: i64,
    pub from_account_id: i64,
    pub to_account_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: OffsetDateTime,
    pub amount: Text<Decimal>,
    pub note: String,
}

#[derive(Debug, FromRow)]
pub struct Ownership {
    pub owner_id: i64,
    pub account_id: i64,
    pub credit: Text<Decimal>,
    pub has_open_positions: bool,
}

#[derive(Debug)]
pub enum ShareOwnershipStatus {
    Success,
    AlreadyOwner,
    NotOwner,
    OwnerNotAUser,
    RecipientNotAUser,
}

#[derive(Debug)]
pub enum CreateAccountStatus {
    Success(Account),
    NameAlreadyExists,
    EmptyName,
    InvalidOwner,
}

#[derive(Debug)]
pub struct Portfolio {
    pub account_id: i64,
    pub total_balance: Decimal,
    pub available_balance: Decimal,
    pub market_exposures: Vec<MarketExposure>,
    pub owner_credits: Vec<OwnerCredit>,
}

#[derive(Debug)]
pub struct OwnerCredit {
    pub owner_id: i64,
    pub credit: Text<Decimal>,
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

#[derive(FromRow, Debug, Clone)]
pub struct Trade {
    pub id: i64,
    pub market_id: i64,
    pub buyer_id: i64,
    pub seller_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: OffsetDateTime,
    pub price: Text<Decimal>,
    pub size: Text<Decimal>,
}

#[derive(FromRow, Debug, Clone)]
pub struct Order {
    pub id: i64,
    pub market_id: i64,
    pub owner_id: i64,
    pub transaction_id: i64,
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
pub struct Redeemable {
    pub fund_id: i64,
    pub constituent_id: i64,
    pub multiplier: i64,
}

#[derive(Debug)]
pub struct Market {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub owner_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: OffsetDateTime,
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

#[derive(Debug)]
pub struct Out {
    pub orders_affected: Vec<i64>,
    pub transaction_info: TransactionInfo,
}

#[cfg(test)]
mod tests {
    use std::{assert_matches::assert_matches, collections::HashSet};

    use itertools::Itertools;

    use super::*;

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_redeem(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };
        let redeemables = [
            websocket_api::Redeemable {
                constituent_id: 1,
                multiplier: -1,
            },
            websocket_api::Redeemable {
                constituent_id: 2,
                multiplier: 2,
            },
        ];
        let CreateMarketStatus::Success(etf_market) = db
            .create_market("etf", "etf market", 1, dec!(0), dec!(0), &redeemables)
            .await?
        else {
            panic!("expected create etf market success");
        };
        assert_eq!(etf_market.market.min_settlement.0, dec!(-20));
        assert_eq!(etf_market.market.max_settlement.0, dec!(10));
        let etf_id = etf_market.market.id;
        let redeem_status = db.redeem(2, 1, dec!(1)).await?;
        assert_matches!(redeem_status, RedeemStatus::MarketNotRedeemable);
        let redeem_status = db.redeem(etf_id, 1, dec!(1000)).await?;
        assert_matches!(redeem_status, RedeemStatus::InsufficientFunds);
        let redeem_status = db.redeem(etf_id, 1, dec!(1)).await?;
        assert_matches!(redeem_status, RedeemStatus::Success { .. });

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[
                MarketExposure {
                    market_id: 1,
                    position: Text(dec!(-1.01)),
                    min_settlement: Text(dec!(10)),
                    max_settlement: Text(dec!(20)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 2,
                    position: Text(dec!(1.98)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: etf_id,
                    position: Text(dec!(-1)),
                    min_settlement: Text(dec!(-20)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                }
            ]
        );
        // 100 - 10 - 20 * 1.01 = 69.8
        assert_eq!(a_portfolio.available_balance, dec!(69.8));
        let redeem_status = db.redeem(etf_id, 1, dec!(-1)).await?;
        assert_matches!(redeem_status, RedeemStatus::Success { .. });
        let a_portfolio = db.get_portfolio(1).await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(100));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[
                MarketExposure {
                    market_id: 1,
                    position: Text(dec!(-0.02)),
                    min_settlement: Text(dec!(10)),
                    max_settlement: Text(dec!(20)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 2,
                    position: Text(dec!(-0.04)),
                    min_settlement: Text(dec!(0)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: etf_id,
                    position: Text(dec!(0)),
                    min_settlement: Text(dec!(-20)),
                    max_settlement: Text(dec!(10)),
                    ..Default::default()
                }
            ]
        );
        // 100 - 20 * 0.02 - 0.04 * 10 = 99.2
        assert_eq!(a_portfolio.available_balance, dec!(99.2));
        let settle_status = db.settle_market(2, dec!(7), 1).await?;
        assert_matches!(settle_status, SettleMarketStatus::Success { .. });
        let redeem_status = db.redeem(etf_id, 1, dec!(-1)).await?;
        assert_matches!(redeem_status, RedeemStatus::MarketSettled);
        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_make_user_to_user_transfer(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };
        let transfer_status = db
            .make_transfer(1, 1, 2, dec!(1000), "test transfer")
            .await?;
        assert_matches!(transfer_status, MakeTransferStatus::InsufficientFunds);
        let transfer_status = db
            .make_transfer(1, 1, 2, dec!(-10), "test transfer")
            .await?;
        assert_matches!(transfer_status, MakeTransferStatus::InvalidAmount);
        let transfer_status = db.make_transfer(1, 1, 2, dec!(10), "test transfer").await?;
        assert_matches!(transfer_status, MakeTransferStatus::Success(_));

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(90));
        assert_eq!(a_portfolio.available_balance, dec!(90));

        let b_portfolio = db.get_portfolio(2).await?.unwrap();
        assert_eq!(b_portfolio.total_balance, dec!(110));
        assert_eq!(b_portfolio.available_balance, dec!(110));
        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_make_withdrawal(_pool: SqlitePool) -> SqlxResult<()> {
        // TODO: write this
        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_invalid_orders_rejected(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let order_status = db.create_order(1, 1, dec!(30), dec!(1), Side::Bid).await?;
        assert_matches!(order_status, CreateOrderStatus::InvalidPrice);

        let order_status = db
            .create_order(1, 1, dec!(15), dec!(100), Side::Bid)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InsufficientFunds);

        let order_status = db
            .create_order(1, 1, dec!(15), dec!(100), Side::Offer)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InsufficientFunds);

        let order_status = db.create_order(1, 1, dec!(15), dec!(-1), Side::Bid).await?;
        assert_matches!(order_status, CreateOrderStatus::InvalidSize);

        let order_status = db
            .create_order(1, 1, dec!(15.001), dec!(1), Side::Bid)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::InvalidPrice);

        let order_status = db
            .create_order(1, 1, dec!(15.0100), dec!(1), Side::Offer)
            .await?;
        assert_matches!(order_status, CreateOrderStatus::Success { .. });

        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_create_and_cancel_single_bid(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let order_status = db.create_order(1, 1, dec!(15), dec!(1), Side::Bid).await?;
        let CreateOrderStatus::Success {
            order: Some(order), ..
        } = order_status
        else {
            panic!("expected success order");
        };

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
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

        db.cancel_order(order.id, 1).await?;
        let all_orders = db.get_live_market_orders(1).await.unwrap();
        assert_eq!(all_orders.len(), 0);

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
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

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_create_single_offer(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let order_status = db
            .create_order(1, 1, dec!(15), dec!(1), Side::Offer)
            .await?;
        assert_matches!(
            order_status,
            CreateOrderStatus::Success { order: Some(_), .. }
        );

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
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

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_create_three_orders_one_fill(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db.create_order(1, 1, dec!(12), dec!(1), Side::Bid).await?;
        let _ = db
            .create_order(1, 1, dec!(16), dec!(1), Side::Offer)
            .await?;

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
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
            .create_order(1, 2, dec!(11), dec!(0.5), Side::Offer)
            .await?;
        let CreateOrderStatus::Success {
            trades,
            fills,
            order: None,
            ..
        } = order_status
        else {
            panic!("expected success with no order");
        };
        assert_eq!(trades.len(), 1);
        assert_eq!(fills.len(), 1);
        let trade = &trades[0];
        let fill = &fills[0];
        assert_eq!(trade.buyer_id, 1);
        assert_eq!(trade.seller_id, 2);
        assert_eq!(trade.size.0, dec!(0.5));
        assert_eq!(trade.price.0, dec!(12));
        assert_eq!(fill.size_filled, dec!(0.5));
        assert_eq!(fill.size_remaining, dec!(0.5));
        assert_eq!(fill.price, dec!(12));
        assert_matches!(fill.side, Side::Bid);

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
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

        let b_portfolio = db.get_portfolio(2).await?.unwrap();
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

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_self_fill(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db.create_order(1, 1, dec!(12), dec!(1), Side::Bid).await?;

        let order_status = db
            .create_order(1, 1, dec!(11), dec!(0.5), Side::Offer)
            .await?;

        let CreateOrderStatus::Success { trades, fills, .. } = order_status else {
            panic!("expected success with no order");
        };

        assert_eq!(trades.len(), 0);
        assert_eq!(fills.len(), 1);
        let fill = &fills[0];
        assert_eq!(fill.size_filled, dec!(0.5));
        assert_eq!(fill.size_remaining, dec!(0.5));

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
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

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_multiple_market_exposure(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db.create_order(1, 1, dec!(15), dec!(10), Side::Bid).await?;

        let order_status = db.create_order(2, 1, dec!(5), dec!(15), Side::Bid).await?;

        assert_matches!(order_status, CreateOrderStatus::InsufficientFunds);

        let _ = db.create_order(2, 1, dec!(5), dec!(10), Side::Bid).await?;

        let a_portfolio = db.get_portfolio(1).await?.unwrap();

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

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_multiple_fills_and_settle(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let _ = db.create_order(2, 1, dec!(3), dec!(1), Side::Bid).await?;
        let _ = db.create_order(2, 1, dec!(4), dec!(1), Side::Bid).await?;
        let _ = db.create_order(2, 1, dec!(5), dec!(1), Side::Bid).await?;
        let _ = db.create_order(2, 1, dec!(6), dec!(1), Side::Bid).await?;

        let order_status = db
            .create_order(2, 2, dec!(3.5), dec!(4), Side::Offer)
            .await?;

        let CreateOrderStatus::Success {
            trades,
            fills,
            order: Some(order),
            ..
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
        assert_eq!(first_trade.buyer_id, 1);
        assert_eq!(first_trade.seller_id, 2);

        assert_eq!(fills.len(), 3);
        let first_fill = &fills[0];
        assert_eq!(first_fill.size_filled, dec!(1));
        assert_eq!(first_fill.size_remaining, dec!(0));
        assert_eq!(first_fill.price, dec!(6));
        assert_matches!(first_fill.side, Side::Bid);

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
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

        let b_portfolio = db.get_portfolio(2).await?.unwrap();
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

        let market = db.settle_market(2, dec!(7), 1).await?;
        assert_matches!(market, SettleMarketStatus::Success { .. });

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(106));
        assert_eq!(a_portfolio.available_balance, dec!(106));
        assert_eq!(a_portfolio.market_exposures.len(), 0);

        let b_portfolio = db.get_portfolio(2).await?.unwrap();
        assert_eq!(b_portfolio.total_balance, dec!(94));
        assert_eq!(b_portfolio.available_balance, dec!(94));
        assert_eq!(b_portfolio.market_exposures.len(), 0);

        let all_orders = db.get_live_market_orders(2).await.unwrap();
        assert_eq!(all_orders.len(), 0);

        let GetMarketTradesStatus::Success(trades) = db.get_market_trades(2).await.unwrap() else {
            panic!("expected success order");
        };
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

    #[sqlx::test(fixtures("accounts"))]
    async fn test_create_bot_empty_name(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let status = db.create_account(1, 1, String::new()).await?;
        assert_matches!(status, CreateAccountStatus::EmptyName);

        let status = db.create_account(1, 1, "   ".into()).await?;
        assert_matches!(status, CreateAccountStatus::EmptyName);

        let status = db.create_account(1, 1, "test_bot".into()).await?;
        assert_matches!(status, CreateAccountStatus::Success(_));

        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_is_allowed_to_act_as(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        let a_owned_accounts = db.get_owned_accounts(1).await?;
        assert_eq!(a_owned_accounts, vec![1, 4, 5]);
        let b_owned_accounts = db.get_owned_accounts(2).await?;
        assert_eq!(b_owned_accounts, vec![2, 4, 5]);
        let c_owned_accounts = db.get_owned_accounts(3).await?;
        assert_eq!(c_owned_accounts, vec![3]);

        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_share_ownership(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB { pool };

        // Test successful sharing between users
        let status = db.share_ownership(1, 4, 3).await?; // a shares ab-child with c
        assert_matches!(status, ShareOwnershipStatus::Success);

        // Verify the new ownership works
        assert!(db.get_owned_accounts(3).await?.contains(&4));
        assert!(db.get_owned_accounts(3).await?.contains(&5));

        // Test sharing when already an owner
        let status = db.share_ownership(1, 4, 2).await?; // a tries to share ab-child with b who already owns it
        assert_matches!(status, ShareOwnershipStatus::AlreadyOwner);

        // Test sharing when not a direct owner
        let status = db.share_ownership(1, 5, 3).await?; // a tries to share ab-child-child but doesn't directly own it
        assert_matches!(status, ShareOwnershipStatus::NotOwner);

        // Test sharing from non-user account
        let status = db.share_ownership(4, 5, 3).await?; // ab-child tries to share ab-child-child
        assert_matches!(status, ShareOwnershipStatus::OwnerNotAUser);

        // Test sharing to non-user account
        let status = db.share_ownership(1, 4, 4).await?; // a tries to share ab-child with ab-child
        assert_matches!(status, ShareOwnershipStatus::RecipientNotAUser);

        Ok(())
    }
}
