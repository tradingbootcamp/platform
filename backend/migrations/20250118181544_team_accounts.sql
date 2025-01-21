-- kinde_id can distinguish users.
ALTER TABLE "user" RENAME TO "account";
ALTER TABLE "account" DROP COLUMN "is_bot";

ALTER TABLE "exposure_cache" RENAME COLUMN "user_id" TO "account_id";

ALTER TABLE "bot_owner" RENAME TO "account_owner";
ALTER TABLE "account_owner" RENAME COLUMN "bot_id" TO "account_id";
ALTER TABLE "account_owner" ADD COLUMN "credit" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "transfer" (
    "id" INTEGER PRIMARY KEY,
    "initiator_id" INTEGER NOT NULL REFERENCES "account",
    "from_account_id" INTEGER NOT NULL REFERENCES "account",
    "to_account_id" INTEGER NOT NULL REFERENCES "account",
    "transaction_id" INTEGER NOT NULL REFERENCES "transaction",
    "amount" TEXT NOT NULL,
    "note" TEXT NOT NULL
);
INSERT INTO "transfer" ("id", "initiator_id", "from_account_id", "to_account_id", "transaction_id", "amount", "note")
SELECT "id", "payer_id" "initiator_id", "payer_id" "from_account_id", "recipient_id" "to_account_id", "transaction_id", "amount", "note" FROM "payment";
DROP TABLE "payment";
