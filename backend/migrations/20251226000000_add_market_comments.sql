-- Create market_comment table for storing comments on markets
CREATE TABLE IF NOT EXISTS "market_comment" (
  "id" INTEGER PRIMARY KEY,
  "market_id" INTEGER NOT NULL REFERENCES "market",
  "account_id" INTEGER NOT NULL REFERENCES "account",
  "content" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for efficient querying by market
CREATE INDEX IF NOT EXISTS "idx_market_comment_market_id" ON "market_comment" ("market_id");
