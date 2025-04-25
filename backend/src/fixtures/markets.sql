INSERT INTO "transaction" (id)
VALUES (0),
  (1);
INSERT INTO market (
    id,
    name,
    description,
    owner_id,
    transaction_id,
    min_settlement,
    max_settlement,
    is_shop
  )
VALUES (1, 'm1', 'first market', 1, 0, '10.0', '20.0', FALSE),
  (2, 'm2', 'second market', 1, 1, '0.0', '10.0', FALSE);
