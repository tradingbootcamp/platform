INSERT INTO account ("id", "kinde_id", "name", "balance")
VALUES (1, 'a', 'a', '100.0'),
  (2, 'b', 'b', '100.0'),
  (3, 'c', 'c', '100.0'),
  (4, NULL, 'ab-child', '100.0'),
  (5, NULL, 'ab-child-child', '100.0');

INSERT INTO account_owner (owner_id, account_id)
VALUES (1, 4),
  (2, 4),
  (4, 5);
