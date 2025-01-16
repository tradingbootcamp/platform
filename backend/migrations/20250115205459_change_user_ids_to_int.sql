-- General plan:
-- 1) Rename the old "user" table.
-- 2) Create a new "user" table with an INTEGER primary key and a new text column "kinde_id."
-- 3) Migrate data from the old table into the new one.
-- 4) For each table referencing "user", rename it, recreate it with the new foreign key type (INTEGER),
--    and then insert rows mapping the old text IDs to new integer IDs from the new "user" table.
-- 5) Drop the old tables.

PRAGMA foreign_keys=OFF;

ALTER TABLE "user" RENAME TO "user_old";

CREATE TABLE "user" (
    "id" INTEGER PRIMARY KEY,
    "kinde_id" TEXT UNIQUE DEFAULT NULL,
    "balance" TEXT NOT NULL,
    "name" TEXT NOT NULL UNIQUE,
    "is_bot" BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO "user" ("id", "kinde_id", "balance", "name", "is_bot")
VALUES (0, NULL, '0', 'Hidden', FALSE);

INSERT INTO "user" ("kinde_id", "balance", "name", "is_bot")
SELECT
    "id",            -- old text ID goes to "kinde_id"
    "balance",
    "name",
    "is_bot"
FROM "user_old";

ALTER TABLE "market" RENAME TO "market_old";

CREATE TABLE "market" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "owner_id" INTEGER NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "min_settlement" TEXT NOT NULL,
  "max_settlement" TEXT NOT NULL,
  "settled_price" TEXT
);

INSERT INTO "market"
  ("id", "name", "description", "owner_id", "transaction_id", "min_settlement", "max_settlement", "settled_price")
SELECT
  m."id",
  m."name",
  m."description",
  u."id",  -- map old text to new integer
  m."transaction_id",
  m."min_settlement",
  m."max_settlement",
  m."settled_price"
FROM "market_old" m
JOIN "user" u ON u."kinde_id" = m."owner_id";

CREATE INDEX IF NOT EXISTS "idx_market_owner_id" ON "market" ("owner_id");

ALTER TABLE "order" RENAME TO "order_old";

CREATE TABLE "order" (
  "id" INTEGER PRIMARY KEY,
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "owner_id" INTEGER NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "price" TEXT NOT NULL,
  "size" TEXT NOT NULL,
  "side" TEXT NOT NULL
);

INSERT INTO "order"
  ("id", "market_id", "owner_id", "transaction_id", "price", "size", "side")
SELECT
  o."id",
  o."market_id",
  u."id",  -- map old text to new integer
  o."transaction_id",
  o."price",
  o."size",
  o."side"
FROM "order_old" o
JOIN "user" u ON u."kinde_id" = o."owner_id";

CREATE INDEX IF NOT EXISTS "idx_order_market_id" ON "order" ("market_id");
CREATE INDEX IF NOT EXISTS "idx_order_owner_id" ON "order" ("owner_id");
CREATE INDEX IF NOT EXISTS "idx_order_transaction_id" ON "order" ("transaction_id");
CREATE INDEX IF NOT EXISTS "idx_order_market_id_side_price"
  ON "order" ("market_id", "side", CAST("price" AS REAL))
  WHERE CAST("size" AS REAL) > 0;

ALTER TABLE "trade" RENAME TO "trade_old";

CREATE TABLE "trade" (
  "id" INTEGER PRIMARY KEY,
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "buyer_id" INTEGER NOT NULL REFERENCES "user",
  "seller_id" INTEGER NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "price" TEXT NOT NULL,
  "size" TEXT NOT NULL
);

INSERT INTO "trade"
  ("id", "market_id", "buyer_id", "seller_id", "transaction_id", "price", "size")
SELECT
  t."id",
  t."market_id",
  bu."id",  -- map old text to new integer
  su."id",  -- map old text to new integer
  t."transaction_id",
  t."price",
  t."size"
FROM "trade_old" t
JOIN "user" bu ON bu."kinde_id" = t."buyer_id"
JOIN "user" su ON su."kinde_id" = t."seller_id";

CREATE INDEX IF NOT EXISTS "idx_trade_market_id" ON "trade" ("market_id");
CREATE INDEX IF NOT EXISTS "idx_trade_buyer_id" ON "trade" ("buyer_id");
CREATE INDEX IF NOT EXISTS "idx_trade_seller_id" ON "trade" ("seller_id");
CREATE INDEX IF NOT EXISTS "idx_trade_transaction_id" ON "trade" ("transaction_id");

ALTER TABLE "exposure_cache" RENAME TO "exposure_cache_old";

CREATE TABLE "exposure_cache" (
  "user_id" INTEGER NOT NULL REFERENCES "user",
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "position" TEXT NOT NULL,
  "total_bid_size" TEXT NOT NULL,
  "total_offer_size" TEXT NOT NULL,
  "total_bid_value" TEXT NOT NULL,
  "total_offer_value" TEXT NOT NULL,
  PRIMARY KEY ("user_id", "market_id")
) WITHOUT ROWID;

INSERT INTO "exposure_cache"
  ("user_id", "market_id", "position", "total_bid_size", "total_offer_size", "total_bid_value", "total_offer_value")
SELECT
  u."id",
  ec."market_id",
  ec."position",
  ec."total_bid_size",
  ec."total_offer_size",
  ec."total_bid_value",
  ec."total_offer_value"
FROM "exposure_cache_old" ec
JOIN "user" u ON u."kinde_id" = ec."user_id";

CREATE INDEX IF NOT EXISTS "idx_exposure_cache_market_id" ON "exposure_cache" ("market_id");

ALTER TABLE "payment" RENAME TO "payment_old";

CREATE TABLE "payment" (
  "id" INTEGER PRIMARY KEY,
  "payer_id" INTEGER NOT NULL REFERENCES "user",
  "recipient_id" INTEGER NOT NULL REFERENCES "user",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "amount" TEXT NOT NULL,
  "note" TEXT NOT NULL
);

INSERT INTO "payment"
  ("id", "payer_id", "recipient_id", "transaction_id", "amount", "note")
SELECT
  p."id",
  pu."id",  -- map old text to new integer
  ru."id",  -- map old text to new integer
  p."transaction_id",
  p."amount",
  p."note"
FROM "payment_old" p
JOIN "user" pu ON pu."kinde_id" = p."payer_id"
JOIN "user" ru ON ru."kinde_id" = p."recipient_id";

CREATE INDEX IF NOT EXISTS "idx_payment_payer_id" ON "payment" ("payer_id");
CREATE INDEX IF NOT EXISTS "idx_payment_recipient_id" ON "payment" ("recipient_id");

ALTER TABLE "bot_owner" RENAME TO "bot_owner_old";

CREATE TABLE "bot_owner" (
  "bot_id" INTEGER NOT NULL REFERENCES "user",
  "owner_id" INTEGER NOT NULL REFERENCES "user",
  PRIMARY KEY ("bot_id", "owner_id")
) WITHOUT ROWID;

INSERT INTO "bot_owner" ("bot_id", "owner_id")
SELECT
  bu."id",
  ou."id"
FROM "bot_owner_old" bo
JOIN "user" bu ON bu."kinde_id" = bo."bot_id"
JOIN "user" ou ON ou."kinde_id" = bo."owner_id";

CREATE INDEX IF NOT EXISTS "idx_bot_owner_owner_id" ON "bot_owner" ("owner_id");

ALTER TABLE "redeemable" RENAME TO "redeemable_old";

CREATE TABLE "redeemable" (
  "fund_id" INTEGER NOT NULL REFERENCES "market",
  "constituent_id" INTEGER NOT NULL REFERENCES "market",
  PRIMARY KEY ("fund_id", "constituent_id")
) WITHOUT ROWID;

INSERT INTO "redeemable" ("fund_id", "constituent_id")
SELECT
  r."fund_id",
  r."constituent_id"
FROM "redeemable_old" r;

ALTER TABLE "redemption" RENAME TO "redemption_old";

CREATE TABLE "redemption" (
  "id" INTEGER PRIMARY KEY,
  "redeemer_id" INTEGER NOT NULL REFERENCES "user",
  "fund_id" INTEGER REFERENCES "market",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "amount" TEXT NOT NULL
);

INSERT INTO "redemption"
  ("id", "redeemer_id", "fund_id", "transaction_id", "amount")
SELECT
  r."id",
  u."id",  -- map old text to new integer
  r."fund_id",
  r."transaction_id",
  r."amount"
FROM "redemption_old" r
JOIN "user" u ON u."kinde_id" = r."redeemer_id";

ALTER TABLE "order_size" RENAME TO "order_size_old";

CREATE TABLE "order_size" (
  "order_id" INTEGER NOT NULL REFERENCES "order",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "size" TEXT NOT NULL,
  PRIMARY KEY ("order_id", "transaction_id")
) WITHOUT ROWID;

INSERT INTO "order_size"
  ("order_id", "transaction_id", "size")
SELECT
  "order_id",
  "transaction_id",
  "size"
FROM "order_size_old";

CREATE INDEX IF NOT EXISTS "idx_order_size_transaction_id" ON "order_size" ("transaction_id");

UPDATE "user" SET "kinde_id" = NULL WHERE "is_bot" = TRUE;

DROP TABLE "redemption_old";
DROP TABLE "redeemable_old";
DROP TABLE "bot_owner_old";
DROP TABLE "payment_old";
DROP TABLE "exposure_cache_old";
DROP TABLE "order_size_old";
DROP TABLE "trade_old";
DROP TABLE "order_old";
DROP TABLE "market_old";
DROP TABLE "user_old";

PRAGMA foreign_keys=ON;
