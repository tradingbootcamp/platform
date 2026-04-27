CREATE TABLE "redeem_code" (
    "id" INTEGER PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "amount" TEXT NOT NULL,
    "created_by" INTEGER NOT NULL REFERENCES "account",
    "created_at" datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expires_at" datetime,
    "redeemed_by" INTEGER REFERENCES "account",
    "redeemed_at" datetime,
    "redeem_transfer_id" INTEGER REFERENCES "transfer"
);

CREATE INDEX "idx_redeem_code_created_by" ON "redeem_code" ("created_by");
CREATE INDEX "idx_redeem_code_redeemed_by" ON "redeem_code" ("redeemed_by");
