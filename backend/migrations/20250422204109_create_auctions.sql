CREATE TABLE auction (
    id INTEGER PRIMARY KEY,
    "name" text NOT NULL UNIQUE,
    "description" text NOT NULL,
    "owner_id" INTEGER NOT NULL REFERENCES "account",
	"transaction_id" INTEGER NOT NULL REFERENCES "transaction",
    "settled_price" text
);
