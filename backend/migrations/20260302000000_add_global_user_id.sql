-- Add global_user_id column to account table for multi-cohort support
ALTER TABLE "account" ADD COLUMN "global_user_id" INTEGER DEFAULT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_account_global_user_id"
    ON "account" ("global_user_id") WHERE "global_user_id" IS NOT NULL;
