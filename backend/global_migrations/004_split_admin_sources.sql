-- Split `global_user.is_admin` into two source columns so we can distinguish
-- admin status granted via the Kinde JWT role from admin status granted via
-- the Admin page. The effective `is_admin` becomes a generated column that is
-- the union of the two sources, so existing read sites don't need to change.
--
-- Migration strategy for existing rows: treat the current `is_admin` as an
-- Admin-page grant. On the next authentication, `is_kinde_admin` will be
-- re-synced from the user's JWT, so Kinde admins will also have the Kinde
-- source flag set. This is slightly over-granting on the grant column for
-- existing Kinde admins until they re-auth once, but effective `is_admin`
-- stays true throughout, so nobody silently loses access.

ALTER TABLE "global_user" ADD COLUMN "admin_grant" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "global_user" ADD COLUMN "is_kinde_admin" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE "global_user" SET "admin_grant" = "is_admin";

ALTER TABLE "global_user" DROP COLUMN "is_admin";
ALTER TABLE "global_user"
    ADD COLUMN "is_admin" BOOLEAN
    GENERATED ALWAYS AS ("is_kinde_admin" OR "admin_grant") VIRTUAL;
