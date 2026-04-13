use std::{env, path::Path};

use rand::{distributions::Alphanumeric, Rng};
use serde::Serialize;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqliteSynchronous},
    Connection, FromRow, SqliteConnection, SqlitePool,
};

/// Generate a user-facing placeholder display name for users whose real name we don't yet
/// know. The Kinde sub and the user's email are both considered sensitive/ugly to expose
/// in the UI, so we deliberately surface neither — callers should use this helper instead
/// of making something up. The 4-character suffix exists purely so two unnamed users in the
/// same account list are distinguishable at a glance.
#[must_use]
pub fn generate_unnamed_placeholder() -> String {
    let suffix: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(4)
        .map(char::from)
        .collect();
    format!("Unnamed-{suffix}")
}

#[derive(Clone, Debug)]
pub struct GlobalDB {
    pool: SqlitePool,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct GlobalUser {
    pub id: i64,
    pub kinde_id: String,
    pub display_name: String,
    /// Effective admin status: `is_kinde_admin OR admin_grant`. Maintained by a `SQLite`
    /// generated column, so this is always consistent with the two source fields below.
    pub is_admin: bool,
    /// True when the user's most recent authentication carried the Kinde admin role.
    /// Auto-synced on every auth — flips false when the role is removed in Kinde.
    pub is_kinde_admin: bool,
    /// True when an existing admin has toggled this user to admin via the Admin page.
    /// Only changes through the Admin page toggle endpoint.
    pub admin_grant: bool,
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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SetUserAdminResult {
    Ok,
    UserNotFound,
    /// The target still has the Kinde admin role, so the effective `is_admin` cannot
    /// drop to false via an Admin-page revoke. The Kinde role must be revoked instead.
    BlockedByKindeRole,
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
        let mut migrator = sqlx::migrate::Migrator::new(Path::new("./global_migrations")).await?;
        migrator
            .set_ignore_missing(true)
            .run(&mut management_conn)
            .await?;

        let pool = SqlitePool::connect_with(connection_options).await?;

        tracing::info!("Global database initialized");
        Ok(Self { pool })
    }

    /// Create a new global user, or return the existing one. The `name` parameter is only
    /// used on creation — once a row exists, its `display_name` is treated as user-owned and
    /// is never overwritten by this function. Manual updates made via
    /// [`Self::update_user_display_name`] (by the user themselves or an admin) therefore
    /// stick, and subsequent Kinde logins won't silently clobber them. `email` and
    /// `is_kinde_admin` are still synced on every call so that email changes and Kinde
    /// admin-role revocations propagate.
    ///
    /// `admin_grant` is never touched here — it is only set via
    /// [`Self::set_user_admin`] from the Admin page.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn ensure_global_user(
        &self,
        kinde_id: &str,
        name: &str,
        email: Option<&str>,
        is_kinde_admin: bool,
    ) -> Result<GlobalUser, sqlx::Error> {
        // Try to find existing user
        let existing = sqlx::query_as::<_, GlobalUser>(
            r"SELECT id, kinde_id, display_name, is_admin, is_kinde_admin, admin_grant, email
              FROM global_user WHERE kinde_id = ?",
        )
        .bind(kinde_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(mut user) = existing {
            let email_changed = email.is_some() && user.email.as_deref() != email;
            let kinde_admin_changed = user.is_kinde_admin != is_kinde_admin;
            if email_changed || kinde_admin_changed {
                sqlx::query(
                    r"UPDATE global_user
                      SET email = COALESCE(?, email),
                          is_kinde_admin = ?
                      WHERE id = ?",
                )
                .bind(email)
                .bind(is_kinde_admin)
                .bind(user.id)
                .execute(&self.pool)
                .await?;
                if email_changed {
                    user.email = email.map(String::from);
                }
                if kinde_admin_changed {
                    user.is_kinde_admin = is_kinde_admin;
                    user.is_admin = is_kinde_admin || user.admin_grant;
                }
            }
            return Ok(user);
        }

        // Create new user
        let id = sqlx::query_scalar::<_, i64>(
            r"INSERT INTO global_user (kinde_id, display_name, email, is_kinde_admin)
              VALUES (?, ?, ?, ?) RETURNING id",
        )
        .bind(kinde_id)
        .bind(name)
        .bind(email)
        .bind(is_kinde_admin)
        .fetch_one(&self.pool)
        .await?;

        Ok(GlobalUser {
            id,
            kinde_id: kinde_id.to_string(),
            display_name: name.to_string(),
            is_admin: is_kinde_admin,
            is_kinde_admin,
            admin_grant: false,
            email: email.map(String::from),
        })
    }

    /// Find a global user by `kinde_id`, creating one with a generated `"Unnamed-XXXX"`
    /// placeholder if none exists. Unlike [`Self::ensure_global_user`], this does NOT
    /// update the display name or email of an existing user — use it from code paths that
    /// don't yet have a trusted name for the user.
    ///
    /// The placeholder is generated by [`generate_unnamed_placeholder`] and is deliberately
    /// not derived from the Kinde sub or the user's email: exposing either in the UI is
    /// considered a privacy/UX regression. `is_kinde_admin` is still synced verbatim so the
    /// Kinde admin role is recognised even on a user's first request.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn find_or_create_global_user(
        &self,
        kinde_id: &str,
        email: Option<&str>,
        is_kinde_admin: bool,
    ) -> Result<GlobalUser, sqlx::Error> {
        if let Some(mut user) = self.get_global_user_by_kinde_id(kinde_id).await? {
            if user.is_kinde_admin != is_kinde_admin {
                sqlx::query("UPDATE global_user SET is_kinde_admin = ? WHERE id = ?")
                    .bind(is_kinde_admin)
                    .bind(user.id)
                    .execute(&self.pool)
                    .await?;
                user.is_kinde_admin = is_kinde_admin;
                user.is_admin = is_kinde_admin || user.admin_grant;
            }
            return Ok(user);
        }

        let placeholder_name = generate_unnamed_placeholder();
        let id = sqlx::query_scalar::<_, i64>(
            r"INSERT INTO global_user (kinde_id, display_name, email, is_kinde_admin)
              VALUES (?, ?, ?, ?) RETURNING id",
        )
        .bind(kinde_id)
        .bind(&placeholder_name)
        .bind(email)
        .bind(is_kinde_admin)
        .fetch_one(&self.pool)
        .await?;

        Ok(GlobalUser {
            id,
            kinde_id: kinde_id.to_string(),
            display_name: placeholder_name,
            is_admin: is_kinde_admin,
            is_kinde_admin,
            admin_grant: false,
            email: email.map(String::from),
        })
    }

    /// Look up a global user by `kinde_id` and sync their `is_kinde_admin` flag in place if
    /// it differs from the passed value. Returns `None` when no row exists — callers that
    /// cannot create the user themselves (e.g. `check_admin`, which has no trusted display
    /// name) should treat this as "not authorised" rather than creating a placeholder row.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn sync_is_kinde_admin_by_kinde_id(
        &self,
        kinde_id: &str,
        is_kinde_admin: bool,
    ) -> Result<Option<GlobalUser>, sqlx::Error> {
        let Some(mut user) = self.get_global_user_by_kinde_id(kinde_id).await? else {
            return Ok(None);
        };
        if user.is_kinde_admin != is_kinde_admin {
            sqlx::query("UPDATE global_user SET is_kinde_admin = ? WHERE id = ?")
                .bind(is_kinde_admin)
                .bind(user.id)
                .execute(&self.pool)
                .await?;
            user.is_kinde_admin = is_kinde_admin;
            user.is_admin = is_kinde_admin || user.admin_grant;
        }
        Ok(Some(user))
    }

    /// Get a global user by `kinde_id`.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn get_global_user_by_kinde_id(
        &self,
        kinde_id: &str,
    ) -> Result<Option<GlobalUser>, sqlx::Error> {
        sqlx::query_as::<_, GlobalUser>(
            r"SELECT id, kinde_id, display_name, is_admin, is_kinde_admin, admin_grant, email
              FROM global_user WHERE kinde_id = ?",
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
            r"
            SELECT c.id, c.name, c.display_name, c.db_path, c.is_read_only
            FROM cohort c
            INNER JOIN cohort_member cm ON cm.cohort_id = c.id
            WHERE cm.global_user_id = ?
            ORDER BY c.created_at DESC
            ",
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
            r"SELECT id, name, display_name, db_path, is_read_only FROM cohort ORDER BY created_at DESC",
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
            r"SELECT COUNT(*) FROM cohort_member WHERE global_user_id = ? AND cohort_id = ?",
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
        sqlx::query_scalar::<_, String>(r"SELECT value FROM global_config WHERE key = ?")
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
            r"INSERT INTO global_config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
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
            r"INSERT INTO cohort (name, display_name, db_path) VALUES (?, ?, ?) RETURNING id",
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

    /// Update a cohort's `display_name` and/or read-only status.
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
            r"SELECT id, name, display_name, db_path, is_read_only FROM cohort WHERE name = ?",
        )
        .bind(name)
        .fetch_optional(&self.pool)
        .await
    }

    /// Batch add members by email. Returns count of newly added members.
    ///
    /// If an email matches an existing global user, the member is linked to
    /// that user immediately so they gain access without needing to re-auth.
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

            let global_user_id = sqlx::query_scalar::<_, i64>(
                r"SELECT id FROM global_user WHERE email = ?",
            )
            .bind(&email)
            .fetch_optional(&self.pool)
            .await?;

            let result = if let Some(gid) = global_user_id {
                // Promote any pre-authorized pending row to point at the user.
                let linked = sqlx::query(
                    r"UPDATE cohort_member SET global_user_id = ? WHERE cohort_id = ? AND email = ? AND global_user_id IS NULL",
                )
                .bind(gid)
                .bind(cohort_id)
                .bind(&email)
                .execute(&self.pool)
                .await?;

                if linked.rows_affected() > 0 {
                    linked
                } else {
                    sqlx::query(
                        r"INSERT INTO cohort_member (cohort_id, global_user_id, initial_balance) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                    )
                    .bind(cohort_id)
                    .bind(gid)
                    .bind(initial_balance)
                    .execute(&self.pool)
                    .await?
                }
            } else {
                sqlx::query(
                    r"INSERT INTO cohort_member (cohort_id, email, initial_balance) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
                )
                .bind(cohort_id)
                .bind(&email)
                .bind(initial_balance)
                .execute(&self.pool)
                .await?
            };

            if result.rows_affected() > 0 {
                added += 1;
            }
        }
        Ok(added)
    }

    /// Add a member by `global_user_id`.
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
            r"INSERT INTO cohort_member (cohort_id, global_user_id, initial_balance) VALUES (?, ?, ?) ON CONFLICT DO NOTHING",
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
    pub async fn remove_member(&self, cohort_id: i64, member_id: i64) -> Result<(), sqlx::Error> {
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
            r"
            SELECT cm.id, cm.cohort_id, cm.global_user_id, COALESCE(cm.email, gu.email) AS email, gu.display_name, cm.initial_balance
            FROM cohort_member cm
            LEFT JOIN global_user gu ON gu.id = cm.global_user_id
            WHERE cm.cohort_id = ?
            ORDER BY cm.created_at
            ",
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

    /// Set a user's Admin-page grant. Returns `Ok(false)` when the caller tried to revoke
    /// a user whose effective admin status comes (at least in part) from the Kinde admin
    /// role — the caller must revoke the Kinde role upstream instead.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn set_user_admin(
        &self,
        global_user_id: i64,
        admin_grant: bool,
    ) -> Result<SetUserAdminResult, sqlx::Error> {
        if !admin_grant {
            let is_kinde_admin = sqlx::query_scalar::<_, bool>(
                r"SELECT is_kinde_admin FROM global_user WHERE id = ?",
            )
            .bind(global_user_id)
            .fetch_optional(&self.pool)
            .await?;
            match is_kinde_admin {
                None => return Ok(SetUserAdminResult::UserNotFound),
                Some(true) => return Ok(SetUserAdminResult::BlockedByKindeRole),
                Some(false) => {}
            }
        }

        sqlx::query("UPDATE global_user SET admin_grant = ? WHERE id = ?")
            .bind(admin_grant)
            .bind(global_user_id)
            .execute(&self.pool)
            .await?;
        Ok(SetUserAdminResult::Ok)
    }

    /// Link a pre-authorized email to a global user. When a user signs up and their email
    /// matches a pre-authorized `cohort_member` row, this links them.
    ///
    /// # Errors
    /// Returns an error on database failure.
    pub async fn link_email_to_user(
        &self,
        email: &str,
        global_user_id: i64,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            r"UPDATE cohort_member SET global_user_id = ? WHERE email = ? AND global_user_id IS NULL",
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
            r"SELECT initial_balance FROM cohort_member WHERE cohort_id = ? AND global_user_id = ? AND initial_balance IS NOT NULL",
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
            r"SELECT id, kinde_id, display_name, is_admin, is_kinde_admin, admin_grant, email
              FROM global_user ORDER BY created_at",
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
        cohort_id: i64,
        member_id: i64,
        initial_balance: Option<&str>,
    ) -> Result<bool, sqlx::Error> {
        let result = sqlx::query(
            "UPDATE cohort_member SET initial_balance = ? WHERE id = ? AND cohort_id = ?",
        )
        .bind(initial_balance)
        .bind(member_id)
        .bind(cohort_id)
        .execute(&self.pool)
        .await?;
        Ok(result.rows_affected() > 0)
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
