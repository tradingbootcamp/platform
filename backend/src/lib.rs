use std::{path::Path, path::PathBuf, sync::Arc};

use arc_swap::ArcSwap;
use dashmap::DashMap;
use db::DB;
use governor::{DefaultKeyedRateLimiter, Quota, RateLimiter};
use nonzero_ext::nonzero;
use showcase::{DatabaseConfig, ShowcaseConfig, ShowcaseEntry};
use subscriptions::Subscriptions;
use tokio::sync::RwLock;

#[allow(clippy::pedantic)]
pub mod websocket_api {
    include!(concat!(env!("OUT_DIR"), "/websocket_api.rs"));
}

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<ArcSwap<DB>>,
    pub db_cache: Arc<DashMap<String, CachedDatabase>>,
    pub showcase: Arc<RwLock<ShowcaseConfig>>,
    pub showcase_config_path: PathBuf,
    pub subscriptions: Subscriptions,
    pub expensive_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub admin_expensive_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub mutate_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub admin_mutate_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub uploads_dir: PathBuf,
}

#[derive(Clone)]
pub struct CachedDatabase {
    pub db_path: String,
    pub db: Arc<DB>,
}

const ADMIN_RATE_LIMIT_MULTIPLIER: u32 = 10;
const LARGE_REQUEST_QUOTA: Quota = Quota::per_minute(nonzero!(180u32));
const ADMIN_LARGE_REQUEST_QUOTA: Quota = Quota::per_minute(nonzero!(180u32 * ADMIN_RATE_LIMIT_MULTIPLIER));
const MUTATE_QUOTA: Quota = Quota::per_second(nonzero!(100u32)).allow_burst(nonzero!(1000u32));
const ADMIN_MUTATE_QUOTA: Quota = Quota::per_second(nonzero!(100u32 * ADMIN_RATE_LIMIT_MULTIPLIER)).allow_burst(nonzero!(1000u32 * ADMIN_RATE_LIMIT_MULTIPLIER));

impl AppState {
    async fn load_database(db_path: &str) -> anyhow::Result<Arc<DB>> {
        let db_url = format!("sqlite:{db_path}");
        let loaded_db = tokio::task::spawn_blocking(move || {
            tokio::runtime::Handle::current().block_on(DB::init_with_path(&db_url))
        })
        .await??;
        Ok(Arc::new(loaded_db))
    }

    /// # Errors
    /// Returns an error if initializing the database failed.
    pub async fn new() -> anyhow::Result<Self> {
        let config_path = showcase::config_path();
        let showcase_config = showcase::load_config(Path::new(&config_path)).await?;

        let db_cache = Arc::new(DashMap::new());

        // Use default showcase DB if configured, else fall back to first registry DB, then DATABASE_URL.
        let db = if let Some((showcase_key, showcase_entry)) = showcase_config.get_default_showcase() {
            if let Some(database_config) = showcase_config.get_database_for_showcase(showcase_entry) {
                tracing::info!(
                    showcase_key,
                    database_key = showcase_entry.database_key,
                    db_path = database_config.db_path,
                    "Loading default showcase DB"
                );
                let loaded_db = Self::load_database(&database_config.db_path).await?;
                db_cache.insert(
                    showcase_entry.database_key.clone(),
                    CachedDatabase {
                        db_path: database_config.db_path.clone(),
                        db: Arc::clone(&loaded_db),
                    },
                );
                loaded_db
            } else {
                tracing::warn!(
                    showcase_key,
                    database_key = showcase_entry.database_key,
                    "Default showcase points to unknown database key; falling back to DATABASE_URL"
                );
                Arc::new(DB::init().await?)
            }
        } else if let Some((database_key, database_config)) = showcase_config.databases.iter().next() {
            tracing::info!(
                database_key,
                db_path = database_config.db_path,
                "Loading first configured showcase database"
            );
            let loaded_db = Self::load_database(&database_config.db_path).await?;
            db_cache.insert(
                database_key.clone(),
                CachedDatabase {
                    db_path: database_config.db_path.clone(),
                    db: Arc::clone(&loaded_db),
                },
            );
            loaded_db
        } else {
            Arc::new(DB::init().await?)
        };

        let subscriptions = Subscriptions::new();
        let expensive_ratelimit = Arc::new(RateLimiter::keyed(LARGE_REQUEST_QUOTA));
        let admin_expensive_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_LARGE_REQUEST_QUOTA));
        let mutate_ratelimit = Arc::new(RateLimiter::keyed(MUTATE_QUOTA));
        let admin_mutate_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_MUTATE_QUOTA));
        let uploads_dir = PathBuf::from("/data/uploads"); // Default value, overridden in main.rs
        Ok(Self {
            db: Arc::new(ArcSwap::new(db)),
            db_cache,
            showcase: Arc::new(RwLock::new(showcase_config)),
            showcase_config_path: PathBuf::from(config_path),
            subscriptions,
            expensive_ratelimit,
            admin_expensive_ratelimit,
            mutate_ratelimit,
            admin_mutate_ratelimit,
            uploads_dir,
        })
    }

    /// Resolve showcase config by explicit key, else default showcase.
    #[must_use]
    pub async fn resolve_showcase_and_database(
        &self,
        requested_showcase_key: Option<&str>,
    ) -> Option<(String, ShowcaseEntry, DatabaseConfig)> {
        let config = self.showcase.read().await;
        let (showcase_key, showcase) = config.resolve_showcase(requested_showcase_key)?;
        let database = config.get_database_for_showcase(showcase)?;
        Some((showcase_key.to_string(), showcase.clone(), database.clone()))
    }

    /// Load a database by key/path from cache, refreshing if path changed.
    ///
    /// # Errors
    /// Returns an error when database initialization fails.
    pub async fn get_or_load_database(
        &self,
        database_key: &str,
        db_path: &str,
    ) -> anyhow::Result<Arc<DB>> {
        if let Some(cached) = self.db_cache.get(database_key) {
            if cached.db_path == db_path {
                return Ok(Arc::clone(&cached.db));
            }
        }

        let loaded_db = Self::load_database(db_path).await?;
        self.db_cache.insert(
            database_key.to_string(),
            CachedDatabase {
                db_path: db_path.to_string(),
                db: Arc::clone(&loaded_db),
            },
        );
        Ok(loaded_db)
    }

    /// Promote the selected database as primary `AppState.db` value.
    ///
    /// # Errors
    /// Returns an error when database initialization fails.
    pub async fn set_primary_database(
        &self,
        database_key: &str,
        db_path: &str,
    ) -> anyhow::Result<()> {
        let db = self.get_or_load_database(database_key, db_path).await?;
        self.db.store(db);
        Ok(())
    }
}

pub mod airtable_users;
pub mod auth;
pub mod convert;
pub mod db;
pub mod handle_socket;
pub mod showcase;
pub mod showcase_api;
pub mod subscriptions;

#[cfg(feature = "dev-mode")]
pub mod seed;
#[cfg(feature = "dev-mode")]
pub mod test_utils;
