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
