FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY ./backend .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
RUN apt-get update && apt-get install -y protobuf-compiler
# Build application
COPY ./backend .
COPY ./schema /schema
RUN cargo build --release --bin backend

# We do not need the Rust toolchain to run the binary!
FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt install -y openssl ca-certificates
WORKDIR /app
COPY --from=builder /app/target/release/backend /usr/local/bin
COPY ./backend/migrations /app/migrations
ENTRYPOINT ["/usr/local/bin/backend"]
