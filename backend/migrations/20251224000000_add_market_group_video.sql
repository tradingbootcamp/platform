-- Add video and synchronization columns to market_group
ALTER TABLE "market_group" ADD COLUMN "video_url" TEXT DEFAULT NULL;
ALTER TABLE "market_group" ADD COLUMN "status" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "market_group" ADD COLUMN "video_timestamp_ms" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "market_group" ADD COLUMN "paused_at" TEXT DEFAULT NULL;
