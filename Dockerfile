FROM lukemathwalker/cargo-chef:latest-rust-1-bookworm AS chef
WORKDIR /app

FROM chef AS planner
RUN rustup toolchain install nightly
COPY ./backend .
RUN cargo +nightly chef prepare --recipe-path recipe.json

FROM chef AS builder
RUN rustup toolchain install nightly
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo +nightly chef cook --release --recipe-path recipe.json
RUN apt-get update && apt-get install -y protobuf-compiler
# Build application
COPY ./backend .
COPY ./schema /schema
RUN cargo +nightly build --release --bin backend

# We do not need the Rust toolchain to run the binary!
FROM debian:bookworm-slim AS runtime
RUN apt-get update && apt install -y openssl ca-certificates
WORKDIR /app
COPY --from=builder /app/target/release/backend /usr/local/bin
ENTRYPOINT ["/usr/local/bin/backend"]
