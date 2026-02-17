# Showcase Mode

The showcase is a read-only, public-facing deployment of the trading platform. It lets anyone view live or historical bootcamp trading data without authentication, while admins manage what's visible.

**Live at:** https://trading-bootcamp-showcase.fly.dev/

## Showcase Slots (Client URLs)

Each bootcamp key also works as a public showcase slot URL:

- `https://trading-bootcamp-showcase.fly.dev/client`
- `https://trading-bootcamp-showcase.fly.dev/other-client`

The frontend rewrites these to normal app routes and carries `showcase=<key>` to the WebSocket.
The backend then applies that bootcamp's showcase filters (`showcase_market_ids`, anonymization, hidden categories, etc.) for that connection.

Notes:
- If the key is unknown, the server falls back to `active_bootcamp`.
- Multi-URL slots currently share the same active database connection; if a requested key points at a different `db_path`, the server falls back to `active_bootcamp`.

## How It Differs from the Main Platform

| Aspect | Main Platform | Showcase |
|--------|---------------|----------|
| Authentication | Required (Kinde OAuth) | Optional — anonymous access by default |
| Who can trade | All authenticated users | Only admins (everyone else is read-only) |
| Database | Single SQLite DB | Multiple bootcamp DBs, hot-swappable |
| Market visibility | Per-market `visible_to` lists | Admin-curated showcase list |
| Account names | Real names | Optionally anonymized ("Trader 1", "Trader 2") |
| Auctions | Visible | Hidden |
| Sign-in | Login page | Only via `/signin` URL (no button in UI) |
| Admin UI | In-app forms | Dedicated `/showcase` management page |
| History view | Not available | Time slider with playback for closed markets |

## Architecture

The showcase is the same Rust/Axum backend and SvelteKit frontend, compiled into a single Docker image. The backend serves the frontend as static files (no separate frontend server).

```
┌─────────────────────────────────────────────┐
│  Fly.io (trading-bootcamp-showcase)         │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Axum Server (port 8080)              │  │
│  │                                       │  │
│  │  /api          → WebSocket handler    │  │
│  │  /api/showcase/ → Admin REST API      │  │
│  │  /*            → Static SvelteKit     │  │
│  └──────────────┬────────────────────────┘  │
│                 │                            │
│  ┌──────────────▼────────────────────────┐  │
│  │  /data/ (persistent volume)           │  │
│  │                                       │  │
│  │  showcase-config.json                 │  │
│  │  dag-feb8.sqlite                      │  │
│  │  dag-mar15.sqlite                     │  │
│  │  uploads/                             │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Key Backend Components

- **`backend/src/showcase.rs`** — `ShowcaseConfig` and `BootcampConfig` structs, JSON load/save
- **`backend/src/showcase_api.rs`** — REST endpoints for admin management
- **`backend/src/handle_socket.rs`** — Modified WebSocket handler with anonymous access, anonymization, market filtering, and read-only enforcement
- **`backend/src/lib.rs`** — `AppState` uses `ArcSwap<DB>` for lock-free DB hot-swapping

## Showcase Configuration

Stored as JSON at the path specified by `SHOWCASE_CONFIG` env var (default: `/data/showcase-config.json`).

```json
{
  "active_bootcamp": "dag-feb8",
  "bootcamps": {
    "dag-feb8": {
      "db_path": "/data/dag-feb8.sqlite",
      "display_name": "DAG - February 2025",
      "anonymize_names": true,
      "showcase_market_ids": [1, 3, 5, 12],
      "hidden_category_ids": [2],
      "non_anonymous_account_ids": [1, 42]
    }
  }
}
```

### Fields

- **`active_bootcamp`** — Key into `bootcamps` map. Determines which DB is loaded.
- **`db_path`** — Path to the SQLite database file for this bootcamp.
- **`display_name`** — Human-readable name shown in admin UI.
- **`anonymize_names`** — When true, account names are replaced with "Trader 1", "Trader 2", etc. for non-admin users.
- **`showcase_market_ids`** — Which markets are visible to non-admin users. Empty = all markets visible.
- **`hidden_category_ids`** — Market type/category IDs to hide from non-admin users.
- **`non_anonymous_account_ids`** — Accounts that keep their real names even when anonymization is on (e.g., house/bot accounts).

## Anonymous Access

When a user opens the site without signing in:

1. Frontend detects no Kinde session
2. Sends `AuthenticateAnonymous` protobuf message (empty payload)
3. Backend creates a read-only session with no user identity
4. Backend sends only public data filtered to showcase markets
5. Frontend renders in read-only mode (no order forms, no portfolio, no transfers)

The `AuthenticateAnonymous` message is defined in `schema/client-message.proto`:
```protobuf
AuthenticateAnonymous authenticate_anonymous = 28;
message AuthenticateAnonymous {}
```

Anonymous users enter a separate event loop (`handle_anonymous_loop`) that:
- Only receives public broadcast messages (markets, orders, trades, accounts, types)
- Only handles three read queries: `GetFullTradeHistory`, `GetFullOrderHistory`, `GetMarketPositions`
- Rejects all mutations with a "read-only" error

## Read-Only Enforcement

Non-admin authenticated users (shouldn't normally exist, since non-admins are rejected at login) and anonymous users are read-only. The `check_read_only()` function intercepts mutation messages and returns a `RequestFailed` response. Blocked operations include:

`CreateMarket`, `SettleMarket`, `CreateOrder`, `CancelOrder`, `Out`, `MakeTransfer`, `CreateAccount`, `ShareOwnership`, `RevokeOwnership`, `Redeem`, `CreateAuction`, `SettleAuction`, `DeleteAuction`, `EditMarket`, `EditAuction`, `BuyAuction`, `CreateMarketType`, `DeleteMarketType`, `CreateMarketGroup`, `CreateUniverse`

## Market Filtering

When `showcase_market_ids` is set:

1. **Initial data** — `send_initial_public_data_showcase()` only sends markets in the list
2. **Live broadcasts** — `should_forward_broadcast()` drops messages for non-showcased markets
3. **Admins bypass** — Admin users see all markets regardless

The filtering checks market IDs in: `OrderCreated`, `OrdersCancelled`, `Trades`, `Market`, `MarketSettled`, `Redeemed`. Account, type, group, and universe messages always pass through.

## Name Anonymization

When `anonymize_names` is enabled:

1. `build_anonymization_map(db, excluded_ids)` queries all accounts and builds a `HashMap<i64, String>` mapping each account ID to "Trader N"
2. Accounts in `non_anonymous_account_ids` are excluded from the map (keep real names)
3. The map is applied to:
   - `Accounts` messages (initial data)
   - `AccountCreated` broadcasts (new accounts)
4. Trader numbers are assigned sequentially by account order in the DB

The anonymization map is built once at connection time. It does not update if accounts are added later.

## Database Hot-Swapping

The `AppState.db` field is `Arc<ArcSwap<DB>>` — a lock-free atomic pointer swap.

When an admin switches the active bootcamp:
1. `POST /api/showcase/active` receives the bootcamp key
2. Backend loads the new SQLite DB via `DB::init_with_path()` (runs on a blocking thread because the SQLite future is `!Send`)
3. `state.db.store(Arc::new(new_db))` atomically replaces the DB pointer
4. Existing connections keep their old DB reference (snapshotted at connection time via `Arc::clone(&app_state.db.load())`)
5. New connections get the new DB

This means switching bootcamps is instant and doesn't disconnect existing users, but they'll see stale data until they reconnect.

## History View (Time Slider)

Closed markets automatically show a history time slider that lets users scrub through the market's trading history.

### How it works

1. When a closed market is viewed, the frontend auto-requests full order history (`GetFullOrderHistory`) and full trade history (`GetFullTradeHistory`)
2. Once loaded, `displayTransactionIdBindable` is set to `maxClosedTransactionId` (one before settlement)
3. The slider maps to transaction IDs — moving it filters orders and trades to that point in time
4. `ordersAtTransaction()` reconstructs the order book state at any transaction by using the `sizes` array on each order
5. `positionsAtTransaction()` computes participant positions from trades up to the selected transaction, seeding all future participants as zero rows
6. `tradesAtTransaction()` filters trades to those at or before the selected transaction

### Playback

The play button advances the slider automatically using `requestAnimationFrame`:
- Speed options: 1x, 2x, 5x, 10x, 50x, 100x (base rate: 15 transactions/sec)
- Uses time-based calculation: `target = start + floor(elapsed * speed * 15 / 1000)`
- This allows high speeds (50x = 750 tps, 100x = 1500 tps) by skipping transactions rather than hitting browser timer limits
- `untrack()` prevents Svelte's `$effect` from re-running on every frame update
- Speed changes cause the effect to restart (speed is read synchronously as a tracked dependency)

### Settlement edge case

`maxClosedTransactionId` returns `closed.transactionId - 1` because the settlement transaction itself cancels all orders (sets size to 0), which would show an empty order book.

## Dark Order Book

Markets in the "Options" category (except those with "Time" in the name) use a dark order book — non-admin users only see their own orders and the best bid/offer, not the full book.

## Admin Management

### Signing in

There is no sign-in button in the UI. Admins sign in by navigating to `/signin`, which redirects to Kinde OAuth. Non-admin Kinde accounts are rejected with a toast error and logged out.

### `/showcase` admin page

The management page at `/showcase` (admin-only) provides:

- **Current Status** — Active bootcamp name, market count, anonymization status
- **Bootcamp Selector** — Switch between configured bootcamps (triggers DB hot-swap)
- **Add Bootcamp** — Register a new bootcamp with key, DB path, display name
- **Market Selection** — Checkbox list to choose which markets to showcase
- **Anonymization** — Toggle on/off
- **Non-Anonymous Accounts** — Searchable multi-select for accounts that keep real names

### Admin REST API

All endpoints require admin JWT in `Authorization: Bearer` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/showcase/config` | Get full config |
| POST | `/api/showcase/active` | Switch active bootcamp |
| GET | `/api/showcase/bootcamps` | List bootcamps |
| POST | `/api/showcase/bootcamps` | Add bootcamp |
| GET | `/api/showcase/bootcamps/:name/markets` | List markets in a bootcamp DB |
| POST | `/api/showcase/markets` | Set showcase market IDs |
| POST | `/api/showcase/anonymize` | Toggle anonymization |
| POST | `/api/showcase/non-anonymous-accounts` | Set non-anonymous account IDs |
| GET | `/api/showcase/accounts` | List all accounts in active DB |
| POST | `/api/showcase/hidden-categories` | Toggle a hidden category |

## Deployment

### Fly.io

Deployed as `trading-bootcamp-showcase` on Fly.io in the `ewr` (Newark) region.

**`fly.toml`:**
```toml
app = 'trading-bootcamp-showcase'
primary_region = 'ewr'

[build]
dockerfile = 'backend/Dockerfile'

[env]
PORT = '8080'
KINDE_ISSUER = 'https://account.trading.camp'
KINDE_AUDIENCE = 'trading-server-api,a9869bb1225848b9ad5bad2a04b72b5f'
DATABASE_URL = 'sqlite:///data/dag-feb8.sqlite'
SHOWCASE_CONFIG = '/data/showcase-config.json'

[mounts]
source = "showcase_data"
destination = "/data"
```

The persistent volume `showcase_data` is mounted at `/data/` and stores:
- Bootcamp SQLite databases (copied from production after each bootcamp)
- `showcase-config.json`
- Uploaded images (`/data/uploads/`)

### Docker build

The `Dockerfile` is a multi-stage build:

1. **Rust builder** — Compiles backend binary with `cargo-chef` for dependency caching
2. **Frontend builder** — Builds SvelteKit with production env vars baked in:
   - `PUBLIC_TEST_AUTH=false`
   - `PUBLIC_KINDE_REDIRECT_URI=https://trading-bootcamp-showcase.fly.dev`
   - `PUBLIC_SERVER_URL=/api` (same-origin WebSocket)
3. **Runtime** — Debian slim with the backend binary and static frontend files

The backend serves the SvelteKit build as static files via `tower_http::services::ServeDir` with `index.html` fallback for SPA routing.

### Adding a new bootcamp database

1. Copy the SQLite database to the Fly volume: `fly sftp shell` then upload to `/data/`
2. Go to `/showcase` admin page
3. Click "Add Bootcamp" with the DB path (e.g., `/data/new-bootcamp.sqlite`)
4. Activate it
5. Select which markets to showcase
6. Enable anonymization if desired
