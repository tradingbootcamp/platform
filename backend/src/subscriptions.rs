use std::sync::Arc;

use axum::extract::ws;
use dashmap::DashMap;
use tokio::sync::{broadcast, watch};

use crate::websocket_api;

const PUBLIC_BROADCAST_BUFFER_SIZE: usize = 256;
const PRIVATE_BROADCAST_BUFFER_SIZE: usize = 16;

#[derive(Clone)]
pub struct Subscriptions {
    inner: Arc<SubscriptionsInner>,
}

struct SubscriptionsInner {
    /// user id -> `watch::Sender<()>`
    portfolio: DashMap<String, watch::Sender<()>>,
    /// Unserialized protobuf `ServerMessage`.
    /// It's not serialized because we might need to hide user ids differently for each client.
    public: broadcast::Sender<websocket_api::ServerMessage>,
    /// user id -> serialized protobuf `Payment`
    private_actor: DashMap<String, broadcast::Sender<ws::Message>>,
    /// user id -> serialized protobuf `Ownership`
    private_user: DashMap<String, broadcast::Sender<ws::Message>>,
}

// TODO: this leaks memory on the order of the number of users, which should be ok for a bootcamp
impl Subscriptions {
    #[must_use]
    pub fn new() -> Self {
        let public = broadcast::Sender::new(PUBLIC_BROADCAST_BUFFER_SIZE);
        Self {
            inner: Arc::new(SubscriptionsInner {
                portfolio: DashMap::default(),
                public,
                private_actor: DashMap::default(),
                private_user: DashMap::default(),
            }),
        }
    }

    /// # Panics
    /// Panics if the lock is poisoned.
    #[must_use]
    pub fn subscribe_portfolio(&self, user_id: &str) -> watch::Receiver<()> {
        if let Some(sender) = self.inner.portfolio.get(user_id) {
            return sender.subscribe();
        }
        let (sender, receiver) = watch::channel(());
        let existing = self.inner.portfolio.insert(user_id.to_string(), sender);
        if existing.is_some() {
            tracing::error!("subscribe_portfolio: key {user_id} already exists");
        }
        receiver
    }

    /// # Panics
    /// Panics if the lock is poisoned.
    pub fn notify_user_portfolio(&self, user_id: &str) {
        if let Some(sender) = self.inner.portfolio.get(user_id) {
            sender.send(()).ok();
        }
    }

    #[must_use]
    pub fn subscribe_public(&self) -> broadcast::Receiver<websocket_api::ServerMessage> {
        self.inner.public.subscribe()
    }

    pub fn send_public(&self, data: websocket_api::ServerMessage) {
        self.inner.public.send(data).ok();
    }

    /// # Panics
    /// Panics if the lock is poisoned.
    #[must_use]
    pub fn subscribe_private_actor(&self, user_id: &str) -> broadcast::Receiver<ws::Message> {
        if let Some(sender) = self.inner.private_actor.get(user_id) {
            return sender.subscribe();
        }
        let (sender, receiver) = broadcast::channel(PRIVATE_BROADCAST_BUFFER_SIZE);
        let existing = self.inner.private_actor.insert(user_id.to_string(), sender);
        if existing.is_some() {
            tracing::error!("subscribe_private_actor: key {user_id} already exists");
        }
        receiver
    }

    /// # Panics
    /// Panics if the lock is poisoned.
    pub fn send_private_actor(&self, user_id: &str, data: ws::Message) {
        if let Some(sender) = self.inner.private_actor.get(user_id) {
            sender.send(data).ok();
        }
    }

    /// # Panics
    /// Panics if the lock is poisoned.
    #[must_use]
    pub fn subscribe_private_user(&self, user_id: &str) -> broadcast::Receiver<ws::Message> {
        if let Some(sender) = self.inner.private_user.get(user_id) {
            return sender.subscribe();
        }
        let (sender, receiver) = broadcast::channel(PRIVATE_BROADCAST_BUFFER_SIZE);
        let existing = self.inner.private_user.insert(user_id.to_string(), sender);
        if existing.is_some() {
            tracing::error!("subscribe_private_user: key {user_id} already exists");
        }
        receiver
    }

    /// # Panics
    /// Panics if the lock is poisoned.
    pub fn send_private_user(&self, user_id: &str, data: ws::Message) {
        if let Some(sender) = self.inner.private_user.get(user_id) {
            sender.send(data).ok();
        }
    }
}

impl Default for Subscriptions {
    fn default() -> Self {
        Self::new()
    }
}
