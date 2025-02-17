DROP INDEX "idx_order_market_id_side_price";
CREATE INDEX "idx_order_market_id_bid_price" ON "order" ("market_id", CAST("price" AS REAL), "transaction_id") WHERE CAST("size" AS REAL) > 0 AND "side" = 'bid';
CREATE INDEX "idx_order_market_id_offer_price" ON "order" ("market_id", CAST("price" AS REAL), "transaction_id") WHERE CAST("size" AS REAL) > 0 AND "side" = 'offer';

CREATE INDEX "idx_order_market_id_owner_id_active" ON "order" ("market_id", "owner_id") WHERE CAST("size" AS REAL) > 0;
