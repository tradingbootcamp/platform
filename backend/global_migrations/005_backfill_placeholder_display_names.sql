-- Backfill display_name for users whose display_name was set to something we now consider
-- sensitive or ugly to show in the UI (the Kinde sub, their email, or the literal "Unknown"
-- fallback from older code paths). Replace each such row with a fresh "Unnamed-XXXX"
-- placeholder, where XXXX is 4 hex characters pulled from SQLite's per-row random blob so
-- two simultaneously-backfilled users remain distinguishable in account lists.
--
-- `randomblob()` is a volatile function in SQLite and is re-evaluated once per updated row,
-- so each row gets its own suffix.
UPDATE "global_user"
SET "display_name" = 'Unnamed-' || substr(hex(randomblob(2)), 1, 4)
WHERE "display_name" = "kinde_id"
   OR "display_name" = "email"
   OR "display_name" = 'Unknown';
