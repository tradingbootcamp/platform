CREATE TABLE auction_buyer (
    auction_id INTEGER NOT NULL REFERENCES "auction" ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES "account",
    amount TEXT NOT NULL,
    PRIMARY KEY (auction_id, account_id)
);

CREATE INDEX idx_auction_buyer_account ON auction_buyer(account_id);

-- Backfill: existing settled auctions had a single buyer at the full settled price.
INSERT INTO auction_buyer (auction_id, account_id, amount)
SELECT id, buyer_id, settled_price
FROM auction
WHERE settled_price IS NOT NULL AND buyer_id != 0;
