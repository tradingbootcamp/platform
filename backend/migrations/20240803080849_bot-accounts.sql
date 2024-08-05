ALTER TABLE "user"
ADD COLUMN "is_bot" BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS "bot_owner" (
  "bot_id" text NOT NULL REFERENCES "user",
  "owner_id" text NOT NULL REFERENCES "user",
  PRIMARY KEY ("bot_id", "owner_id")
) WITHOUT ROWID;
CREATE INDEX "idx_bot_owner_owner_id" ON "bot_owner" ("owner_id");