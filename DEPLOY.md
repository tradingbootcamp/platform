# Deployment

## Architecture

- **Frontend**: Static SPA on Vercel (SvelteKit with `adapter-static`)
- **Backend**: Rust binary on Fly.io (Docker, SQLite with persistent volume)
- Frontend and backend are on different domains, so HTTP API calls use cross-origin requests with CORS.

## Staging

- **Frontend**: https://platform-staging-five-gamma.vercel.app (Vercel project `platform-staging` under `trading-bootcamp` team)
- **Backend**: https://trading-bootcamp-staging.fly.dev (Fly app `trading-bootcamp-staging`)

### Deploy staging backend

```bash
fly deploy --config backend/fly.staging.toml
```

### Deploy staging frontend

```bash
vercel --prod --scope trading-bootcamp
```

### Vercel env vars (Production environment)

| Variable | Value |
|----------|-------|
| `PUBLIC_KINDE_CLIENT_ID` | `a9869bb1225848b9ad5bad2a04b72b5f` |
| `PUBLIC_KINDE_DOMAIN` | `https://account.trading.camp` |
| `PUBLIC_KINDE_REDIRECT_URI` | `https://platform-staging-five-gamma.vercel.app` |
| `PUBLIC_SERVER_URL` | `wss://trading-bootcamp-staging.fly.dev/api` |
| `PUBLIC_TEST_AUTH` | `false` |

**Important**: When setting env vars via `vercel env add`, pipe with `printf` (not `echo`) to avoid embedding trailing newlines:
```bash
printf 'value' | vercel env add VAR_NAME production --scope trading-bootcamp
```

### Kinde setup

Add the frontend URL to "Allowed callback URLs" in the Kinde application settings for client ID `a9869bb1225848b9ad5bad2a04b72b5f`.

## Code changes required for deployment

### 1. `.dockerignore`

Excludes `backend/target`, `backend/data`, SQLite files, `node_modules`, `.git`, `.claude` etc. Without this, Docker context transfer is ~733MB instead of ~700KB.

### 2. `backend/Dockerfile` modifications

- **`ENV SQLX_OFFLINE=true`**: SQLx does compile-time query checking against a live database by default. In Docker there's no database, so offline mode uses the pre-generated `.sqlx/` cache instead.
- **`COPY ./backend/global_migrations /app/global_migrations`**: The multi-cohort feature added a `global_migrations/` directory that needs to be in the runtime image.

### 3. `.vercelignore`

Excludes the same heavy directories from Vercel uploads.

### 4. CORS: `backend/Cargo.toml` + `backend/src/main.rs`

Since frontend (Vercel) and backend (Fly.io) are on different domains, the browser blocks cross-origin API requests. The fix:

- Added `"cors"` feature to `tower-http` in `Cargo.toml`
- Replaced the manual `SetResponseHeaderLayer` for `Access-Control-Allow-Origin: *` with `CorsLayer::permissive()`, which properly handles preflight OPTIONS requests and allows the `Authorization` header

### 5. Cross-origin HTTP API calls: `frontend/src/lib/apiBase.ts`

In development, the Vite dev server proxies `/api/*` to the backend (see `frontend/vite.config.ts`). In production, there's no proxy — the frontend and backend are on different domains.

`apiBase.ts` derives the HTTP base URL from `PUBLIC_SERVER_URL`:
- `wss://host.fly.dev/api` → `https://host.fly.dev`
- `ws://localhost:8080` → `http://localhost:8080`

`cohortApi.ts` and `adminApi.ts` use `API_BASE` to make absolute URL requests instead of relative `/api/...` paths. This works in both dev (Vite proxy still intercepts) and production (direct cross-origin requests).

### 6. `frontend/src/routes/[cohort_name]/docs/[slug]/+page.svelte`

Fixed markdown import paths — the file moved one level deeper into `[cohort_name]/` so the relative imports needed an extra `../` (e.g. `../../../../../docs/` → `../../../../../../docs/`).

### 7. `backend/fly.staging.toml`

Fly.io config for the staging app. Key differences from production (`fly.toml`):
- `app = 'trading-bootcamp-staging'`
- Separate persistent volume mount (`trading_bootcamp_staging`)
- Staging database path
