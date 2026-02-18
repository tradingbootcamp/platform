# Showcase Mode

The showcase deployment is a read-only, public-facing view of trading data with admin-configured filtering.

Live URL: `https://trading-bootcamp-showcase.fly.dev/`

## Model (v2)

Showcases are first-class objects. A showcase points to a database from a shared registry.

- Zero or more showcases can point to the same database.
- Zero or one showcase is marked as `default_showcase`.
- Showcase context is URL-only (`?showcase=<key>`).

## Routing Behavior

- `/signin`: always reachable.
- `/showcase`: always reachable (admin API auth still required).
- `/<showcase-key>`: validates showcase key, then redirects into app routes with `?showcase=<key>`.
- `/`:
  - if `default_showcase` exists: redirects to `/<default_showcase>`
  - if no default: renders a plain chooser page with showcase links only
- Non-root trading routes without explicit showcase query (`/market`, `/accounts`, `/transfers`, `/auction`, `/options`): redirect to `/`.

## Config File

Path: `SHOWCASE_CONFIG` env var (default `/data/showcase-config.json`).

### v2 shape

```json
{
  "default_showcase": "wealthsimple",
  "databases": {
    "dag-feb8": {
      "db_path": "/data/dag-feb8.sqlite",
      "display_name": "DAG - February 2025"
    }
  },
  "showcases": {
    "wealthsimple": {
      "display_name": "Wealthsimple View",
      "database_key": "dag-feb8",
      "anonymize_names": true,
      "showcase_market_ids": [1, 3, 5],
      "hidden_category_ids": [2],
      "non_anonymous_account_ids": [1, 42]
    }
  }
}
```

### Key fields

- `default_showcase`: optional key shown at `/`.
- `databases[db_key]`: registry of DB paths and labels.
- `showcases[showcase_key]`: per-client presentation config.
  - `database_key`: points to one registry entry.
  - `anonymize_names`: anonymize account names for non-admin sessions.
  - `showcase_market_ids`: allowed market IDs for non-admin sessions.
  - `hidden_category_ids`: hidden market category IDs for non-admin sessions.
  - `non_anonymous_account_ids`: real names preserved when anonymization is enabled.

## Legacy Migration

`backend/src/showcase.rs` accepts legacy config on load:

- `active_bootcamp`
- `bootcamps`

Migration rules:

- each legacy bootcamp key becomes one `databases[key]` entry
- each legacy bootcamp key becomes one `showcases[key]` entry with `database_key = key`
- `default_showcase = active_bootcamp`

Save always writes v2.

## Backend Runtime Behavior

- WebSocket handler resolves showcase by URL query key.
- If query key is missing, it uses `default_showcase` (if configured).
- If query key is explicit but invalid, no showcase context is applied.
- DB is resolved through `showcase.database_key`.
- `AppState` keeps a DB cache keyed by database key; multiple showcases can share one loaded DB.

## Public + Admin API

### Public

- `GET /api/showcase/public`
  - returns `{ default_showcase, showcases: [{ key, display_name }] }`

### Admin

- `GET /api/showcase/config`
- `GET /api/showcase/databases`
- `POST /api/showcase/databases`
- `POST /api/showcase/default` body: `{ showcase: string | null }`
- `GET /api/showcase/showcases`
- `POST /api/showcase/showcases`
- `DELETE /api/showcase/showcases/:key`
- `GET /api/showcase/showcases/:key/markets`
- `POST /api/showcase/showcases/:key/markets`
- `GET /api/showcase/showcases/:key/accounts`
- `POST /api/showcase/showcases/:key/anonymize`
- `POST /api/showcase/showcases/:key/non-anonymous-accounts`
- `POST /api/showcase/showcases/:key/hidden-categories`

## Frontend Admin UI (`/showcase`)

The admin page now has three parts:

1. Database registry
- list databases
- add database (`key`, `db_path`, `display_name`)

2. Showcase registry
- list showcases with share URLs
- add showcase with database dropdown
- delete showcase
- choose/set default showcase

3. Selected showcase editor
- shown markets
- anonymization toggle
- non-anonymous account list
- hidden categories

## Key Normalization and Restrictions

- Showcase/database keys are normalized lowercase slug keys: `[a-z0-9_-]+`.
- Reserved showcase route keys are rejected for showcase creation (`signin`, `login`, `showcase`, `market`, `accounts`, `transfers`, `auction`, `options`, `docs`, `home`, `api`).

## Notes

- `/showcase` remains a normal app route; API calls still require admin auth.
- `/signin` remains outside showcase-routing constraints and always works.
