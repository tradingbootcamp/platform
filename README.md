# Trading Bootcamp Platform!

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/tradingbootcamp/platform?quickstart=1)

[Quantitative Trading Bootcamp](https://www.trading.camp/) teaches the fundamentals of quantitative trading: markets, order books, auctions, risk and sizing, adverse selection, arbitrage, and how quant trading firms make money. Our philosophy is that the best way to learn to trade is by trading. This repository contains the exchange we use to run a simulated economy and allow students to make and trade on markets.

## Working locally

### Requirements

- [Rust](https://rustup.rs/) >= 1.8 for backend
- node 20 and [pnpm](https://pnpm.io/) for frontend
- [uv](https://docs.astral.sh/uv/#highlights) for python client
- [protobuf-compiler](https://grpc.io/docs/protoc-installation/) for schema updates

### Setting up

#### Backend

- Place a .env file in backend/ and populate it. See [backend/example.env](backend/example.env) for which keys are needed.
- Install `sqlx-cli` if you haven't already: `cargo install sqlx-cli`
- Run `cd backend && sqlx db create && sqlx migrate run`

#### Frontend

- Place a .env file in frontend/ and populate it. See [frontend/example.env](frontend/example.env) for which keys are needed.
- From the root directory, run `pnpm i`

#### Python client

- Place a .env file in python-client/ and populate it with the values copied to clipboard on the accounts page.
- Run `cd python-client && uv sync`

### Running

- Run `cd backend && cargo run` to start the backend
- Run `pnpm dev` from the root directory to start the frontend
- Run `cd python-client && uv run min_max_bot.py` to run the example bot
