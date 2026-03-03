CREATE TABLE IF NOT EXISTS "global_user" (
    "id" INTEGER PRIMARY KEY,
    "kinde_id" TEXT UNIQUE NOT NULL,
    "display_name" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "cohort" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "display_name" TEXT NOT NULL,
    "db_path" TEXT NOT NULL UNIQUE,
    "is_read_only" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "cohort_member" (
    "id" INTEGER PRIMARY KEY,
    "cohort_id" INTEGER NOT NULL REFERENCES "cohort",
    "global_user_id" INTEGER REFERENCES "global_user",
    "email" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("cohort_id", "global_user_id"),
    UNIQUE("cohort_id", "email")
);

CREATE TABLE IF NOT EXISTS "global_config" (
    "key" TEXT PRIMARY KEY,
    "value" TEXT NOT NULL
);
