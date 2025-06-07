-- Add buyer_id column to auction table
ALTER TABLE "auction" ADD COLUMN "buyer_id" INTEGER DEFAULT 0 NOT NULL;
