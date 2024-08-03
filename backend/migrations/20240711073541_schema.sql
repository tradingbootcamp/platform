CREATE TABLE IF NOT EXISTS "transaction" (
  "id" INTEGER PRIMARY KEY,
  "timestamp" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS "user" (
  "id" text NOT NULL PRIMARY KEY,
  "balance" text NOT NULL,
  "name" text NOT NULL
) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS "market" (
  "id" INTEGER PRIMARY KEY,
  "name" text NOT NULL UNIQUE,
  "description" text NOT NULL,
  "owner_id" text NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "min_settlement" text NOT NULL,
  "max_settlement" text NOT NULL,
  "settled_price" text
);
CREATE INDEX "idx_market_owner_id" ON "market" ("owner_id");
CREATE TABLE IF NOT EXISTS "order" (
  "id" INTEGER PRIMARY KEY,
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "owner_id" text NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "price" text NOT NULL,
  "size" text NOT NULL,
  "side" text NOT NULL
);
CREATE INDEX "idx_order_market_id" ON "order" ("market_id");
CREATE INDEX "idx_order_owner_id" ON "order" ("owner_id");
CREATE INDEX "idx_order_transaction_id" ON "order" ("transaction_id");
CREATE INDEX "idx_order_market_id_side_price" ON "order" ("market_id", "side", CAST("price" AS REAL))
WHERE CAST("size" AS REAL) > 0;
CREATE TABLE IF NOT EXISTS "order_size" (
  "order_id" INTEGER NOT NULL REFERENCES "order",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "size" text NOT NULL,
  PRIMARY KEY ("order_id", "transaction_id")
) WITHOUT ROWID;
CREATE INDEX "idx_order_size_transaction_id" ON "order_size" ("transaction_id");
CREATE TABLE IF NOT EXISTS "trade" (
  "id" INTEGER PRIMARY KEY,
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "buyer_id" text NOT NULL REFERENCES "user",
  "seller_id" text NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "price" text NOT NULL,
  "size" text NOT NULL
);
CREATE INDEX "idx_trade_market_id" ON "trade" ("market_id");
CREATE INDEX "idx_trade_buyer_id" ON "trade" ("buyer_id");
CREATE INDEX "idx_trade_seller_id" ON "trade" ("seller_id");
CREATE INDEX "idx_trade_transaction_id" ON "trade" ("transaction_id");
CREATE TABLE IF NOT EXISTS "exposure_cache" (
  "user_id" text NOT NULL REFERENCES "user",
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "position" text NOT NULL,
  "total_bid_size" text NOT NULL,
  "total_offer_size" text NOT NULL,
  "total_bid_value" text NOT NULL,
  "total_offer_value" text NOT NULL,
  PRIMARY KEY ("user_id", "market_id")
) WITHOUT ROWID;
CREATE INDEX "idx_exposure_cache_market_id" ON "exposure_cache" ("market_id");
CREATE TABLE IF NOT EXISTS "payment" (
  "id" INTEGER PRIMARY KEY,
  "payer_id" text NOT NULL REFERENCES "user",
  "recipient_id" text NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "amount" text NOT NULL,
  "note" text NOT NULL
);
CREATE INDEX "idx_payment_payer_id" ON "payment" ("payer_id");
CREATE INDEX "idx_payment_recipient_id" ON "payment" ("recipient_id");