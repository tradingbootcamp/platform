#![feature(type_alias_impl_trait)]
#![feature(const_async_blocks)]
#![feature(assert_matches)]

use std::sync::Arc;

use db::DB;
use governor::{DefaultKeyedRateLimiter, Quota, RateLimiter};
use nonzero_ext::nonzero;
use subscriptions::Subscriptions;

#[allow(clippy::pedantic)]
pub mod websocket_api {
    use serde::{de, Deserialize, Deserializer};

    include!(concat!(env!("OUT_DIR"), "/websocket_api.rs"));

    pub fn deserialize_side<'de, D: Deserializer<'de>>(deserializer: D) -> Result<i32, D::Error> {
        let s: &str = Deserialize::deserialize(deserializer)?;

        match s {
            "bid" => Ok(Side::Bid as i32),
            "offer" => Ok(Side::Offer as i32),
            _ => Err(de::Error::unknown_variant(s, &["bid", "offer"])),
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    pub db: DB,
    pub subscriptions: Subscriptions,
    pub connect_ratelimit: Arc<DefaultKeyedRateLimiter<String>>,
    pub mutate_ratelimit: Arc<DefaultKeyedRateLimiter<String>>,
}

const CONNECT_QUOTA: Quota = Quota::per_minute(nonzero!(180u32));
const MUTATE_QUOTA: Quota = Quota::per_second(nonzero!(100u32));

impl AppState {
    /// # Errors
    /// Returns an error if initializing the database failed.
    pub async fn new() -> anyhow::Result<Self> {
        let db = DB::init().await?;
        let subscriptions = Subscriptions::new();
        let connect_ratelimit = Arc::new(RateLimiter::keyed(CONNECT_QUOTA));
        let mutate_ratelimit = Arc::new(RateLimiter::keyed(MUTATE_QUOTA));
        Ok(Self {
            db,
            subscriptions,
            connect_ratelimit,
            mutate_ratelimit,
        })
    }
}

pub mod auth;
pub mod convert;
pub mod db;
pub mod handle_socket;
pub mod subscriptions;
