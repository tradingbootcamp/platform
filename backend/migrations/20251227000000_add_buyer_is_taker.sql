-- Add buyer_is_taker column to track which side was the taker
ALTER TABLE trade ADD COLUMN buyer_is_taker INTEGER NOT NULL DEFAULT 1;
