use std::{path::Path, path::PathBuf, sync::Arc};

use arc_swap::ArcSwap;
use db::DB;
use governor::{DefaultKeyedRateLimiter, Quota, RateLimiter};
use nonzero_ext::nonzero;
use showcase::ShowcaseConfig;
use subscriptions::Subscriptions;
use tokio::sync::RwLock;

#[allow(clippy::pedantic)]
pub mod websocket_api {
    include!(concat!(env!("OUT_DIR"), "/websocket_api.rs"));
}

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<ArcSwap<DB>>,
    pub showcase: Arc<RwLock<ShowcaseConfig>>,
    pub showcase_config_path: PathBuf,
    pub subscriptions: Subscriptions,
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
        let config_path = showcase::config_path();
        let showcase_config = showcase::load_config(Path::new(&config_path)).await?;

        // Use active bootcamp DB if configured, else fall back to DATABASE_URL
        let db = if let Some(bootcamp) = showcase_config.get_active_bootcamp() {
            let db_url = format!("sqlite:{}", bootcamp.db_path);
            tracing::info!("Loading showcase DB: {}", bootcamp.db_path);
            DB::init_with_path(&db_url).await?
        } else {
            DB::init().await?
        };

        let subscriptions = Subscriptions::new();
        let expensive_ratelimit = Arc::new(RateLimiter::keyed(LARGE_REQUEST_QUOTA));
        let admin_expensive_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_LARGE_REQUEST_QUOTA));
        let mutate_ratelimit = Arc::new(RateLimiter::keyed(MUTATE_QUOTA));
        let admin_mutate_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_MUTATE_QUOTA));
        let uploads_dir = PathBuf::from("/data/uploads"); // Default value, overridden in main.rs
        Ok(Self {
            db: Arc::new(ArcSwap::new(Arc::new(db))),
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
