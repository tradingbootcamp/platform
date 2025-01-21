use std::sync::Arc;

use axum::extract::ws;
use dashmap::DashMap;
use tokio::sync::{broadcast, watch};
use tokio_stream::{
    wrappers::{BroadcastStream, WatchStream},
    StreamMap,
};

use crate::websocket_api;

const PUBLIC_BROADCAST_BUFFER_SIZE: usize = 256;
const PRIVATE_BROADCAST_BUFFER_SIZE: usize = 32;

#[derive(Clone)]
pub struct Subscriptions {
    inner: Arc<SubscriptionsInner>,
}

struct SubscriptionsInner {
    /// account id -> `watch::Sender<()>`
    portfolio: DashMap<i64, watch::Sender<()>>,
    /// Unserialized because we might need to hide account ids differently for each client.
    public: broadcast::Sender<websocket_api::ServerMessage>,
    /// account id -> serialized protobuf `Transfer`
    private: DashMap<i64, broadcast::Sender<ws::Message>>,
    /// account id -> new owned account id
    ownership: DashMap<i64, watch::Sender<()>>,
}

// TODO: this leaks memory on the order of the number of accounts, which should be ok for a bootcamp
impl Subscriptions {
    #[must_use]
    pub fn new() -> Self {
        let public = broadcast::Sender::new(PUBLIC_BROADCAST_BUFFER_SIZE);
        Self {
            inner: Arc::new(SubscriptionsInner {
                portfolio: DashMap::default(),
                public,
                private: DashMap::default(),
                ownership: DashMap::default(),
            }),
        }
    }

    pub fn notify_portfolio(&self, account: i64) {
        if let Some(sender) = self.inner.portfolio.get(&account) {
            sender.send(()).ok();
        }
    }

    pub fn send_public(&self, data: websocket_api::ServerMessage) {
        self.inner.public.send(data).ok();
    }

    pub fn send_private(&self, account_id: i64, data: ws::Message) {
        if let Some(sender) = self.inner.private.get(&account_id) {
            sender.send(data).ok();
        }
    }

    pub fn notify_ownership(&self, owner_id: i64) {
        if let Some(sender) = self.inner.ownership.get(&owner_id) {
            sender.send(()).ok();
        }
    }

    #[must_use]
    pub fn subscribe_all(&self, owned_accounts: &[i64]) -> SubscriptionReceivers {
        let public = self.subscribe_public();
        let mut subscription_receivers = SubscriptionReceivers::new(public);
        for &account_id in owned_accounts {
            self.add_owned_subscription(&mut subscription_receivers, account_id);
        }
        subscription_receivers
    }

    pub fn add_owned_subscription(
        &self,
        subscription_receivers: &mut SubscriptionReceivers,
        account_id: i64,
    ) {
        // Don't immediately notify portfolio and ownership, we're about to send them anyway
        let portfolio = WatchStream::from_changes(self.subscribe_portfolio(account_id));
        let ownership = WatchStream::from_changes(self.subscribe_ownership(account_id));
        let private = self.subscribe_private(account_id).into();
        subscription_receivers
            .portfolios
            .insert(account_id, portfolio);
        subscription_receivers
            .ownership
            .insert(account_id, ownership);
        subscription_receivers.private.insert(account_id, private);
    }

    #[must_use]
    fn subscribe_portfolio(&self, account: i64) -> watch::Receiver<()> {
        if let Some(sender) = self.inner.portfolio.get(&account) {
            return sender.subscribe();
        }
        let sender = self
            .inner
            .portfolio
            .entry(account)
            .or_insert_with(|| watch::channel(()).0);
        sender.subscribe()
    }

    #[must_use]
    fn subscribe_public(&self) -> broadcast::Receiver<websocket_api::ServerMessage> {
        self.inner.public.subscribe()
    }

    #[must_use]
    fn subscribe_private(&self, account_id: i64) -> broadcast::Receiver<ws::Message> {
        if let Some(sender) = self.inner.private.get(&account_id) {
            return sender.subscribe();
        }
        let sender = self
            .inner
            .private
            .entry(account_id)
            .or_insert_with(|| broadcast::channel(PRIVATE_BROADCAST_BUFFER_SIZE).0);
        sender.subscribe()
    }

    fn subscribe_ownership(&self, account_id: i64) -> watch::Receiver<()> {
        if let Some(sender) = self.inner.ownership.get(&account_id) {
            return sender.subscribe();
        }
        let sender = self
            .inner
            .ownership
            .entry(account_id)
            .or_insert_with(|| watch::channel(()).0);
        sender.subscribe()
    }
}

pub struct SubscriptionReceivers {
    pub portfolios: StreamMap<i64, WatchStream<()>>,
    pub public: broadcast::Receiver<websocket_api::ServerMessage>,
    pub private: StreamMap<i64, BroadcastStream<ws::Message>>,
    pub ownership: StreamMap<i64, WatchStream<()>>,
}

impl SubscriptionReceivers {
    fn new(public: broadcast::Receiver<websocket_api::ServerMessage>) -> Self {
        Self {
            portfolios: StreamMap::new(),
            public,
            private: StreamMap::new(),
            ownership: StreamMap::new(),
        }
    }
}

impl Default for Subscriptions {
    fn default() -> Self {
        Self::new()
    }
}
