CREATE TABLE IF NOT EXISTS "market_visible_to" (
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "account_id" INTEGER NOT NULL REFERENCES "account",
  PRIMARY KEY ("market_id", "account_id")
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS "idx_market_visible_to_account_id" ON "market_visible_to" ("account_id");