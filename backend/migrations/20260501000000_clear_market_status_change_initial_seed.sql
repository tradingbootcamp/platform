-- The 20260429 migration that introduced market_status_change seeded one row
-- per existing market using each market's *current* status, anchored at the
-- market's creation transaction. For markets paused at the time the migration
-- ran, this looked like "paused since creation" to consumers — a fake interval
-- spanning the market's entire history. Since no real status_change rows were
-- ever recorded after that migration deployed (no markets paused/unpaused or
-- newly created in that window), the table holds nothing worth keeping. Wipe
-- it and let real activity from this point on populate it correctly.
DELETE FROM market_status_change;
