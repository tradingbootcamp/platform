use std::{env, path::Path};

use serde::Serialize;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqliteSynchronous},
    Connection, FromRow, SqliteConnection, SqlitePool,
};

#[derive(Clone, Debug)]
pub struct GlobalDB {
    pool: SqlitePool,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct GlobalUser {
    pub id: i64,
    pub kinde_id: String,
    pub display_name: String,
    pub is_admin: bool,
    pub email: Option<String>,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct CohortInfo {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub db_path: String,
    pub is_read_only: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct CohortMember {
    pub id: i64,
    pub cohort_id: i64,
    pub global_user_id: Option<i64>,
    pub email: Option<String>,
    pub display_name: Option<String>,
    pub initial_balance: Option<String>,
}

impl GlobalDB {
    /// Initialize the global database, creating it if necessary and running migrations.
    ///
    /// # Errors
    /// Returns an error if database creation or migration fails.
    pub async fn init() -> anyhow::Result<Self> {
        let db_url = env::var("GLOBAL_DATABASE_URL")
            .unwrap_or_else(|_| "sqlite:///data/global.sqlite".to_string());
        let db_path = db_url.trim_start_matches("sqlite://");
        Self::init_with_path(db_path).await
    }

    /// Initialize a `GlobalDB` from a specific file path.
    ///
    /// # Errors
    /// Returns an error if database initialization fails.
    pub async fn init_with_path(db_path: &str) -> anyhow::Result<Self> {
        let connection_options = SqliteConnectOptions::new()
            .filename(db_path)
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .synchronous(SqliteSynchronous::Normal)
            .busy_timeout(std::time::Duration::from_secs(5));

        let mut management_conn = SqliteConnection::connect_with(&connection_options).await?;

        // Run global migrations
        let mut migrator =
            sqlx::migrate::Migrator::new(Path::new("./global_migrations")).await?;
        migrator
            .set_ignore_missing(true)
            .run(&mut management_conn)
            .await?;

        let pool = SqlitePool::connect_with(connection_options).await?;

        tracing::info!("Global database initialized");
        Ok(Self { pool })
    }

    /// Create or find a global user by kinde_id. Updates display_name and email if changed.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn ensure_global_user(
        &self,
        kinde_id: &str,
        name: &str,
        email: Option<&str>,
    ) -> Result<GlobalUser, sqlx::Error> {
        // Try to find existing user
        let existing = sqlx::query_as::<_, GlobalUser>(
            r#"SELECT id, kinde_id, display_name, is_admin, email FROM global_user WHERE kinde_id = ?"#,
        )
        .bind(kinde_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(mut user) = existing {
            // Update display_name and email if changed
            if user.display_name != name || user.email.as_deref() != email {
                sqlx::query("UPDATE global_user SET display_name = ?, email = COALESCE(?, email) WHERE id = ?")
                    .bind(name)
                    .bind(email)
                    .bind(user.id)
                    .execute(&self.pool)
                    .await?;
                user.display_name = name.to_string();
                if email.is_some() {
                    user.email = email.map(String::from);
                }
            }
            return Ok(user);
        }

        // Create new user
        let id = sqlx::query_scalar::<_, i64>(
            r#"INSERT INTO global_user (kinde_id, display_name, email) VALUES (?, ?, ?) RETURNING id"#,
        )
        .bind(kinde_id)
        .bind(name)
        .bind(email)
        .fetch_one(&self.pool)
        .await?;

        Ok(GlobalUser {
            id,
            kinde_id: kinde_id.to_string(),
            display_name: name.to_string(),
            is_admin: false,
            email: email.map(String::from),
        })
    }

    /// Get a global user by kinde_id.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_global_user_by_kinde_id(
        &self,
        kinde_id: &str,
    ) -> Result<Option<GlobalUser>, sqlx::Error> {
        sqlx::query_as::<_, GlobalUser>(
            r#"SELECT id, kinde_id, display_name, is_admin, email FROM global_user WHERE kinde_id = ?"#,
        )
        .bind(kinde_id)
        .fetch_optional(&self.pool)
        .await
    }

    /// Get all cohorts a user is a member of.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_user_cohorts(
        &self,
        global_user_id: i64,
    ) -> Result<Vec<CohortInfo>, sqlx::Error> {
        sqlx::query_as::<_, CohortInfo>(
            r#"
            SELECT c.id, c.name, c.display_name, c.db_path, c.is_read_only
            FROM cohort c
            INNER JOIN cohort_member cm ON cm.cohort_id = c.id
            WHERE cm.global_user_id = ?
            ORDER BY c.created_at DESC
            "#,
        )
        .bind(global_user_id)
        .fetch_all(&self.pool)
        .await
    }

    /// Get all cohorts.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_all_cohorts(&self) -> Result<Vec<CohortInfo>, sqlx::Error> {
        sqlx::query_as::<_, CohortInfo>(
            r#"SELECT id, name, display_name, db_path, is_read_only FROM cohort ORDER BY created_at DESC"#,
        )
        .fetch_all(&self.pool)
        .await
    }

    /// Check if a user is a member of a cohort.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn is_cohort_member(
        &self,
        global_user_id: i64,
        cohort_id: i64,
    ) -> Result<bool, sqlx::Error> {
        let count = sqlx::query_scalar::<_, i64>(
            r#"SELECT COUNT(*) FROM cohort_member WHERE global_user_id = ? AND cohort_id = ?"#,
        )
        .bind(global_user_id)
        .bind(cohort_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(count > 0)
    }

    /// Get a config value by key.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_config(&self, key: &str) -> Result<Option<String>, sqlx::Error> {
        sqlx::query_scalar::<_, String>(
            r#"SELECT value FROM global_config WHERE key = ?"#,
        )
        .bind(key)
        .fetch_optional(&self.pool)
        .await
    }

    /// Set a config value.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn set_config(&self, key: &str, value: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"INSERT INTO global_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"#,
        )
        .bind(key)
        .bind(value)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// Create a new cohort.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn create_cohort(
        &self,
        name: &str,
        display_name: &str,
        db_path: &str,
    ) -> Result<CohortInfo, sqlx::Error> {
        let id = sqlx::query_scalar::<_, i64>(
            r#"INSERT INTO cohort (name, display_name, db_path) VALUES (?, ?, ?) RETURNING id"#,
        )
        .bind(name)
        .bind(display_name)
        .bind(db_path)
        .fetch_one(&self.pool)
        .await?;

        Ok(CohortInfo {
            id,
            name: name.to_string(),
            display_name: display_name.to_string(),
            db_path: db_path.to_string(),
            is_read_only: false,
        })
    }

    /// Delete a cohort by id.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn delete_cohort(&self, id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM cohort WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Update a cohort's display_name and/or read-only status.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn update_cohort(
        &self,
        id: i64,
        display_name: Option<&str>,
        is_read_only: Option<bool>,
    ) -> Result<(), sqlx::Error> {
        if let Some(dn) = display_name {
            sqlx::query("UPDATE cohort SET display_name = ? WHERE id = ?")
                .bind(dn)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }
        if let Some(ro) = is_read_only {
            sqlx::query("UPDATE cohort SET is_read_only = ? WHERE id = ?")
                .bind(ro)
                .bind(id)
                .execute(&self.pool)
                .await?;
        }
        Ok(())
    }

    /// Get a cohort by name.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_cohort_by_name(&self, name: &str) -> Result<Option<CohortInfo>, sqlx::Error> {
        sqlx::query_as::<_, CohortInfo>(
            r#"SELECT id, name, display_name, db_path, is_read_only FROM cohort WHERE name = ?"#,
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await
    }

    /// Batch add members by email. Returns count of newly added members.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn batch_add_members(
        &self,
        cohort_id: i64,
        emails: &[String],
        initial_balance: Option<&str>,
    ) -> Result<usize, sqlx::Error> {
        let mut added = 0;
        for email in emails {
            let email = email.trim().to_lowercase();
            if email.is_empty() {
                continue;
            }

            // Check if this email matches an existing global user
            // (we don't have email in global_user, so just store the email for now)
            let result = sqlx::query(
                r#"INSERT INTO cohort_member (cohort_id, email, initial_balance) VALUES (?, ?, ?) ON CONFLICT DO NOTHING"#,
            )
            .bind(cohort_id)
            .bind(&email)
            .bind(initial_balance)
            .execute(&self.pool)
            .await?;

            if result.rows_affected() > 0 {
                added += 1;
            }
        }
        Ok(added)
    }

    /// Add a member by global_user_id.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn add_member_by_user_id(
        &self,
        cohort_id: i64,
        global_user_id: i64,
        initial_balance: Option<&str>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"INSERT INTO cohort_member (cohort_id, global_user_id, initial_balance) VALUES (?, ?, ?) ON CONFLICT DO NOTHING"#,
        )
        .bind(cohort_id)
        .bind(global_user_id)
        .bind(initial_balance)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// Remove a member from a cohort.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn remove_member(
        &self,
        cohort_id: i64,
        member_id: i64,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM cohort_member WHERE id = ? AND cohort_id = ?")
            .bind(member_id)
            .bind(cohort_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Get all members of a cohort.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_cohort_members(
        &self,
        cohort_id: i64,
    ) -> Result<Vec<CohortMember>, sqlx::Error> {
        let rows = sqlx::query_as::<_, CohortMemberRow>(
            r#"
            SELECT cm.id, cm.cohort_id, cm.global_user_id, COALESCE(cm.email, gu.email) AS email, gu.display_name, cm.initial_balance
            FROM cohort_member cm
            LEFT JOIN global_user gu ON gu.id = cm.global_user_id
            WHERE cm.cohort_id = ?
            ORDER BY cm.created_at
            "#,
        )
        .bind(cohort_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| CohortMember {
                id: r.id,
                cohort_id: r.cohort_id,
                global_user_id: r.global_user_id,
                email: r.email,
                display_name: r.display_name,
                initial_balance: r.initial_balance,
            })
            .collect())
    }

    /// Set a user's admin status.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn set_user_admin(
        &self,
        global_user_id: i64,
        is_admin: bool,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE global_user SET is_admin = ? WHERE id = ?")
            .bind(is_admin)
            .bind(global_user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Link a pre-authorized email to a global user. When a user signs up and their email
    /// matches a pre-authorized cohort_member row, this links them.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn link_email_to_user(
        &self,
        email: &str,
        global_user_id: i64,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"UPDATE cohort_member SET global_user_id = ? WHERE email = ? AND global_user_id IS NULL"#,
        )
        .bind(global_user_id)
        .bind(email.trim().to_lowercase())
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// Get a member's initial balance for a specific cohort.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_member_initial_balance(
        &self,
        cohort_id: i64,
        global_user_id: i64,
    ) -> Result<Option<String>, sqlx::Error> {
        sqlx::query_scalar::<_, String>(
            r#"SELECT initial_balance FROM cohort_member WHERE cohort_id = ? AND global_user_id = ? AND initial_balance IS NOT NULL"#,
        )
        .bind(cohort_id)
        .bind(global_user_id)
        .fetch_optional(&self.pool)
        .await
    }

    /// Get all global users (for admin UI).
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_all_users(&self) -> Result<Vec<GlobalUser>, sqlx::Error> {
        sqlx::query_as::<_, GlobalUser>(
            r#"SELECT id, kinde_id, display_name, is_admin, email FROM global_user ORDER BY created_at"#,
        )
        .fetch_all(&self.pool)
        .await
    }

    /// Update a user's display name.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn update_user_display_name(
        &self,
        global_user_id: i64,
        display_name: &str,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE global_user SET display_name = ? WHERE id = ?")
            .bind(display_name)
            .bind(global_user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Delete a global user and all their cohort memberships.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn delete_user(&self, global_user_id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM cohort_member WHERE global_user_id = ?")
            .bind(global_user_id)
            .execute(&self.pool)
            .await?;
        sqlx::query("DELETE FROM global_user WHERE id = ?")
            .bind(global_user_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Update a member's initial balance.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn update_member_initial_balance(
        &self,
        member_id: i64,
        initial_balance: Option<&str>,
    ) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE cohort_member SET initial_balance = ? WHERE id = ?")
            .bind(initial_balance)
            .bind(member_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

#[derive(Debug, FromRow)]
struct CohortMemberRow {
    id: i64,
    cohort_id: i64,
    global_user_id: Option<i64>,
    email: Option<String>,
    display_name: Option<String>,
    initial_balance: Option<String>,
}
