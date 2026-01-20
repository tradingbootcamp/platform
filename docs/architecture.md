# Architecture Overview

This document provides a high-level overview of the trading platform architecture.

## What Is This?

A simulated trading exchange for a quantitative trading bootcamp. Students learn about markets, order books, and quant trading through hands-on experience with a real (simulated money) exchange.

## System Components

```
┌───────────────┐
│  Kinde Auth   │  (External OAuth provider)
└───────┬───────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│                    (SvelteKit + Svelte 5)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Market UI, Account/Portfolio UI                          │  │
│  │  (Orders, Trades, Balances, Transfers, Alt Accounts)      │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ WebSocket + Protobuf
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
│                      (Rust + Axum)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  WebSocket  │  │  Order      │  │  Pub/Sub                │  │
│  │  Handler    │  │  Matching   │  │  (Broadcasts)           │  │
│  │             │  │  Engine     │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    SQLite Database                          ││
│  │  (Accounts, Orders, Trades, Markets, Transfers, Auctions)   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (SvelteKit)

**Location:** `../frontend`

**Key Technologies:**
- Svelte 5 with runes for reactivity
- shadcn-svelte for UI components
- Tailwind CSS for styling
- ReconnectingWebSocket for connection management

**Key Files:**
- `src/lib/api.svelte.ts` - Central state management, WebSocket connection, server message handling
- `src/lib/auth.svelte.ts` - Kinde OAuth PKCE authentication flow
- `src/lib/components/market.svelte` - Main market trading interface

**State Management:**
- Server state synchronized via WebSocket patch messages
- Reactive `serverState` object holds all data (portfolios, markets, orders, trades)
- `MarketData` class manages per-market order books and trade history

### Backend (Rust/Axum)

**Location:** `../backend`

**Key Technologies:**
- Axum web framework
- SQLite with WAL mode for persistence
- tokio for async runtime
- Protocol Buffers for message serialization

**Key Files:**
- `src/main.rs` - Server entry point, HTTP routes
- `src/handle_socket.rs` - WebSocket request/response handler (~1150 lines)
- `src/db.rs` - Database layer and business logic (~5000+ lines)
- `src/subscriptions.rs` - Pub/sub system for real-time updates
- `src/auth.rs` - JWT validation with Kinde

**Request Flow:**
1. Client connects via WebSocket at `/api`
2. Client authenticates with Kinde JWT
3. Server sends initial state snapshot
4. Client sends requests, server responds and broadcasts updates

### Schema (Protocol Buffers)

**Location:** `../schema`

**Key Files:**
- `client-message.proto` - All client-to-server request types
- `server-message.proto` - All server-to-client response/event types
- Individual `.proto` files for each domain type (market, order, trade, etc.)

**Generated Bindings:** `../schema-js` (TypeScript/JavaScript, built with `pnpm --filter schema-js build-proto`)

## Communication Protocol

All client-server communication uses **WebSocket with Protocol Buffers**.

### Example Message Flow

```
Client                                    Server
  │                                         │
  │──── Authenticate (JWT) ────────────────▶│
  │◀─── Authenticated + Initial State ──────│
  │                                         │
  │──── CreateOrder { request_id: 1 } ─────▶│
  │◀─── OrderCreated { request_id: 1 } ─────│
  │◀─── Trades (broadcast to all) ──────────│
  │◀─── PortfolioUpdated ───────────────────│
  │                                         │
```

### Subscription Model

The server maintains subscriptions for each connected client:

- **Public subscriptions**: Market updates, order book changes, trades (broadcast to all)
- **Private subscriptions**: Transfers, portfolio updates (per-account)
- **Ownership watchers**: Notified when account ownership changes

## Core Domain Concepts

### [Accounts](./accounts.md)
- **User accounts**: Linked to Kinde authentication (have `kinde_id`)
- **Alt accounts**: Created by users, owned by user accounts (no `kinde_id`)
- **Ownership**: Hierarchical - users can own alt accounts, share ownership with others

### Markets
- Prediction/trading markets with min/max settlement bounds
- Statuses: Open, Paused, Closed
- Can be settled at a price between min and max
- Optional [visibility](./visibility.md) restrictions and account ID hiding

### [Orders](./order-matching.md)
- Limit orders only (bids and offers)
- Price-time priority matching
- Partial fills supported

### Trades
- Created when orders match
- Track buyer, seller, price, size, taker side

### Portfolios
- Track account balances and market exposures
- Available balance considers worst-case outcomes from positions

### [Auctions](./auctions.md)
- Separate auction system for non-market items
- Supports buy-it-now pricing
- Admin settles with buyer and price

## Authentication Flow

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Client │     │ Kinde  │     │Frontend│     │Backend │
└───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘
    │              │              │              │
    │──Login──────▶│              │              │
    │◀─────────────│              │              │
    │   (OAuth PKCE flow)         │              │
    │◀──Access Token──────────────│              │
    │              │              │              │
    │──────────────WebSocket Connect────────────▶│
    │──────────────Authenticate(JWT)────────────▶│
    │              │              │◀─Validate JWT─│
    │              │              │              │
    │◀─────────────Authenticated────────────────│
    │◀─────────────Initial State────────────────│
```

## Rate Limiting

Two rate limit classes protect the server (admins have elevated limits via [sudo mode](./sudo.md)):

| Class | User Limit | Admin Limit | Operations |
|-------|------------|-------------|------------|
| Expensive | 180/min | 1800/min | GetFullTradeHistory, CreateMarket, Auctions |
| Mutate | 100/sec (1000 burst) | 1000/sec (10000 burst) | CreateOrder, CancelOrder, MakeTransfer |

## Database Schema (Key Tables)

```
account          - User and alt accounts
account_owner    - Ownership relationships + credits
market           - Trading markets with settlement bounds
market_visible_to - Market visibility restrictions
order            - Live and historical orders
order_size       - Order size history (for replay)
trade            - Executed trades
transfer         - Balance transfers between accounts
exposure_cache   - Pre-computed market exposures per account
auction          - Auction listings
```

## Directory Structure

```
platform/
├── backend/           # Rust backend server
│   ├── src/
│   │   ├── main.rs           # Entry point
│   │   ├── lib.rs            # Module wiring, AppState
│   │   ├── handle_socket.rs  # WebSocket handler
│   │   ├── db.rs             # Database + business logic
│   │   ├── subscriptions.rs  # Pub/sub system
│   │   └── auth.rs           # JWT validation
│   ├── migrations/    # SQLite migrations
│   └── tests/         # Integration tests
├── frontend/          # SvelteKit frontend
│   └── src/
│       ├── lib/
│       │   ├── api.svelte.ts     # Central state + WebSocket
│       │   ├── auth.svelte.ts    # Kinde auth
│       │   └── components/       # UI components
│       └── routes/               # SvelteKit pages
├── schema/            # Protocol Buffer definitions
├── schema-js/         # Generated JS/TS bindings
└── docs/              # Documentation (you are here)
```

## Further Reading

- [Sudo and Admin System](./sudo.md)
- [Market Visibility](./visibility.md)
- [Account System](./accounts.md)
- [Order Matching](./order-matching.md)
- [WebSocket Protocol](./websocket-protocol.md)
- [Auction System](./auctions.md)
