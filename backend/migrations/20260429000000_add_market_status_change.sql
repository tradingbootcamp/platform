CREATE TABLE market_status_change (
  id INTEGER PRIMARY KEY,
  market_id INTEGER NOT NULL REFERENCES market,
  status INTEGER NOT NULL,
  transaction_id INTEGER NOT NULL REFERENCES "transaction"
);

CREATE INDEX idx_market_status_change_market_id
  ON market_status_change (market_id, transaction_id);

INSERT INTO market_status_change (market_id, status, transaction_id)
SELECT id, status, transaction_id
FROM market;
