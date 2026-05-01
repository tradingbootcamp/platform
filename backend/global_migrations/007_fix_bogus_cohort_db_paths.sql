-- Repair cohort rows created with the legacy buggy db_path resolver.
--
-- Before COHORT_DATABASE_DIR was wired up, a `DATABASE_URL` like
-- `sqlite://db.sqlite` (no parent directory) caused new cohort `db_path`
-- values to be written as `/<cohort_name>.sqlite` (filesystem root). Rewrite
-- those entries to the cohort name only; on the next startup the runtime
-- resolves them under the configured `COHORT_DATABASE_DIR`. Any DB file
-- actually placed at root must be moved by the operator — only the stored
-- path is fixed here.
UPDATE "cohort"
SET "db_path" = "name" || '.sqlite'
WHERE "db_path" = '/' || "name" || '.sqlite';
