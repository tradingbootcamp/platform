# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. You should only be changing the frontend, but you may look at the backend for help understanding how things work.

## Overview

This is a monorepo for a quantitative trading bootcamp platform - a simulated trading exchange where students learn about markets, order books, auctions, and quant trading. 

## Architecture

- **frontend** (SvelteKit): Main web interface using Svelte 5, shadcn-svelte, Tailwind CSS
- **backend** (Rust/Axum): Core exchange server handling WebSocket connections, order matching, trade execution, SQLite persistence
- **schema**: Protocol Buffer definitions for client-server communication
- **schema-js**: Generated JS/TS protobuf bindings (workspace dependency)

Communication: WebSocket with Protocol Buffers (binary, ordered delivery, request-response via request IDs)

Authentication: Kinde Auth

## Common Commands

### Frontend Only (against production backend)
```bash
pnpm i                      # Install dependencies
pnpm dev                    # Start frontend on localhost:5173
```

### Frontend
```bash
cd frontend
pnpm run dev                # Dev server
pnpm run build              # Production build
pnpm run check              # Svelte/TypeScript type checking
pnpm run lint               # Prettier + ESLint
pnpm run format             # Auto-format with Prettier
```

## Key Files

- `schema/server-message.proto`, `schema/client-message.proto` - API contract; `schema/` contains all protobuf definitions
- `frontend/src/lib/api.svelte.ts` - Frontend state aggregation from server patches. *Most important* file for getting data for the UI, as well as sending client requests.
- `frontend/src/lib/components/market.svelte` - Main market UI

Only look at `backend/` if you are confused or interested in how something works that isn't clear from the frontend.
- `backend/src/db.rs` - Core exchange database logic. 
- `backend/migrations/` - Database schema

## Frontend Patterns

- Svelte 5 runes for reactivity
- shadcn-svelte components with Tailwind
- State synchronization via WebSocket patch messages

## Frontend!

You are working on making frontend changes. Changes to the backend will not work, since we are using a production backend server, and only have a locally running frontend.
