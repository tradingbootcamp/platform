This file provides guidance when working with code in this repository.

## Overview

This is a monorepo for a quantitative trading bootcamp platform - a simulated trading exchange where students learn about markets, order books, and quant trading. 

## Architecture

### System Components

- **Kinde Auth** (external): OAuth provider for authentication
- **Frontend** (SvelteKit + Svelte 5): Web interface with Market UI, Account/Portfolio UI (orders, trades, balances, transfers, alt accounts)
- **Backend** (Rust + Axum): Contains WebSocket handler, order matching engine, pub/sub broadcasts, and SQLite database (accounts, orders, trades, markets, transfers, auctions)

Communication: Frontend connects to backend via WebSocket with Protocol Buffers (binary, ordered delivery, request-response via request IDs)

### Core Domain Concepts

- **Accounts**: User accounts (linked to Kinde via `kinde_id`) and alt accounts (no `kinde_id`, owned by users). Ownership is hierarchical—users can own alt accounts and share ownership with others. Each account belongs to a universe.
- **Markets**: Prediction/trading markets with min/max settlement bounds. Statuses: Open, Paused, Closed. Optional visibility restrictions and account ID hiding. Each market belongs to a universe.
- **Orders**: Limit orders only (bids and offers). Price-time priority matching with partial fills.
- **Trades**: Created when orders match. Track buyer, seller, price, size, taker side.
- **Portfolios**: Track account balances and market exposures. Available balance considers worst-case outcomes from positions.
- **Auctions**: Separate system for non-market items. Supports buy-it-now pricing. Admin settles with buyer and price.
- **Universes**: Isolated trading environments. Universe 0 is "Main" (no owner). Users can create their own universes and give accounts initial balances within them. Only universe owners can create markets in non-main universes. Accounts in different universes cannot trade with each other. Frontend shows universe features after pressing Ctrl+Shift+U on the Accounts page.

### Communication Protocol

All client-server communication uses WebSocket with Protocol Buffers.

**Typical message flow:**
1. Client sends `Authenticate` with JWT
2. Server responds with `Authenticated` + initial state snapshot
3. Client sends requests (e.g., `CreateOrder` with `request_id`)
4. Server responds to requester (e.g., `OrderCreated` with matching `request_id`)
5. Server broadcasts updates to all clients (e.g., `Trades`, `PortfolioUpdated`)

**Subscription model:**
- Public subscriptions: Market updates, order book changes, trades (broadcast to all)
- Private subscriptions: Transfers, portfolio updates (per-account)
- Ownership watchers: Notified when account ownership changes

### Authentication Flow

1. Client initiates login with Kinde (OAuth PKCE flow)
2. Kinde returns access token to client
3. Client opens WebSocket connection to backend
4. Client sends `Authenticate` message with JWT
5. Backend validates JWT against Kinde's public keys
6. Backend responds with `Authenticated` + initial state

### Rate Limiting

| Class | User Limit | Admin Limit | Operations |
|-------|------------|-------------|------------|
| Expensive | 180/min | 1800/min | GetFullTradeHistory, CreateMarket, Auctions |
| Mutate | 100/sec (1000 burst) | 1000/sec (10000 burst) | CreateOrder, CancelOrder, MakeTransfer |

### Database Schema (Key Tables)

- `universe` - Isolated trading environments (id, name, description, owner_id)
- `account` - User and alt accounts (includes universe_id)
- `account_owner` - Ownership relationships + credits
- `market` - Trading markets with settlement bounds (includes universe_id)
- `market_visible_to` - Market visibility restrictions
- `order` - Live and historical orders
- `order_size` - Order size history (for replay)
- `trade` - Executed trades
- `transfer` - Balance transfers between accounts
- `exposure_cache` - Pre-computed market exposures per account
- `auction` - Auction listings

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
sqlx db create              # Create database (uses DATABASE_URL)
sqlx migrate run            # Apply migrations (uses DATABASE_URL)
cargo run                   # Run the exchange server
cargo test-all              # Run all tests (unit + integration)
cargo clippy                # Run linter
cargo sqlx prepare          # Regenerate .sqlx/ cache (run after changing SQL queries)
cargo llvm-cov --features test-auth-bypass --html  # Generate coverage report (requires cargo-llvm-cov)
```

Always create the database with `sqlx db create && sqlx migrate run` instead of using `SQLX_OFFLINE=true`. This ensures SQLx compile-time query checking works correctly.

### Test Auth Bypass

When running with `--features test-auth-bypass` (or using `./dev.sh --test-auth-bypass`), you can authenticate with test tokens instead of real Kinde JWTs:

```
test::<kinde_id>::<name>::<is_admin>
```

- `<kinde_id>`: Any arbitrary string. Each unique value creates a separate account.
- `<name>`: Display name for the account.
- `<is_admin>`: `true` or `false` to control admin status.

**Initial balances:**
- Admin accounts: **100,000,000 clips**
- Non-admin accounts: **0 clips**

Examples: `test::alice::Alice::false`, `test::admin1::Admin User::true`

### Frontend
```bash
cd frontend
pnpm run dev                # Dev server
pnpm run build              # Production build
pnpm run check              # Svelte/TypeScript type checking
pnpm run lint               # Prettier + ESLint
pnpm run format             # Auto-format with Prettier
pnpm --filter schema-js build-proto   # Regenerate JS/TS protobuf bindings after changing .proto files
pnpm run generate:api                 # Regenerate Scenario Server OpenAPI (scenario server must be running locally on :8000)
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

## Connection Data Flow

When a client connects via WebSocket:

1. **JWT validated**, `user_id` determined from Kinde token
2. **`ensure_user_created()`** - create account record if new user
3. **`get_owned_accounts()`** - fetch all accounts user can access (own + alt + shared)
4. **Subscribe to channels:**
   - Public (markets, orders, trades)
   - Private transfers (for each owned account)
   - Portfolio updates (for each owned account)
   - Ownership changes (to detect new/revoked access)
5. **`send_initial_private_data()`:**
   - Transfers for all owned accounts
   - Portfolios for all owned accounts
6. **`send_initial_public_data()`:**
   - All accounts
   - Visible markets (filtered by `visible_to` unless admin with sudo)
   - Live orders (account IDs possibly hidden per market settings)
7. **`ActingAs` message sent** - signals client is ready for operations

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

## Documentation

**Read relevant docs before starting work.** The `docs/` directory contains detailed documentation on specific subsystems. Consult these when working on related features.

| Document | Read when... |
|----------|--------------|
| `docs/accounts.md` | Working on user accounts, alt accounts, ownership/sharing, portfolios, transfers, or the `account_owner` table |
| `docs/order-matching.md` | Working on orders, the order book, trade execution, fills, price-time priority, or the `exposure_cache` |
| `docs/websocket-protocol.md` | Working on client-server communication, message types, request/response patterns, or reconnection logic |
| `docs/visibility.md` | Working on market visibility restrictions (`visible_to`), account ID hiding (`hide_account_ids`), or privacy features |
| `docs/sudo.md` | Working on admin permissions, sudo mode, rate limits, or admin-only operations |
| `docs/auctions.md` | Working on the auction system, buy-it-now, or auction settlement |

## File Listing

> **Maintenance note:** Update this listing when source files (`.rs`, `.ts`, `.svelte`, `.proto`, etc.) are created, deleted, significantly changed, or refactored. Exclude dependency directories (`node_modules/`, `target/`, `vendor/`), build artifacts, and package manager configuration files (`package.json`, `Cargo.toml`, etc.). Use discretion about what to include—focus on files that would be helpful for future agents modifying the codebase.
>
> Organize files by directory structure. For each file, create a subsection with:
> - Heading: the file path in backticks (e.g., `src/main.rs`)
> - 3-6 bullet points describing: its purpose, key functions/exports, notable dependencies on other files or other components of the project, and notable implementation details
> - Mark primary entry points (main files, index files) explicitly as such
>
> For directories with many similar files, you may summarize them as a group rather than listing each individually—but only if the individual files are mostly boilerplate or can be easily summarized as one.

### Root Scripts

#### `dev.sh`
- Unified development script that starts both backend and frontend servers
- Handles dependency installation (pnpm, sqlx-cli), database creation, and schema-js build
- Automatic port detection with fallback if ports are in use
- Supports `--test-auth-bypass` flag to enable test authentication bypass feature
- Graceful shutdown with signal handlers (cleanup on Ctrl+C)

---

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
- **Warning:** Do not read this file in its entirety—it is too large and will consume excessive tokens. Instead, use targeted searches (grep/ripgrep) or line-range reads to find specific functions or sections.
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
- `createAccount.svelte` - Alt account creation (supports universe_id and initial_balance for universe owners)
- `createUniverse.svelte` - Universe creation form (name, description)
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

#### `frontend/src/lib/universeMode.svelte.ts`
- Universe mode toggle state (hidden feature activated by Ctrl+Shift+U)
- Persists enabled state to localStorage
- Exports `universeMode` object with `enabled` getter, `toggle()`, and `handleKeydown()`

#### `frontend/src/lib/starredMarkets.svelte.ts` / `starPinnedMarkets.svelte.ts`
- Starred/favorite and pinned markets state management
- Persisted to localStorage

#### `frontend/src/routes/+layout.svelte`
- Root layout wrapping all pages with sidebar provider and global header
- Fixed header (`z-[5]`) displays available balance and mark-to-market; compacts on scroll
- Responsive banner logic adapts content (full/short/minimal) based on viewport width
- Imports global CSS from `../app.css`; shows colored background for admin/sudo modes
- Includes spacer div to offset page content below the fixed header
- Redirects unauthenticated users to login on mount

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

#### `schema/universe.proto` / `schema/create-universe.proto`
- Universe definition and creation request
- Fields: id, name, description, owner_id

#### Other schema files
- `account.proto`, `transfer.proto` - Account and transfer types (account includes universe_id)
- `create-*.proto`, `settle-*.proto`, `edit-*.proto` - Request parameter messages
- `side.proto` - Bid/Offer enum
- `request-failed.proto` - Error response with details

---

### Schema-JS (Generated Bindings)

#### `schema-js/index.js` / `schema-js/index.d.ts`
- Auto-generated JavaScript/TypeScript protobuf bindings
- Generated from `schema/*.proto` files via `pnpm --filter schema-js build-proto`
- Imported by frontend via workspace dependency
