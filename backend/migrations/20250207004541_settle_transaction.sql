ALTER TABLE market ADD COLUMN settled_transaction_id INTEGER REFERENCES "transaction" DEFAULT NULL;
