-- Per-cohort auctions toggle. When false (the default), auction data is not
-- sent to clients connecting to that cohort, the /auction route renders as
-- unavailable, the sidebar link is hidden, and auction-mutating requests are
-- rejected. Replaces the previous global public_auction_enabled +
-- active_auction_cohort_id config with a per-cohort flag.
ALTER TABLE "cohort" ADD COLUMN "auctions_enabled" BOOLEAN NOT NULL DEFAULT FALSE;
