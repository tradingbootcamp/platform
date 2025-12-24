# Home metrics and table calculations

- **Reference price**: mid price computed from the live order book. If both best bid and best offer exist, use their average. If only one side exists, use that side’s price. If neither exists, treat as missing (`---` in the UI and value omitted from calculations that need it).
- **Mark to Market**: `available_balance + Σ(capital_used_by_position) + Σ(capital_locked_by_bids) + Σ(capital_locked_by_offers)`.
- **Capital used by position**:  
  - Long (position ≥ 0): `position * reference_price`.  
  - Short (position < 0): `position * (reference_price - max_settlement)` (still non-negative because position is negative).
- **Capital locked by bids**: sum over the acting account’s live bid orders of `size * (price - min_settlement)` (floored at 0 for each order).
- **Capital locked by offers**: sum over the acting account’s live offer orders of `size * (max_settlement - price)` (floored at 0 for each order).
- **Capital locked by current open orders**: `capital_locked_by_bids + capital_locked_by_offers`.
- **Open bids / offers (contracts)**: per-market `total_bid_size` / `total_offer_size` from the portfolio exposure cache (acting account only).
- **Your best bid / Your best offer**: best-priced live orders owned by the acting account (per side), to 1 decimal; shown as `---` if none.
- **Mid / Last / Min / Max settlement**: displayed to 1 decimal. Mid uses the reference price; Last uses the most recent trade price when present (highest transaction id / timestamp, falling back to the tail).
- **Rounding for display**: capital and position figures are rounded to the nearest integer; top-line balances are rounded to two decimals.
