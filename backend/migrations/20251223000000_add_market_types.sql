-- Create market_type table
CREATE TABLE IF NOT EXISTS "market_type" (
  "id" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL DEFAULT '',
  "public" BOOLEAN NOT NULL DEFAULT FALSE
);

-- Insert default types
INSERT INTO "market_type" ("name", "description", "public") VALUES
  ('Fun', 'General fun prediction markets', TRUE),
  ('Class Scenarios', 'Markets for class scenarios and exercises', FALSE);

-- Add type_id column to market table
ALTER TABLE "market" ADD COLUMN "type_id" INTEGER REFERENCES "market_type" DEFAULT NULL;

CREATE INDEX IF NOT EXISTS "idx_market_type_id" ON "market" ("type_id");
