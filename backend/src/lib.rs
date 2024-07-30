#![feature(type_alias_impl_trait)]
#![feature(const_async_blocks)]
#![feature(assert_matches)]

use db::DB;
use subscriptions::Subscriptions;

#[allow(clippy::pedantic)]
pub mod websocket_api {
    include!(concat!(env!("OUT_DIR"), "/websocket_api.rs"));
}

#[derive(Clone)]
pub struct AppState {
    pub db: DB,
    pub subscriptions: Subscriptions,
}

impl AppState {
    /// # Errors
    /// Returns an error if initializing the database failed.
    pub async fn new() -> anyhow::Result<Self> {
        let db = DB::init().await?;
        let subscriptions = Subscriptions::new();
        Ok(Self { db, subscriptions })
    }
}

pub mod auth;
pub mod convert;
pub mod db;
pub mod handle_socket;
pub mod subscriptions;
