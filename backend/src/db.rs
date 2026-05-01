use std::{
    collections::HashMap,
    env::{self},
    fmt::Display,
    path::Path,
    str::FromStr,
};

use futures::TryStreamExt;
use futures_core::stream::BoxStream;
use itertools::Itertools;
use rand::{distributions::WeightedIndex, prelude::Distribution, Rng};
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
const ARBOR_PIXIE_ACCOUNT_NAME: &str = "Arbor Pixie";

#[derive(Clone, Debug)]
pub struct DB {
    arbor_pixie_account_id: i64,
    pool: SqlitePool,
}

type SqlxResult<T> = Result<T, sqlx::Error>;

pub type ValidationResult<T> = Result<T, ValidationFailure>;

impl DB {
    #[instrument(err)]
    pub async fn init() -> anyhow::Result<Self> {
        let connection_options = SqliteConnectOptions::from_str(&env::var("DATABASE_URL")?)?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .synchronous(SqliteSynchronous::Normal)
            // Wait up to 5 seconds for locks instead of failing immediately
            .busy_timeout(std::time::Duration::from_secs(5))
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
                    }
                    Ok(true)
                })
            })
            .connect_with(connection_options)
            .await?;

        let arbor_pixie_account_id = sqlx::query_scalar!(
            r#"SELECT id as "id!: i64" FROM account WHERE name = ?"#,
            ARBOR_PIXIE_ACCOUNT_NAME
        )
        .fetch_one(&mut management_conn)
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
                }
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

        let db = Self {
            arbor_pixie_account_id,
            pool,
        };

        // Seed development data if in dev-mode
        #[cfg(feature = "dev-mode")]
        {
            if let Err(e) = crate::seed::seed_dev_data(&db, &db.pool).await {
                tracing::error!("Failed to seed development data: {:?}", e);
            }
        }

        Ok(db)
    }

    /// Creates a DB instance for testing with a pre-configured pool.
    #[cfg(feature = "dev-mode")]
    #[must_use]
    pub fn new_for_tests(arbor_pixie_account_id: i64, pool: SqlitePool) -> Self {
        Self {
            arbor_pixie_account_id,
            pool,
        }
    }

    /// Initialize a DB from a specific file path (for multi-cohort support).
    /// In dev-mode this also runs idempotent seed data.
    #[instrument(err)]
    pub async fn init_with_path(db_path: &str, create_if_missing: bool) -> anyhow::Result<Self> {
        let connection_options = SqliteConnectOptions::new()
            .filename(db_path)
            .create_if_missing(create_if_missing)
            .journal_mode(SqliteJournalMode::Wal)
            .synchronous(SqliteSynchronous::Normal)
            .busy_timeout(std::time::Duration::from_secs(5))
            .optimize_on_close(true, None)
            .pragma("optimize", "0x10002")
            .pragma("wal_autocheckpoint", "0");

        // Create pool first, then run migrations through it.
        // This avoids holding a raw SqliteConnection across await points,
        // which would make this future !Send.
        let (release_tx, release_rx) = tokio::sync::broadcast::channel(1);

        let pool = SqlitePoolOptions::new()
            .min_connections(8)
            .max_connections(64)
            .after_release(move |_, _| {
                let release_tx = release_tx.clone();
                Box::pin(async move {
                    if let Err(e) = release_tx.send(()) {
                        tracing::error!("release_tx.send failed: {:?}", e);
                    }
                    Ok(true)
                })
            })
            .connect_with(connection_options.clone())
            .await?;

        let mut migrator = sqlx::migrate::Migrator::new(Path::new("./migrations")).await?;
        migrator
            .set_ignore_missing(true)
            .run(&pool)
            .await?;

        let arbor_pixie_account_id: i64 = sqlx::query_scalar(
            r"SELECT id FROM account WHERE name = ?",
        )
        .bind(ARBOR_PIXIE_ACCOUNT_NAME)
        .fetch_one(&pool)
        .await?;

        // Checkpoint task: create a dedicated connection inside the spawned task
        let checkpoint_options = connection_options;
        tokio::spawn(async move {
            let mut management_conn =
                match SqliteConnection::connect_with(&checkpoint_options).await {
                    Ok(conn) => conn,
                    Err(e) => {
                        tracing::error!("Failed to create checkpoint connection: {e}");
                        return;
                    }
                };
            let mut release_rx = release_rx;
            let mut released_connections: i64 = 0;
            let mut remaining_pages: i64 = 0;
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
                }
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

        let db = Self {
            arbor_pixie_account_id,
            pool,
        };

        // Seed development data if in dev-mode. The seed function is idempotent
        // (checks for existing data) so it's safe to call on every startup.
        #[cfg(feature = "dev-mode")]
        {
            if let Err(e) = crate::seed::seed_dev_data(&db, &db.pool).await {
                tracing::error!("Failed to seed development data: {:?}", e);
            }
        }

        Ok(db)
    }

    #[instrument(err, skip(self))]
    pub async fn get_account(&self, account_id: i64) -> SqlxResult<Option<Account>> {
        sqlx::query_as!(
            Account,
            r#"
                SELECT
                    id,
                    name,
                    (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL) AS "is_user: bool",
                    universe_id,
                    color
                FROM account
                WHERE id = ?
            "#,
            account_id
        )
        .fetch_optional(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn redeem(
        &self,
        redeemer_id: i64,
        redeem: websocket_api::Redeem,
    ) -> SqlxResult<ValidationResult<Redeemed>> {
        let Ok(amount) = Decimal::try_from(redeem.amount) else {
            return Ok(Err(ValidationFailure::InvalidAmount));
        };
        let fund_id = redeem.fund_id;
        if amount.scale() > 2 || amount.is_zero() {
            return Ok(Err(ValidationFailure::InvalidAmount));
        }
        let (mut transaction, transaction_info) = self.begin_write().await?;
        let redeemables = sqlx::query!(
            r#"
                SELECT
                    *
                FROM "redeemable"
                WHERE "fund_id" = ?
            "#,
            fund_id
        )
        .fetch_all(transaction.as_mut())
        .await?;
        if redeemables.is_empty() {
            return Ok(Err(ValidationFailure::MarketNotRedeemable));
        }

        let settled = sqlx::query_scalar!(
            r#"
                SELECT EXISTS (
                    SELECT 1
                    FROM market
                    JOIN redeemable ON (market.id = fund_id OR market.id = constituent_id)
                    WHERE fund_id = ? AND settled_price IS NOT NULL
                ) AS "exists!: bool"
            "#,
            fund_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if settled {
            return Ok(Err(ValidationFailure::MarketSettled));
        }

        let fund_position_change = -amount;
        let amount = Text(amount);
        sqlx::query!(
            r#"
                INSERT INTO "redemption" (
                    "redeemer_id",
                    "fund_id",
                    "transaction_id",
                    "amount"
                )
                VALUES (?, ?, ?, ?)
            "#,
            redeemer_id,
            fund_id,
            transaction_info.id,
            amount
        )
        .execute(transaction.as_mut())
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
            r#"
                INSERT INTO exposure_cache (
                    account_id,
                    market_id,
                    position,
                    total_bid_size,
                    total_offer_size,
                    total_bid_value,
                    total_offer_value
                ) VALUES (?, ?, ?, '0', '0', '0', '0')
                ON CONFLICT DO UPDATE SET position = ?
            "#,
            redeemer_id,
            fund_id,
            new_fund_position,
            new_fund_position
        )
        .execute(transaction.as_mut())
        .await?;

        for redeemable in redeemables {
            let constituent_position_change = amount.0 * Decimal::from(redeemable.multiplier);
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
                r#"
                    INSERT INTO exposure_cache (
                        account_id,
                        market_id,
                        position,
                        total_bid_size,
                        total_offer_size,
                        total_bid_value,
                        total_offer_value
                    ) VALUES (?, ?, ?, '0', '0', '0', '0')
                    ON CONFLICT DO UPDATE SET position = ?
                "#,
                redeemer_id,
                redeemable.constituent_id,
                new_exposure,
                new_exposure
            )
            .execute(transaction.as_mut())
            .await?;
        }

        let Text(redeem_fee) = sqlx::query_scalar!(
            r#"SELECT redeem_fee as "redeem_fee: Text<Decimal>" FROM market WHERE id = ?"#,
            fund_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let Some(portfolio) = get_portfolio(&mut transaction, redeemer_id).await? else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };
        if portfolio.available_balance < redeem_fee {
            return Ok(Err(ValidationFailure::InsufficientFunds));
        }

        let new_balance = Text(portfolio.total_balance - redeem_fee);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            new_balance,
            redeemer_id,
        )
        .execute(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(Redeemed {
            account_id: redeemer_id,
            fund_id,
            amount,
            transaction_info,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn exercise_option(
        &self,
        exerciser_id: i64,
        exercise: websocket_api::ExerciseOption,
    ) -> SqlxResult<ValidationResult<OptionExerciseResult>> {
        let Ok(amount) = Decimal::try_from(exercise.amount) else {
            return Ok(Err(ValidationFailure::InvalidAmount));
        };
        let amount = amount.normalize();
        if amount.is_zero() || amount.is_sign_negative() || amount.scale() > 2 {
            return Ok(Err(ValidationFailure::InvalidAmount));
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

        // Fetch the contract
        let contract = sqlx::query!(
            r#"
                SELECT
                    id,
                    option_market_id,
                    buyer_id,
                    writer_id,
                    remaining_amount as "remaining_amount: Text<Decimal>"
                FROM option_contract
                WHERE id = ?
            "#,
            exercise.contract_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(contract) = contract else {
            return Ok(Err(ValidationFailure::ContractNotFound));
        };

        if contract.buyer_id != exerciser_id {
            return Ok(Err(ValidationFailure::NotContractBuyer));
        }
        if contract.option_market_id != exercise.option_market_id {
            return Ok(Err(ValidationFailure::ContractNotFound));
        }
        if amount > contract.remaining_amount.0 {
            return Ok(Err(ValidationFailure::InvalidAmount));
        }

        let writer_id = contract.writer_id;

        // Fetch the option market info
        let option = sqlx::query!(
            r#"
                SELECT
                    underlying_market_id,
                    strike_price as "strike_price: Text<Decimal>",
                    is_call as "is_call: bool",
                    expiration_date as "expiration_date: OffsetDateTime"
                FROM option_market
                WHERE market_id = ?
            "#,
            exercise.option_market_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(option) = option else {
            return Ok(Err(ValidationFailure::NotOptionMarket));
        };

        // Check if option market is settled
        let option_settled = sqlx::query_scalar!(
            r#"SELECT settled_price IS NOT NULL as "settled: bool" FROM market WHERE id = ?"#,
            exercise.option_market_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        if option_settled {
            return Ok(Err(ValidationFailure::MarketSettled));
        }

        // Check underlying market settled status
        let underlying_settled_price = sqlx::query_scalar!(
            r#"SELECT settled_price as "settled_price: Text<Decimal>" FROM market WHERE id = ?"#,
            option.underlying_market_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let is_cash_settled = underlying_settled_price.is_some();

        // Determine exercise type
        if !is_cash_settled {
            // Physical exercise: check expiration
            if let Some(expiration) = option.expiration_date {
                if transaction_info.timestamp > expiration {
                    return Ok(Err(ValidationFailure::OptionExpired));
                }
            }
        }
        // Cash exercise (underlying settled) is always allowed regardless of expiration

        let strike = option.strike_price.0;
        let amount_text = Text(amount);

        // Update option market positions for both parties
        // Exerciser: position decreases by amount
        let Text(exerciser_option_pos) = sqlx::query_scalar!(
            r#"SELECT position as "position: Text<Decimal>" FROM exposure_cache WHERE account_id = ? AND market_id = ?"#,
            exerciser_id,
            exercise.option_market_id,
        )
        .fetch_optional(transaction.as_mut())
        .await?
        .unwrap_or_default();
        let new_exerciser_option_pos = Text(exerciser_option_pos - amount);
        sqlx::query!(
            r#"
                INSERT INTO exposure_cache (account_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value)
                VALUES (?, ?, ?, '0', '0', '0', '0')
                ON CONFLICT DO UPDATE SET position = ?
            "#,
            exerciser_id,
            exercise.option_market_id,
            new_exerciser_option_pos,
            new_exerciser_option_pos
        )
        .execute(transaction.as_mut())
        .await?;

        // Writer: position increases by amount
        let Text(writer_option_pos) = sqlx::query_scalar!(
            r#"SELECT position as "position: Text<Decimal>" FROM exposure_cache WHERE account_id = ? AND market_id = ?"#,
            writer_id,
            exercise.option_market_id,
        )
        .fetch_optional(transaction.as_mut())
        .await?
        .unwrap_or_default();
        let new_writer_option_pos = Text(writer_option_pos + amount);
        sqlx::query!(
            r#"
                INSERT INTO exposure_cache (account_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value)
                VALUES (?, ?, ?, '0', '0', '0', '0')
                ON CONFLICT DO UPDATE SET position = ?
            "#,
            writer_id,
            exercise.option_market_id,
            new_writer_option_pos,
            new_writer_option_pos
        )
        .execute(transaction.as_mut())
        .await?;

        // Calculate cash transfer and update underlying positions
        let (exerciser_cash_change, exerciser_underlying_change) = if is_cash_settled {
            // Cash exercise: transfer intrinsic value
            let settled = underlying_settled_price.unwrap().0;
            let intrinsic = if option.is_call {
                Decimal::ZERO.max(settled - strike)
            } else {
                Decimal::ZERO.max(strike - settled)
            };
            (amount * intrinsic, Decimal::ZERO)
        } else {
            // Physical exercise
            if option.is_call {
                // Call: exerciser pays strike, gets underlying
                (-amount * strike, amount)
            } else {
                // Put: exerciser receives strike, gives underlying
                (amount * strike, -amount)
            }
        };

        let writer_cash_change = -exerciser_cash_change;
        let writer_underlying_change = -exerciser_underlying_change;

        // Update underlying positions (physical exercise only)
        if !is_cash_settled {
            // Exerciser underlying position
            let Text(exerciser_underlying_pos) = sqlx::query_scalar!(
                r#"SELECT position as "position: Text<Decimal>" FROM exposure_cache WHERE account_id = ? AND market_id = ?"#,
                exerciser_id,
                option.underlying_market_id,
            )
            .fetch_optional(transaction.as_mut())
            .await?
            .unwrap_or_default();
            let new_exerciser_underlying_pos = Text(exerciser_underlying_pos + exerciser_underlying_change);
            sqlx::query!(
                r#"
                    INSERT INTO exposure_cache (account_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value)
                    VALUES (?, ?, ?, '0', '0', '0', '0')
                    ON CONFLICT DO UPDATE SET position = ?
                "#,
                exerciser_id,
                option.underlying_market_id,
                new_exerciser_underlying_pos,
                new_exerciser_underlying_pos
            )
            .execute(transaction.as_mut())
            .await?;

            // Writer underlying position
            let Text(writer_underlying_pos) = sqlx::query_scalar!(
                r#"SELECT position as "position: Text<Decimal>" FROM exposure_cache WHERE account_id = ? AND market_id = ?"#,
                writer_id,
                option.underlying_market_id,
            )
            .fetch_optional(transaction.as_mut())
            .await?
            .unwrap_or_default();
            let new_writer_underlying_pos = Text(writer_underlying_pos + writer_underlying_change);
            sqlx::query!(
                r#"
                    INSERT INTO exposure_cache (account_id, market_id, position, total_bid_size, total_offer_size, total_bid_value, total_offer_value)
                    VALUES (?, ?, ?, '0', '0', '0', '0')
                    ON CONFLICT DO UPDATE SET position = ?
                "#,
                writer_id,
                option.underlying_market_id,
                new_writer_underlying_pos,
                new_writer_underlying_pos
            )
            .execute(transaction.as_mut())
            .await?;
        }

        // Update cash balances
        let Text(exerciser_balance) = sqlx::query_scalar!(
            r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
            exerciser_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        let new_exerciser_balance = Text(exerciser_balance + exerciser_cash_change);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            new_exerciser_balance,
            exerciser_id,
        )
        .execute(transaction.as_mut())
        .await?;

        let Text(writer_balance) = sqlx::query_scalar!(
            r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
            writer_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        let new_writer_balance = Text(writer_balance + writer_cash_change);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            new_writer_balance,
            writer_id,
        )
        .execute(transaction.as_mut())
        .await?;

        // Check available balance for both parties
        let Some(exerciser_portfolio) = get_portfolio(&mut transaction, exerciser_id).await? else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };
        if exerciser_portfolio.available_balance.is_sign_negative() {
            return Ok(Err(ValidationFailure::InsufficientFunds));
        }

        let Some(writer_portfolio) = get_portfolio(&mut transaction, writer_id).await? else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };
        if writer_portfolio.available_balance.is_sign_negative() {
            return Ok(Err(ValidationFailure::InsufficientFunds));
        }

        // Update contract remaining amount
        let new_remaining = Text(contract.remaining_amount.0 - amount);
        sqlx::query!(
            r#"UPDATE option_contract SET remaining_amount = ? WHERE id = ?"#,
            new_remaining,
            contract.id,
        )
        .execute(transaction.as_mut())
        .await?;

        // Record the exercise
        let is_cash_settled_db = is_cash_settled;
        sqlx::query!(
            r#"
                INSERT INTO option_exercise (option_market_id, contract_id, exerciser_id, counterparty_id, amount, transaction_id, is_cash_settled)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            exercise.option_market_id,
            contract.id,
            exerciser_id,
            writer_id,
            amount_text,
            transaction_info.id,
            is_cash_settled_db,
        )
        .execute(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(OptionExerciseResult {
            option_market_id: exercise.option_market_id,
            exerciser_id,
            counterparty_id: writer_id,
            amount: Text(amount),
            is_cash_settled,
            contract_id: contract.id,
            transaction_info,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn get_option_contracts(
        &self,
        market_id: i64,
        account_id: i64,
    ) -> SqlxResult<Vec<OptionContract>> {
        sqlx::query_as!(
            OptionContract,
            r#"
                SELECT
                    id as "id!",
                    option_market_id as "option_market_id!",
                    buyer_id as "buyer_id!",
                    writer_id as "writer_id!",
                    remaining_amount as "remaining_amount: _"
                FROM option_contract
                WHERE option_market_id = ?
                AND (buyer_id = ? OR writer_id = ?)
                AND CAST(remaining_amount AS REAL) > 0
            "#,
            market_id,
            account_id,
            account_id,
        )
        .fetch_all(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn market_has_hide_account_ids(&self, market_id: i64) -> SqlxResult<bool> {
        sqlx::query_scalar!(
            r#"SELECT hide_account_ids as "hide_account_ids!: bool" FROM market WHERE id = ?"#,
            market_id
        )
        .fetch_one(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn create_account(
        &self,
        user_id: i64,
        create_account: websocket_api::CreateAccount,
    ) -> SqlxResult<ValidationResult<Account>> {
        let owner_id = create_account.owner_id;
        let account_name = create_account.name;
        if account_name.trim().is_empty() {
            return Ok(Err(ValidationFailure::EmptyName));
        }

        let universe_id = create_account.universe_id;
        let initial_balance = create_account.initial_balance;
        let color = match create_account.color {
            Some(color) => {
                let trimmed = color.trim();
                if trimmed.is_empty() {
                    None
                } else if is_valid_account_color(trimmed) {
                    Some(trimmed.to_ascii_lowercase())
                } else {
                    return Ok(Err(ValidationFailure::InvalidAccountColor));
                }
            }
            None => None,
        };

        let mut transaction = self.pool.begin().await?;

        // Validate universe exists
        let universe_owner = sqlx::query_scalar!(
            r#"SELECT owner_id FROM universe WHERE id = ?"#,
            universe_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(universe_owner) = universe_owner else {
            return Ok(Err(ValidationFailure::UniverseNotFound));
        };

        // For non-main universes, only the universe owner can create accounts
        // (they can then share ownership to give others access)
        if universe_id != 0 {
            let user_owns_universe = universe_owner == Some(user_id);
            if !user_owns_universe {
                return Ok(Err(ValidationFailure::NotUniverseOwner));
            }
        }

        // For main universe, initial_balance must be 0 (no one owns it)
        if universe_id == 0 && initial_balance > 0.0 {
            return Ok(Err(ValidationFailure::NotUniverseOwner));
        }

        let balance = initial_balance.to_string();
        let color_for_insert = color.clone().unwrap_or_default();
        let result = sqlx::query_scalar!(
            r#"
                INSERT INTO account (name, balance, universe_id, color)
                VALUES (?, ?, ?, ?)
                RETURNING id
            "#,
            account_name,
            balance,
            universe_id,
            color_for_insert
        )
        .fetch_one(transaction.as_mut())
        .await;

        let is_valid_owner = owner_id == user_id
            || sqlx::query_scalar!(
                r#"
                    SELECT EXISTS(
                        SELECT 1
                        FROM account_owner
                        WHERE account_id = ? AND owner_id = ?
                    ) as "exists!: bool"
                "#,
                owner_id,
                user_id
            )
            .fetch_one(transaction.as_mut())
            .await?;

        if !is_valid_owner {
            return Ok(Err(ValidationFailure::InvalidOwner));
        }

        // Owner must be in universe 0 or in the same universe as the new account
        let (owner_universe, owner_is_user) = sqlx::query_as::<_, (i64, bool)>(
            r#"SELECT universe_id, (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL) as "is_user" FROM account WHERE id = ?"#,
        )
        .bind(owner_id)
        .fetch_one(transaction.as_mut())
        .await?;

        if owner_universe != 0 && owner_universe != universe_id {
            return Ok(Err(ValidationFailure::OwnerInDifferentUniverse));
        }

        // If creating account in non-zero universe with owner from universe 0,
        // the owner must be a user account (not an alt account)
        if universe_id != 0 && owner_universe == 0 && !owner_is_user {
            return Ok(Err(ValidationFailure::OwnerMustBeUser));
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

                Ok(Ok(Account {
                    id: account_id,
                    name: account_name,
                    is_user: false,
                    universe_id,
                    color,
                }))
            }
            Err(sqlx::Error::Database(db_err)) => {
                if db_err.message().contains("UNIQUE constraint failed") {
                    transaction.rollback().await?;
                    Ok(Err(ValidationFailure::NameAlreadyExists))
                } else {
                    Err(sqlx::Error::Database(db_err))
                }
            }
            Err(e) => Err(e),
        }
    }

    #[instrument(err, skip(self))]
    pub async fn create_universe(
        &self,
        owner_id: i64,
        name: String,
        description: String,
    ) -> SqlxResult<ValidationResult<Universe>> {
        if name.trim().is_empty() {
            return Ok(Err(ValidationFailure::EmptyName));
        }

        let result = sqlx::query_as!(
            Universe,
            r#"
                INSERT INTO universe (name, description, owner_id)
                VALUES (?, ?, ?)
                RETURNING id, name, description, owner_id
            "#,
            name,
            description,
            owner_id
        )
        .fetch_one(&self.pool)
        .await;

        match result {
            Ok(universe) => Ok(Ok(universe)),
            Err(sqlx::Error::Database(db_err)) => {
                if db_err.message().contains("UNIQUE constraint failed") {
                    Ok(Err(ValidationFailure::UniverseNameExists))
                } else {
                    Err(sqlx::Error::Database(db_err))
                }
            }
            Err(e) => Err(e),
        }
    }

    #[instrument(err, skip(self))]
    pub async fn get_all_universes(&self) -> SqlxResult<Vec<Universe>> {
        sqlx::query_as!(
            Universe,
            r#"SELECT id, name, description, owner_id FROM universe ORDER BY id"#
        )
        .fetch_all(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn get_accessible_universes(&self, user_id: i64) -> SqlxResult<Vec<Universe>> {
        // User can access universes they own OR universes that contain accounts they own
        sqlx::query_as!(
            Universe,
            r#"
                SELECT DISTINCT u.id, u.name, u.description, u.owner_id
                FROM universe u
                WHERE u.owner_id = ?
                   OR u.id IN (
                       SELECT a.universe_id
                       FROM account a
                       WHERE a.id = ?
                          OR a.id IN (
                              SELECT ao.account_id
                              FROM account_owner ao
                              WHERE ao.owner_id = ?
                          )
                   )
                ORDER BY u.id
            "#,
            user_id,
            user_id,
            user_id
        )
        .fetch_all(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn get_account_universe_id(&self, account_id: i64) -> SqlxResult<Option<i64>> {
        sqlx::query_scalar!(
            r#"SELECT universe_id FROM account WHERE id = ?"#,
            account_id
        )
        .fetch_optional(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn get_market_universe_id(&self, market_id: i64) -> SqlxResult<Option<i64>> {
        sqlx::query_scalar!(
            r#"SELECT universe_id FROM market WHERE id = ?"#,
            market_id
        )
        .fetch_optional(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn share_ownership(
        &self,
        existing_owner_id: i64,
        share_ownership: websocket_api::ShareOwnership,
    ) -> SqlxResult<ValidationResult<()>> {
        let of_account_id = share_ownership.of_account_id;
        let to_account_id = share_ownership.to_account_id;
        let owner_is_user = sqlx::query_scalar!(
            r#"
                SELECT EXISTS (
                    SELECT 1
                    FROM account
                    WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
                ) AS "exists!: bool"
            "#,
            existing_owner_id
        )
        .fetch_one(&self.pool)
        .await?;

        if !owner_is_user {
            return Ok(Err(ValidationFailure::OwnerNotAUser));
        }

        let is_direct_owner = sqlx::query_scalar!(
            r#"
                SELECT EXISTS(
                    SELECT 1
                    FROM account_owner
                    WHERE owner_id = ? AND account_id = ?
                ) as "exists!: bool"
            "#,
            existing_owner_id,
            of_account_id
        )
        .fetch_one(&self.pool)
        .await?;

        if !is_direct_owner {
            return Ok(Err(ValidationFailure::NotOwner));
        }

        let recipient_is_user = sqlx::query_scalar!(
            r#"
                SELECT EXISTS(
                    SELECT 1
                    FROM account
                    WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
                ) as "exists!: bool"
            "#,
            to_account_id
        )
        .fetch_one(&self.pool)
        .await?;

        if !recipient_is_user {
            return Ok(Err(ValidationFailure::RecipientNotAUser));
        }
        let res = sqlx::query!(
            r#"INSERT INTO account_owner (account_id, owner_id) VALUES (?, ?) ON CONFLICT DO NOTHING"#,
            of_account_id,
            to_account_id
        )
        .execute(&self.pool)
        .await?;
        if res.rows_affected() == 0 {
            Ok(Err(ValidationFailure::AlreadyOwner))
        } else {
            Ok(Ok(()))
        }
    }

    #[instrument(err, skip(self))]
    pub async fn revoke_ownership(
        &self,
        revoke_ownership: websocket_api::RevokeOwnership,
    ) -> SqlxResult<ValidationResult<()>> {
        let of_account_id = revoke_ownership.of_account_id;
        let from_account_id = revoke_ownership.from_account_id;

        let (mut transaction, _transaction_info) = self.begin_write().await?;

        let exrecipient_is_user = sqlx::query_scalar!(
            r#"
                SELECT EXISTS(
                    SELECT 1
                    FROM account
                    WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
                ) as "exists!: bool"
            "#,
            from_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if !exrecipient_is_user {
            return Ok(Err(ValidationFailure::RecipientNotAUser));
        }

        let ownership_exists = sqlx::query_scalar!(
            r#"
                SELECT EXISTS(
                    SELECT 1
                    FROM account_owner
                    WHERE account_id = ? AND owner_id = ?
                ) as "exists!: bool"
            "#,
            of_account_id,
            from_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if !ownership_exists {
            return Ok(Err(ValidationFailure::AccountNotShared));
        }

        let Some(portfolio) = get_portfolio_with_credits(&mut transaction, of_account_id).await?
        else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };

        if let Some(credit) = portfolio
            .owner_credits
            .iter()
            .find(|credit| credit.owner_id == from_account_id)
        {
            if !credit.credit.0.is_zero() {
                return Ok(Err(ValidationFailure::CreditRemaining));
            }
        }

        sqlx::query!(
            r#"
                DELETE FROM account_owner
                WHERE owner_id = ? AND account_id = ?
            "#,
            from_account_id,
            of_account_id
        )
        .execute(transaction.as_mut())
        .await?;

        transaction.commit().await?;

        Ok(Ok(()))
    }

    #[instrument(err, skip(self))]
    pub async fn get_owned_accounts(&self, user_id: i64) -> SqlxResult<Vec<i64>> {
        sqlx::query_scalar!(
            r#"
                SELECT ao2.account_id AS "account_id!"
                FROM account_owner ao1
                JOIN account_owner ao2 ON ao1.account_id = ao2.owner_id
                WHERE ao1.owner_id = ?
                UNION
                SELECT account_id
                FROM account_owner
                WHERE owner_id = ?
                UNION
                SELECT ?
            "#,
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
    ) -> SqlxResult<ValidationResult<EnsureUserCreatedSuccess>> {
        let balance = Text(initial_balance);
        let mut transaction = self.pool.begin().await?;

        // First try to find user by kinde_id
        let existing_user = sqlx::query!(
            r#"
                SELECT id AS "id!", name
                FROM account
                WHERE kinde_id = ?
            "#,
            kinde_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        if let Some(user) = existing_user {
            transaction.commit().await?;
            return Ok(Ok(EnsureUserCreatedSuccess {
                id: user.id,
                name: None,
            }));
        }

        let Some(requested_name) = requested_name else {
            transaction.commit().await?;
            return Ok(Err(ValidationFailure::NoNameProvidedForNewUser));
        };

        let conflicting_account = sqlx::query!(
            r#"
                SELECT id
                FROM account
                WHERE name = ? AND (kinde_id != ? OR kinde_id IS NULL)
            "#,
            requested_name,
            kinde_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let final_name = if conflicting_account.is_some() {
            format!("{}-{}", requested_name, &kinde_id[3..10])
        } else {
            requested_name.to_string()
        };

        sqlx::query!(
            r#"
                INSERT INTO account (kinde_id, name, balance)
                VALUES (?, ?, ?)
            "#,
            kinde_id,
            final_name,
            balance,
        )
        .execute(transaction.as_mut())
        .await?;

        let id = sqlx::query_scalar!(
            r#"
                SELECT id AS "id!: i64"
                FROM account
                WHERE kinde_id = ?
            "#,
            kinde_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(EnsureUserCreatedSuccess {
            id,
            name: Some(final_name),
        }))
    }

    /// Ensure a user exists in this cohort DB by `global_user_id`.
    /// Used in multi-cohort mode where the global DB tracks the user identity.
    ///
    /// When `email` is provided and no account matches `global_user_id` yet, also
    /// checks for a preregistered account (see
    /// [`Self::create_preregistered_account_if_missing`]) with that email and
    /// promotes it by setting its `global_user_id`. This is what keeps
    /// preregistered rows from orphaning at first login.
    ///
    /// On first creation, if `requested_name` is already taken in this cohort, the
    /// smallest `-N` suffix (N >= 2) that's still available is appended.
    #[instrument(err, skip(self))]
    pub async fn ensure_user_created_by_global_id(
        &self,
        global_user_id: i64,
        email: Option<&str>,
        requested_name: &str,
        initial_balance: Decimal,
    ) -> SqlxResult<ValidationResult<EnsureUserCreatedSuccess>> {
        let balance = Text(initial_balance);

        let existing_user = sqlx::query!(
            r#"
                SELECT id AS "id!", name
                FROM account
                WHERE global_user_id = ?
            "#,
            global_user_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(user) = existing_user {
            return Ok(Ok(EnsureUserCreatedSuccess {
                id: user.id,
                name: None,
            }));
        }

        // Preregistered by email: promote the existing row rather than creating a
        // second account. The display name stays as it was (user can rename later).
        if let Some(email) = email {
            let preregistered = sqlx::query!(
                r#"
                    SELECT id AS "id!"
                    FROM account
                    WHERE email = ? AND global_user_id IS NULL
                "#,
                email
            )
            .fetch_optional(&self.pool)
            .await?;

            if let Some(row) = preregistered {
                sqlx::query!(
                    r#"UPDATE account SET global_user_id = ? WHERE id = ?"#,
                    global_user_id,
                    row.id
                )
                .execute(&self.pool)
                .await?;
                return Ok(Ok(EnsureUserCreatedSuccess {
                    id: row.id,
                    name: None,
                }));
            }
        }

        // Arbor Pixie hardcode: when the scenarios M2M auths into a cohort that
        // pre-dates the global_user model, the existing "Arbor Pixie" account row
        // has no global_user_id. Claim it instead of inserting a suffixed
        // "Arbor Pixie-xyz" twin, so the historical positions / team account
        // ownerships keep flowing through the same row. Triggered only by the
        // exact name "Arbor Pixie", which the auth layer sets when it recognises
        // ARBOR_PIXIE_M2M_CLIENT_ID — regular users never reach this path with
        // that name.
        if requested_name == ARBOR_PIXIE_ACCOUNT_NAME {
            let unclaimed = sqlx::query!(
                r#"
                    SELECT id AS "id!"
                    FROM account
                    WHERE name = ? AND global_user_id IS NULL
                "#,
                ARBOR_PIXIE_ACCOUNT_NAME
            )
            .fetch_optional(&self.pool)
            .await?;

            if let Some(row) = unclaimed {
                sqlx::query!(
                    r#"UPDATE account SET global_user_id = ? WHERE id = ?"#,
                    global_user_id,
                    row.id
                )
                .execute(&self.pool)
                .await?;
                return Ok(Ok(EnsureUserCreatedSuccess {
                    id: row.id,
                    name: None,
                }));
            }
        }

        let final_name = match self
            .suggest_cohort_account_name(requested_name, None)
            .await?
        {
            Ok(name) => name,
            Err(failure) => return Ok(Err(failure)),
        };

        let id = sqlx::query_scalar!(
            r#"
                INSERT INTO account (global_user_id, name, balance)
                VALUES (?, ?, ?)
                RETURNING id
            "#,
            global_user_id,
            final_name,
            balance,
        )
        .fetch_one(&self.pool)
        .await?;
        Ok(Ok(EnsureUserCreatedSuccess {
            id,
            name: Some(final_name),
        }))
    }

    /// Insert a placeholder `account` row for a preregistered cohort member who has
    /// not yet signed in. The row carries only an email — no `kinde_id`, no
    /// `global_user_id`. It is treated as `is_user = true` by the account query's
    /// computed column (so the member is immediately visible in transfer pickers,
    /// scenarios, etc.) and gets its `global_user_id` backfilled on the user's
    /// first login via [`Self::ensure_user_created_by_global_id`].
    ///
    /// Idempotent: returns `Ok(None)` when an account with this email already
    /// exists (preregistered or linked).
    ///
    /// # Errors
    /// Returns a database error, or `NameSuffixExhausted` if all dedup suffixes
    /// for the email's local part are taken.
    #[instrument(err, skip(self))]
    pub async fn create_preregistered_account_if_missing(
        &self,
        email: &str,
        initial_balance: Decimal,
    ) -> SqlxResult<ValidationResult<Option<(i64, String)>>> {
        let existing = sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM account WHERE email = ?) as "exists!: bool""#,
            email
        )
        .fetch_one(&self.pool)
        .await?;

        if existing {
            return Ok(Ok(None));
        }

        let name_base = email.split('@').next().unwrap_or(email);
        let final_name = match self.suggest_cohort_account_name(name_base, None).await? {
            Ok(name) => name,
            Err(failure) => return Ok(Err(failure)),
        };

        let balance = Text(initial_balance);
        let id = sqlx::query_scalar!(
            r#"
                INSERT INTO account (name, balance, email)
                VALUES (?, ?, ?)
                RETURNING id
            "#,
            final_name,
            balance,
            email,
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(Ok(Some((id, final_name))))
    }

    /// Probe `base`, then `base-2`, `base-3`, ..., up to `base-999`, returning the
    /// first cohort-local `account.name` that is still available. When
    /// `exclude_account_id` is `Some(id)`, rows with `account.id = id` do not count
    /// as a conflict — use this so a user renaming themselves doesn't race their
    /// own current row.
    ///
    /// # Errors
    /// Returns a database error, or `NameSuffixExhausted` if `base-2..=base-999`
    /// are all taken.
    pub async fn suggest_cohort_account_name(
        &self,
        base: &str,
        exclude_account_id: Option<i64>,
    ) -> SqlxResult<ValidationResult<String>> {
        for suffix in std::iter::once(0u32).chain(2..=999u32) {
            let candidate = if suffix == 0 {
                base.to_string()
            } else {
                format!("{base}-{suffix}")
            };
            let row = sqlx::query_scalar!(
                r#"
                    SELECT id AS "id!"
                    FROM account
                    WHERE name = ?
                    LIMIT 1
                "#,
                candidate
            )
            .fetch_optional(&self.pool)
            .await?;
            match (row, exclude_account_id) {
                (None, _) => return Ok(Ok(candidate)),
                (Some(id), Some(excluded)) if id == excluded => return Ok(Ok(candidate)),
                _ => {}
            }
        }
        Ok(Err(ValidationFailure::NameSuffixExhausted))
    }

    /// Look up a user account by `global_user_id`. Returns `(id, name)` of the
    /// caller's cohort-local account, or `None` if they don't have one yet.
    ///
    /// # Errors
    /// Returns a database error.
    pub async fn get_user_account_by_global_user_id(
        &self,
        global_user_id: i64,
    ) -> SqlxResult<Option<(i64, String)>> {
        let row = sqlx::query!(
            r#"
                SELECT id AS "id!", name
                FROM account
                WHERE global_user_id = ?
            "#,
            global_user_id
        )
        .fetch_optional(&self.pool)
        .await?;
        Ok(row.map(|r| (r.id, r.name)))
    }

    /// Rename an existing account. Returns `NameAlreadyExists` if the target name
    /// would violate the cohort-local `account.name UNIQUE` constraint.
    ///
    /// # Errors
    /// Returns a database error, or `NameAlreadyExists` via `ValidationResult`.
    pub async fn rename_user_account(
        &self,
        account_id: i64,
        new_name: &str,
    ) -> SqlxResult<ValidationResult<()>> {
        let result = sqlx::query!(
            r#"
                UPDATE account
                SET name = ?
                WHERE id = ?
            "#,
            new_name,
            account_id,
        )
        .execute(&self.pool)
        .await;

        match result {
            Ok(_) => Ok(Ok(())),
            Err(sqlx::Error::Database(db_err))
                if db_err.message().contains("UNIQUE constraint failed") =>
            {
                Ok(Err(ValidationFailure::NameAlreadyExists))
            }
            Err(e) => Err(e),
        }
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

    /// Get all market IDs an account has ever traded in or redeemed from.
    ///
    /// # Errors
    /// Returns an error if the database query fails.
    pub async fn get_traded_market_ids(&self, account_id: i64) -> SqlxResult<Vec<i64>> {
        let rows = sqlx::query_scalar!(
            r#"
                SELECT DISTINCT market_id as "market_id!"
                FROM (
                    SELECT market_id FROM trade WHERE buyer_id = ?1
                    UNION
                    SELECT market_id FROM trade WHERE seller_id = ?1
                    UNION
                    SELECT fund_id AS market_id FROM redemption WHERE redeemer_id = ?1
                )
            "#,
            account_id
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    #[must_use]
    pub fn get_all_accounts(&self) -> BoxStream<'_, SqlxResult<Account>> {
        sqlx::query_as!(
            Account,
            r#"SELECT id, name, (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL) as "is_user: bool", universe_id, color FROM account"#
        )
        .fetch(&self.pool)
    }

    /// Get all accounts with `kinde_id` but without `global_user_id` (legacy accounts).
    /// Used during migration from single-DB to multi-cohort mode.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_legacy_kinde_users(&self) -> SqlxResult<Vec<(i64, String, String)>> {
        sqlx::query_as::<_, (i64, String, String)>(
            r"SELECT id, kinde_id, name FROM account WHERE kinde_id IS NOT NULL AND global_user_id IS NULL",
        )
        .fetch_all(&self.pool)
        .await
    }

    /// Get the balance for an account by `global_user_id`.
    ///
    /// # Errors
    /// Returns an error on database failure.
    /// Return `(global_user_id, balance)` pairs for every account in this
    /// cohort that's tied to a global user. Used by the admin balances view to
    /// show both members and public-auction guests.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_all_user_balances(&self) -> SqlxResult<Vec<(i64, i64, Decimal)>> {
        let rows = sqlx::query!(
            r#"SELECT
                id as "id!: i64",
                global_user_id as "global_user_id!: i64",
                balance as "balance: Text<Decimal>"
            FROM account
            WHERE global_user_id IS NOT NULL"#,
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows
            .into_iter()
            .map(|r| (r.id, r.global_user_id, r.balance.0))
            .collect())
    }

    /// Look up a single user's primary-account balance in this cohort.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_balance_by_global_user_id(
        &self,
        global_user_id: i64,
    ) -> SqlxResult<Option<f64>> {
        let row = sqlx::query_scalar::<_, String>(
            r"SELECT balance FROM account WHERE global_user_id = ?",
        )
        .bind(global_user_id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(row.and_then(|b| b.parse::<f64>().ok()))
    }

    /// Set the `global_user_id` for an account (used during migration).
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn set_global_user_id(
        &self,
        account_id: i64,
        global_user_id: i64,
    ) -> SqlxResult<()> {
        sqlx::query("UPDATE account SET global_user_id = ? WHERE id = ?")
            .bind(global_user_id)
            .bind(account_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    #[instrument(err, skip(self))]
    pub async fn get_all_markets(&self) -> SqlxResult<Vec<MarketWithRedeemables>> {
        let market_rows: Vec<MarketRow> = sqlx::query_as(
            r#"
                SELECT
                    market.id as id,
                    name,
                    description,
                    owner_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    min_settlement,
                    max_settlement,
                    settled_price,
                    settled_transaction_id,
                    settled_transaction.timestamp as settled_transaction_timestamp,
                    redeem_fee,
                    pinned,
                    type_id,
                    group_id,
                    status,
                    universe_id
                FROM market
                JOIN "transaction" on (market.transaction_id = "transaction".id)
                LEFT JOIN "transaction" as settled_transaction on (market.settled_transaction_id = settled_transaction.id)
                ORDER BY market.id
            "#
        )
        .fetch_all(&self.pool)
        .await?;
        let markets: Vec<Market> = market_rows.into_iter().map(Market::from).collect();
        let redeemables = sqlx::query_as!(
            Redeemable,
            r#"SELECT fund_id, constituent_id, multiplier FROM redeemable ORDER BY fund_id"#
        )
        .fetch_all(&self.pool)
        .await?;

        let visible_to = sqlx::query!(
            r#"SELECT market_id, account_id FROM market_visible_to ORDER BY market_id"#
        )
        .fetch_all(&self.pool)
        .await?;

        let option_markets: std::collections::HashMap<i64, OptionInfo> = sqlx::query!(
            r#"
                SELECT
                    market_id,
                    underlying_market_id,
                    strike_price as "strike_price: Text<Decimal>",
                    is_call as "is_call: bool",
                    expiration_date as "expiration_date: OffsetDateTime"
                FROM option_market
            "#
        )
        .fetch_all(&self.pool)
        .await?
        .into_iter()
        .map(|row| {
            (
                row.market_id,
                OptionInfo {
                    underlying_market_id: row.underlying_market_id,
                    strike_price: row.strike_price,
                    is_call: row.is_call,
                    expiration_date: row.expiration_date,
                },
            )
        })
        .collect();

        let redeemables_chunked = redeemables
            .into_iter()
            .chunk_by(|redeemable| redeemable.fund_id);

        let visible_to_chunked = visible_to
            .into_iter()
            .chunk_by(|visibility| visibility.market_id);

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
                Ok((market, right))
            })
            .merge_join_by(visible_to_chunked.into_iter(), |market, (market_id, _)| {
                if let Ok((market, _)) = market {
                    market.id.cmp(market_id)
                } else {
                    std::cmp::Ordering::Equal
                }
            })
            .map(|joined| {
                let (left, right) = joined.left_and_right();
                let Some(Ok((market, redeemables))) = left else {
                    return Err(sqlx::Error::RowNotFound);
                };
                let option_info = option_markets.get(&market.id).cloned();
                Ok(MarketWithRedeemables {
                    market,
                    redeemables: redeemables
                        .map(|(_, redeemables)| redeemables.collect())
                        .unwrap_or_default(),
                    visible_to: right
                        .map(|(_, visibilities)| visibilities.map(|v| v.account_id).collect())
                        .unwrap_or_default(),
                    option_info,
                })
            })
            .collect()
    }

    #[instrument(err, skip(self))]
    pub async fn get_all_market_types(&self) -> SqlxResult<Vec<MarketType>> {
        sqlx::query_as!(
            MarketType,
            r#"
                SELECT
                    id,
                    name,
                    description,
                    public as "public: bool"
                FROM market_type
                ORDER BY id
            "#
        )
        .fetch_all(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn create_market_type(
        &self,
        name: String,
        description: String,
        public: bool,
    ) -> SqlxResult<ValidationResult<MarketType>> {
        // Check if name already exists
        let existing = sqlx::query!(
            r#"SELECT id FROM market_type WHERE name = ?"#,
            name
        )
        .fetch_optional(&self.pool)
        .await?;

        if existing.is_some() {
            return Ok(Err(ValidationFailure::MarketTypeNameExists));
        }

        let market_type = sqlx::query_as!(
            MarketType,
            r#"
                INSERT INTO market_type (name, description, public)
                VALUES (?, ?, ?)
                RETURNING
                    id,
                    name,
                    description,
                    public as "public: bool"
            "#,
            name,
            description,
            public
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(Ok(market_type))
    }

    #[instrument(err, skip(self))]
    pub async fn delete_market_type(
        &self,
        market_type_id: i64,
    ) -> SqlxResult<ValidationResult<i64>> {
        // Check if market type exists
        let existing = sqlx::query!(
            r#"SELECT id FROM market_type WHERE id = ?"#,
            market_type_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if existing.is_none() {
            return Ok(Err(ValidationFailure::MarketTypeNotFound));
        }

        // Find another category to move markets to (lowest id that isn't being deleted)
        let target_type = sqlx::query_scalar!(
            r#"SELECT id FROM market_type WHERE id != ? ORDER BY id LIMIT 1"#,
            market_type_id
        )
        .fetch_optional(&self.pool)
        .await?;

        let Some(target_type_id) = target_type else {
            return Ok(Err(ValidationFailure::CannotDeleteLastMarketType));
        };

        // Move all markets from the deleted category to the target category
        sqlx::query!(
            r#"UPDATE market SET type_id = ? WHERE type_id = ?"#,
            target_type_id,
            market_type_id
        )
        .execute(&self.pool)
        .await?;

        // Move all market groups from the deleted category to the target category
        sqlx::query!(
            r#"UPDATE market_group SET type_id = ? WHERE type_id = ?"#,
            target_type_id,
            market_type_id
        )
        .execute(&self.pool)
        .await?;

        // Delete the market type
        sqlx::query!(
            r#"DELETE FROM market_type WHERE id = ?"#,
            market_type_id
        )
        .execute(&self.pool)
        .await?;

        Ok(Ok(market_type_id))
    }

    #[instrument(err, skip(self))]
    pub async fn get_all_market_groups(&self) -> SqlxResult<Vec<MarketGroup>> {
        sqlx::query_as!(
            MarketGroup,
            r#"
                SELECT
                    id,
                    name,
                    description,
                    type_id
                FROM market_group
                ORDER BY id
            "#
        )
        .fetch_all(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn create_market_group(
        &self,
        name: String,
        description: String,
        type_id: i64,
    ) -> SqlxResult<ValidationResult<MarketGroup>> {
        // Check if name already exists
        let existing = sqlx::query!(
            r#"SELECT id FROM market_group WHERE name = ?"#,
            name
        )
        .fetch_optional(&self.pool)
        .await?;

        if existing.is_some() {
            return Ok(Err(ValidationFailure::MarketGroupNameExists));
        }

        // Check if type_id is valid
        let type_exists = sqlx::query!(
            r#"SELECT id FROM market_type WHERE id = ?"#,
            type_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if type_exists.is_none() {
            return Ok(Err(ValidationFailure::MarketTypeNotFound));
        }

        let market_group = sqlx::query_as!(
            MarketGroup,
            r#"
                INSERT INTO market_group (name, description, type_id)
                VALUES (?, ?, ?)
                RETURNING
                    id,
                    name,
                    description,
                    type_id
            "#,
            name,
            description,
            type_id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(Ok(market_group))
    }

    /// # Errors
    /// Returns an error if the database query fails.
    pub async fn get_all_auctions(&self) -> SqlxResult<Vec<AuctionWithBuyers>> {
        let auctions = sqlx::query_as!(
            Auction,
            r#"
                SELECT
                    auction.id as id,
                    name,
                    description,
                    owner_id,
                    buyer_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    settled_price as "settled_price: _",
                    image_filename,
                    bin_price as "bin_price: _"
                FROM auction
                JOIN "transaction" on (auction.transaction_id = "transaction".id)
                ORDER BY auction.id
            "#
        )
        .fetch_all(&self.pool)
        .await?;
        let all_buyers = sqlx::query_as!(
            AuctionBuyer,
            r#"
                SELECT
                    auction_id,
                    account_id,
                    amount as "amount: _"
                FROM auction_buyer
                ORDER BY auction_id, account_id
            "#
        )
        .fetch_all(&self.pool)
        .await?;
        let mut by_auction: std::collections::HashMap<i64, Vec<AuctionBuyer>> =
            std::collections::HashMap::new();
        for b in all_buyers {
            by_auction.entry(b.auction_id).or_default().push(b);
        }
        Ok(auctions
            .into_iter()
            .map(|auction| {
                let buyers = by_auction.remove(&auction.id).unwrap_or_default();
                AuctionWithBuyers { auction, buyers }
            })
            .collect())
    }

    #[instrument(err, skip(self))]
    pub async fn is_market_visible_to(&self, market_id: i64, account_id: i64) -> SqlxResult<bool> {
        // A market is visible if either:
        // 1. It has no visibility restrictions (no entries in market_visible_to)
        // 2. The account is explicitly listed in market_visible_to
        let is_visible = sqlx::query_scalar!(
            r#"
            SELECT NOT EXISTS (
                SELECT 1 FROM market_visible_to WHERE market_id = ?
            ) OR EXISTS (
                SELECT 1 FROM market_visible_to
                WHERE market_id = ? AND account_id = ?
            ) as "is_visible!: bool"
            "#,
            market_id,
            market_id,
            account_id
        )
        .fetch_one(&self.pool)
        .await?;

        Ok(is_visible)
    }

    /// Check if a market is visible to any of the given accounts.
    /// Returns true if the market has no visibility restrictions,
    /// or if any of the owned accounts is in the `visible_to` list.
    #[instrument(err, skip(self))]
    pub async fn is_market_visible_to_any(
        &self,
        market_id: i64,
        owned_accounts: &[i64],
    ) -> SqlxResult<bool> {
        // First check if the market has any restrictions at all
        let has_restrictions = sqlx::query_scalar!(
            r#"SELECT EXISTS (SELECT 1 FROM market_visible_to WHERE market_id = ?) as "exists!: bool""#,
            market_id
        )
        .fetch_one(&self.pool)
        .await?;

        if !has_restrictions {
            return Ok(true);
        }

        // Check if any owned account is in the visible_to list
        for &account_id in owned_accounts {
            let is_listed = sqlx::query_scalar!(
                r#"SELECT EXISTS (SELECT 1 FROM market_visible_to WHERE market_id = ? AND account_id = ?) as "exists!: bool""#,
                market_id,
                account_id
            )
            .fetch_one(&self.pool)
            .await?;
            if is_listed {
                return Ok(true);
            }
        }

        Ok(false)
    }

    #[must_use]
    pub fn get_all_live_orders(&self) -> BoxStream<'_, SqlxResult<Order>> {
        sqlx::query_as!(
            Order,
            r#"
                SELECT
                    "order".id as "id!",
                    market_id,
                    owner_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    size as "size: _",
                    price as "price: _",
                    side as "side: _"
                FROM "order"
                JOIN "transaction" on ("order".transaction_id = "transaction".id)
                WHERE CAST(size AS REAL) > 0
                ORDER BY market_id
            "#
        )
        .fetch(&self.pool)
    }

    #[instrument(err, skip(self))]
    pub async fn get_market_trades(&self, market_id: i64) -> SqlxResult<ValidationResult<Trades>> {
        if !self.market_exists(market_id).await? {
            return Ok(Err(ValidationFailure::MarketNotFound));
        }
        let trades = sqlx::query_as!(
            Trade,
            r#"
                SELECT
                    t.id as "id!",
                    t.market_id,
                    t.buyer_id,
                    t.seller_id,
                    t.transaction_id,
                    t.size as "size: _",
                    t.price as "price: _",
                    tr.timestamp as "transaction_timestamp",
                    t.buyer_is_taker as "buyer_is_taker: _"
                FROM trade t
                JOIN "transaction" tr ON t.transaction_id = tr.id
                WHERE t.market_id = ?
            "#,
            market_id
        )
        .fetch_all(&self.pool)
        .await?;
        let redemptions = self.get_market_redemptions(market_id).await?;
        Ok(Ok(Trades {
            market_id,
            trades,
            has_full_history: true,
            redemptions,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn get_market_redemptions(&self, fund_id: i64) -> SqlxResult<Vec<Redeemed>> {
        struct Row {
            redeemer_id: i64,
            fund_id: i64,
            amount: Text<Decimal>,
            transaction_id: i64,
            transaction_timestamp: OffsetDateTime,
        }
        let rows = sqlx::query_as!(
            Row,
            r#"
                SELECT
                    r.redeemer_id,
                    r.fund_id as "fund_id!",
                    r.amount as "amount: _",
                    r.transaction_id,
                    tr.timestamp as "transaction_timestamp"
                FROM redemption r
                JOIN "transaction" tr ON r.transaction_id = tr.id
                WHERE r.fund_id = ?
            "#,
            fund_id
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(rows
            .into_iter()
            .map(|row| Redeemed {
                account_id: row.redeemer_id,
                fund_id: row.fund_id,
                amount: row.amount,
                transaction_info: TransactionInfo {
                    id: row.transaction_id,
                    timestamp: row.transaction_timestamp,
                },
            })
            .collect())
    }

    /// Get every market's status-change history grouped by `market_id`, with
    /// each market's entries sorted ascending by `transaction_id`.
    ///
    /// # Errors
    /// Returns an error if the database query fails.
    #[instrument(err, skip(self))]
    pub async fn get_all_status_changes_by_market(
        &self,
    ) -> SqlxResult<HashMap<i64, Vec<MarketStatusChange>>> {
        let rows = sqlx::query!(
            r#"
                SELECT
                    msc.market_id as "market_id!: i64",
                    msc.status as "status!: i32",
                    msc.transaction_id as "transaction_id!: i64",
                    tr.timestamp as "transaction_timestamp!: OffsetDateTime"
                FROM market_status_change msc
                JOIN "transaction" tr ON msc.transaction_id = tr.id
                ORDER BY msc.market_id, msc.transaction_id
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        let mut by_market: HashMap<i64, Vec<MarketStatusChange>> = HashMap::new();
        for row in rows {
            by_market
                .entry(row.market_id)
                .or_default()
                .push(MarketStatusChange {
                    status: row.status,
                    transaction_id: row.transaction_id,
                    transaction_timestamp: row.transaction_timestamp,
                });
        }
        Ok(by_market)
    }

    /// Get a single market's status-change history, sorted ascending by
    /// `transaction_id`.
    ///
    /// # Errors
    /// Returns an error if the database query fails.
    pub async fn get_status_changes(
        &self,
        market_id: i64,
    ) -> SqlxResult<Vec<MarketStatusChange>> {
        let changes = sqlx::query_as!(
            MarketStatusChange,
            r#"
                SELECT
                    msc.status as "status!: i32",
                    msc.transaction_id as "transaction_id!: i64",
                    tr.timestamp as "transaction_timestamp!: OffsetDateTime"
                FROM market_status_change msc
                JOIN "transaction" tr ON msc.transaction_id = tr.id
                WHERE msc.market_id = ?
                ORDER BY msc.transaction_id
            "#,
            market_id
        )
        .fetch_all(&self.pool)
        .await?;
        Ok(changes)
    }

    /// Gets the last trade for each market that has trades.
    /// Returns a `HashMap` where keys are `market_id`s and values are the most recent Trade.
    ///
    /// # Errors
    /// Returns an error if the database query fails.
    pub async fn get_last_trades_by_market(&self) -> SqlxResult<HashMap<i64, Trade>> {
        let trades = sqlx::query_as!(
            Trade,
            r#"
                SELECT
                    t.id as "id!",
                    t.market_id,
                    t.buyer_id,
                    t.seller_id,
                    t.transaction_id,
                    t.size as "size: _",
                    t.price as "price: _",
                    tr.timestamp as "transaction_timestamp",
                    t.buyer_is_taker as "buyer_is_taker: _"
                FROM trade t
                JOIN "transaction" tr ON t.transaction_id = tr.id
                JOIN (
                    SELECT market_id, MAX(transaction_id) as max_tid
                    FROM trade
                    GROUP BY market_id
                ) latest ON t.market_id = latest.market_id AND t.transaction_id = latest.max_tid
            "#
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(trades.into_iter().map(|t| (t.market_id, t)).collect())
    }

    #[instrument(err, skip(self))]
    pub async fn get_full_market_orders(
        &self,
        market_id: i64,
    ) -> SqlxResult<ValidationResult<Orders>> {
        if !self.market_exists(market_id).await? {
            return Ok(Err(ValidationFailure::MarketNotFound));
        }
        let mut transaction = self.pool.begin().await?;
        let orders = sqlx::query_as!(
            Order,
            r#"
                SELECT
                    "order".id as "id!",
                    market_id,
                    owner_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    size as "size: _",
                    price as "price: _",
                    side as "side: _"
                FROM "order"
                JOIN "transaction" on ("order".transaction_id = "transaction".id)
                WHERE market_id = ?
                ORDER BY "order".id
            "#,
            market_id
        )
        .fetch_all(transaction.as_mut())
        .await?;
        let sizes = sqlx::query_as!(
            Size,
            r#"
                SELECT
                    transaction_id,
                    order_id,
                    "transaction".timestamp as transaction_timestamp,
                    size as "size: _"
                FROM order_size
                JOIN "transaction" on (order_size.transaction_id = "transaction".id)
                WHERE order_id IN (
                    SELECT id
                    FROM "order"
                    WHERE market_id = ?
                )
                ORDER BY order_id
            "#,
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
        Ok(Ok(Orders {
            market_id,
            orders,
            has_full_history: true,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn get_transfers(&self, account_id: i64) -> SqlxResult<Vec<Transfer>> {
        sqlx::query_as!(
            Transfer,
            r#"
                SELECT
                    transfer.id as "id!",
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    amount as "amount: _",
                    note,
                    "transaction".timestamp as "transaction_timestamp"
                FROM transfer
                JOIN "transaction" ON (transfer.transaction_id = "transaction".id)
                WHERE from_account_id = ? OR to_account_id = ?
            "#,
            account_id,
            account_id
        )
        .fetch_all(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn market_exists(&self, id: i64) -> SqlxResult<bool> {
        sqlx::query_scalar!(
            r#"
                SELECT EXISTS(
                    SELECT 1 FROM market WHERE id = ?
                ) as "exists!: bool"
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await
    }

    #[instrument(err, skip(self))]
    pub async fn get_market_owner_and_status(
        &self,
        market_id: i64,
    ) -> SqlxResult<Option<(i64, i64)>> {
        sqlx::query!(
            r#"
                SELECT owner_id, status
                FROM market
                WHERE id = ?
            "#,
            market_id
        )
        .fetch_optional(&self.pool)
        .await
        .map(|opt| opt.map(|r| (r.owner_id, r.status)))
    }

    #[instrument(err, skip(self))]
    pub async fn make_transfer(
        &self,
        admin_id: Option<i64>,
        initiator_id: i64,
        make_transfer: websocket_api::MakeTransfer,
    ) -> SqlxResult<ValidationResult<Transfer>> {
        let Ok(amount) = Decimal::try_from(make_transfer.amount) else {
            return Ok(Err(ValidationFailure::InvalidAmount));
        };
        let from_account_id = make_transfer.from_account_id;
        let to_account_id = make_transfer.to_account_id;

        if from_account_id == to_account_id {
            return Ok(Err(ValidationFailure::SameAccount));
        }

        let amount = amount.normalize();

        if amount <= dec!(0) || amount.scale() > 4 {
            return Ok(Err(ValidationFailure::InvalidAmount));
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

        let initiator_is_user = sqlx::query_scalar!(
            r#"SELECT EXISTS(
                SELECT 1 FROM account WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
            ) as "exists!: bool""#,
            initiator_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if !initiator_is_user {
            return Ok(Err(ValidationFailure::InitiatorNotUser));
        }

        let Some(from_account_portfolio) =
            get_portfolio_with_credits(&mut transaction, from_account_id).await?
        else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };

        if from_account_portfolio.available_balance < amount {
            return Ok(Err(ValidationFailure::InsufficientFunds));
        }

        let Some(to_account_portfolio) =
            get_portfolio_with_credits(&mut transaction, to_account_id).await?
        else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };

        // Validate both accounts are in the same universe
        let from_universe = sqlx::query_scalar!(
            r#"SELECT universe_id FROM account WHERE id = ?"#,
            from_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let to_universe = sqlx::query_scalar!(
            r#"SELECT universe_id FROM account WHERE id = ?"#,
            to_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if from_universe != to_universe {
            return Ok(Err(ValidationFailure::CrossUniverseTransfer));
        }

        let is_user_to_user_transfer =
            initiator_id == from_account_id && to_account_portfolio.owner_credits.is_empty();

        if let Some(withdrawal_owner_credit) = from_account_portfolio
            .owner_credits
            .iter()
            .find(|credit| credit.owner_id == to_account_id)
        {
            if withdrawal_owner_credit.credit.0 < amount {
                return Ok(Err(ValidationFailure::InsufficientCredit));
            }
            let new_credit = withdrawal_owner_credit.credit.0 - amount;
            if let Err(status) = execute_credit_transfer(
                &mut transaction,
                initiator_id,
                &to_account_portfolio,
                &from_account_portfolio,
                new_credit,
            )
            .await?
            {
                return Ok(Err(status));
            }
        } else if let Some(deposit_owner_credit) = to_account_portfolio
            .owner_credits
            .iter()
            .find(|credit| credit.owner_id == from_account_id)
        {
            let new_credit = deposit_owner_credit.credit.0 + amount;
            if let Err(status) = execute_credit_transfer(
                &mut transaction,
                initiator_id,
                &from_account_portfolio,
                &to_account_portfolio,
                new_credit,
            )
            .await?
            {
                return Ok(Err(status));
            }
        } else if !is_user_to_user_transfer {
            return Ok(Err(ValidationFailure::AccountNotOwned));
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

        let true_initiator_id = admin_id.unwrap_or(initiator_id);

        let transfer = sqlx::query_as!(
            Transfer,
            r#"
                INSERT INTO transfer (
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    amount,
                    note
                ) VALUES (?, ?, ?, ?, ?, ?)
                RETURNING
                    id,
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    ? as "transaction_timestamp!: _",
                    amount as "amount: _",
                    note
            "#,
            true_initiator_id,
            from_account_id,
            to_account_id,
            transaction_info.id,
            amount,
            make_transfer.note,
            transaction_info.timestamp
        )
        .fetch_one(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(transfer))
    }

    /// # Errors
    /// Returns `Err` on database failure.
    pub async fn gift(
        &self,
        admin_id: Option<i64>,
        initiator_id: i64,
        gift: websocket_api::Gift,
    ) -> SqlxResult<ValidationResult<Transfer>> {
        let Ok(amount) = Decimal::try_from(gift.amount) else {
            return Ok(Err(ValidationFailure::InvalidAmount));
        };
        let amount = amount.normalize();
        if amount <= dec!(0) || amount.scale() > 4 {
            return Ok(Err(ValidationFailure::InvalidAmount));
        }

        let to_account_id = gift.to_account_id;
        let (mut transaction, transaction_info) = self.begin_write().await?;

        let initiator_is_user = sqlx::query_scalar!(
            r#"SELECT EXISTS(
                SELECT 1 FROM account WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
            ) as "exists!: bool""#,
            initiator_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        if !initiator_is_user {
            return Ok(Err(ValidationFailure::InitiatorNotUser));
        }

        let Some(to_account_portfolio) =
            get_portfolio_with_credits(&mut transaction, to_account_id).await?
        else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };

        let to_universe_id = sqlx::query_scalar!(
            r#"SELECT universe_id FROM account WHERE id = ?"#,
            to_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let universe_owner = sqlx::query_scalar!(
            r#"SELECT owner_id FROM universe WHERE id = ?"#,
            to_universe_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let is_admin = admin_id.is_some();
        let from_account_id = if to_universe_id == 0 {
            if !is_admin {
                return Ok(Err(ValidationFailure::NotUniverseOwner));
            }
            self.arbor_pixie_account_id
        } else {
            match universe_owner {
                Some(owner_id) if owner_id == initiator_id || is_admin => owner_id,
                _ => return Ok(Err(ValidationFailure::NotUniverseOwner)),
            }
        };

        let to_account_new_balance = Text(to_account_portfolio.total_balance + amount);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            to_account_new_balance,
            to_account_id
        )
        .execute(transaction.as_mut())
        .await?;

        let amount = Text(amount);
        let true_initiator_id = admin_id.unwrap_or(initiator_id);

        let transfer = sqlx::query_as!(
            Transfer,
            r#"
                INSERT INTO transfer (
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    amount,
                    note
                ) VALUES (?, ?, ?, ?, ?, ?)
                RETURNING
                    id,
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    ? as "transaction_timestamp!: _",
                    amount as "amount: _",
                    note
            "#,
            true_initiator_id,
            from_account_id,
            to_account_id,
            transaction_info.id,
            amount,
            gift.note,
            transaction_info.timestamp
        )
        .fetch_one(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(transfer))
    }

    /// Mint a new single-use redeem code valid for 24h. The code amount is held
    /// against the creating admin's account; redeeming creates a transfer from
    /// the admin to the redeemer at claim time.
    ///
    /// # Errors
    /// Returns `Err` on database failure.
    ///
    /// # Panics
    /// Panics if the system clock is far enough off that adding 24 hours to
    /// "now" is unrepresentable as an `OffsetDateTime`. In practice this is
    /// impossible.
    pub async fn create_redeem_code(
        &self,
        admin_id: i64,
        create: websocket_api::CreateRedeemCode,
    ) -> SqlxResult<ValidationResult<websocket_api::RedeemCodeCreated>> {
        let Ok(amount) = Decimal::try_from(create.amount) else {
            return Ok(Err(ValidationFailure::InvalidAmount));
        };
        let amount = amount.normalize();
        if amount <= dec!(0) || amount.scale() > 4 {
            return Ok(Err(ValidationFailure::InvalidAmount));
        }
        let amount_text = Text(amount);

        let expires_at = OffsetDateTime::from_unix_timestamp(
            OffsetDateTime::now_utc().unix_timestamp() + 24 * 60 * 60,
        )
        .expect("24h offset always representable");

        // Retry a handful of times in the (extremely unlikely) event of a
        // unique-constraint collision on the generated code.
        for _ in 0..10 {
            let code = generate_redeem_code();
            let result = sqlx::query!(
                r#"INSERT INTO redeem_code (code, amount, created_by, expires_at) VALUES (?, ?, ?, ?)"#,
                code,
                amount_text,
                admin_id,
                expires_at,
            )
            .execute(&self.pool)
            .await;
            match result {
                Ok(_) => {
                    return Ok(Ok(websocket_api::RedeemCodeCreated {
                        code,
                        amount: amount.try_into().unwrap_or(0.0),
                        expires_at: Some(prost_types::Timestamp {
                            seconds: expires_at.unix_timestamp(),
                            nanos: 0,
                        }),
                    }));
                }
                Err(sqlx::Error::Database(e)) if e.is_unique_violation() => {}
                Err(e) => return Err(e),
            }
        }
        Err(sqlx::Error::Protocol(
            "Failed to generate a unique redeem code after 10 attempts".into(),
        ))
    }

    /// Claim a previously-minted redeem code. Validates that the code exists,
    /// is unredeemed, and is not expired, then transfers the locked amount from
    /// the creating admin's account to the claimer.
    ///
    /// # Errors
    /// Returns `Err` on database failure.
    #[allow(clippy::too_many_lines)]
    pub async fn claim_redeem_code(
        &self,
        claimer_id: i64,
        claim: websocket_api::ClaimRedeemCode,
    ) -> SqlxResult<ValidationResult<(Transfer, Decimal)>> {
        let code = claim.code.trim().to_uppercase();
        if !is_valid_redeem_code_format(&code) {
            return Ok(Err(ValidationFailure::InvalidRedeemCode));
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

        let row = sqlx::query!(
            r#"SELECT
                id as "id!",
                amount as "amount: Text<Decimal>",
                created_by,
                expires_at as "expires_at: OffsetDateTime",
                redeemed_by
            FROM redeem_code WHERE code = ?"#,
            code,
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(row) = row else {
            return Ok(Err(ValidationFailure::RedeemCodeNotFound));
        };
        if row.redeemed_by.is_some() {
            return Ok(Err(ValidationFailure::RedeemCodeAlreadyRedeemed));
        }
        let now = OffsetDateTime::now_utc();
        if let Some(expires_at) = row.expires_at {
            if expires_at < now {
                return Ok(Err(ValidationFailure::RedeemCodeExpired));
            }
        }

        let amount = row.amount.0;
        let from_account_id = row.created_by;
        let to_account_id = claimer_id;

        if from_account_id == to_account_id {
            return Ok(Err(ValidationFailure::SameAccount));
        }

        let Some(from_portfolio) =
            get_portfolio_with_credits(&mut transaction, from_account_id).await?
        else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };
        if from_portfolio.available_balance < amount {
            return Ok(Err(ValidationFailure::InsufficientFunds));
        }

        let Some(to_portfolio) =
            get_portfolio_with_credits(&mut transaction, to_account_id).await?
        else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };

        let from_universe = sqlx::query_scalar!(
            r#"SELECT universe_id FROM account WHERE id = ?"#,
            from_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        let to_universe = sqlx::query_scalar!(
            r#"SELECT universe_id FROM account WHERE id = ?"#,
            to_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        if from_universe != to_universe {
            return Ok(Err(ValidationFailure::CrossUniverseTransfer));
        }

        let from_new_balance = Text(from_portfolio.total_balance - amount);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            from_new_balance,
            from_account_id
        )
        .execute(transaction.as_mut())
        .await?;

        let to_new_balance = Text(to_portfolio.total_balance + amount);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            to_new_balance,
            to_account_id
        )
        .execute(transaction.as_mut())
        .await?;

        let amount_text = Text(amount);
        let note = format!("Redeem code {code}");
        let transfer = sqlx::query_as!(
            Transfer,
            r#"
                INSERT INTO transfer (
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    amount,
                    note
                ) VALUES (?, ?, ?, ?, ?, ?)
                RETURNING
                    id,
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    ? as "transaction_timestamp!: _",
                    amount as "amount: _",
                    note
            "#,
            claimer_id,
            from_account_id,
            to_account_id,
            transaction_info.id,
            amount_text,
            note,
            transaction_info.timestamp,
        )
        .fetch_one(transaction.as_mut())
        .await?;

        sqlx::query!(
            r#"UPDATE redeem_code
               SET redeemed_by = ?, redeemed_at = ?, redeem_transfer_id = ?
               WHERE id = ?"#,
            claimer_id,
            now,
            transfer.id,
            row.id,
        )
        .execute(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok((transfer, amount)))
    }

    /// # Errors
    /// Returns `Err` on database failure.
    pub async fn redistribute_owner_credit(
        &self,
        redistribute: websocket_api::RedistributeOwnerCredit,
    ) -> SqlxResult<ValidationResult<()>> {
        let account_id = redistribute.account_id;
        let from_owner_id = redistribute.from_owner_id;

        let mut transaction = self.pool.begin().await?;

        let owner_credits = sqlx::query_as!(
            OwnerCredit,
            r#"SELECT owner_id, credit as "credit: _" FROM account_owner WHERE account_id = ?"#,
            account_id,
        )
        .fetch_all(transaction.as_mut())
        .await?;

        if owner_credits.is_empty() {
            return Ok(Err(ValidationFailure::AccountNotFound));
        }

        let from_credit = match owner_credits.iter().find(|c| c.owner_id == from_owner_id) {
            Some(c) => c.credit.0,
            None => return Ok(Err(ValidationFailure::NotOwner)),
        };

        if from_credit.is_zero() {
            return Ok(Ok(()));
        }

        let others: Vec<_> = owner_credits
            .iter()
            .filter(|c| c.owner_id != from_owner_id)
            .collect();

        if others.is_empty() {
            return Ok(Ok(()));
        }

        let others_total: Decimal = others.iter().map(|c| c.credit.0).sum();

        let (mut new_credits, remainders): (Vec<_>, Vec<_>) = if others_total.is_zero() {
            let even_share = from_credit / Decimal::from(others.len());
            others
                .iter()
                .map(|_| {
                    let rounded = even_share
                        .round_dp_with_strategy(4, RoundingStrategy::ToNegativeInfinity)
                        .normalize();
                    let remainder = even_share - rounded;
                    (rounded, remainder)
                })
                .unzip()
        } else {
            others
                .iter()
                .map(|o| {
                    let share = o.credit.0 / others_total * from_credit;
                    let rounded = share
                        .round_dp_with_strategy(4, RoundingStrategy::ToNegativeInfinity)
                        .normalize();
                    let remainder = share - rounded;
                    (rounded, remainder)
                })
                .unzip()
        };

        if let Ok(dist) = WeightedIndex::new(&remainders) {
            let idx = dist.sample(&mut rand::thread_rng());
            new_credits[idx] += remainders.iter().sum::<Decimal>();
            new_credits[idx] = new_credits[idx].round_dp(4).normalize();
        }

        for (other, additional) in others.iter().zip(new_credits) {
            let updated_credit = Text((other.credit.0 + additional).normalize());
            sqlx::query!(
                r#"UPDATE account_owner SET credit = ? WHERE owner_id = ? AND account_id = ?"#,
                updated_credit,
                other.owner_id,
                account_id,
            )
            .execute(transaction.as_mut())
            .await?;
        }

        let zero = Text(dec!(0));
        sqlx::query!(
            r#"UPDATE account_owner SET credit = ? WHERE owner_id = ? AND account_id = ?"#,
            zero,
            from_owner_id,
            account_id,
        )
        .execute(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(()))
    }

    #[instrument(err, skip(self))]
    pub async fn ensure_arbor_pixie_transfer(
        &self,
        to_account_id: i64,
        amount: Decimal,
    ) -> SqlxResult<ValidationResult<Option<Transfer>>> {
        let amount = amount.normalize();

        if amount <= dec!(0) || amount.scale() > 4 {
            return Ok(Err(ValidationFailure::InvalidAmount));
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;

        let is_user = sqlx::query_scalar!(
            r#"SELECT EXISTS(
                SELECT 1 FROM account WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
            ) as "exists!: bool""#,
            to_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if !is_user {
            return Ok(Err(ValidationFailure::RecipientNotAUser));
        }

        let already_has_transfer = sqlx::query_scalar!(
            r#"SELECT EXISTS(
                SELECT 1 FROM transfer
                WHERE from_account_id = ? AND to_account_id = ?
            ) as "exists!: bool""#,
            self.arbor_pixie_account_id,
            to_account_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        if already_has_transfer {
            return Ok(Ok(None));
        }

        let Some(to_account_portfolio) = get_portfolio(&mut transaction, to_account_id).await?
        else {
            return Ok(Err(ValidationFailure::AccountNotFound));
        };

        let to_account_new_balance = Text(to_account_portfolio.total_balance + amount);

        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            to_account_new_balance,
            to_account_id
        )
        .execute(transaction.as_mut())
        .await?;

        let amount = Text(amount);
        let note = "Welcome clips from Arbor Pixie".to_string();

        let transfer = sqlx::query_as!(
            Transfer,
            r#"
                INSERT INTO transfer (
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    amount,
                    note
                ) VALUES (?, ?, ?, ?, ?, ?)
                RETURNING
                    id,
                    initiator_id,
                    from_account_id,
                    to_account_id,
                    transaction_id,
                    ? as "transaction_timestamp!: _",
                    amount as "amount: _",
                    note
            "#,
            self.arbor_pixie_account_id,
            self.arbor_pixie_account_id,
            to_account_id,
            transaction_info.id,
            amount,
            note,
            transaction_info.timestamp
        )
        .fetch_one(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(Some(transfer)))
    }

    #[instrument(err, skip(self))]
    pub async fn create_market(
        &self,
        owner_id: i64,
        create_market: websocket_api::CreateMarket,
        is_admin: bool,
        universe_id: i64,
    ) -> SqlxResult<ValidationResult<MarketWithRedeemables>> {
        let Ok(mut min_settlement) = Decimal::try_from(create_market.min_settlement) else {
            return Ok(Err(ValidationFailure::InvalidSettlement));
        };
        let Ok(mut max_settlement) = Decimal::try_from(create_market.max_settlement) else {
            return Ok(Err(ValidationFailure::InvalidSettlement));
        };
        let Ok(mut redeem_fee) = Decimal::try_from(create_market.redeem_fee) else {
            return Ok(Err(ValidationFailure::InvalidRedeemFee));
        };

        if create_market
            .redeemable_for
            .iter()
            .any(|redeemable| redeemable.multiplier == 0)
        {
            return Ok(Err(ValidationFailure::InvalidMultiplier));
        }

        // Options and redeemables are mutually exclusive
        if create_market.option.is_some() && !create_market.redeemable_for.is_empty() {
            return Ok(Err(ValidationFailure::InvalidSettlement));
        }

        // Validate option strike price early
        let option_strike = if let Some(ref option) = create_market.option {
            let Ok(strike) = Decimal::try_from(option.strike_price) else {
                return Ok(Err(ValidationFailure::InvalidStrikePrice));
            };
            let strike = strike.normalize();
            if strike.scale() > 2 || strike.mantissa() > 1_000_000_000_000 {
                return Ok(Err(ValidationFailure::InvalidStrikePrice));
            }
            if !is_admin {
                return Ok(Err(ValidationFailure::SudoRequired));
            }
            Some(strike)
        } else {
            None
        };

        let (mut transaction, transaction_info) = self.begin_write().await?;

        if let (Some(ref option), Some(strike)) = (&create_market.option, option_strike) {
            // Calculate option bounds from underlying market
            let Some(underlying) = sqlx::query!(
                r#"
                    SELECT
                        min_settlement as "min_settlement: Text<Decimal>",
                        max_settlement as "max_settlement: Text<Decimal>",
                        settled_price IS NOT NULL as "settled: bool"
                    FROM market
                    WHERE id = ?
                "#,
                option.underlying_market_id
            )
            .fetch_optional(transaction.as_mut())
            .await?
            else {
                return Ok(Err(ValidationFailure::ConstituentNotFound));
            };

            if underlying.settled {
                return Ok(Err(ValidationFailure::ConstituentSettled));
            }

            let u_min = underlying.min_settlement.0;
            let u_max = underlying.max_settlement.0;

            if option.is_call {
                // Call: min = max(0, U_min - K), max = max(0, U_max - K)
                min_settlement = Decimal::ZERO.max(u_min - strike);
                max_settlement = Decimal::ZERO.max(u_max - strike);
            } else {
                // Put: min = max(0, K - U_max), max = max(0, K - U_min)
                min_settlement = Decimal::ZERO.max(strike - u_max);
                max_settlement = Decimal::ZERO.max(strike - u_min);
            }
        } else if !create_market.redeemable_for.is_empty() {
            if redeem_fee < Decimal::ZERO {
                return Ok(Err(ValidationFailure::InvalidRedeemFee));
            }

            min_settlement = Decimal::ZERO;
            max_settlement = Decimal::ZERO;

            for redeemable in &create_market.redeemable_for {
                let Some(constituent) = sqlx::query!(
                    r#"
                        SELECT
                            min_settlement as "min_settlement: Text<Decimal>",
                            max_settlement as "max_settlement: Text<Decimal>",
                            settled_price IS NOT NULL as "settled: bool"
                        FROM market
                        WHERE id = ?
                    "#,
                    redeemable.constituent_id
                )
                .fetch_optional(transaction.as_mut())
                .await?
                else {
                    return Ok(Err(ValidationFailure::ConstituentNotFound));
                };

                if constituent.settled {
                    return Ok(Err(ValidationFailure::ConstituentSettled));
                }

                // Handle negative multipliers correctly
                let min_settlement_payout =
                    constituent.min_settlement.0 * Decimal::from(redeemable.multiplier);
                let max_settlement_payout =
                    constituent.max_settlement.0 * Decimal::from(redeemable.multiplier);

                min_settlement += min_settlement_payout.min(max_settlement_payout);
                max_settlement += min_settlement_payout.max(max_settlement_payout);
            }
        } else if !redeem_fee.is_zero() {
            return Ok(Err(ValidationFailure::InvalidRedeemFee));
        }
        min_settlement = min_settlement.normalize();
        max_settlement = max_settlement.normalize();
        redeem_fee = redeem_fee.normalize();

        if min_settlement >= max_settlement {
            return Ok(Err(ValidationFailure::InvalidSettlement));
        }

        if min_settlement.scale() > 2 || max_settlement.scale() > 2 {
            return Ok(Err(ValidationFailure::InvalidSettlement));
        }

        if max_settlement.mantissa() > 1_000_000_000_000
            || min_settlement.mantissa() > 1_000_000_000_000
        {
            return Ok(Err(ValidationFailure::InvalidSettlement));
        }

        if redeem_fee.scale() > 4 || redeem_fee.mantissa() > 1_000_000_000_000 {
            return Ok(Err(ValidationFailure::InvalidRedeemFee));
        }

        // Validate type_id - default to "Other Markets" type (id=1) if not specified
        let type_id = if create_market.type_id > 0 {
            create_market.type_id
        } else {
            1 // Default to "Other Markets" type
        };

        // Check if type exists and validate public access
        let market_type = sqlx::query!(
            r#"SELECT public as "public: bool" FROM market_type WHERE id = ?"#,
            type_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        match market_type {
            None => return Ok(Err(ValidationFailure::MarketTypeNotFound)),
            Some(mt) if !mt.public && !is_admin => {
                return Ok(Err(ValidationFailure::MarketTypeNotPublic))
            }
            _ => {}
        }

        // Validate group_id if provided (admin only can assign to groups)
        let group_id = if create_market.group_id > 0 && is_admin {
            // Check if group exists and has matching type_id
            let group = sqlx::query!(
                r#"SELECT type_id FROM market_group WHERE id = ?"#,
                create_market.group_id
            )
            .fetch_optional(transaction.as_mut())
            .await?;

            match group {
                None => return Ok(Err(ValidationFailure::MarketGroupNotFound)),
                Some(g) if g.type_id != type_id => {
                    return Ok(Err(ValidationFailure::MarketGroupTypeMismatch))
                }
                _ => Some(create_market.group_id),
            }
        } else {
            None
        };

        // Validate universe: non-zero universes require the creator to be the universe owner
        if universe_id != 0 {
            let universe_owner = sqlx::query_scalar!(
                r#"SELECT owner_id FROM universe WHERE id = ?"#,
                universe_id
            )
            .fetch_optional(transaction.as_mut())
            .await?;

            match universe_owner {
                None => return Ok(Err(ValidationFailure::UniverseNotFound)),
                Some(Some(uid)) if uid != owner_id => {
                    return Ok(Err(ValidationFailure::NotUniverseOwner))
                }
                _ => {}
            }
        }

        let min_settlement = Text(min_settlement);
        let max_settlement = Text(max_settlement);
        let redeem_fee = Text(redeem_fee);
        let market_status = websocket_api::MarketStatus::Open as i32;
        let market_row = sqlx::query_as!(
            MarketRow,
            r#"
                INSERT INTO market (
                    name,
                    description,
                    owner_id,
                    transaction_id,
                    min_settlement,
                    max_settlement,
                    redeem_fee,
                    hide_account_ids,
                    pinned,
                    type_id,
                    group_id,
                    status,
                    universe_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?, ?, ?, ?)
                RETURNING
                    id,
                    name,
                    description,
                    owner_id,
                    transaction_id,
                    ? as "transaction_timestamp!: _",
                    min_settlement as "min_settlement: _",
                    max_settlement as "max_settlement: _",
                    settled_price as "settled_price: _",
                    NULL as "settled_transaction_id: _",
                    NULL as "settled_transaction_timestamp: _",
                    redeem_fee as "redeem_fee: _",
                    pinned as "pinned!: bool",
                    type_id,
                    group_id,
                    status as "status!: i32",
                    universe_id
            "#,
            create_market.name,
            create_market.description,
            owner_id,
            transaction_info.id,
            min_settlement,
            max_settlement,
            redeem_fee,
            create_market.hide_account_ids,
            type_id,
            group_id,
            market_status,
            universe_id,
            transaction_info.timestamp
        )
        .fetch_one(transaction.as_mut())
        .await?;
        let market = Market::from(market_row);

        sqlx::query!(
            r#"
                INSERT INTO market_status_change (market_id, status, transaction_id)
                VALUES (?, ?, ?)
            "#,
            market.id,
            market_status,
            transaction_info.id,
        )
        .execute(transaction.as_mut())
        .await?;

        // Insert market visibility restrictions
        for account_id in &create_market.visible_to {
            sqlx::query!(
                r#"
                    INSERT INTO market_visible_to (market_id, account_id)
                    VALUES (?, ?)
                "#,
                market.id,
                account_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        let mut redeemables = Vec::new();
        for redeemable in create_market.redeemable_for {
            let redeemable = sqlx::query_as!(
                Redeemable,
                r#"
                    INSERT INTO redeemable (fund_id, constituent_id, multiplier)
                    VALUES (?, ?, ?)
                    RETURNING fund_id, constituent_id, multiplier as "multiplier: _"
                "#,
                market.id,
                redeemable.constituent_id,
                redeemable.multiplier,
            )
            .fetch_one(transaction.as_mut())
            .await?;
            redeemables.push(redeemable);
        }

        // Insert option market info if this is an option
        let option_info = if let (Some(option), Some(strike)) = (create_market.option, option_strike)
        {
            let strike_text = Text(strike);
            let expiration_ts = option
                .expiration_date
                .map(|ts| {
                    OffsetDateTime::from_unix_timestamp(ts.seconds)
                        .unwrap_or(OffsetDateTime::UNIX_EPOCH)
                });
            sqlx::query!(
                r#"
                    INSERT INTO option_market (market_id, underlying_market_id, strike_price, is_call, expiration_date)
                    VALUES (?, ?, ?, ?, ?)
                "#,
                market.id,
                option.underlying_market_id,
                strike_text,
                option.is_call,
                expiration_ts,
            )
            .execute(transaction.as_mut())
            .await?;
            Some(OptionInfo {
                underlying_market_id: option.underlying_market_id,
                strike_price: Text(strike),
                is_call: option.is_call,
                expiration_date: expiration_ts,
            })
        } else {
            None
        };

        transaction.commit().await?;
        Ok(Ok(MarketWithRedeemables {
            market,
            redeemables,
            visible_to: create_market.visible_to,
            option_info,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn edit_market(
        &self,
        edit_market: websocket_api::EditMarket,
    ) -> SqlxResult<ValidationResult<MarketWithRedeemables>> {
        let (mut transaction, transaction_info) = self.begin_write().await?;

        let market_id = edit_market.id;
        let market_status = match websocket_api::MarketStatus::try_from(edit_market.status) {
            Ok(status) => status as i32,
            Err(_) => return Ok(Err(ValidationFailure::InvalidMarketStatus)),
        };

        // let old_market = sqlx::query_as!(
        //     Market,
        //     r#"
        //         SELECT
        //             market.id as id,
        //             name,
        //             description,
        //             owner_id,
        //             transaction_id,
        //             "transaction".timestamp as transaction_timestamp,
        //             min_settlement as "min_settlement: _",
        //             max_settlement as "max_settlement: _",
        //             settled_price as "settled_price: _",
        //             settled_transaction_id,
        //             settled_transaction.timestamp as settled_transaction_timestamp,
        //             redeem_fee as "redeem_fee: _",
        //             pinned as "pinned!: bool"
        //         FROM market
        //         JOIN "transaction" on (market.transaction_id = "transaction".id)
        //         LEFT JOIN "transaction" as "settled_transaction" on (market.settled_transaction_id = "settled_transaction".id)
        //         WHERE market.id = ?
        //     "#,
        //     market_id
        // )
        // .fetch_one(transaction.as_mut())
        // .await?;

        let redeemables = if let Some(_redeemable_settings) = edit_market.redeemable_settings {
            // not supported for now, not sure this won't break
            return Ok(Err(ValidationFailure::MarketNotRedeemable));
            // let Ok(mut redeem_fee) = Decimal::try_from(redeemable_settings.redeem_fee) else {
            //     return Ok(Err(ValidationFailure::InvalidRedeemFee));
            // };

            // if redeemable_settings
            //     .redeemable_for
            //     .iter()
            //     .any(|redeemable| redeemable.multiplier == 0)
            // {
            //     return Ok(Err(ValidationFailure::InvalidMultiplier));
            // }
            // let mut new_min_settlement = Decimal::ZERO;
            // let mut new_max_settlement = Decimal::ZERO;

            // if redeem_fee < Decimal::ZERO {
            //     return Ok(Err(ValidationFailure::InvalidRedeemFee));
            // }
            // for redeemable in &redeemable_settings.redeemable_for {
            //     let Some(constituent) = sqlx::query!(
            //         r#"
            //             SELECT
            //                 min_settlement as "min_settlement: Text<Decimal>",
            //                 max_settlement as "max_settlement: Text<Decimal>",
            //                 settled_price IS NOT NULL as "settled: bool"
            //             FROM market
            //             WHERE id = ?
            //         "#,
            //         redeemable.constituent_id
            //     )
            //     .fetch_optional(transaction.as_mut())
            //     .await?
            //     else {
            //         return Ok(Err(ValidationFailure::ConstituentNotFound));
            //     };

            //     if constituent.settled {
            //         return Ok(Err(ValidationFailure::ConstituentSettled));
            //     }

            //     // Handle negative multipliers correctly
            //     let min_settlement_payout =
            //         constituent.min_settlement.0 * Decimal::from(redeemable.multiplier);
            //     let max_settlement_payout =
            //         constituent.max_settlement.0 * Decimal::from(redeemable.multiplier);

            //     new_min_settlement += min_settlement_payout.min(max_settlement_payout);
            //     new_max_settlement += min_settlement_payout.max(max_settlement_payout);
            // }

            // if new_min_settlement != Decimal::from(old_market.min_settlement.0) {
            //     return Ok(Err(ValidationFailure::InvalidSettlement));
            // }
            // if new_max_settlement != Decimal::from(old_market.max_settlement.0) {
            //     return Ok(Err(ValidationFailure::InvalidSettlement));
            // }
            // redeem_fee = redeem_fee.normalize();
            // if redeem_fee.scale() > 4 || redeem_fee.mantissa() > 1_000_000_000_000 {
            //     return Ok(Err(ValidationFailure::InvalidRedeemFee));
            // }
            // let redeem_fee = Text(redeem_fee);
            // sqlx::query!(
            //     r#"
            //         UPDATE market
            //         SET redeem_fee = ?
            //         WHERE id = ?
            //     "#,
            //     redeem_fee,
            //     market_id,
            // )
            // .execute(transaction.as_mut())
            // .await?;

            // sqlx::query!(
            //     r#"
            //         DELETE FROM redeemable
            //         WHERE fund_id = ?
            //     "#,
            //     market_id,
            // )
            // .execute(transaction.as_mut())
            // .await?;
            // let mut redeemables = Vec::new();
            // for redeemable in redeemable_settings.redeemable_for {
            //     let redeemable = sqlx::query_as!(
            //         Redeemable,
            //         r#"
            //             INSERT INTO redeemable (fund_id, constituent_id, multiplier)
            //             VALUES (?, ?, ?)
            //             RETURNING fund_id, constituent_id, multiplier as "multiplier: _"
            //         "#,
            //         market_id,
            //         redeemable.constituent_id,
            //         redeemable.multiplier,
            //     )
            //     .fetch_one(transaction.as_mut())
            //     .await?;
            //     redeemables.push(redeemable);
            // }
            // redeemables
        } else {
            sqlx::query_as!(
                Redeemable,
                r#"
                    SELECT fund_id, constituent_id, multiplier as "multiplier: _"
                    FROM redeemable
                    WHERE fund_id = ?
                "#,
                market_id
            )
            .fetch_all(transaction.as_mut())
            .await?
        };

        if let Some(name) = edit_market.name {
            sqlx::query!(
                r#"
                UPDATE market
                SET name = ?
                WHERE id = ?
                "#,
                name,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;
        }
        if let Some(description) = edit_market.description {
            sqlx::query!(
                r#"
                UPDATE market
                SET description = ?
                WHERE id = ?
                "#,
                description,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        if let Some(pinned) = edit_market.pinned {
            sqlx::query!(
                r#"
                UPDATE market
                SET pinned = ?
                WHERE id = ?
                "#,
                pinned,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;
        }
        let old_status = sqlx::query_scalar!(
            r#"SELECT status as "status!: i32" FROM market WHERE id = ?"#,
            market_id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        sqlx::query!(
            r#"
            UPDATE market
            SET status = ?
            WHERE id = ?
            "#,
            market_status,
            market_id
        )
        .execute(transaction.as_mut())
        .await?;
        if old_status != market_status {
            sqlx::query!(
                r#"
                    INSERT INTO market_status_change (market_id, status, transaction_id)
                    VALUES (?, ?, ?)
                "#,
                market_id,
                market_status,
                transaction_info.id,
            )
            .execute(transaction.as_mut())
            .await?;
        }

        if let Some(hide_account_ids) = edit_market.hide_account_ids {
            sqlx::query!(
                r#"
                UPDATE market
                SET hide_account_ids = ?
                WHERE id = ?
                "#,
                hide_account_ids,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;
        }
        let visible_to = if edit_market.update_visible_to.is_some() {
            sqlx::query!(
                r#"
                DELETE FROM market_visible_to
                WHERE market_id = ?
                "#,
                market_id
            )
            .execute(transaction.as_mut())
            .await?;

            for account_id in &edit_market.visible_to {
                sqlx::query!(
                    r#"
                        INSERT INTO market_visible_to (market_id, account_id)
                        VALUES (?, ?)
                    "#,
                    market_id,
                    account_id
                )
                .execute(transaction.as_mut())
                .await?;
            }
            edit_market.visible_to
        } else {
            let visible_to_rows = sqlx::query!(
                r#"
                   SELECT account_id
                   FROM market_visible_to
                   WHERE market_id = ?
                   "#,
                market_id
            )
            .fetch_all(transaction.as_mut())
            .await?;

            // Convert the rows to a Vec<i64> of account_ids
            visible_to_rows
                .into_iter()
                .map(|row| row.account_id)
                .collect::<Vec<i64>>()
        };

        let market_row = sqlx::query_as!(
            MarketRow,
            r#"
                SELECT
                    market.id as id,
                    name,
                    description,
                    owner_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    min_settlement as "min_settlement: _",
                    max_settlement as "max_settlement: _",
                    settled_price as "settled_price: _",
                    settled_transaction_id,
                    settled_transaction.timestamp as settled_transaction_timestamp,
                    redeem_fee as "redeem_fee: _",
                    pinned as "pinned!: bool",
                    type_id,
                    group_id,
                    status as "status!: i32",
                    universe_id
                FROM market
                JOIN "transaction" on (market.transaction_id = "transaction".id)
                LEFT JOIN "transaction" as "settled_transaction" on (market.settled_transaction_id = "settled_transaction".id)
                WHERE market.id = ?
            "#,
            market_id,
        )
        .fetch_one(transaction.as_mut())
        .await?;
        let market = Market::from(market_row);

        // Fetch option info for edit_market return
        let option_info = sqlx::query!(
            r#"
                SELECT
                    underlying_market_id,
                    strike_price as "strike_price: Text<Decimal>",
                    is_call as "is_call: bool",
                    expiration_date as "expiration_date: OffsetDateTime"
                FROM option_market
                WHERE market_id = ?
            "#,
            market.id
        )
        .fetch_optional(transaction.as_mut())
        .await?
        .map(|row| OptionInfo {
            underlying_market_id: row.underlying_market_id,
            strike_price: row.strike_price,
            is_call: row.is_call,
            expiration_date: row.expiration_date,
        });

        transaction.commit().await?;
        Ok(Ok(MarketWithRedeemables {
            market,
            redeemables,
            visible_to,
            option_info,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn settle_market(
        &self,
        user_id: i64,
        admin_id: Option<i64>,
        settle_market: websocket_api::SettleMarket,
    ) -> SqlxResult<ValidationResult<MarketSettledWithAffectedAccounts>> {
        let Ok(mut settled_price) = Decimal::try_from(settle_market.settle_price) else {
            return Ok(Err(ValidationFailure::InvalidSettlementPrice));
        };

        let is_admin_override = admin_id.is_some();

        let (mut transaction, transaction_info) = self.begin_write().await?;

        let market_row: MarketRow = sqlx::query_as(
            r#"
                SELECT
                    market.id as id,
                    name,
                    description,
                    owner_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    min_settlement,
                    max_settlement,
                    settled_price,
                    settled_transaction_id,
                    settled_transaction.timestamp as settled_transaction_timestamp,
                    redeem_fee,
                    pinned,
                    type_id,
                    group_id,
                    status,
                    universe_id
                FROM market
                JOIN "transaction" on (market.transaction_id = "transaction".id)
                LEFT JOIN "transaction" as "settled_transaction" on (market.settled_transaction_id = "settled_transaction".id)
                WHERE market.id = ?
            "#
        )
        .bind(settle_market.market_id)
        .fetch_one(transaction.as_mut())
        .await?;
        let mut market = Market::from(market_row);

        if market.settled_price.is_some() {
            return Ok(Err(ValidationFailure::MarketSettled));
        }

        // Option markets cannot be settled — positions are closed via exercise only
        let is_option = sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM option_market WHERE market_id = ?) as "exists!: bool""#,
            market.id
        )
        .fetch_one(transaction.as_mut())
        .await?;
        if is_option {
            return Ok(Err(ValidationFailure::NotOptionMarket));
        }

        if market.owner_id != user_id && !is_admin_override {
            return Ok(Err(ValidationFailure::NotMarketOwner));
        }

        let constituent_settlements = sqlx::query!(
            r#"
                SELECT
                    settled_price as "settled_price: Text<Decimal>",
                    multiplier
                FROM redeemable
                JOIN market ON (constituent_id = market.id)
                WHERE fund_id = ?
            "#,
            market.id
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
                return Ok(Err(ValidationFailure::ConstituentNotSettled));
            }
        }

        let settled_price = settled_price.normalize();

        if settled_price.scale() > 2 {
            return Ok(Err(ValidationFailure::InvalidSettlementPrice));
        }

        if market.min_settlement.0 > settled_price || market.max_settlement.0 < settled_price {
            return Ok(Err(ValidationFailure::InvalidSettlementPrice));
        }

        let settled_price = Text(settled_price);
        sqlx::query!(
            r#"UPDATE market SET settled_price = ?, settled_transaction_id = ? WHERE id = ?"#,
            settled_price,
            transaction_info.id,
            market.id,
        )
        .execute(transaction.as_mut())
        .await?;

        market.settled_price = Some(settled_price);
        market.settled_transaction_id = Some(transaction_info.id);
        market.settled_transaction_timestamp = Some(transaction_info.timestamp);

        let canceled_orders = sqlx::query_scalar!(
            r#"
                UPDATE "order"
                SET size = '0'
                WHERE market_id = ?
                AND CAST(size AS REAL) > 0
                RETURNING id
            "#,
            market.id
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
            r#"
                DELETE FROM exposure_cache
                WHERE market_id = ?
                RETURNING
                    account_id,
                    position as "position: Text<Decimal>"
            "#,
            market.id
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

        let visible_to_rows = sqlx::query!(
            r#"
               SELECT account_id
               FROM market_visible_to
               WHERE market_id = ?
               "#,
            market.id
        )
        .fetch_all(transaction.as_mut())
        .await?;

        // Convert the rows to a Vec<i64> of account_ids
        let visible_to = visible_to_rows
            .into_iter()
            .map(|row| row.account_id)
            .collect::<Vec<i64>>();

        transaction.commit().await?;

        let affected_accounts = account_positions
            .into_iter()
            .map(|row| row.account_id)
            .collect();

        Ok(Ok(MarketSettledWithAffectedAccounts {
            market_settled: MarketSettled {
                id: market.id,
                settle_price: settled_price,
                transaction_info,
            },
            affected_accounts,
            visible_to,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn create_auction(
        &self,
        owner_id: i64,
        create_auction: websocket_api::CreateAuction,
    ) -> SqlxResult<ValidationResult<AuctionWithBuyers>> {
        let (mut transaction, transaction_info) = self.begin_write().await?;

        let auction = sqlx::query_as!(
            Auction,
            r#"
                INSERT INTO auction (
                    name,
                    description,
                    transaction_id,
                    owner_id,
                    buyer_id,
                    image_filename,
                    bin_price
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING
                    id,
                    name,
                    description,
                    owner_id,
                    buyer_id,
                    transaction_id,
                    settled_price as "settled_price: _",
                    bin_price as "bin_price: _",
                    ? as "transaction_timestamp!: _",
                    image_filename
            "#,
            create_auction.name,
            create_auction.description,
            transaction_info.id,
            owner_id,
            0,
            create_auction.image_filename,
            create_auction.bin_price,
            transaction_info.timestamp
        )
        .fetch_one(transaction.as_mut())
        .await?;

        transaction.commit().await?;
        Ok(Ok(AuctionWithBuyers {
            auction,
            buyers: vec![],
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn settle_auction(
        &self,
        admin_id: i64,
        settle_auction: websocket_api::SettleAuction,
    ) -> SqlxResult<ValidationResult<AuctionSettledWithAffectedAccounts>> {
        struct InputContribution {
            buyer_id: i64,
            amount: Decimal,
        }

        let Ok(total_price) = Decimal::try_from(settle_auction.settle_price) else {
            return Ok(Err(ValidationFailure::InvalidSettlementPrice));
        };

        let auction_id = settle_auction.auction_id;

        let (mut transaction, transaction_info) = self.begin_write().await?;

        let mut auction = sqlx::query_as!(
            Auction,
            r#"
                SELECT
                    auction.id as id,
                    name,
                    description,
                    owner_id,
                    buyer_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    settled_price as "settled_price: _",
                    bin_price as "bin_price: _",
                    image_filename
                FROM auction
                JOIN "transaction" on (auction.transaction_id = "transaction".id)
                WHERE auction.id = ?
            "#,
            auction_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let seller_id = auction.owner_id;

        if auction.settled_price.is_some() {
            return Ok(Err(ValidationFailure::MarketSettled));
        }

        // Resolve total_price (handles bin-price marker -1.0 in legacy single-buyer flow).
        let total_price = if let Some(bin_price) = auction.bin_price {
            if settle_auction.contributions.is_empty()
                && (settle_auction.settle_price - (-1.0)).abs() < f64::EPSILON
            {
                bin_price.0
            } else if settle_auction.settle_price < 0.0 {
                return Ok(Err(ValidationFailure::InvalidSettlementPrice));
            } else {
                total_price
            }
        } else if settle_auction.settle_price < 0.0 {
            return Ok(Err(ValidationFailure::InvalidSettlementPrice));
        } else {
            total_price
        };

        let total_price = total_price.normalize();
        if total_price.scale() > 2 {
            return Ok(Err(ValidationFailure::InvalidSettlementPrice));
        }

        // Build the contributions list. If the client sent the legacy single-buyer fields,
        // synthesize a single contribution from them.
        let contributions: Vec<InputContribution> = if settle_auction.contributions.is_empty() {
            vec![InputContribution {
                buyer_id: settle_auction.buyer_id,
                amount: total_price,
            }]
        } else {
            let mut out = Vec::with_capacity(settle_auction.contributions.len());
            for c in &settle_auction.contributions {
                let Ok(amount) = Decimal::try_from(c.amount) else {
                    return Ok(Err(ValidationFailure::InvalidSettlementPrice));
                };
                let amount = amount.normalize();
                if amount.scale() > 2 {
                    return Ok(Err(ValidationFailure::InvalidSettlementPrice));
                }
                if amount < dec!(0.0) {
                    return Ok(Err(ValidationFailure::ContributionMustNotBeNegative));
                }
                out.push(InputContribution {
                    buyer_id: c.buyer_id,
                    amount,
                });
            }
            out
        };

        if contributions.is_empty() {
            return Ok(Err(ValidationFailure::EmptyContributions));
        }

        // No duplicate contributors.
        let mut seen = std::collections::HashSet::new();
        for c in &contributions {
            if !seen.insert(c.buyer_id) {
                return Ok(Err(ValidationFailure::DuplicateContributor));
            }
            if c.buyer_id == seller_id {
                return Ok(Err(ValidationFailure::BuyerIsSeller));
            }
        }

        // Sum of contributions must equal the declared total.
        let sum: Decimal = contributions.iter().map(|c| c.amount).sum();
        if sum.normalize() != total_price {
            return Ok(Err(ValidationFailure::ContributionsDontSumToTotal));
        }

        // Resolve labeled owner. owner_id == 0 (or unset) means "no owner picked".
        // For a single-contributor settle, default the owner to that sole contributor
        // so existing single-buyer behavior is unchanged.
        let labeled_owner: i64 = match settle_auction.owner_id {
            Some(id) if id != 0 => {
                if !contributions.iter().any(|c| c.buyer_id == id) {
                    return Ok(Err(ValidationFailure::OwnerNotInContributions));
                }
                id
            }
            _ => {
                if contributions.len() == 1 {
                    contributions[0].buyer_id
                } else {
                    0
                }
            }
        };

        let total_text = Text(total_price);

        sqlx::query!(
            r#"UPDATE auction SET settled_price = ?, buyer_id = ? WHERE id = ?"#,
            total_text,
            labeled_owner,
            auction.id,
        )
        .execute(transaction.as_mut())
        .await?;

        auction.settled_price = Some(total_text);

        // Read seller balance once; we'll compute its new balance after the loop.
        let Text(mut seller_balance) = sqlx::query_scalar!(
            r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
            seller_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let mut transfers: Vec<Transfer> = Vec::with_capacity(contributions.len());
        let mut auction_buyer_rows: Vec<AuctionBuyer> = Vec::with_capacity(contributions.len());
        let mut affected_accounts: Vec<i64> = Vec::with_capacity(contributions.len() + 1);
        affected_accounts.push(seller_id);

        let is_split = contributions.len() > 1;

        for c in &contributions {
            let buyer_id = c.buyer_id;
            let amount = c.amount;

            let Text(buyer_balance) = sqlx::query_scalar!(
                r#"SELECT balance as "balance: Text<Decimal>" FROM account WHERE id = ?"#,
                buyer_id
            )
            .fetch_one(transaction.as_mut())
            .await?;

            let buyer_new_balance = buyer_balance - amount;
            if buyer_new_balance < dec!(0.0) {
                return Ok(Err(ValidationFailure::InsufficientFunds));
            }
            seller_balance += amount;

            let buyer_new_balance_text = Text(buyer_new_balance);
            sqlx::query!(
                r#"UPDATE account SET balance = ? WHERE id = ?"#,
                buyer_new_balance_text,
                buyer_id,
            )
            .execute(transaction.as_mut())
            .await?;

            let amount_text = Text(amount);
            sqlx::query!(
                r#"INSERT INTO auction_buyer (auction_id, account_id, amount) VALUES (?, ?, ?)"#,
                auction.id,
                buyer_id,
                amount_text,
            )
            .execute(transaction.as_mut())
            .await?;

            auction_buyer_rows.push(AuctionBuyer {
                auction_id: auction.id,
                account_id: buyer_id,
                amount: amount_text,
            });

            let note = if is_split {
                let pct = (amount / total_price) * dec!(100.0);
                let pct = pct.round_dp(1).normalize();
                std::format!("Auction Settlement of {} ({pct}% split)", auction.name)
            } else {
                std::format!("Auction Settlement of {}", auction.name)
            };

            let transfer = sqlx::query_as!(
                Transfer,
                r#"
                    INSERT INTO transfer (
                        initiator_id,
                        from_account_id,
                        to_account_id,
                        transaction_id,
                        amount,
                        note
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    RETURNING
                        id,
                        initiator_id,
                        from_account_id,
                        to_account_id,
                        transaction_id,
                        ? as "transaction_timestamp!: _",
                        amount as "amount: _",
                        note
                "#,
                admin_id,
                buyer_id,
                seller_id,
                transaction_info.id,
                amount_text,
                note,
                transaction_info.timestamp
            )
            .fetch_one(transaction.as_mut())
            .await?;

            transfers.push(transfer);
            affected_accounts.push(buyer_id);
        }

        let seller_balance_text = Text(seller_balance);
        sqlx::query!(
            r#"UPDATE account SET balance = ? WHERE id = ?"#,
            seller_balance_text,
            seller_id
        )
        .execute(transaction.as_mut())
        .await?;

        transaction.commit().await?;

        Ok(Ok(AuctionSettledWithAffectedAccounts {
            auction_settled: AuctionSettled {
                id: auction.id,
                settle_price: total_text,
                buyer_id: labeled_owner,
                transaction_info,
                buyers: auction_buyer_rows,
            },
            affected_accounts,
            transfers,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn create_order(
        &self,
        owner_id: i64,
        create_order: websocket_api::CreateOrder,
    ) -> SqlxResult<ValidationResult<OrderCreated>> {
        let Ok(price) = Decimal::try_from(create_order.price) else {
            return Ok(Err(ValidationFailure::InvalidPrice));
        };
        let Ok(size) = Decimal::try_from(create_order.size) else {
            return Ok(Err(ValidationFailure::InvalidSize));
        };
        let side = match create_order.side() {
            websocket_api::Side::Unknown => {
                return Ok(Err(ValidationFailure::NoSideProvided));
            }
            websocket_api::Side::Bid => Side::Bid,
            websocket_api::Side::Offer => Side::Offer,
        };
        let market_id = create_order.market_id;
        let price = price.normalize();
        let size = size.normalize();

        if price.scale() > 2 || price.mantissa() > 1_000_000_000_000 {
            return Ok(Err(ValidationFailure::InvalidPrice));
        }

        if size <= dec!(0) || size.scale() > 2 || size.mantissa() > 1_000_000_000_000 {
            return Ok(Err(ValidationFailure::InvalidSize));
        }

        let (mut transaction, transaction_info) = self.begin_write().await?;
        let market = sqlx::query!(
            r#"
                SELECT
                    min_settlement as "min_settlement: Text<Decimal>",
                    max_settlement as "max_settlement: Text<Decimal>",
                    settled_price IS NOT NULL as "settled: bool",
                    status,
                    universe_id
                FROM market
                WHERE id = ?
            "#,
            market_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(market) = market else {
            return Ok(Err(ValidationFailure::MarketNotFound));
        };

        // Validate that the account is in the same universe as the market
        let account_universe = sqlx::query_scalar!(
            r#"SELECT universe_id FROM account WHERE id = ?"#,
            owner_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        if let Some(account_universe) = account_universe {
            if account_universe != market.universe_id {
                return Ok(Err(ValidationFailure::CrossUniverseTrade));
            }
        }

        if market.settled {
            return Ok(Err(ValidationFailure::MarketSettled));
        }
        if market.status != i64::from(websocket_api::MarketStatus::Open as i32) {
            return Ok(Err(ValidationFailure::MarketPaused));
        }
        if price < market.min_settlement.0 || price > market.max_settlement.0 {
            return Ok(Err(ValidationFailure::InvalidPrice));
        }

        // Check if this is an option market (for contract creation on trades)
        let is_option_market = sqlx::query_scalar!(
            r#"SELECT EXISTS(SELECT 1 FROM option_market WHERE market_id = ?) as "exists!: bool""#,
            market_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

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
            return Ok(Err(ValidationFailure::AccountNotFound));
        };

        if portfolio.available_balance.is_sign_negative() {
            return Ok(Err(ValidationFailure::InsufficientFunds));
        }

        let side = Text(side);

        // Overfetch to avoid floating point issues
        let condition_price = match side.0 {
            Side::Bid => Text(price + dec!(0.000001)),
            Side::Offer => Text(price - dec!(0.000001)),
        };

        // check for potential fills
        let mut potential_fills = match side.0 {
            Side::Bid => sqlx::query_as!(
                Order,
                r#"
                    SELECT
                        id as "id!",
                        market_id,
                        owner_id,
                        transaction_id,
                        NULL as "transaction_timestamp: _",
                        size as "size: _",
                        price as "price: _",
                        side as "side: Text<Side>"
                    FROM "order"
                    WHERE market_id = ?
                        AND side = ?
                        AND CAST(size AS REAL) > 0
                        AND CAST(price AS REAL) <= ?
                    ORDER BY CAST(price AS REAL), transaction_id
                "#,
                market_id,
                Text(Side::Offer),
                condition_price
            )
            .fetch(transaction.as_mut()),
            Side::Offer => sqlx::query_as!(
                Order,
                r#"
                    SELECT
                        id as "id!",
                        market_id,
                        owner_id,
                        transaction_id,
                        NULL as "transaction_timestamp: _",
                        size as "size: _",
                        price as "price: _",
                        side as "side: Text<Side>"
                    FROM "order"
                    WHERE market_id = ?
                        AND side = ?
                        AND CAST(size AS REAL) > 0
                        AND CAST(price AS REAL) >= ?
                    ORDER BY CAST(price AS REAL) DESC, transaction_id
                "#,
                market_id,
                Text(Side::Bid),
                condition_price
            )
            .fetch(transaction.as_mut()),
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
                r#"
                    INSERT INTO "order" (
                        market_id,
                        owner_id,
                        transaction_id,
                        size,
                        price,
                        side
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    RETURNING
                        id,
                        market_id,
                        owner_id,
                        transaction_id,
                        ? as "transaction_timestamp: _",
                        size as "size: _",
                        price as "price: _",
                        side as "side: _"
                "#,
                market_id,
                owner_id,
                transaction_info.id,
                size_remaining,
                price,
                side,
                transaction_info.timestamp
            )
            .fetch_one(transaction.as_mut())
            .await?;
            sqlx::query!(
                r#"
                    INSERT INTO order_size (
                        order_id,
                        transaction_id,
                        size
                    ) VALUES (?, ?, ?)
                "#,
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
                let (buyer_id, seller_id, buyer_is_taker) = match side.0 {
                    Side::Bid => (owner_id, fill.owner_id, true),
                    Side::Offer => (fill.owner_id, owner_id, false),
                };
                let trade = sqlx::query_as!(
                    Trade,
                    r#"
                        INSERT INTO trade (
                            market_id,
                            buyer_id,
                            seller_id,
                            transaction_id,
                            size,
                            price,
                            buyer_is_taker
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        RETURNING
                            id as "id!",
                            market_id,
                            buyer_id,
                            seller_id,
                            transaction_id,
                            size as "size: _",
                            price as "price: _",
                            ? as "transaction_timestamp!: _",
                            buyer_is_taker as "buyer_is_taker: _"
                    "#,
                    market_id,
                    buyer_id,
                    seller_id,
                    transaction_info.id,
                    size,
                    price,
                    buyer_is_taker,
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
                // Create option contract if this is an option market
                if is_option_market {
                    let contract_amount = &trade.size;
                    sqlx::query!(
                        r#"
                            INSERT INTO option_contract (option_market_id, buyer_id, writer_id, remaining_amount, trade_id)
                            VALUES (?, ?, ?, ?, ?)
                        "#,
                        market_id,
                        trade.buyer_id,
                        trade.seller_id,
                        contract_amount,
                        trade.id,
                    )
                    .execute(transaction.as_mut())
                    .await?;
                }

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

        Ok(Ok(OrderCreated {
            market_id,
            account_id: owner_id,
            order,
            fills: order_fills,
            trades,
            transaction_info,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn cancel_order(
        &self,
        owner_id: i64,
        cancel_order: websocket_api::CancelOrder,
    ) -> SqlxResult<ValidationResult<OrderCancelled>> {
        let (mut transaction, transaction_info) = self.begin_write().await?;

        let order = sqlx::query_as!(
            Order,
            r#"
                SELECT
                    id as "id!",
                    market_id,
                    owner_id,
                    transaction_id,
                    NULL as "transaction_timestamp: _",
                    size as "size: _",
                    price as "price: _",
                    side as "side: _"
                FROM "order"
                WHERE id = ?
            "#,
            cancel_order.id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(order) = order else {
            return Ok(Err(ValidationFailure::OrderNotFound));
        };

        if order.size.is_zero() {
            return Ok(Err(ValidationFailure::OrderNotFound));
        }

        if order.owner_id != owner_id {
            return Ok(Err(ValidationFailure::NotOrderOwner));
        }

        let market_status = sqlx::query_scalar!(
            r#"
                SELECT status as "status!: i32"
                FROM market
                WHERE id = ?
            "#,
            order.market_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(market_status) = market_status else {
            return Ok(Err(ValidationFailure::MarketNotFound));
        };

        if market_status == websocket_api::MarketStatus::Paused as i32 {
            return Ok(Err(ValidationFailure::MarketPaused));
        }

        sqlx::query!(
            r#"UPDATE "order" SET size = '0' WHERE id = ?"#,
            cancel_order.id
        )
        .execute(transaction.as_mut())
        .await?;
        sqlx::query!(
            r#"INSERT INTO order_size (order_id, transaction_id, size) VALUES (?, ?, '0')"#,
            cancel_order.id,
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

        Ok(Ok(OrderCancelled {
            order_id: order.id,
            market_id: order.market_id,
            transaction_info,
        }))
    }

    #[instrument(err, skip(self))]
    pub async fn out(
        &self,
        owner_id: i64,
        out: websocket_api::Out,
    ) -> SqlxResult<ValidationResult<Vec<OrdersCancelled>>> {
        let (mut transaction, transaction_info) = self.begin_write().await?;

        // Determine which markets to cancel orders in
        let market_ids: Vec<i64> = if let Some(market_id) = out.market_id {
            // Single market - validate it exists and is not paused
            let market_status = sqlx::query_scalar!(
                r#"
                    SELECT status as "status!: i32"
                    FROM market
                    WHERE id = ?
                "#,
                market_id
            )
            .fetch_optional(transaction.as_mut())
            .await?;

            let Some(market_status) = market_status else {
                return Ok(Err(ValidationFailure::MarketNotFound));
            };

            if market_status == websocket_api::MarketStatus::Paused as i32 {
                return Ok(Err(ValidationFailure::MarketPaused));
            }

            vec![market_id]
        } else {
            // All markets - find all markets where this user has open orders (skip paused)
            let paused_status = websocket_api::MarketStatus::Paused as i32;
            sqlx::query_scalar!(
                r#"
                    SELECT DISTINCT o.market_id as "market_id!"
                    FROM "order" o
                    JOIN market m ON o.market_id = m.id
                    WHERE o.owner_id = ?
                    AND CAST(o.size AS REAL) > 0
                    AND m.status != ?
                "#,
                owner_id,
                paused_status
            )
            .fetch_all(transaction.as_mut())
            .await?
        };

        let side_filter = match out.side {
            Some(1) => Some(Side::Bid),   // websocket_api::Side::Bid = 1
            Some(2) => Some(Side::Offer), // websocket_api::Side::Offer = 2
            _ => None,
        };

        let mut results: Vec<OrdersCancelled> = Vec::new();

        for market_id in market_ids {
            let orders_affected = match side_filter {
                Some(side) => {
                    let side = Text(side);
                    sqlx::query_scalar!(
                        r#"
                            UPDATE "order"
                            SET size = '0'
                            WHERE market_id = ?
                            AND owner_id = ?
                            AND CAST(size AS REAL) > 0
                            AND side = ?
                            RETURNING id as "id!"
                        "#,
                        market_id,
                        owner_id,
                        side
                    )
                    .fetch_all(transaction.as_mut())
                    .await?
                }
                None => {
                    sqlx::query_scalar!(
                        r#"
                            UPDATE "order"
                            SET size = '0'
                            WHERE market_id = ?
                            AND owner_id = ?
                            AND CAST(size AS REAL) > 0
                            RETURNING id as "id!"
                        "#,
                        market_id,
                        owner_id
                    )
                    .fetch_all(transaction.as_mut())
                    .await?
                }
            };

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
                match out.side {
                    Some(1) => {  // websocket_api::Side::Bid = 1
                        sqlx::query!(
                            r#"
                                UPDATE exposure_cache
                                SET
                                    total_bid_size = '0',
                                    total_bid_value = '0'
                                WHERE
                                    account_id = ?
                                    AND market_id = ?
                            "#,
                            owner_id,
                            market_id
                        )
                        .execute(transaction.as_mut())
                        .await?;
                    }
                    Some(2) => {  // websocket_api::Side::Offer = 2
                        sqlx::query!(
                            r#"
                                UPDATE exposure_cache
                                SET
                                    total_offer_size = '0',
                                    total_offer_value = '0'
                                WHERE
                                    account_id = ?
                                    AND market_id = ?
                            "#,
                            owner_id,
                            market_id
                        )
                        .execute(transaction.as_mut())
                        .await?;
                    }
                    _ => {  // None, Unknown (0), or any other value
                        sqlx::query!(
                            r#"
                                UPDATE exposure_cache
                                SET
                                    total_bid_size = '0',
                                    total_offer_size = '0',
                                    total_bid_value = '0',
                                    total_offer_value = '0'
                                WHERE
                                    account_id = ?
                                    AND market_id = ?
                            "#,
                            owner_id,
                            market_id
                        )
                        .execute(transaction.as_mut())
                        .await?;
                    }
                }

                results.push(OrdersCancelled {
                    market_id,
                    orders_affected,
                    transaction_info: transaction_info.clone(),
                });
            }
        }

        transaction.commit().await?;

        Ok(Ok(results))
    }

    #[instrument(err, skip(self))]
    pub async fn delete_auction(
        &self,
        user_id: i64,
        delete_auction: websocket_api::DeleteAuction,
        admin_id: Option<i64>,
    ) -> SqlxResult<ValidationResult<i64>> {
        let auction_id = delete_auction.auction_id;

        let mut transaction = self.pool.begin().await?;

        let auction = sqlx::query!(
            r#"
                SELECT owner_id, settled_price IS NOT NULL as "settled: bool"
                FROM auction
                WHERE id = ?
            "#,
            auction_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(auction) = auction else {
            return Ok(Err(ValidationFailure::AuctionNotFound));
        };

        let is_admin = sqlx::query_scalar!(
            r#"
                SELECT EXISTS(
                    SELECT 1
                    FROM account
                    WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
                ) AS "exists!: bool"
            "#,
            user_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        // Only admins can delete settled auctions
        if auction.settled && !is_admin {
            return Ok(Err(ValidationFailure::AuctionSettled));
        }

        if auction.owner_id != user_id {
            if !is_admin {
                return Ok(Err(ValidationFailure::NotAuctionOwner));
            }
            if admin_id.is_none() {
                return Ok(Err(ValidationFailure::SudoRequired));
            }
        }

        sqlx::query!(r#"DELETE FROM auction WHERE id = ?"#, auction_id)
            .execute(transaction.as_mut())
            .await?;

        transaction.commit().await?;

        Ok(Ok(auction_id))
    }

    #[instrument(err, skip(self))]
    pub async fn edit_auction(
        &self,
        user_id: i64,
        edit_auction: websocket_api::EditAuction,
        admin_id: Option<i64>,
    ) -> SqlxResult<ValidationResult<AuctionWithBuyers>> {
        let auction_id = edit_auction.id;

        let mut transaction = self.pool.begin().await?;

        let auction = sqlx::query!(
            r#"
                SELECT owner_id, settled_price IS NOT NULL as "settled: bool"
                FROM auction
                WHERE id = ?
            "#,
            auction_id
        )
        .fetch_optional(transaction.as_mut())
        .await?;

        let Some(auction) = auction else {
            return Ok(Err(ValidationFailure::AuctionNotFound));
        };

        let is_admin = sqlx::query_scalar!(
            r#"
                SELECT EXISTS(
                    SELECT 1
                    FROM account
                    WHERE id = ? AND (kinde_id IS NOT NULL OR global_user_id IS NOT NULL OR email IS NOT NULL)
                ) AS "exists!: bool"
            "#,
            user_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        // Only admins can edit settled auctions
        if auction.settled && !is_admin {
            return Ok(Err(ValidationFailure::AuctionSettled));
        }

        if auction.owner_id != user_id {
            if !is_admin {
                return Ok(Err(ValidationFailure::NotAuctionOwner));
            }
            if admin_id.is_none() {
                return Ok(Err(ValidationFailure::SudoRequired));
            }
        }

        // Update only provided fields
        if let Some(name) = &edit_auction.name {
            sqlx::query!(r#"UPDATE auction SET name = ? WHERE id = ?"#, name, auction_id)
                .execute(transaction.as_mut())
                .await?;
        }

        if let Some(description) = &edit_auction.description {
            sqlx::query!(
                r#"UPDATE auction SET description = ? WHERE id = ?"#,
                description,
                auction_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        if let Some(image_filename) = &edit_auction.image_filename {
            sqlx::query!(
                r#"UPDATE auction SET image_filename = ? WHERE id = ?"#,
                image_filename,
                auction_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        if let Some(bin_price) = edit_auction.bin_price {
            sqlx::query!(
                r#"UPDATE auction SET bin_price = ? WHERE id = ?"#,
                bin_price,
                auction_id
            )
            .execute(transaction.as_mut())
            .await?;
        }

        // Fetch and return the updated auction
        let updated_auction = sqlx::query_as!(
            Auction,
            r#"
                SELECT
                    auction.id as id,
                    name,
                    description,
                    owner_id,
                    buyer_id,
                    transaction_id,
                    "transaction".timestamp as transaction_timestamp,
                    settled_price as "settled_price: _",
                    image_filename,
                    bin_price as "bin_price: _"
                FROM auction
                JOIN "transaction" on (auction.transaction_id = "transaction".id)
                WHERE auction.id = ?
            "#,
            auction_id
        )
        .fetch_one(transaction.as_mut())
        .await?;

        let buyers = sqlx::query_as!(
            AuctionBuyer,
            r#"
                SELECT
                    auction_id,
                    account_id,
                    amount as "amount: _"
                FROM auction_buyer
                WHERE auction_id = ?
                ORDER BY account_id
            "#,
            auction_id
        )
        .fetch_all(transaction.as_mut())
        .await?;

        transaction.commit().await?;

        Ok(Ok(AuctionWithBuyers {
            auction: updated_auction,
            buyers,
        }))
    }

    async fn begin_write(&self) -> SqlxResult<(sqlx::Transaction<'_, Sqlite>, TransactionInfo)> {
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

/// Letters used in redeem codes — full A-Z minus the visually ambiguous
/// `I`, `O`, `L`. 23 distinct letters.
const REDEEM_CODE_LETTERS: &[u8] = b"ABCDEFGHJKMNPQRSTUVWXYZ";
/// Digits used in redeem codes — 2-9 (no 0 or 1, which look like O and I).
const REDEEM_CODE_DIGITS: &[u8] = b"23456789";

fn generate_redeem_code() -> String {
    let mut rng = rand::thread_rng();
    let mut out = String::with_capacity(7);
    for _ in 0..3 {
        let idx = rng.gen_range(0..REDEEM_CODE_LETTERS.len());
        out.push(REDEEM_CODE_LETTERS[idx] as char);
    }
    out.push('-');
    for _ in 0..3 {
        let idx = rng.gen_range(0..REDEEM_CODE_DIGITS.len());
        out.push(REDEEM_CODE_DIGITS[idx] as char);
    }
    out
}

fn is_valid_redeem_code_format(s: &str) -> bool {
    let bytes = s.as_bytes();
    bytes.len() == 7
        && bytes[3] == b'-'
        && bytes[..3].iter().all(u8::is_ascii_uppercase)
        && bytes[4..].iter().all(u8::is_ascii_digit)
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
        r#"
            SELECT
                market_id,
                position as "position: _",
                total_bid_size as "total_bid_size: _",
                total_offer_size as "total_offer_size: _",
                total_bid_value as "total_bid_value: _",
                total_offer_value as "total_offer_value: _",
                min_settlement as "min_settlement: _",
                max_settlement as "max_settlement: _"
            FROM exposure_cache
            JOIN market on (market_id = market.id)
            WHERE account_id = ?
        "#,
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
        traded_market_ids: vec![],
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

    let existing_market_exposure = sqlx::query_as!(
        Exposure,
        r#"
            SELECT
                position as "position: Text<Decimal>",
                total_bid_size as "total_bid_size: Text<Decimal>",
                total_offer_size as "total_offer_size: Text<Decimal>",
                total_bid_value as "total_bid_value: Text<Decimal>",
                total_offer_value as "total_offer_value: Text<Decimal>"
            FROM exposure_cache
            WHERE account_id = ? AND market_id = ?
        "#,
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
            r#"
                INSERT INTO exposure_cache (
                    account_id,
                    market_id,
                    position,
                    total_bid_size,
                    total_offer_size,
                    total_bid_value,
                    total_offer_value
                ) VALUES (?, ?, '0', '0', '0', '0', '0')
                RETURNING
                    position as "position: Text<Decimal>",
                    total_bid_size as "total_bid_size: Text<Decimal>",
                    total_offer_size as "total_offer_size: Text<Decimal>",
                    total_bid_value as "total_bid_value: Text<Decimal>",
                    total_offer_value as "total_offer_value: Text<Decimal>"
            "#,
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
                r#"
                    UPDATE exposure_cache
                    SET
                        total_bid_size = ?,
                        total_bid_value = ?,
                        position = ?
                    WHERE
                        account_id = ?
                        AND market_id = ?
                "#,
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
                r#"
                    UPDATE exposure_cache
                    SET
                        total_offer_size = ?,
                        total_offer_value = ?,
                        position = ?
                    WHERE
                        account_id = ?
                        AND market_id = ?
                "#,
                total_offer_size,
                total_offer_value,
                position,
                owner_id,
                market_id,
            )
            .execute(transaction.as_mut())
            .await?;
        }
    }
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
        }
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
) -> SqlxResult<ValidationResult<()>> {
    if owner_portfolio.account_id != initiator_id
        && !owner_portfolio
            .owner_credits
            .iter()
            .any(|credit| credit.owner_id == initiator_id)
    {
        return Ok(Err(ValidationFailure::AccountNotOwned));
    }
    let is_shared_ownership = owned_portfolio.owner_credits.len() > 1;
    if is_shared_ownership
        && owned_portfolio
            .has_open_positions_recursive(transaction)
            .await?
    {
        return Ok(Err(
            ValidationFailure::SharedOwnershipAccountHasOpenPositions,
        ));
    }
    let new_credit = Text(new_credit);
    sqlx::query!(
        r#"
            UPDATE account_owner
            SET credit = ?
            WHERE account_id = ? AND owner_id = ?
        "#,
        new_credit,
        owned_portfolio.account_id,
        owner_portfolio.account_id
    )
    .execute(transaction.as_mut())
    .await?;
    Ok(Ok(()))
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

#[derive(Debug, Clone)]
pub struct TransactionInfo {
    pub id: i64,
    pub timestamp: OffsetDateTime,
}

pub struct EnsureUserCreatedSuccess {
    pub id: i64,
    pub name: Option<String>,
}

#[derive(Debug)]
pub struct MarketWithRedeemables {
    pub market: Market,
    pub redeemables: Vec<Redeemable>,
    pub visible_to: Vec<i64>,
    pub option_info: Option<OptionInfo>,
}

#[derive(Debug, Clone)]
pub struct OptionInfo {
    pub underlying_market_id: i64,
    pub strike_price: Text<Decimal>,
    pub is_call: bool,
    pub expiration_date: Option<OffsetDateTime>,
}

#[derive(Debug)]
pub struct OptionContract {
    pub id: i64,
    pub option_market_id: i64,
    pub buyer_id: i64,
    pub writer_id: i64,
    pub remaining_amount: Text<Decimal>,
}

#[derive(Debug)]
pub struct OptionExerciseResult {
    pub option_market_id: i64,
    pub exerciser_id: i64,
    pub counterparty_id: i64,
    pub amount: Text<Decimal>,
    pub is_cash_settled: bool,
    pub contract_id: i64,
    pub transaction_info: TransactionInfo,
}

#[derive(Debug)]
pub struct Size {
    pub order_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: Option<OffsetDateTime>,
    pub size: Text<Decimal>,
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
pub struct Account {
    pub id: i64,
    pub name: String,
    pub is_user: bool,
    pub universe_id: i64,
    pub color: Option<String>,
}

#[derive(Debug, FromRow)]
pub struct Universe {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub owner_id: Option<i64>,
}

#[derive(Debug, FromRow)]
pub struct Transfer {
    pub id: i64,
    pub initiator_id: i64,
    pub from_account_id: i64,
    pub to_account_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: Option<OffsetDateTime>,
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
pub struct OrdersCancelled {
    pub market_id: i64,
    pub orders_affected: Vec<i64>,
    pub transaction_info: TransactionInfo,
}

#[derive(Debug)]
pub struct Redeemed {
    pub account_id: i64,
    pub fund_id: i64,
    pub amount: Text<Decimal>,
    pub transaction_info: TransactionInfo,
}

#[derive(Debug)]
pub struct OrderCreated {
    pub market_id: i64,
    pub account_id: i64,
    pub order: Option<Order>,
    pub fills: Vec<OrderFill>,
    pub trades: Vec<Trade>,
    pub transaction_info: TransactionInfo,
}

#[derive(Debug)]
pub struct OrderCancelled {
    pub order_id: i64,
    pub market_id: i64,
    pub transaction_info: TransactionInfo,
}

#[derive(Debug)]
pub struct MarketSettledWithAffectedAccounts {
    pub affected_accounts: Vec<i64>,
    pub market_settled: MarketSettled,
    pub visible_to: Vec<i64>,
}

#[derive(Debug)]
pub struct AuctionSettledWithAffectedAccounts {
    pub affected_accounts: Vec<i64>,
    pub auction_settled: AuctionSettled,
    pub transfers: Vec<Transfer>,
}

#[derive(Debug)]
pub struct MarketSettled {
    pub id: i64,
    pub settle_price: Text<Decimal>,
    pub transaction_info: TransactionInfo,
}

#[derive(Debug)]
pub struct AuctionSettled {
    pub id: i64,
    pub buyer_id: i64,
    pub settle_price: Text<Decimal>,
    pub transaction_info: TransactionInfo,
    pub buyers: Vec<AuctionBuyer>,
}

#[derive(Debug)]
pub struct Portfolio {
    pub account_id: i64,
    pub total_balance: Decimal,
    pub available_balance: Decimal,
    pub market_exposures: Vec<MarketExposure>,
    pub owner_credits: Vec<OwnerCredit>,
    pub traded_market_ids: Vec<i64>,
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

#[derive(Debug)]
pub struct Trades {
    pub market_id: i64,
    pub trades: Vec<Trade>,
    pub has_full_history: bool,
    pub redemptions: Vec<Redeemed>,
}

#[derive(FromRow, Debug, Clone)]
pub struct Trade {
    pub id: i64,
    pub market_id: i64,
    pub buyer_id: i64,
    pub seller_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: Option<OffsetDateTime>,
    pub price: Text<Decimal>,
    pub size: Text<Decimal>,
    pub buyer_is_taker: bool,
}

#[derive(Debug)]
pub struct Orders {
    pub market_id: i64,
    pub orders: Vec<(Order, Vec<Size>)>,
    pub has_full_history: bool,
}

#[derive(FromRow, Debug, Clone)]
pub struct Order {
    pub id: i64,
    pub market_id: i64,
    pub owner_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: Option<OffsetDateTime>,
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

// Internal struct for SQLx deserialization (type_id and group_id are Option because columns are nullable)
#[derive(FromRow, Debug)]
struct MarketRow {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub owner_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: Option<OffsetDateTime>,
    pub min_settlement: Text<Decimal>,
    pub max_settlement: Text<Decimal>,
    pub settled_price: Option<Text<Decimal>>,
    pub settled_transaction_id: Option<i64>,
    pub settled_transaction_timestamp: Option<OffsetDateTime>,
    pub redeem_fee: Text<Decimal>,
    pub pinned: bool,
    pub type_id: Option<i64>,
    pub group_id: Option<i64>,
    pub status: i32,
    pub universe_id: i64,
}

impl From<MarketRow> for Market {
    fn from(row: MarketRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
            description: row.description,
            owner_id: row.owner_id,
            transaction_id: row.transaction_id,
            transaction_timestamp: row.transaction_timestamp,
            min_settlement: row.min_settlement,
            max_settlement: row.max_settlement,
            settled_price: row.settled_price,
            settled_transaction_id: row.settled_transaction_id,
            settled_transaction_timestamp: row.settled_transaction_timestamp,
            redeem_fee: row.redeem_fee,
            pinned: row.pinned,
            type_id: row.type_id.unwrap_or(1),
            group_id: row.group_id,
            status: row.status,
            universe_id: row.universe_id,
        }
    }
}

#[derive(Debug)]
pub struct Market {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub owner_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: Option<OffsetDateTime>,
    pub min_settlement: Text<Decimal>,
    pub max_settlement: Text<Decimal>,
    pub settled_price: Option<Text<Decimal>>,
    pub settled_transaction_id: Option<i64>,
    pub settled_transaction_timestamp: Option<OffsetDateTime>,
    pub redeem_fee: Text<Decimal>,
    pub pinned: bool,
    pub type_id: i64,
    pub group_id: Option<i64>,
    pub status: i32,
    pub universe_id: i64,
}

#[derive(Debug)]
pub struct MarketStatusChange {
    pub status: i32,
    pub transaction_id: i64,
    pub transaction_timestamp: OffsetDateTime,
}

#[derive(Debug)]
pub struct MarketType {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub public: bool,
}

#[derive(Debug)]
pub struct MarketGroup {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub type_id: i64,
}

#[derive(Debug)]
pub struct Auction {
    pub id: i64,
    pub name: String,
    pub description: String,
    pub owner_id: i64,
    pub buyer_id: i64,
    pub transaction_id: i64,
    pub transaction_timestamp: Option<OffsetDateTime>,
    pub settled_price: Option<Text<Decimal>>,
    pub image_filename: Option<String>,
    pub bin_price: Option<Text<Decimal>>,
}

#[derive(Debug, Clone)]
pub struct AuctionBuyer {
    pub auction_id: i64,
    pub account_id: i64,
    pub amount: Text<Decimal>,
}

#[derive(Debug)]
pub struct AuctionWithBuyers {
    pub auction: Auction,
    pub buyers: Vec<AuctionBuyer>,
}

#[derive(FromRow, Debug)]
struct WalCheckPointRow {
    busy: i64,
    log: i64,
    checkpointed: i64,
}

fn is_valid_account_color(color: &str) -> bool {
    color.len() == 7
        && color.starts_with('#')
        && color.as_bytes()[1..].iter().all(u8::is_ascii_hexdigit)
}

#[derive(Debug)]
pub enum ValidationFailure {
    // Market related
    MarketNotFound,
    MarketSettled,
    MarketPaused,
    InvalidMarketStatus,
    MarketNotRedeemable,
    InvalidSettlement,
    InvalidSettlementPrice,
    ConstituentNotFound,
    ConstituentSettled,
    ConstituentNotSettled,
    InvalidMultiplier,
    InvalidRedeemFee,
    NotMarketOwner,

    // Order related
    OrderNotFound,
    NotOrderOwner,
    InvalidPrice,
    InvalidSize,
    NoSideProvided,

    // Account related
    AccountNotFound,
    AccountNotOwned,
    SameAccount,
    InitiatorNotUser,
    OwnerNotAUser,
    RecipientNotAUser,
    NotOwner,
    AlreadyOwner,
    EmptyName,
    NameAlreadyExists,
    NameSuffixExhausted,
    InvalidAccountColor,
    InvalidOwner,
    OwnerInDifferentUniverse,
    OwnerMustBeUser,
    NoNameProvidedForNewUser,
    AccountNotShared,
    CreditRemaining,

    // Balance/Funds related
    InsufficientFunds,
    InsufficientCredit,
    InvalidAmount,
    SharedOwnershipAccountHasOpenPositions,
    AuctionNotFound,
    AuctionSettled,
    NotAuctionOwner,
    BuyerIsSeller,
    SudoRequired,
    VisibleToAccountNotFound,

    // Category related
    MarketTypeNotFound,
    MarketTypeNotPublic,
    MarketTypeNameExists,
    CannotDeleteLastMarketType,

    // Group related
    MarketGroupNotFound,
    MarketGroupNameExists,
    MarketGroupTypeMismatch,

    // Universe related
    CrossUniverseTransfer,
    CrossUniverseTrade,
    NotUniverseOwner,
    UniverseNameExists,
    UniverseNotFound,

    // Option related
    NotOptionMarket,
    ContractNotFound,
    NotContractBuyer,
    OptionExpired,
    UnderlyingNotSettled,
    InvalidStrikePrice,

    // Redeem code related
    InvalidRedeemCode,
    RedeemCodeNotFound,
    RedeemCodeAlreadyRedeemed,
    RedeemCodeExpired,

    // Auction split related
    EmptyContributions,
    DuplicateContributor,
    ContributionsDontSumToTotal,
    OwnerNotInContributions,
    ContributionMustNotBeNegative,
}

impl ValidationFailure {
    #[must_use]
    pub fn message(&self) -> &'static str {
        match self {
            // Market related
            Self::MarketNotFound => "Market not found",
            Self::MarketSettled => "Market already settled",
            Self::MarketPaused => "Market is paused",
            Self::InvalidMarketStatus => "Invalid market status",
            Self::MarketNotRedeemable => "Fund not found",
            Self::InvalidSettlement => "Invalid settlement prices",
            Self::InvalidSettlementPrice => "Invalid settlement price",
            Self::ConstituentNotFound => "Constituent not found",
            Self::ConstituentSettled => "Constituent already settled",
            Self::ConstituentNotSettled => "Constituent not settled",
            Self::InvalidMultiplier => "Invalid multiplier",
            Self::InvalidRedeemFee => "Invalid redeem fee",
            Self::NotMarketOwner => "Not market owner",

            // Order related
            Self::OrderNotFound => "Order not found",
            Self::NotOrderOwner => "Not order owner",
            Self::InvalidPrice => "Invalid price",
            Self::InvalidSize => "Invalid size",
            Self::NoSideProvided => "No side provided",
            // Account related
            Self::AccountNotFound => "Account not found",
            Self::AccountNotOwned => "Account not owned",
            Self::SameAccount => "Cannot pay yourself",
            Self::InitiatorNotUser => "Initiator not user",
            Self::OwnerNotAUser => "Owner not a user",
            Self::RecipientNotAUser => "Recipient not a user",
            Self::NotOwner => "Not owner",
            Self::AlreadyOwner => "Already owner",
            Self::EmptyName => "Account name cannot be empty",
            Self::NameAlreadyExists => "Account name already exists",
            Self::NameSuffixExhausted => "Could not find an available numeric suffix for this name",
            Self::InvalidAccountColor => "Account color must be a hex value like #aabbcc",
            Self::InvalidOwner => "Invalid owner",
            Self::OwnerInDifferentUniverse => "Owner must be in universe 0 or the same universe",
            Self::OwnerMustBeUser => "Owner from main universe must be a user account",
            Self::NoNameProvidedForNewUser => "No name provided for new user",
            Self::AccountNotShared => "Account already not shared",
            Self::CreditRemaining => "Ownership can only be revoked after removing all credits",
            // Balance/Funds related
            Self::InsufficientFunds => "Insufficient funds",
            Self::InsufficientCredit => "Insufficient credit",
            Self::InvalidAmount => "Invalid amount",
            Self::SharedOwnershipAccountHasOpenPositions => {
                "Shared ownership account has open positions"
            }
            Self::AuctionNotFound => "Auction not found",
            Self::AuctionSettled => "Cannot delete a settled auction",
            Self::NotAuctionOwner => "Not auction owner",
            Self::BuyerIsSeller => "Buyer is the seller — pick a different buyer",
            Self::SudoRequired => "Sudo required",
            Self::VisibleToAccountNotFound => "One or more visible_to accounts not found",
            // Category related
            Self::MarketTypeNotFound => "Category not found",
            Self::MarketTypeNotPublic => "Cannot create market with non-public category",
            Self::MarketTypeNameExists => "Category name already exists",
            Self::CannotDeleteLastMarketType => "Cannot delete the last category",
            // Group related
            Self::MarketGroupNotFound => "Market group not found",
            Self::MarketGroupNameExists => "Market group name already exists",
            Self::MarketGroupTypeMismatch => "Market category does not match group category",
            // Universe related
            Self::CrossUniverseTransfer => "Cannot transfer between accounts in different universes",
            Self::CrossUniverseTrade => "Cannot trade in a market from a different universe",
            Self::NotUniverseOwner => "Not the owner of this universe",
            Self::UniverseNameExists => "Universe name already exists",
            Self::UniverseNotFound => "Universe not found",
            // Option related
            Self::NotOptionMarket => "Option markets cannot be settled; use exercise instead",
            Self::ContractNotFound => "Option contract not found",
            Self::NotContractBuyer => "Not the buyer of this contract",
            Self::OptionExpired => "Option has expired",
            Self::UnderlyingNotSettled => "Underlying market not yet settled",
            Self::InvalidStrikePrice => "Invalid strike price",
            // Redeem code related
            Self::InvalidRedeemCode => "Invalid redeem code format",
            Self::RedeemCodeNotFound => "Redeem code not found",
            Self::RedeemCodeAlreadyRedeemed => "Redeem code already redeemed",
            Self::RedeemCodeExpired => "Redeem code has expired",
            // Auction split related
            Self::EmptyContributions => "At least one contributor is required",
            Self::DuplicateContributor => "The same buyer cannot appear more than once",
            Self::ContributionsDontSumToTotal => "Contributions must sum to the settle price",
            Self::OwnerNotInContributions => "Labeled owner must be one of the contributors",
            Self::ContributionMustNotBeNegative => "Contribution amount cannot be negative",
        }
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use itertools::Itertools;

    use super::*;

    #[sqlx::test(fixtures("accounts"))]
    async fn test_arbor_pixie_claim_on_first_global_user_connect(
        pool: SqlitePool,
    ) -> SqlxResult<()> {
        // Simulates the scenarios M2M connecting to an old cohort: there's an
        // existing "Arbor Pixie" row from the bootstrap migration with
        // global_user_id IS NULL, and our hardcode should claim it (set
        // global_user_id) instead of creating a suffixed twin.
        let db = DB {
            arbor_pixie_account_id: 6,
            pool: pool.clone(),
        };

        let existing_id = sqlx::query_scalar!(
            r#"SELECT id AS "id!: i64" FROM account WHERE name = 'Arbor Pixie'"#
        )
        .fetch_one(&pool)
        .await?;
        // Sanity: bootstrap row starts unclaimed.
        let existing_global = sqlx::query_scalar!(
            r#"SELECT global_user_id FROM account WHERE id = ?"#,
            existing_id
        )
        .fetch_one(&pool)
        .await?;
        assert!(existing_global.is_none());

        let m2m_global_user_id = 42;
        let result = db
            .ensure_user_created_by_global_id(
                m2m_global_user_id,
                None,
                ARBOR_PIXIE_ACCOUNT_NAME,
                dec!(100_000_000),
            )
            .await?
            .expect("ensure_user_created_by_global_id should succeed");

        assert_eq!(
            result.id, existing_id,
            "should reuse existing Arbor Pixie row, not create a new one"
        );
        let claimed = sqlx::query_scalar!(
            r#"SELECT global_user_id FROM account WHERE id = ?"#,
            existing_id
        )
        .fetch_one(&pool)
        .await?;
        assert_eq!(claimed, Some(m2m_global_user_id));

        // No second row was created with a suffixed name.
        let arbor_count = sqlx::query_scalar!(
            r#"SELECT COUNT(*) AS "n!: i64" FROM account WHERE name LIKE 'Arbor Pixie%'"#
        )
        .fetch_one(&pool)
        .await?;
        assert_eq!(arbor_count, 1);
        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_arbor_pixie_claim_idempotent_on_second_connect(
        pool: SqlitePool,
    ) -> SqlxResult<()> {
        // After the row is claimed, subsequent auths by the same global_user
        // resolve via the existing-by-global_user_id lookup (the first branch
        // of ensure_user_created_by_global_id) rather than re-claiming.
        let db = DB {
            arbor_pixie_account_id: 6,
            pool: pool.clone(),
        };
        let m2m_global_user_id = 42;
        let first = db
            .ensure_user_created_by_global_id(
                m2m_global_user_id,
                None,
                ARBOR_PIXIE_ACCOUNT_NAME,
                dec!(100_000_000),
            )
            .await?
            .expect("first connect");
        let second = db
            .ensure_user_created_by_global_id(
                m2m_global_user_id,
                None,
                ARBOR_PIXIE_ACCOUNT_NAME,
                dec!(100_000_000),
            )
            .await?
            .expect("second connect");
        assert_eq!(first.id, second.id);
        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_redeem(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };
        let redeemables = vec![
            websocket_api::Redeemable {
                constituent_id: 1,
                multiplier: -1,
            },
            websocket_api::Redeemable {
                constituent_id: 2,
                multiplier: 2,
            },
        ];
        let Ok(Ok(etf_market)) = db
            .create_market(
                1,
                websocket_api::CreateMarket {
                    name: "etf".into(),
                    description: "etf market".into(),
                    min_settlement: 0.0,
                    max_settlement: 0.0,
                    redeemable_for: redeemables,
                    redeem_fee: 2.0,
                    hide_account_ids: false,
                    visible_to: vec![],
                    type_id: 1,
                    group_id: 0,
                    option: None,
                },
                true,
                0, // universe_id
            )
            .await
        else {
            panic!("expected create etf market success");
        };
        assert_eq!(etf_market.market.min_settlement.0, dec!(-20));
        assert_eq!(etf_market.market.max_settlement.0, dec!(10));
        let etf_id = etf_market.market.id;
        let redeem_status = db
            .redeem(
                1,
                websocket_api::Redeem {
                    fund_id: 2,
                    amount: 1.0,
                },
            )
            .await?;
        assert!(matches!(
            redeem_status,
            Err(ValidationFailure::MarketNotRedeemable)
        ));
        let redeem_status = db
            .redeem(
                1,
                websocket_api::Redeem {
                    fund_id: etf_id,
                    amount: 1000.0,
                },
            )
            .await?;
        assert!(matches!(
            redeem_status,
            Err(ValidationFailure::InsufficientFunds)
        ));
        let redeem_status = db
            .redeem(
                1,
                websocket_api::Redeem {
                    fund_id: etf_id,
                    amount: 1.0,
                },
            )
            .await?;
        assert!(redeem_status.is_ok());

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
        // fee of 2
        assert_eq!(a_portfolio.total_balance, dec!(98));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[
                MarketExposure {
                    market_id: 1,
                    position: Text(dec!(-1)),
                    min_settlement: Text(dec!(10)),
                    max_settlement: Text(dec!(20)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 2,
                    position: Text(dec!(2)),
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
        // 100 - 10 - 20 * 1 - 2 = 68
        assert_eq!(a_portfolio.available_balance, dec!(68));
        let redeem_status = db
            .redeem(
                1,
                websocket_api::Redeem {
                    fund_id: etf_id,
                    amount: -1.0,
                },
            )
            .await?;
        assert!(redeem_status.is_ok());
        let a_portfolio = db.get_portfolio(1).await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(96));
        assert_eq!(
            &a_portfolio.market_exposures,
            &[
                MarketExposure {
                    market_id: 1,
                    position: Text(dec!(0)),
                    min_settlement: Text(dec!(10)),
                    max_settlement: Text(dec!(20)),
                    ..Default::default()
                },
                MarketExposure {
                    market_id: 2,
                    position: Text(dec!(0)),
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
        // 100 - 4 = 96
        assert_eq!(a_portfolio.available_balance, dec!(96));
        let settle_status = db
            .settle_market(
                1,
                None,
                websocket_api::SettleMarket {
                    market_id: 2,
                    settle_price: 7.0,
                },
            )
            .await?;
        assert!(settle_status.is_ok());
        let redeem_status = db
            .redeem(
                1,
                websocket_api::Redeem {
                    fund_id: etf_id,
                    amount: -1.0,
                },
            )
            .await?;
        assert!(matches!(
            redeem_status,
            Err(ValidationFailure::MarketSettled)
        ));
        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_make_user_to_user_transfer(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };
        let transfer_status = db
            .make_transfer(
                None,
                1,
                websocket_api::MakeTransfer {
                    from_account_id: 1,
                    to_account_id: 2,
                    amount: 1000.0,
                    note: "test transfer".into(),
                },
            )
            .await?;

        assert!(matches!(
            transfer_status,
            Err(ValidationFailure::InsufficientFunds)
        ));
        let transfer_status = db
            .make_transfer(
                None,
                1,
                websocket_api::MakeTransfer {
                    from_account_id: 1,
                    to_account_id: 2,
                    amount: -10.0,
                    note: "test transfer".into(),
                },
            )
            .await?;

        assert!(matches!(
            transfer_status,
            Err(ValidationFailure::InvalidAmount)
        ));

        let transfer_status = db
            .make_transfer(
                None,
                1,
                websocket_api::MakeTransfer {
                    from_account_id: 1,
                    to_account_id: 2,
                    amount: 10.0,
                    note: "test transfer".into(),
                },
            )
            .await?;
        assert!(transfer_status.is_ok());

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
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 30.0,
                    size: 1.0,
                    side: websocket_api::Side::Bid as i32,
                },
            )
            .await?;
        assert!(matches!(order_status, Err(ValidationFailure::InvalidPrice)));

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 15.0,
                    size: 100.0,
                    side: websocket_api::Side::Bid as i32,
                },
            )
            .await?;
        assert!(matches!(
            order_status,
            Err(ValidationFailure::InsufficientFunds)
        ));

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 15.0,
                    size: 100.0,
                    side: websocket_api::Side::Offer as i32,
                },
            )
            .await?;
        assert!(matches!(
            order_status,
            Err(ValidationFailure::InsufficientFunds)
        ));

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 15.0,
                    size: -1.0,
                    side: websocket_api::Side::Bid as i32,
                },
            )
            .await?;
        assert!(matches!(order_status, Err(ValidationFailure::InvalidSize)));

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 15.001,
                    size: 1.0,
                    side: websocket_api::Side::Bid as i32,
                },
            )
            .await?;
        assert!(matches!(order_status, Err(ValidationFailure::InvalidPrice)));

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 15.0100,
                    size: 1.0,
                    side: websocket_api::Side::Offer as i32,
                },
            )
            .await?;
        assert!(order_status.is_ok());

        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_create_and_cancel_single_bid(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 15.0,
                    size: 1.0,
                    side: websocket_api::Side::Bid as i32,
                },
            )
            .await?;
        let Ok(OrderCreated {
            order: Some(order), ..
        }) = order_status
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

        let all_orders = db
            .get_all_live_orders()
            .try_collect::<Vec<_>>()
            .await
            .unwrap();
        assert_eq!(all_orders.len(), 1);

        let Ok(_) = db
            .cancel_order(1, websocket_api::CancelOrder { id: order.id })
            .await?
        else {
            panic!("expected success cancel");
        };
        let all_orders = db
            .get_all_live_orders()
            .try_collect::<Vec<_>>()
            .await
            .unwrap();
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
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 15.0,
                    size: 1.0,
                    side: websocket_api::Side::Offer as i32,
                },
            )
            .await?;
        assert!(matches!(
            order_status,
            Ok(OrderCreated { order: Some(_), .. })
        ));

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
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 1,
                price: 12.0,
                size: 1.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();

        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 1,
                price: 16.0,
                size: 1.0,
                side: websocket_api::Side::Offer as i32,
            },
        )
        .await?
        .unwrap();

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
            .create_order(
                2,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 11.0,
                    size: 0.5,
                    side: websocket_api::Side::Offer as i32,
                },
            )
            .await?;

        let Ok(OrderCreated {
            trades,
            fills,
            order: None,
            ..
        }) = order_status
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
        assert!(matches!(fill.side, Side::Bid));

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
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 1,
                price: 12.0,
                size: 1.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 1,
                    price: 11.0,
                    size: 0.5,
                    side: websocket_api::Side::Offer as i32,
                },
            )
            .await?;

        let Ok(OrderCreated { trades, fills, .. }) = order_status else {
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
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 1,
                price: 15.0,
                size: 10.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();

        let order_status = db
            .create_order(
                1,
                websocket_api::CreateOrder {
                    market_id: 2,
                    price: 5.0,
                    size: 15.0,
                    side: websocket_api::Side::Bid as i32,
                },
            )
            .await?;

        assert!(matches!(
            order_status,
            Err(ValidationFailure::InsufficientFunds)
        ));

        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 2,
                price: 5.0,
                size: 10.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();

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
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 2,
                price: 3.0,
                size: 1.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();
        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 2,
                price: 4.0,
                size: 1.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();
        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 2,
                price: 5.0,
                size: 1.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();
        db.create_order(
            1,
            websocket_api::CreateOrder {
                market_id: 2,
                price: 6.0,
                size: 1.0,
                side: websocket_api::Side::Bid as i32,
            },
        )
        .await?
        .unwrap();

        let order_status = db
            .create_order(
                2,
                websocket_api::CreateOrder {
                    market_id: 2,
                    price: 3.5,
                    size: 4.0,
                    side: websocket_api::Side::Offer as i32,
                },
            )
            .await?;

        let Ok(OrderCreated {
            trades,
            fills,
            order: Some(order),
            ..
        }) = order_status
        else {
            panic!("expected success order");
        };

        assert_eq!(order.size.0, dec!(1));
        assert_eq!(order.price.0, dec!(3.5));
        assert!(matches!(order.side.0, Side::Offer));

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
        assert!(matches!(first_fill.side, Side::Bid));

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

        let market = db
            .settle_market(
                1,
                None,
                websocket_api::SettleMarket {
                    market_id: 2,
                    settle_price: 7.0,
                },
            )
            .await?;
        assert!(market.is_ok());

        let a_portfolio = db.get_portfolio(1).await?.unwrap();
        assert_eq!(a_portfolio.total_balance, dec!(106));
        assert_eq!(a_portfolio.available_balance, dec!(106));
        assert_eq!(a_portfolio.market_exposures.len(), 0);

        let b_portfolio = db.get_portfolio(2).await?.unwrap();
        assert_eq!(b_portfolio.total_balance, dec!(94));
        assert_eq!(b_portfolio.available_balance, dec!(94));
        assert_eq!(b_portfolio.market_exposures.len(), 0);

        let all_orders = db
            .get_all_live_orders()
            .try_collect::<Vec<_>>()
            .await
            .unwrap();
        assert_eq!(all_orders.len(), 0);

        let Ok(Trades { trades, .. }) = db.get_market_trades(2).await.unwrap() else {
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
    async fn test_create_account_empty_name(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        let status = db
            .create_account(
                1,
                websocket_api::CreateAccount {
                    owner_id: 1,
                    name: String::new(),
                    universe_id: 0,
                    initial_balance: 0.0,
                    color: None,
                },
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::EmptyName)));

        let status = db
            .create_account(
                1,
                websocket_api::CreateAccount {
                    owner_id: 1,
                    name: "   ".into(),
                    universe_id: 0,
                    initial_balance: 0.0,
                    color: None,
                },
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::EmptyName)));

        let status = db
            .create_account(
                1,
                websocket_api::CreateAccount {
                    owner_id: 1,
                    name: "test_bot".into(),
                    universe_id: 0,
                    initial_balance: 0.0,
                    color: None,
                },
            )
            .await?;
        assert!(status.is_ok());

        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_create_account_color(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        let status = db
            .create_account(
                1,
                websocket_api::CreateAccount {
                    owner_id: 1,
                    name: "test_bot_color".into(),
                    universe_id: 0,
                    initial_balance: 0.0,
                    color: Some("#AaBbCc".into()),
                },
            )
            .await?;
        let created = status.expect("expected account creation to succeed");
        assert_eq!(created.color.as_deref(), Some("#aabbcc"));

        let account = db
            .get_account(created.id)
            .await?
            .expect("created account should exist");
        assert_eq!(account.color.as_deref(), Some("#aabbcc"));

        let status = db
            .create_account(
                1,
                websocket_api::CreateAccount {
                    owner_id: 1,
                    name: "test_bot_bad_color".into(),
                    universe_id: 0,
                    initial_balance: 0.0,
                    color: Some("blue".into()),
                },
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::InvalidAccountColor)));

        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_is_allowed_to_act_as(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

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
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        // Test successful sharing between users
        let status = db
            .share_ownership(
                1,
                websocket_api::ShareOwnership {
                    of_account_id: 4,
                    to_account_id: 3,
                },
            )
            .await?; // a shares ab-child with c
        assert!(status.is_ok());

        // Verify the new ownership works
        assert!(db.get_owned_accounts(3).await?.contains(&4));
        assert!(db.get_owned_accounts(3).await?.contains(&5));

        // Test sharing when already an owner
        let status = db
            .share_ownership(
                1,
                websocket_api::ShareOwnership {
                    of_account_id: 4,
                    to_account_id: 2,
                },
            )
            .await?; // a tries to share ab-child with b who already owns it
        assert!(matches!(status, Err(ValidationFailure::AlreadyOwner)));

        // Test sharing when not a direct owner
        let status = db
            .share_ownership(
                1,
                websocket_api::ShareOwnership {
                    of_account_id: 5,
                    to_account_id: 3,
                },
            )
            .await?; // a tries to share ab-child-child but doesn't directly own it
        assert!(matches!(status, Err(ValidationFailure::NotOwner)));

        // Test sharing from non-user account
        let status = db
            .share_ownership(
                4,
                websocket_api::ShareOwnership {
                    of_account_id: 5,
                    to_account_id: 3,
                },
            )
            .await?; // ab-child tries to share ab-child-child
        assert!(matches!(status, Err(ValidationFailure::OwnerNotAUser)));

        // Test sharing to non-user account
        let status = db
            .share_ownership(
                1,
                websocket_api::ShareOwnership {
                    of_account_id: 4,
                    to_account_id: 4,
                },
            )
            .await?; // a tries to share ab-child with ab-child
        assert!(matches!(status, Err(ValidationFailure::RecipientNotAUser)));

        Ok(())
    }

    #[sqlx::test(fixtures("accounts"))]
    async fn test_revoke_ownership(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        // Test successful sharing between users
        let status = db
            .share_ownership(
                1,
                websocket_api::ShareOwnership {
                    of_account_id: 4,
                    to_account_id: 3,
                },
            )
            .await?; // a shares ab-child with c
        assert!(status.is_ok());

        // Verify ownership was shared
        assert!(db.get_owned_accounts(3).await?.contains(&4));

        // Test successful revocation
        let status = db
            .revoke_ownership(websocket_api::RevokeOwnership {
                of_account_id: 4,
                from_account_id: 3,
            })
            .await?;
        assert!(status.is_ok());

        // Verify ownership was revoked
        assert!(!db.get_owned_accounts(3).await?.contains(&4));

        // Test revoking ownership that doesn't exist
        let status = db
            .revoke_ownership(websocket_api::RevokeOwnership {
                of_account_id: 4,
                from_account_id: 3,
            })
            .await?;
        assert!(matches!(status, Err(ValidationFailure::AccountNotShared)));

        // Test revoking from non-user account
        let status = db
            .revoke_ownership(websocket_api::RevokeOwnership {
                of_account_id: 5,
                from_account_id: 4, // ab-child is not a user
            })
            .await?;
        assert!(matches!(status, Err(ValidationFailure::RecipientNotAUser)));

        // Test revoking when there are credits remaining
        // First share ownership again
        let status = db
            .share_ownership(
                1,
                websocket_api::ShareOwnership {
                    of_account_id: 4,
                    to_account_id: 3,
                },
            )
            .await?;
        assert!(status.is_ok());

        // Make a transfer to create credits
        let status = db
            .make_transfer(
                None,
                3,
                websocket_api::MakeTransfer {
                    from_account_id: 3,
                    to_account_id: 4,
                    amount: 10.0,
                    note: "test transfer".into(),
                },
            )
            .await?;
        match &status {
            Ok(_) => println!("Transfer succeeded"),
            Err(e) => println!("Transfer failed with error: {e:?}"),
        }
        assert!(
            status.is_ok(),
            "Transfer should succeed but got error: {:?}",
            status.err()
        );

        // Now try to revoke ownership - should fail due to remaining credits
        let status = db
            .revoke_ownership(websocket_api::RevokeOwnership {
                of_account_id: 4,
                from_account_id: 3,
            })
            .await?;
        assert!(matches!(status, Err(ValidationFailure::CreditRemaining)));

        // Transfer the credits back to zero them out
        let status = db
            .make_transfer(
                None,
                3,
                websocket_api::MakeTransfer {
                    from_account_id: 4,
                    to_account_id: 3,
                    amount: 110.0,
                    note: "return transfer".into(),
                },
            )
            .await?;
        assert!(status.is_ok());

        // Now revocation should work
        let status = db
            .revoke_ownership(websocket_api::RevokeOwnership {
                of_account_id: 4,
                from_account_id: 3,
            })
            .await?;
        println!("{status:?}");
        assert!(status.is_ok());

        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_settle_market_sudo_behavior(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        // Market 1 is owned by account 1
        // Account 1 has kinde_id so is considered an admin
        // Account 2 has kinde_id so is considered an admin
        // Account 4 has no kinde_id so is not an admin

        // Owner can settle their own market (admin_id doesn't matter)
        let status = db
            .settle_market(
                1, // user_id = owner
                None, // admin_id = None (no sudo)
                websocket_api::SettleMarket {
                    market_id: 1,
                    settle_price: 15.0,
                },
            )
            .await?;
        assert!(status.is_ok());

        // Admin with sudo (admin_id = Some) can settle others' markets
        let status = db
            .settle_market(
                2, // user_id != owner
                Some(2), // admin_id = Some (sudo enabled)
                websocket_api::SettleMarket {
                    market_id: 2,
                    settle_price: 5.0,
                },
            )
            .await?;
        assert!(status.is_ok());

        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_settle_market_non_owner_rejected(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        // Non-owner without admin override cannot settle
        let status = db
            .settle_market(
                2, // user_id != owner
                None, // admin_id = None (no sudo or not admin)
                websocket_api::SettleMarket {
                    market_id: 1,
                    settle_price: 15.0,
                },
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::NotMarketOwner)));

        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_delete_auction_sudo_behavior(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        // Create an auction owned by account 1
        let Ok(auction) = db
            .create_auction(
                1,
                websocket_api::CreateAuction {
                    name: "test auction".into(),
                    description: "test".into(),
                    ..Default::default()
                },
            )
            .await?
        else {
            panic!("expected create auction success");
        };
        let auction_id = auction.auction.id;

        // Owner can delete their own auction (admin_id doesn't matter)
        let status = db
            .delete_auction(
                1, // user_id = owner
                websocket_api::DeleteAuction { auction_id },
                None, // admin_id = None
            )
            .await?;
        assert!(status.is_ok());

        // Create another auction for more tests
        let Ok(auction2) = db
            .create_auction(
                1,
                websocket_api::CreateAuction {
                    name: "test auction 2".into(),
                    description: "test".into(),
                    ..Default::default()
                },
            )
            .await?
        else {
            panic!("expected create auction success");
        };
        let auction_id2 = auction2.auction.id;

        // Admin with sudo can delete others' auctions
        let status = db
            .delete_auction(
                2, // user_id != owner (but is admin in db)
                websocket_api::DeleteAuction { auction_id: auction_id2 },
                Some(2), // admin_id = Some (sudo enabled)
            )
            .await?;
        assert!(status.is_ok());

        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_delete_auction_sudo_required(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        // Create an auction owned by account 1
        let Ok(auction) = db
            .create_auction(
                1,
                websocket_api::CreateAuction {
                    name: "test auction".into(),
                    description: "test".into(),
                    ..Default::default()
                },
            )
            .await?
        else {
            panic!("expected create auction success");
        };
        let auction_id = auction.auction.id;

        // Admin without sudo (admin_id = None but user is admin in db) gets SudoRequired
        let status = db
            .delete_auction(
                2, // user_id != owner (but is admin in db due to kinde_id)
                websocket_api::DeleteAuction { auction_id },
                None, // admin_id = None (sudo not enabled)
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::SudoRequired)));

        // Non-admin without sudo gets NotAuctionOwner
        let status = db
            .delete_auction(
                4, // user_id != owner (not admin, no kinde_id)
                websocket_api::DeleteAuction { auction_id },
                None, // admin_id = None
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::NotAuctionOwner)));

        Ok(())
    }

    #[sqlx::test(fixtures("accounts", "markets"))]
    async fn test_edit_auction_sudo_behavior(pool: SqlitePool) -> SqlxResult<()> {
        let db = DB {
            arbor_pixie_account_id: 6,
            pool,
        };

        // Create an auction owned by account 1
        let Ok(auction) = db
            .create_auction(
                1,
                websocket_api::CreateAuction {
                    name: "test auction".into(),
                    description: "test".into(),
                    ..Default::default()
                },
            )
            .await?
        else {
            panic!("expected create auction success");
        };
        let auction_id = auction.auction.id;

        // Owner can edit their own auction
        let status = db
            .edit_auction(
                1, // user_id = owner
                websocket_api::EditAuction {
                    id: auction_id,
                    name: Some("updated name".into()),
                    ..Default::default()
                },
                None, // admin_id = None
            )
            .await?;
        assert!(status.is_ok());

        // Admin with sudo can edit others' auctions
        let status = db
            .edit_auction(
                2, // user_id != owner (but is admin)
                websocket_api::EditAuction {
                    id: auction_id,
                    name: Some("admin updated".into()),
                    ..Default::default()
                },
                Some(2), // admin_id = Some (sudo enabled)
            )
            .await?;
        assert!(status.is_ok());

        // Admin without sudo gets SudoRequired
        let status = db
            .edit_auction(
                2, // user_id != owner (but is admin in db)
                websocket_api::EditAuction {
                    id: auction_id,
                    name: Some("should fail".into()),
                    ..Default::default()
                },
                None, // admin_id = None (sudo not enabled)
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::SudoRequired)));

        // Non-admin gets NotAuctionOwner
        let status = db
            .edit_auction(
                4, // user_id != owner (not admin)
                websocket_api::EditAuction {
                    id: auction_id,
                    name: Some("should fail".into()),
                    ..Default::default()
                },
                None, // admin_id = None
            )
            .await?;
        assert!(matches!(status, Err(ValidationFailure::NotAuctionOwner)));

        Ok(())
    }
}
