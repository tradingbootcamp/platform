//! Test utilities for WebSocket integration tests

use std::path::Path;
use std::sync::Arc;

use futures::{SinkExt, StreamExt};
use governor::{Quota, RateLimiter};
use nonzero_ext::nonzero;
use prost::Message;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqliteSynchronous},
    Connection, SqliteConnection, SqlitePool,
};
use tempfile::TempDir;
use tokio::net::TcpListener;
use tokio_tungstenite::{connect_async, tungstenite::Message as WsMessage};

use crate::{
    db::DB,
    subscriptions::Subscriptions,
    websocket_api::{
        client_message::Message as CM, server_message::Message as SM, ActAs, Authenticate,
        ClientMessage, CreateMarket, CreateOrder, GetFullTradeHistory,
        RevokeOwnership, ServerMessage, SetSudo, Side,
    },
    AppState,
};

/// Creates a test `AppState` with a temporary `SQLite` database.
///
/// # Errors
/// Returns an error if database initialization fails.
pub async fn create_test_app_state() -> anyhow::Result<(AppState, TempDir)> {
    let temp_dir = TempDir::new()?;
    let db_path = temp_dir.path().join("test.db");

    let connection_options = SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal);

    let mut management_conn = SqliteConnection::connect_with(&connection_options).await?;

    // Run migrations
    let mut migrator = sqlx::migrate::Migrator::new(Path::new("./migrations")).await?;
    migrator
        .set_ignore_missing(true)
        .run(&mut management_conn)
        .await?;

    let pool = SqlitePool::connect_with(connection_options).await?;

    // Get arbor_pixie_account_id
    let arbor_pixie_account_id = sqlx::query_scalar!(
        r#"SELECT id as "id!: i64" FROM account WHERE name = 'Arbor Pixie'"#
    )
    .fetch_one(&mut management_conn)
    .await?;

    let db = DB::new_for_tests(arbor_pixie_account_id, pool);

    // Use permissive rate limits for testing
    let quota = Quota::per_second(nonzero!(10000u32));

    let state = AppState {
        db,
        subscriptions: Subscriptions::new(),
        expensive_ratelimit: Arc::new(RateLimiter::keyed(quota)),
        admin_expensive_ratelimit: Arc::new(RateLimiter::keyed(quota)),
        mutate_ratelimit: Arc::new(RateLimiter::keyed(quota)),
        admin_mutate_ratelimit: Arc::new(RateLimiter::keyed(quota)),
        uploads_dir: temp_dir.path().to_path_buf(),
    };

    Ok((state, temp_dir))
}

/// Spawns a test server and returns the WebSocket URL.
///
/// # Errors
/// Returns an error if the server fails to start.
pub async fn spawn_test_server(app_state: AppState) -> anyhow::Result<String> {
    use axum::{extract::State, routing::get, Router};

    use crate::handle_socket::handle_socket;

    let app = Router::new()
        .route(
            "/api",
            get(
                |ws: axum::extract::WebSocketUpgrade, State(state): State<AppState>| async move {
                    ws.on_upgrade(move |socket| handle_socket(socket, state))
                },
            ),
        )
        .with_state(app_state);

    let listener = TcpListener::bind("127.0.0.1:0").await?;
    let addr = listener.local_addr()?;

    tokio::spawn(async move {
        axum::serve(listener, app).await.ok();
    });

    // Give the server a moment to start
    tokio::time::sleep(std::time::Duration::from_millis(10)).await;

    Ok(format!("ws://127.0.0.1:{}/api", addr.port()))
}

/// WebSocket test client for integration tests.
pub struct TestClient {
    ws: tokio_tungstenite::WebSocketStream<
        tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
    >,
    request_counter: u64,
}

impl TestClient {
    /// Connect to a WebSocket server.
    ///
    /// # Errors
    /// Returns an error if the connection fails.
    pub async fn connect(url: &str) -> anyhow::Result<Self> {
        let (ws, _) = connect_async(url).await?;
        Ok(Self {
            ws,
            request_counter: 0,
        })
    }

    fn next_request_id(&mut self) -> String {
        self.request_counter += 1;
        format!("req-{}", self.request_counter)
    }

    /// Authenticate with the server using a test token.
    ///
    /// # Errors
    /// Returns an error if authentication fails.
    pub async fn authenticate(
        &mut self,
        kinde_id: &str,
        name: &str,
        is_admin: bool,
    ) -> anyhow::Result<i64> {
        let token = format!("test::{kinde_id}::{name}::{is_admin}");
        let request_id = self.next_request_id();

        let msg = ClientMessage {
            request_id,
            message: Some(CM::Authenticate(Authenticate {
                jwt: token,
                id_jwt: String::new(),
                act_as: 0,
            })),
        };

        self.send_message(msg).await?;

        // Receive messages until we get Authenticated
        loop {
            let server_msg = self.recv_message().await?;
            match server_msg.message {
                Some(SM::Authenticated(auth)) => return Ok(auth.account_id),
                Some(SM::RequestFailed(fail)) => {
                    anyhow::bail!("Authentication failed: {:?}", fail);
                }
                // Skip other initial data messages (Accounts, Markets, etc.)
                _ => {}
            }
        }
    }

    /// Drains all pending messages until `ActingAs` is received.
    ///
    /// # Errors
    /// Returns an error if the connection closes unexpectedly.
    pub async fn drain_initial_data(&mut self) -> anyhow::Result<i64> {
        loop {
            let server_msg = self.recv_message().await?;
            if let Some(SM::ActingAs(acting_as)) = server_msg.message {
                return Ok(acting_as.account_id);
            }
        }
    }

    /// Send a `SetSudo` message to enable sudo.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    pub async fn enable_sudo(&mut self) -> anyhow::Result<ServerMessage> {
        let request_id = self.next_request_id();
        let msg = ClientMessage {
            request_id,
            message: Some(CM::SetSudo(SetSudo { enabled: true })),
        };
        self.send_message(msg).await?;
        self.recv_message().await
    }

    /// Send a `SetSudo` message to disable sudo.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    pub async fn disable_sudo(&mut self) -> anyhow::Result<ServerMessage> {
        let request_id = self.next_request_id();
        let msg = ClientMessage {
            request_id,
            message: Some(CM::SetSudo(SetSudo { enabled: false })),
        };
        self.send_message(msg).await?;
        self.recv_message().await
    }

    /// Send a `RevokeOwnership` message.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    pub async fn revoke_ownership(
        &mut self,
        of_account_id: i64,
        from_account_id: i64,
    ) -> anyhow::Result<ServerMessage> {
        let request_id = self.next_request_id();
        let msg = ClientMessage {
            request_id,
            message: Some(CM::RevokeOwnership(RevokeOwnership {
                of_account_id,
                from_account_id,
            })),
        };
        self.send_message(msg).await?;
        self.recv_message().await
    }

    /// Send an `ActAs` message.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    pub async fn act_as(&mut self, account_id: i64) -> anyhow::Result<ServerMessage> {
        let request_id = self.next_request_id();
        let msg = ClientMessage {
            request_id,
            message: Some(CM::ActAs(ActAs { account_id })),
        };
        self.send_message(msg).await?;
        self.recv_message().await
    }

    /// Send a `CreateMarket` message.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    pub async fn create_market(
        &mut self,
        name: &str,
        min_settlement: f64,
        max_settlement: f64,
        hide_account_ids: bool,
    ) -> anyhow::Result<ServerMessage> {
        let request_id = self.next_request_id();
        let msg = ClientMessage {
            request_id,
            message: Some(CM::CreateMarket(CreateMarket {
                name: name.to_string(),
                description: String::new(),
                min_settlement,
                max_settlement,
                redeemable_for: vec![],
                redeem_fee: 0.0,
                hide_account_ids,
                visible_to: vec![],
                type_id: 0,
                group_id: 0,
            })),
        };
        self.send_message(msg).await?;
        self.recv_message().await
    }

    /// Send a `CreateOrder` message.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    #[allow(clippy::similar_names)]
    pub async fn create_order(
        &mut self,
        market_id: i64,
        price: f64,
        size: f64,
        side: Side,
    ) -> anyhow::Result<ServerMessage> {
        let request_id = self.next_request_id();
        let msg = ClientMessage {
            request_id,
            message: Some(CM::CreateOrder(CreateOrder {
                market_id,
                price,
                size,
                side: side.into(),
            })),
        };
        self.send_message(msg).await?;
        self.recv_message().await
    }

    /// Send a `GetFullTradeHistory` message.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    pub async fn get_full_trade_history(&mut self, market_id: i64) -> anyhow::Result<ServerMessage> {
        let request_id = self.next_request_id();
        let msg = ClientMessage {
            request_id,
            message: Some(CM::GetFullTradeHistory(GetFullTradeHistory { market_id })),
        };
        self.send_message(msg).await?;
        self.recv_message().await
    }

    /// Send a raw `ClientMessage`.
    ///
    /// # Errors
    /// Returns an error if sending fails.
    pub async fn send_raw(&mut self, msg: ClientMessage) -> anyhow::Result<()> {
        self.send_message(msg).await
    }

    /// Receive a single message from the server.
    ///
    /// # Errors
    /// Returns an error if receiving fails.
    pub async fn recv(&mut self) -> anyhow::Result<ServerMessage> {
        self.recv_message().await
    }

    /// Try to receive a message with a timeout.
    pub async fn try_recv_timeout(
        &mut self,
        timeout: std::time::Duration,
    ) -> Option<anyhow::Result<ServerMessage>> {
        tokio::time::timeout(timeout, self.recv_message()).await.ok()
    }

    async fn send_message(&mut self, msg: ClientMessage) -> anyhow::Result<()> {
        let bytes = msg.encode_to_vec();
        self.ws.send(WsMessage::Binary(bytes)).await?;
        Ok(())
    }

    async fn recv_message(&mut self) -> anyhow::Result<ServerMessage> {
        loop {
            let msg = self
                .ws
                .next()
                .await
                .ok_or_else(|| anyhow::anyhow!("WebSocket closed"))??;

            match msg {
                WsMessage::Binary(data) => {
                    let server_msg = ServerMessage::decode(&data[..])?;
                    return Ok(server_msg);
                }
                WsMessage::Close(_) => {
                    anyhow::bail!("WebSocket closed");
                }
                // Ignore ping/pong
                _ => {}
            }
        }
    }
}
