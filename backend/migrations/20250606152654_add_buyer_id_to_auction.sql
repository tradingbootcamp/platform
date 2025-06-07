-- Add buyer_id column to auction table
ALTER TABLE "auction" ADD COLUMN "buyer_id" INTEGER NOT NULL REFERENCES "account" DEFAULT 0;
