# Trading Bootcamp Platform!

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/tradingbootcamp/platform?quickstart=1)

[Quantitative Trading Bootcamp](https://www.trading.camp/) teaches the fundamentals of quantitative trading: markets, order books, auctions, risk and sizing, adverse selection, arbitrage, and how quant trading firms make money. Our philosophy is that the best way to learn to trade is by trading. This repository contains the exchange we use to run a simulated economy and allow students to make and trade on markets.

## Prerequisites

- **pnpm**: Node package manager (`npm install -g pnpm`)
- **Rust**: Install via [rustup](https://rustup.rs/) (for backend development)
- **protoc**: Protocol buffer compiler (for backend development)
  - Debian/Ubuntu: `apt-get install protobuf-compiler`
  - macOS: `brew install protobuf`

## Making Frontend changes

You need to have pnpm installed.

To run the frontend:
```
pnpm i
```

Then run:
```
pnpm dev
```
This will start the frontend on `localhost:5173`.

Since this will run against the production backend, you should probably create a test account in Accounts.

Copy the appropriate environment template to `frontend/.env` for your use case:

For frontend development against production backend:
```
cp frontend/remote.env frontend/.env
```

For local backend testing:
```
cp frontend/local.env frontend/.env
```

## Making Backend Changes

First, set up the database:
```
cd backend
sqlx db create
sqlx migrate run
```

Then run the exchange server:
```
cargo run
```

Run tests and linter before submitting changes:
```
cargo test-all
cargo clippy
```
