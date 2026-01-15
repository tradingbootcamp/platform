use std::{path::PathBuf, sync::Arc};

use db::DB;
use governor::{DefaultKeyedRateLimiter, Quota, RateLimiter};
use nonzero_ext::nonzero;
use subscriptions::Subscriptions;

#[allow(clippy::pedantic)]
pub mod websocket_api {
    include!(concat!(env!("OUT_DIR"), "/websocket_api.rs"));
}

#[derive(Clone)]
pub struct AppState {
    pub db: DB,
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
        let db = DB::init().await?;
        let subscriptions = Subscriptions::new();
        let expensive_ratelimit = Arc::new(RateLimiter::keyed(LARGE_REQUEST_QUOTA));
        let admin_expensive_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_LARGE_REQUEST_QUOTA));
        let mutate_ratelimit = Arc::new(RateLimiter::keyed(MUTATE_QUOTA));
        let admin_mutate_ratelimit = Arc::new(RateLimiter::keyed(ADMIN_MUTATE_QUOTA));
        let uploads_dir = PathBuf::from("/data/uploads"); // Default value, overridden in main.rs
        Ok(Self {
            db,
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
pub mod subscriptions;

#[cfg(feature = "test-auth-bypass")]
pub mod test_utils;
