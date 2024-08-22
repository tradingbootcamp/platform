CREATE TABLE IF NOT EXISTS "redeemable" (
  "fund_id" INTEGER NOT NULL REFERENCES "market",
  "constituent_id" INTEGER NOT NULL REFERENCES "market",
  PRIMARY KEY ("fund_id", "constituent_id")
) WITHOUT ROWID;
CREATE TABLE IF NOT EXISTS "redemption" (
  "id" INTEGER PRIMARY KEY,
  "redeemer_id" TEXT NOT NULL REFERENCES "user",
  "fund_id" INTEGER REFERENCES "market",
  "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
  "amount" TEXT NOT NULL
);