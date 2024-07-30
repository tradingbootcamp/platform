# Trading Bootcamp Platform!

TODO: add stuff about the actual bootcamp, maybe some design details, etc.

## Requirements

* Rust >= 1.8 nightly
* node 20
* pnpm
* protobuf-compiler

## Setting up

* Place one .env file in backend/ and another in frontend/ and populate them. See [backend/example.env](backend/example.env) and [frontend/example.env](frontend/example.env) for which keys are needed.
* Install `sqlx-cli` if you haven't already: `cargo install sqlx-cli`
* Run `cd backend && sqlx db create && sqlx migrate run`
* From the root directory, run `pnpm i`
* Optional - install recommended vscode extensions

## Running

* Run `cd backend && cargo run` to start the backend
* Run `pnpm dev` from the root directory to start the frontend
