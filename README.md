# Trading Bootcamp Platform!

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/tradingbootcamp/platform?quickstart=1)

[Quantitative Trading Bootcamp](https://www.trading.camp/) teaches the fundamentals of quantitative trading: markets, order books, auctions, risk and sizing, adverse selection, arbitrage, and how quant trading firms make money. Our philosophy is that the best way to learn to trade is by trading. This repository contains the exchange we use to run a simulated economy and allow students to make and trade on markets.

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
