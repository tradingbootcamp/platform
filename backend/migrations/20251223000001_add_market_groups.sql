-- Create market_group table
CREATE TABLE IF NOT EXISTS "market_group" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "type_id" INTEGER NOT NULL REFERENCES "market_type"
);

-- Add group_id column to market table
ALTER TABLE "market" ADD COLUMN "group_id" INTEGER REFERENCES "market_group" DEFAULT NULL;

CREATE INDEX IF NOT EXISTS "idx_market_group_id" ON "market" ("group_id");
CREATE INDEX IF NOT EXISTS "idx_market_group_type_id" ON "market_group" ("type_id");
