# Stage 1: Rust dependency planning
FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY ./backend .
RUN cargo chef prepare --recipe-path recipe.json

# Stage 2: Build Rust backend
FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
RUN apt-get update && apt-get install -y protobuf-compiler
# Build application
COPY ./backend .
COPY ./schema /schema
RUN cargo build --release --bin backend

# Stage 3: Build SvelteKit frontend
FROM node:20-slim AS frontend-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
# Copy workspace config and package files first for caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY schema-js/package.json schema-js/
COPY frontend/package.json frontend/
RUN pnpm install --frozen-lockfile
# Copy source and build
COPY schema-js/ schema-js/
COPY schema/ schema/
COPY docs/ docs/
COPY frontend/ frontend/
# Build schema-js first (frontend depends on it)
RUN pnpm --filter schema-js build-proto
# Set production env vars for frontend build
ENV PUBLIC_KINDE_CLIENT_ID=a9869bb1225848b9ad5bad2a04b72b5f
ENV PUBLIC_KINDE_DOMAIN=https://account.trading.camp
ENV PUBLIC_SERVER_URL=/api
ENV PUBLIC_KINDE_REDIRECT_URI=https://trading-bootcamp-showcase.fly.dev
ENV PUBLIC_SCENARIOS_SERVER_URL=
ENV PUBLIC_TEST_AUTH=false
RUN pnpm --filter frontend build

# Stage 4: Runtime
FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt install -y openssl ca-certificates
WORKDIR /app
COPY --from=builder /app/target/release/backend /usr/local/bin
COPY --from=frontend-builder /app/frontend/build /app/static
COPY ./backend/migrations /app/migrations
ENV STATIC_DIR=/app/static
ENTRYPOINT ["/usr/local/bin/backend"]
