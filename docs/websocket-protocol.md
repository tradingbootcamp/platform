# WebSocket Protocol

This document explains the WebSocket communication protocol between client and server.

## Connection

Clients connect via WebSocket at:
```
ws://localhost:8080/api      (development)
wss://exchange.example.com/api  (production)
```

## Message Format

All messages use **Protocol Buffers** (binary serialization).

### Client → Server

```protobuf
message ClientMessage {
    string request_id = 1;  // Client-generated ID for request-response matching
    oneof message {
        Authenticate authenticate = 2;
        CreateMarket create_market = 3;
        CreateOrder create_order = 4;
        CancelOrder cancel_order = 5;
        // ... more request types
    }
}
```

### Server → Client

```protobuf
message ServerMessage {
    string request_id = 1;  // Echoed from request (empty for broadcasts)
    oneof message {
        Authenticated authenticated = 2;
        Market market = 3;
        OrderCreated order_created = 4;
        RequestFailed request_failed = 5;
        // ... more response/event types
    }
}
```

## Request-Response Pattern

Clients track pending requests by `request_id`:

```typescript
// Frontend: ../frontend/src/lib/api.svelte.ts
function sendClientMessage(message: ClientMessage): Promise<ServerMessage> {
    const requestId = crypto.randomUUID();
    message.requestId = requestId;

    return new Promise((resolve, reject) => {
        pendingRequests.set(requestId, { resolve, reject });
        socket.send(ClientMessage.encode(message).finish());
    });
}

// When response arrives
function handleServerMessage(msg: ServerMessage) {
    if (msg.requestId && pendingRequests.has(msg.requestId)) {
        const { resolve } = pendingRequests.get(msg.requestId);
        pendingRequests.delete(msg.requestId);
        resolve(msg);
    }
}
```

## Connection Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  1. WebSocket Connect                                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Client sends: Authenticate { access_token, id_token }   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Server validates JWT, creates/fetches account           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Server sends: Authenticated { user_id, is_admin }       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Server sends initial state:                             │
│     - Accounts (all users)                                  │
│     - Markets (filtered by visibility)                      │
│     - Orders (for visible markets)                          │
│     - Transfers (for owned accounts)                        │
│     - Portfolios (for owned accounts)                       │
│     - Auctions                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Server sends: ActingAs { account_id }                   │
│     (Signals ready for client operations)                   │
└─────────────────────────────────────────────────────────────┘
```

## Message Types

### Authentication

**Request:**
```protobuf
message Authenticate {
    string access_token = 1;  // Kinde JWT
    string id_token = 2;      // Optional, for user info
}
```

**Response:**
```protobuf
message Authenticated {
    int64 user_id = 1;
    bool is_admin = 2;
}
```

### Order Operations

**Create Order:**
```protobuf
message CreateOrder {
    int64 market_id = 1;
    string size = 2;   // Decimal as string
    string price = 3;  // Decimal as string
    Side side = 4;     // BID or OFFER
}
```

**Response:**
```protobuf
message OrderCreated {
    int64 account_id = 1;
    Order order = 2;
    repeated OrderFill fills = 3;    // Orders that were matched
    repeated Trade trades = 4;        // Resulting trades
    double balance_delta = 5;         // Change in account balance
}
```

**Cancel Order:**
```protobuf
message CancelOrder {
    int64 order_id = 1;
}
```

**Response:**
```protobuf
message OrderCancelled {
    int64 order_id = 1;
    int64 market_id = 2;
}
```

### Market Operations

**Create Market:**
```protobuf
message CreateMarket {
    string description = 1;
    double min_settlement = 2;
    double max_settlement = 3;
    string name = 13;              // Admin only
    repeated int64 visible_to = 14; // Admin only
    bool hide_account_ids = 15;    // Admin only
    // ... more fields
}
```

**Settle Market:**
```protobuf
message SettleMarket {
    int64 market_id = 1;
    double settled_price = 2;
}
```

### Transfer

```protobuf
message MakeTransfer {
    int64 from_account_id = 1;
    int64 to_account_id = 2;
    string amount = 3;
    string note = 4;
}
```

### Admin Operations

See [Sudo & Admin Mode](./sudo.md) for details on admin permissions.

**Toggle Sudo:**
```protobuf
message SetSudo {
    bool enabled = 1;
}
```

**Response:**
```protobuf
message SudoStatus {
    bool enabled = 1;
}
```

**Act As Another Account:**
```protobuf
message ActAs {
    int64 account_id = 1;
}
```

## Broadcast Messages

Some messages are broadcast to all connected clients (no `request_id`):

| Message | Trigger | Recipients |
|---------|---------|------------|
| `Market` | Market created/updated/settled | All (filtered by [visibility](./visibility.md)) |
| `OrderCreated` | Order placed | All (IDs may be hidden) |
| `OrderCancelled` | Order cancelled | All |
| `Trades` | Trades executed | All (IDs may be hidden) |
| `PortfolioUpdated` | Balance/position change | [Account](./accounts.md) owners only |
| `Transfers` | Transfer made | Sender and receiver only |

## Error Handling

**Request Failure:**
```protobuf
message RequestFailed {
    string request_id = 1;
    string error_type = 2;    // e.g., "ValidationFailure"
    string error_message = 3; // Human-readable
}
```

Common error types:
- `ValidationFailure` - Business logic validation failed
- `RateLimited` - Too many requests
- `NotAuthenticated` - Auth required
- `PermissionDenied` - Insufficient permissions

## Reconnection

The frontend uses `ReconnectingWebSocket` for automatic reconnection:

```typescript
const socket = new ReconnectingWebSocket(url, [], {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
});

socket.onopen = () => {
    // Re-authenticate on reconnect
    authenticate();
};
```

On reconnection:
1. Client authenticates again
2. Server sends fresh initial state
3. Client state is replaced (not merged)

## Rate Limiting

Requests are rate-limited by type:

| Category | User Limit | Admin Limit |
|----------|------------|-------------|
| Expensive | 180/min | 1800/min |
| Mutate | 100/sec (1000 burst) | 1000/sec (10000 burst) |

Rate-limited requests receive:
```protobuf
RequestFailed {
    error_type: "RateLimited",
    error_message: "Too many requests"
}
```

## Expensive Query Requests

For large data fetches:

```protobuf
message GetFullTradeHistory {
    int64 market_id = 1;
}

message GetFullOrderHistory {
    int64 market_id = 1;
}

message GetMarketPositions {
    int64 market_id = 1;
}
```

These are rate-limited under the "expensive" category.

## Subscription Model

The server maintains per-connection subscriptions:

```rust
// Public channels (broadcast to all)
public_sender: broadcast::Sender<ServerMessage>

// Private channels (per-account)
private_senders: DashMap<AccountId, broadcast::Sender<ServerMessage>>

// Watchers (for specific events)
portfolio_watchers: DashMap<AccountId, watch::Sender<()>>
ownership_watchers: DashMap<AccountId, watch::Sender<()>>
```

Clients automatically subscribe to:
- Public channel on connect
- Private channels for all owned accounts
- Watchers for portfolio/ownership changes

## Frontend State Management

The frontend aggregates server messages into reactive state:

```typescript
// ../frontend/src/lib/api.svelte.ts
export const serverState = $state({
    userId: null,
    isAdmin: false,
    portfolios: new Map(),
    transfers: [],
    accounts: new Map(),
    marketData: new Map(),  // MarketData per market
    auctions: new Map(),
});

// Updates on each server message
function handleServerMessage(msg: ServerMessage) {
    if (msg.market) {
        serverState.marketData.set(msg.market.id, new MarketData(msg.market));
    }
    if (msg.orderCreated) {
        const market = serverState.marketData.get(msg.orderCreated.order.marketId);
        market?.addOrder(msg.orderCreated);
    }
    // ... etc
}
```

## Related Documentation

- [Architecture Overview](./architecture.md) - System overview
- [Order Matching](./order-matching.md) - How orders are matched
- [Accounts](./accounts.md) - Account management and ownership
- [Sudo & Admin Mode](./sudo.md) - Admin permissions
- [Auctions](./auctions.md) - Auction system
