CREATE TABLE option_market (
    market_id INTEGER PRIMARY KEY REFERENCES market(id),
    underlying_market_id INTEGER NOT NULL REFERENCES market(id),
    strike_price TEXT NOT NULL,
    is_call BOOLEAN NOT NULL,
    expiration_date DATETIME
);
CREATE INDEX idx_option_market_underlying ON option_market(underlying_market_id);

CREATE TABLE option_contract (
    id INTEGER PRIMARY KEY,
    option_market_id INTEGER NOT NULL REFERENCES market(id),
    buyer_id INTEGER NOT NULL REFERENCES account(id),
    writer_id INTEGER NOT NULL REFERENCES account(id),
    remaining_amount TEXT NOT NULL,
    trade_id INTEGER NOT NULL REFERENCES trade(id)
);
CREATE INDEX idx_option_contract_market_buyer ON option_contract(option_market_id, buyer_id);
CREATE INDEX idx_option_contract_market_writer ON option_contract(option_market_id, writer_id);

CREATE TABLE option_exercise (
    id INTEGER PRIMARY KEY,
    option_market_id INTEGER NOT NULL REFERENCES market(id),
    contract_id INTEGER NOT NULL REFERENCES option_contract(id),
    exerciser_id INTEGER NOT NULL REFERENCES account(id),
    counterparty_id INTEGER NOT NULL REFERENCES account(id),
    amount TEXT NOT NULL,
    transaction_id INTEGER NOT NULL REFERENCES "transaction"(id),
    is_cash_settled BOOLEAN NOT NULL DEFAULT FALSE
);
