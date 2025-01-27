#![feature(type_alias_impl_trait)]
#![feature(const_async_blocks)]
#![feature(assert_matches)]

use std::sync::{Arc, LazyLock};

use db::DB;
use governor::{DefaultKeyedRateLimiter, Quota, RateLimiter};
use nonzero_ext::nonzero;
use subscriptions::Subscriptions;

pub static HIDE_USER_IDS: LazyLock<bool> = LazyLock::new(|| std::env::var("HIDE_USER_IDS").is_ok());

#[allow(clippy::pedantic)]
pub mod websocket_api {
    include!(concat!(env!("OUT_DIR"), "/websocket_api.rs"));
}

#[derive(Clone)]
pub struct AppState {
    pub db: DB,
    pub subscriptions: Subscriptions,
    pub large_request_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
    pub mutate_ratelimit: Arc<DefaultKeyedRateLimiter<i64>>,
}

const CONNECT_QUOTA: Quota = Quota::per_minute(nonzero!(180u32));
const MUTATE_QUOTA: Quota = Quota::per_second(nonzero!(100u32));

impl AppState {
    /// # Errors
    /// Returns an error if initializing the database failed.
    pub async fn new() -> anyhow::Result<Self> {
        let db = DB::init().await?;
        let subscriptions = Subscriptions::new();
        let large_request_ratelimit = Arc::new(RateLimiter::keyed(CONNECT_QUOTA));
        let mutate_ratelimit = Arc::new(RateLimiter::keyed(MUTATE_QUOTA));
        Ok(Self {
            db,
            subscriptions,
            large_request_ratelimit,
            mutate_ratelimit,
        })
    }
}

pub mod auth;
pub mod convert;
pub mod db;
pub mod handle_socket;
pub mod subscriptions;
