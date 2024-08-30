-- Written by Claude 3.5 Sonnet

PRAGMA defer_foreign_keys = ON;

CREATE TABLE "old_user" (
    "id" text NOT NULL PRIMARY KEY,
    "balance" text NOT NULL,
    "name" text NOT NULL,
    "is_bot" BOOLEAN NOT NULL DEFAULT FALSE
) WITHOUT ROWID;

INSERT INTO "old_user" SELECT * FROM "user";
DROP TABLE "user";
ALTER TABLE "old_user" RENAME TO "user";

PRAGMA defer_foreign_keys = OFF;
