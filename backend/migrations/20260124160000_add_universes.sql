-- Create universe table
CREATE TABLE IF NOT EXISTS "universe" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "owner_id" INTEGER REFERENCES "account",
  "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert default universe (id=0, no owner)
INSERT INTO "universe" ("id", "name", "description", "owner_id")
VALUES (0, 'Main', 'The main trading universe', NULL);

-- Add universe_id to account table (without REFERENCES since SQLite doesn't support it with default on existing table)
ALTER TABLE "account" ADD COLUMN "universe_id" INTEGER NOT NULL DEFAULT 0;

-- Add universe_id to market table (without REFERENCES since SQLite doesn't support it with default on existing table)
ALTER TABLE "market" ADD COLUMN "universe_id" INTEGER NOT NULL DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_account_universe_id" ON "account" ("universe_id");
CREATE INDEX IF NOT EXISTS "idx_market_universe_id" ON "market" ("universe_id");
