-- Written by Claude 3.5 Sonnet

-- See this issue https://github.com/launchbadge/sqlx/issues/2085
PRAGMA defer_foreign_keys = ON;

-- Ensure no NULL values in the name column
UPDATE "user" SET "name" = 'User_' || "id" WHERE "name" IS NULL;

-- Step 1: Add a temporary column for the unique name
ALTER TABLE "user" ADD COLUMN "unique_name" TEXT;

-- Step 2: Update the temporary column with unique names
UPDATE "user"
SET "unique_name" = 
    CASE 
        WHEN "name" IN (
            SELECT "name"
            FROM "user"
            GROUP BY "name"
            HAVING COUNT(*) > 1
        )
        THEN "name" || '_' || "id"
        ELSE "name"
    END;

-- Step 3: Create a new table with the desired structure
CREATE TABLE "new_user" (
    "id" text NOT NULL PRIMARY KEY,
    "balance" text NOT NULL,
    "name" text NOT NULL UNIQUE,
    "is_bot" BOOLEAN NOT NULL DEFAULT FALSE
) WITHOUT ROWID;

-- Step 4: Copy data from the old table to the new table
INSERT INTO "new_user" ("id", "balance", "name", "is_bot")
SELECT "id", "balance", "unique_name", "is_bot" FROM "user";

-- Step 5: Drop the old table
DROP TABLE "user";

-- Step 6: Rename the new table to the original name
ALTER TABLE "new_user" RENAME TO "user";

PRAGMA defer_foreign_keys = OFF;