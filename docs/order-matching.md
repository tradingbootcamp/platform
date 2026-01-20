# Order Matching Engine

This document explains how the order book and matching engine work.

## Overview

The platform implements a **price-time priority** matching engine:
1. Orders match at the best available price first
2. At the same price, earlier orders (by transaction ID) match first

Only **limit orders** are supported. To achieve market order behavior, set the limit price to the market's max settlement (for buys) or min settlement (for sells)—this ensures you match with any available counterparty.

## Order Structure

```
order
├── id (auto-increment)
├── market_id
├── owner_id (account placing the order)
├── transaction_id (for time priority)
├── price (TEXT, stored as Decimal)
├── size (TEXT, stored as Decimal)
└── side (bid/offer)
```

### Order Size History

The `order_size` table tracks size changes over time:

```
order_size
├── order_id
├── transaction_id
└── size
```

This enables historical replay of the order book at any point.

## Matching Algorithm

### When a New Order Arrives

```
1. Validate order (price/size precision, market open, etc.)
2. Search for matching counterparty orders
3. Execute fills against matches
4. Post remaining size as resting order (if any)
5. Update balances and exposures
6. Broadcast updates
```

### Matching Search

**For incoming BID:**
```sql
SELECT * FROM order
WHERE market_id = ?
  AND side = 'offer'
  AND CAST(price AS REAL) <= bid_price + 0.000001  -- Small tolerance
  AND CAST(size AS REAL) > 0
ORDER BY CAST(price AS REAL) ASC, transaction_id ASC
```
Matches cheapest offers first, then FIFO at each price.

**For incoming OFFER:**
```sql
SELECT * FROM order
WHERE market_id = ?
  AND side = 'bid'
  AND CAST(price AS REAL) >= offer_price - 0.000001
  AND CAST(size AS REAL) > 0
ORDER BY CAST(price AS REAL) DESC, transaction_id ASC
```
Matches highest bids first, then FIFO at each price.

### Fill Execution

```rust
for each matching_order in matches {
    // Calculate fill size
    fill_size = min(remaining_size, matching_order.size);

    // Create fill record
    fills.push(OrderFill {
        id: matching_order.id,
        owner_id: matching_order.owner_id,
        size_filled: fill_size,
        size_remaining: matching_order.size - fill_size,
        price: matching_order.price,
        side: matching_order.side,
    });

    // Update remaining
    remaining_size -= fill_size;

    if remaining_size == 0 {
        break;  // Fully filled
    }
}
```

### Partial Fills Example

New BID for 10 units at 50.00:

| Step | Matching Order | Fill | Result |
|------|---------------|------|--------|
| 1 | OFFER 3 @ 48.00 | 3 units | OFFER consumed, 7 remaining |
| 2 | OFFER 5 @ 49.00 | 5 units | OFFER consumed, 2 remaining |
| 3 | OFFER 4 @ 50.00 | 2 units | OFFER partial (2 left), BID filled |

Result: BID fully filled, no resting order created.

## Trade Creation

Each fill creates a trade record:

```
trade
├── id
├── market_id
├── buyer_id
├── seller_id
├── transaction_id
├── price (fill price)
├── size (fill size)
└── buyer_is_taker (bool)
```

### Taker/Maker Designation

- **Taker**: The incoming (aggressive) order that initiates the match
- **Maker**: The resting order on the book

`buyer_is_taker = true` means the buyer placed the incoming order.

## Balance Updates

Balance updates modify [account balances](./accounts.md#portfolios). On each fill:

```rust
// Buyer pays
buyer.balance -= size * price;

// Seller receives
seller.balance += size * price;
```

Both updates happen atomically within the same database transaction.

## Exposure Cache

The `exposure_cache` table tracks per-account-per-market positions (see also [Portfolios](./accounts.md#portfolios)):

```
exposure_cache
├── account_id
├── market_id
├── position (net quantity, + for long, - for short)
├── total_bid_size (sum of open bid sizes)
├── total_offer_size (sum of open offer sizes)
├── total_bid_value (sum of bid_size * bid_price)
└── total_offer_value (sum of offer_size * offer_price)
```

Updated immediately on:
- Order creation
- Order cancellation
- Trade execution

Used for fast portfolio calculations without re-aggregating all trades.

## Order Cancellation

```rust
fn cancel_order(order_id, requesting_account_id) {
    // Validate
    - Order exists and size > 0
    - Requester owns the order
    - Market not paused

    // Cancel
    - Insert order_size record with size = 0
    - Update exposure_cache

    // Return confirmation
}
```

### Bulk Cancellation (Out)

Cancel all orders in a market (see [WebSocket Protocol](./websocket-protocol.md) for message details):

```
Client ──── Out { market_id: 123, side: null } ────▶ Server
```

Options:
- `market_id: null` → Cancel in all markets
- `side: BID/OFFER` → Cancel only bids or offers
- Skips paused markets

## Order Book Display

The frontend sorts orders for display:

```typescript
// Bids: highest price first (best at top)
sortedBids: sort by price DESC

// Offers: lowest price first (best at top)
sortedOffers: sort by price ASC
```

## Price/Size Precision

- Maximum 2 decimal places for both price and size
- Stored as TEXT (Decimal) to avoid floating-point errors
- Matching queries use small tolerance (0.000001) for float comparison

## Validation Checks

Before accepting an order:

| Check | Error |
|-------|-------|
| Price > 0 | InvalidPrice |
| Size > 0 | InvalidSize |
| Price precision ≤ 2 decimals | InvalidPrice |
| Size precision ≤ 2 decimals | InvalidSize |
| Market exists | MarketNotFound |
| Market not settled | MarketSettled |
| Market status = Open | MarketPaused |
| Price ≥ min_settlement | InvalidPrice |
| Price ≤ max_settlement | InvalidPrice |

## Performance Optimizations

### Index for Matching

```sql
CREATE INDEX idx_order_market_id_side_price
  ON "order" ("market_id", "side", CAST("price" AS REAL))
  WHERE CAST("size" AS REAL) > 0;
```

### Exposure Cache

Pre-computed exposures avoid aggregating all orders/trades on every portfolio request.

### Transaction IDs

Monotonically increasing transaction IDs enable:
- Efficient FIFO ordering at price level
- Historical replay without timestamp parsing
- Atomic ordering guarantees

## Historical Replay

The order book state at any transaction can be reconstructed:

```typescript
function ordersAtTransaction(orders, txId) {
    return orders
        .map(order => {
            // Find size at that transaction
            const sizeAtTx = order.sizes
                .filter(s => s.transaction_id <= txId)
                .sort((a, b) => b.transaction_id - a.transaction_id)[0];
            return { ...order, size: sizeAtTx?.size ?? 0 };
        })
        .filter(o => o.size > 0);
}
```

This powers the transaction slider in the UI for replaying market history.

## Related Documentation

- [Architecture Overview](./architecture.md) - System overview
- [WebSocket Protocol](./websocket-protocol.md) - Message formats
