ALTER TABLE "account_owner" DROP COLUMN "credit";
ALTER TABLE "account_owner" ADD COLUMN "credit" TEXT NOT NULL DEFAULT '0';
