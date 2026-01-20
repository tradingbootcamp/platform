This file provides guidance when working with code in this repository.

## Overview

This is a monorepo for a quantitative trading bootcamp platform - a simulated trading exchange where students learn about markets, order books, and quant trading. 

## Architecture

- **frontend** (SvelteKit): Main web interface using Svelte 5, shadcn-svelte, Tailwind CSS
- **backend** (Rust/Axum): Core exchange server handling WebSocket connections, order matching, trade execution, SQLite persistence
- **schema**: Protocol Buffer definitions for client-server communication
- **schema-js**: Generated JS/TS protobuf bindings (workspace dependency)

Communication: WebSocket with Protocol Buffers (binary, ordered delivery, request-response via request IDs)

Authentication: Kinde Auth

## Prerequisites

- **protoc**: Protocol buffer compiler. Install with `apt-get install protobuf-compiler` (Debian/Ubuntu) or `brew install protobuf` (macOS)
- **pnpm**: Node package manager
- **Rust**: Install via rustup

## Common Commands

### Frontend Only (against production backend)
```bash
pnpm i                      # Install dependencies
pnpm dev                    # Start frontend on localhost:5173
```

### Backend
```bash
cd backend
cargo run                   # Run the exchange server
cargo test-all              # Run all tests (unit + integration)
cargo clippy                # Run linter
sqlx migrate run            # Apply migrations (uses DATABASE_URL)
cargo sqlx prepare          # Regenerate .sqlx/ cache (run after changing SQL queries)
cargo llvm-cov --features test-auth-bypass --html  # Generate coverage report (requires cargo-llvm-cov)
```

### Frontend
```bash
cd frontend
pnpm run dev                # Dev server
pnpm run build              # Production build
pnpm run check              # Svelte/TypeScript type checking
pnpm run lint               # Prettier + ESLint
pnpm run format             # Auto-format with Prettier
pnpm --filter schema-js build-proto   # Regenerate JS/TS protobuf bindings after changing .proto files
```

## Frontend Patterns

- Svelte 5 runes for reactivity
- shadcn-svelte components with Tailwind
- State synchronization via WebSocket patch messages

## Frontend Structure

- `schema/server-message.proto`, `schema/client-message.proto` - API contract; `schema/` contains all protobuf definitions
- `frontend/src/lib/api.svelte.ts` - Frontend state aggregation from server patches. *Most important* file for getting data for the UI, as well as sending client requests.
- `frontend/src/lib/components/market.svelte` - Main market UI

## Backend Structure

- `backend/src/main.rs` - Backend binary entry point
- `backend/src/lib.rs` - Core server crate wiring
- `backend/src/handle_socket.rs` - WebSocket request/response handling
- `backend/src/subscriptions.rs` - Pub/sub fanout for market updates
- `backend/src/auth.rs` - Kinde auth validation
- `backend/src/db.rs` - Exchange database and order book logic
- `backend/src/test_utils.rs` - Test infrastructure (feature-gated behind `test-auth-bypass`)
- `backend/src/fixtures/` - Seed data for local development
- `backend/migrations/` - SQLite migrations
- `backend/tests/websocket_sudo.rs` - WebSocket integration tests for sudo/admin permissions

## Environment Files

- `backend/.env`: just backend .env
- `frontend/remote.env`: .env template for connecting to main exchange server
- `frontend/local.env`: .env template for connecting to local testing exchange server

Copy the appropriate template to `frontend/.env` for your use case:
- For frontend development against production backend: `cp frontend/remote.env frontend/.env`
- For local backend testing: `cp frontend/local.env frontend/.env`

## Required Checks

- **Frontend changes**: Run `pnpm run check` and `pnpm run lint` from root or `frontend/`
- **Backend changes**: Run `cargo test-all` and `cargo clippy` in `backend/`

## File Listing

> **Maintenance note:** Update this listing when source files (`.rs`, `.ts`, `.svelte`, `.proto`, etc.) are created, deleted, significantly changed, or refactored. Exclude dependency directories (`node_modules/`, `target/`, `vendor/`), build artifacts, and package manager configuration files (`package.json`, `Cargo.toml`, etc.). Use discretion about what to include—focus on files that would be helpful for future agents modifying the codebase.
>
> Organize files by directory structure. For each file, create a subsection with:
> - Heading: the file path in backticks (e.g., `src/main.rs`)
> - 3-6 bullet points describing: its purpose, key functions/exports, notable dependencies on other files or other components of the project, and notable implementation details
> - Mark primary entry points (main files, index files) explicitly as such
>
> For directories with many similar files, you may summarize them as a group rather than listing each individually—but only if the individual files are mostly boilerplate or can be easily summarized as one.

### Backend (Rust/Axum)

#### `backend/src/main.rs`
- **Entry point** for the backend server
- Initializes Axum router with WebSocket handler at `/api`, image upload/serving routes, and Airtable sync endpoint
- Implements port binding with fallback logic (tries sequential ports if in use)
- Manages uploads directory and request body size limits
- Depends on `lib.rs` for `AppState`, `handle_socket.rs` for WebSocket handling

#### `backend/src/lib.rs`
- Core library crate wiring and module declarations
- Defines `AppState` struct containing DB connection pool, pub/sub subscriptions, and rate limiters
- Configures separate admin/user rate limit quotas for expensive queries and mutations
- Includes protobuf module generation via `build.rs`
- Declares modules: `websocket_api`, `auth`, `db`, `handle_socket`, `subscriptions`, `airtable_users`, `convert`, `test_utils`

#### `backend/src/handle_socket.rs`
- Core WebSocket request/response handler (~1150 lines)
- Main logic loop for client connections and authentication flow
- Processes all client message types (CreateMarket, CreateOrder, CancelOrder, MakeTransfer, etc.)
- Implements per-user rate limiting and sudo/admin mode toggling
- Sends initial state snapshots (accounts, markets, orders, trades, auctions, portfolios)
- Depends on `db.rs` for business logic, `subscriptions.rs` for pub/sub, `auth.rs` for JWT validation

#### `backend/src/subscriptions.rs`
- Pub/sub fanout system using DashMap and tokio broadcast/watch channels
- Manages public broadcasts (market updates), private channels (per-account transfers)
- Portfolio watchers notify on balance changes, ownership watchers track account sharing
- Used by `handle_socket.rs` to broadcast updates to connected clients

#### `backend/src/db.rs`
- Database layer (~2000+ lines) with SQLite, WAL mode, and connection pooling
- Core methods: `get_account`, `create_account`, `get_portfolio`, `make_transfer`, `create_market`, `settle_market`, `create_order`, `cancel_order`, `create_auction`
- Returns `ValidationResult` for business logic failures
- Implements complex order matching logic with fills and trades
- Features: market visibility control, account ID hiding, redeemable fund handling, auction buy-it-now

#### `backend/src/auth.rs`
- Kinde Auth integration with JWT validation
- Caches JWK sets lazily, validates RS256-signed JWTs against Kinde's public keys
- Supports test token format (`test::<kinde_id>::<name>::<is_admin>`) via `test-auth-bypass` feature
- Decodes access tokens and optional ID tokens

#### `backend/src/convert.rs`
- Database-to-protobuf type conversions
- Implements `From` trait for all domain types (Portfolio, Market, Order, Trade, Transfer, Account, Auction)
- Converts Rust Decimal to protobuf floats, timestamps to protobuf Timestamp format

#### `backend/src/airtable_users.rs`
- Syncs Airtable student records to Kinde and database
- Creates Kinde accounts and DB entries, assigns initial balances based on product ID
- Caches Kinde API tokens, logs errors back to Airtable

#### `backend/src/test_utils.rs`
- Test infrastructure (feature-gated behind `test-auth-bypass`)
- Database setup helpers for integration tests

#### `backend/tests/websocket_sudo.rs`
- WebSocket integration tests for sudo/admin permissions
- Tests admin-only operations and permission boundaries

#### `backend/migrations/`
- SQLite schema evolution (15+ migration files)
- Key migrations: initial schema, team accounts, redeemable multipliers, auctions, visibility controls, indexes

---

### Frontend (SvelteKit 5)

#### `frontend/src/lib/api.svelte.ts`
- **Most important frontend file** - central state aggregation from server patches
- Manages WebSocket connection with `ReconnectingWebSocket`
- Exports reactive `serverState`: user ID, admin flag, portfolios, transfers, accounts, markets, auctions
- `MarketData` class holds per-market orders/trades/positions
- Functions: `sendClientMessage`, `accountName`, `isAltAccount`
- Re-exports schema-js protobuf types for use across components

#### `frontend/src/lib/auth.svelte.ts`
- Kinde PKCE OAuth flow wrapper
- Exports `kinde` object: `login()`, `register()`, `logout()`, `isAuthenticated()`, `getToken()`, `getUser()`, `isAdmin()`
- Configured via public env vars (KINDE_CLIENT_ID, KINDE_DOMAIN, KINDE_REDIRECT_URI)

#### `frontend/src/lib/components/market.svelte`
- Main market UI component
- Displays order book (bids/offers), trade history, price chart, participant positions
- Transaction slider for historical replay with real-time updates
- Uses Svelte 5 `$derived` and `$effect` runes
- Depends on `api.svelte.ts` for state, `marketDataUtils.ts` for transformations

#### `frontend/src/lib/components/marketHead.svelte`
- Market header with definition, status, and settlement controls
- Shows market metadata and admin actions

#### `frontend/src/lib/components/marketOrders.svelte`
- Order book display with separated bids and offers
- Interactive highlighting and selection

#### `frontend/src/lib/components/marketTrades.svelte`
- Trade history/log table with transaction replay support
- Shows buyer/seller, price, size, timestamp

#### `frontend/src/lib/components/priceChart.svelte`
- OHLCV price visualization for trade data
- Configurable time intervals and display options

#### `frontend/src/lib/components/appSideBar.svelte`
- Main navigation sidebar with market navigation and account switcher
- Uses shadcn sidebar components

#### `frontend/src/lib/components/selectMarket.svelte`
- Market search/filter dropdown with fuzzy matching
- Supports keyboard navigation

#### `frontend/src/lib/components/auctionLink.svelte` / `auctionModal.svelte`
- Auction card/link component and detail modal
- Displays auction info, bids, buy-it-now options

#### `frontend/src/lib/components/marketDataUtils.ts`
- Market data transformation utilities
- Functions: `sortedBids`, `sortedOffers`, `ordersAtTransaction`, `tradesAtTransaction`, `maxClosedTransactionId`

#### `frontend/src/lib/components/forms/protoSuperForm.ts`
- Form builder wrapper for sveltekit-superforms with Protobuf validation
- Maps validation errors to form fields
- Used by all form components

#### `frontend/src/lib/components/forms/` (Form Components)
- `createMarket.svelte` - Create market form (name, description, min/max settlement, visibility)
- `settleMarket.svelte` - Settle market form (settlement price selection)
- `createOrder.svelte` - Order entry form (size, price, bid/offer side)
- `makeTransfer.svelte` - Money/credit transfer form
- `createAccount.svelte` - Alt account creation
- `shareOwnership.svelte` - Share account ownership
- `createAuction.svelte` / `editAuction.svelte` / `settleAuction.svelte` / `deleteAuction.svelte` / `buyAuction.svelte` - Auction management forms
- `redeem.svelte` - Redeem fund shares
- `createMarketType.svelte` / `deleteMarketType.svelte` / `createMarketGroup.svelte` - Admin market category management

#### `frontend/src/lib/components/ui/` (shadcn-svelte Components)
- Pre-built UI components: button, dialog, form, input, select, table, tabs, tooltip, sidebar, etc.
- Configured with Tailwind CSS styling
- Used throughout the application for consistent UI

#### `frontend/src/lib/utils.ts`
- Helper functions including `cn()` for class name merging
- General utility functions used across components

#### `frontend/src/lib/portfolioMetrics.ts`
- Portfolio calculation utilities
- Computes positions, P&L, exposure metrics

#### `frontend/src/lib/localStore.svelte.ts`
- LocalStorage persistence wrapper with Svelte reactivity
- Used for client-side preferences

#### `frontend/src/lib/starredMarkets.svelte.ts` / `starPinnedMarkets.svelte.ts`
- Starred/favorite and pinned markets state management
- Persisted to localStorage

#### `frontend/src/routes/+layout.svelte`
- Root layout with sidebar provider
- Sets up global UI structure

#### `frontend/src/routes/market/[id]/+page.svelte`
- Individual market detail page
- Renders order book, trades, settlement controls via market.svelte

#### `frontend/src/routes/auction/+page.svelte`
- Auction marketplace listing page
- Shows all active auctions with filtering

#### `frontend/src/routes/accounts/+page.svelte`
- Account management page
- Create alt accounts, share ownership, view balances

#### `frontend/src/routes/transfers/+page.svelte`
- Transfer history page
- Shows all incoming/outgoing transfers

---

### Schema (Protocol Buffers)

#### `schema/client-message.proto`
- Client-to-server message envelope
- Defines `ClientMessage` with `request_id` and oneof for all request types
- Request types: CreateMarket, SettleMarket, CreateOrder, CancelOrder, MakeTransfer, Authenticate, ActAs, CreateAccount, CreateAuction, etc.

#### `schema/server-message.proto`
- Server-to-client message envelope
- Defines `ServerMessage` with `request_id` and oneof for all response/event types
- Response types: PortfolioUpdated, Market, OrderCreated, Transfers, Authenticated, RequestFailed, Accounts, Trades, etc.

#### `schema/market.proto`
- Market definition (id, name, description, owner_id, min/max settlement, settled_price, status, visibility, pinned)

#### `schema/order.proto` / `schema/orders.proto`
- Single order and order book batch messages
- Fields: id, market_id, owner_id, size, price, side, timestamp

#### `schema/trade.proto` / `schema/trades.proto`
- Trade execution and batch messages
- Fields: id, market_id, buyer_id, seller_id, price, size, timestamp, is_taker

#### `schema/portfolio.proto`
- Account positions and balances
- Fields: account_id, total/available balance, market exposures, owner credits

#### `schema/auction.proto`
- Auction listing definition
- Fields: id, name, description, owner_id, start/settle price, buy-it-now price

#### Other schema files
- `account.proto`, `transfer.proto` - Account and transfer types
- `create-*.proto`, `settle-*.proto`, `edit-*.proto` - Request parameter messages
- `side.proto` - Bid/Offer enum
- `request-failed.proto` - Error response with details

---

### Schema-JS (Generated Bindings)

#### `schema-js/index.js` / `schema-js/index.d.ts`
- Auto-generated JavaScript/TypeScript protobuf bindings
- Generated from `schema/*.proto` files via `pnpm --filter schema-js build-proto`
- Imported by frontend via workspace dependency
