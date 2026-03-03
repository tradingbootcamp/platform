use std::{path::PathBuf, sync::Arc};

use dashmap::DashMap;
use db::DB;
use global_db::{CohortInfo, GlobalDB};
use governor::{DefaultKeyedRateLimiter, Quota, RateLimiter};
use nonzero_ext::nonzero;
use subscriptions::Subscriptions;

#[allow(clippy::pedantic)]
pub mod websocket_api {
    include!(concat!(env!("OUT_DIR"), "/websocket_api.rs"));
}

/// State for a single cohort (its own DB + pub/sub system).
pub struct CohortState {
    pub db: DB,
    pub subscriptions: Subscriptions,
    pub info: CohortInfo,
}

#[derive(Clone)]
pub struct AppState {
    pub global_db: GlobalDB,
    pub cohorts: Arc<DashMap<String, Arc<CohortState>>>,
    pub expensive_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub admin_expensive_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub mutate_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub admin_mutate_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub uploads_dir: PathBuf,
}

const ADMIN_RATE_LIMIT_MULTIPLIER: u32 = 10;
const LARGE_REQUEST_QUOTA: Quota = Quota::per_minute(nonzero!(180u32));
const ADMIN_LARGE_REQUEST_QUOTA: Quota = Quota::per_minute(nonzero!(180u32 * ADMIN_RATE_LIMIT_MULTIPLIER));
const MUTATE_QUOTA: Quota = Quota::per_second(nonzero!(100u32)).allow_burst(nonzero!(1000u32));
const ADMIN_MUTATE_QUOTA: Quota = Quota::per_second(nonzero!(100u32 * ADMIN_RATE_LIMIT_MULTIPLIER)).allow_burst(nonzero!(1000u32 * ADMIN_RATE_LIMIT_MULTIPLIER));

impl AppState {
    /// # Errors
    /// Returns an error if initializing the database failed.
    pub async fn new() -> anyhow::Result<Self> {
        let global_db = GlobalDB::init().await?;

        let cohorts = Arc::new(DashMap::new());

        // Load all cohorts from global DB and initialize their databases
        let cohort_list = global_db.get_all_cohorts().await?;
        for cohort_info in cohort_list {
            match DB::init_with_path(&cohort_info.db_path).await {
                Ok(db) => {
                    let cohort_state = Arc::new(CohortState {
                        db,
                        subscriptions: Subscriptions::new(),
                        info: cohort_info.clone(),
                    });
                    cohorts.insert(cohort_info.name.clone(), cohort_state);
                    tracing::info!("Loaded cohort: {}", cohort_info.name);
                }
                Err(e) => {
                    tracing::error!(
                        "Failed to load cohort '{}' at '{}': {e}",
                        cohort_info.name,
                        cohort_info.db_path
                    );
                }
            }
        }

        // If no cohorts exist, check for legacy DATABASE_URL and auto-migrate
        if cohorts.is_empty() {
            if let Ok(legacy_db_url) = std::env::var("DATABASE_URL") {
                tracing::info!("No cohorts found, migrating legacy database");
                let db_path = legacy_db_url.trim_start_matches("sqlite://").to_string();
                let db_path_str = if db_path.starts_with("//") {
                    db_path.trim_start_matches('/').to_string()
                } else {
                    db_path
                };

                match DB::init_with_path(&db_path_str).await {
                    Ok(db) => {
                        let cohort_info = global_db
                            .create_cohort("main", "Main", &db_path_str)
                            .await?;

                        // Migrate existing kinde_id users to global users
                        Self::migrate_legacy_users(&global_db, &db, &cohort_info).await?;

                        let cohort_state = Arc::new(CohortState {
                            db,
                            subscriptions: Subscriptions::new(),
                            info: cohort_info,
                        });
                        cohorts.insert("main".to_string(), cohort_state);
                        tracing::info!("Legacy database migrated as 'main' cohort");
                    }
                    Err(e) => {
                        tracing::error!("Failed to load legacy database: {e}");
                    }
                }
            }
        }

        let expensive_ratelimit = Arc::new(RateLimiter::keyed(LARGE_REQUEST_QUOTA));
        let admin_expensive_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_LARGE_REQUEST_QUOTA));
        let mutate_ratelimit = Arc::new(RateLimiter::keyed(MUTATE_QUOTA));
        let admin_mutate_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_MUTATE_QUOTA));
        let uploads_dir = PathBuf::from("/data/uploads"); // Default value, overridden in main.rs
        Ok(Self {
            global_db,
            cohorts,
            expensive_ratelimit,
            admin_expensive_ratelimit,
            mutate_ratelimit,
            admin_mutate_ratelimit,
            uploads_dir,
        })
    }

    /// Migrate legacy users from a cohort DB to the global DB.
    async fn migrate_legacy_users(
        global_db: &GlobalDB,
        cohort_db: &DB,
        cohort_info: &CohortInfo,
    ) -> anyhow::Result<()> {
        let legacy_users = cohort_db.get_legacy_kinde_users().await?;
        for (account_id, kinde_id, name) in legacy_users {
            let global_user = global_db.ensure_global_user(&kinde_id, &name).await?;
            cohort_db
                .set_global_user_id(account_id, global_user.id)
                .await?;
            // Also add as cohort member
            global_db
                .add_member_by_user_id(cohort_info.id, global_user.id)
                .await?;
        }
        Ok(())
    }

    /// Add a new cohort at runtime (e.g., from admin API).
    /// If the DB is a legacy DB (has kinde_id but no global_user_id), migrates users.
    ///
    /// # Errors
    /// Returns an error if database initialization fails.
    pub async fn add_cohort(&self, cohort_info: CohortInfo) -> anyhow::Result<()> {
        let db = DB::init_with_path(&cohort_info.db_path).await?;

        // Check if this is a legacy DB that needs migration
        let legacy_users = db.get_legacy_kinde_users().await?;
        if !legacy_users.is_empty() {
            tracing::info!(
                "Migrating {} legacy users in cohort '{}'",
                legacy_users.len(),
                cohort_info.name
            );
            for (account_id, kinde_id, name) in legacy_users {
                let global_user = self.global_db.ensure_global_user(&kinde_id, &name).await?;
                db.set_global_user_id(account_id, global_user.id).await?;
                self.global_db
                    .add_member_by_user_id(cohort_info.id, global_user.id)
                    .await?;
            }
        }

        let cohort_state = Arc::new(CohortState {
            db,
            subscriptions: Subscriptions::new(),
            info: cohort_info.clone(),
        });
        self.cohorts
            .insert(cohort_info.name.clone(), cohort_state);
        Ok(())
    }
}

pub mod airtable_users;
pub mod auth;
pub mod convert;
pub mod db;
pub mod global_db;
pub mod handle_socket;
pub mod subscriptions;

#[cfg(feature = "dev-mode")]
pub mod seed;
#[cfg(feature = "dev-mode")]
pub mod test_utils;
