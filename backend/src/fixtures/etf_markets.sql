INSERT INTO "transaction" (id)
VALUES (0),
  (1),
  (2);
INSERT INTO market (
    id,
    name,
    description,
    owner_id,
    transaction_id,
    min_settlement,
    max_settlement
  )
VALUES (1, 'etf', 'etf market', 1, 0, '0.0', '20.0'),
  (2, 'stock_a', 'stock a', 1, 1, '0.0', '10.0'),
  (3, 'stock_b', 'stock b', 1, 2, '0.0', '10.0');
INSERT INTO redeemable (
  fund_id,
  constituent_id
)
VALUES (1, 2),
  (1, 3);