-- Backfill display_name for users whose display_name was set to a placeholder
-- (either their Kinde sub or the literal "Unknown") by older buggy code paths.
-- When an email is available, prefer it over the placeholder.
UPDATE "global_user"
SET "display_name" = "email"
WHERE "email" IS NOT NULL
  AND (
       "display_name" = "kinde_id"
    OR "display_name" = 'Unknown'
  );
