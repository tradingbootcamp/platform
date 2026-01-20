# Auction System

This document explains how the auction system works.

## Overview

The auction system is **separate from the trading markets**. It's used for selling items (physical or virtual) outside the normal order book mechanism.

Key characteristics:
- The exchange doesn't run continuous bidding—bidding happens in the world of atoms (e.g., live in person)
- Admins settle auctions by specifying the winning buyer and final price
- Any user can instantly purchase via buy-it-now (BIN) if the seller set a BIN price
- Balance transfers happen automatically on settlement

## Auction Structure

```protobuf
message Auction {
    int64 id = 1;
    string name = 2;
    string description = 3;
    int64 owner_id = 4;      // Seller
    int64 buyer_id = 5;      // 0 = unsold, >0 = sold to this account
    double settle_price = 6;  // 0 = unsettled, >0 = final price
    double bin_price = 7;     // Buy-it-now price (optional)
    string image_filename = 8;
}
```

## Auction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  1. Create Auction                                           │
│     - Owner sets name, description, optional BIN price       │
│     - buyer_id = 0, settle_price = 0                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Auction Active                                           │
│     - Visible to all users                                   │
│     - Can be edited by owner                                 │
│     - Can be deleted by owner                                │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────────┐     ┌──────────────────────┐
│  3a. Buy-It-Now      │     │  3b. Admin Settle    │
│  (User action)       │     │  (Admin action)      │
│  - Buyer clicks BIN  │     │  - Admin specifies   │
│  - Auto-settles at   │     │    buyer + price     │
│    BIN price         │     │                      │
└──────────────────────┘     └──────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Settled                                                  │
│     - buyer_id = buyer account                               │
│     - settle_price = final price                             │
│     - Balances transferred                                   │
│     - Cannot be edited/deleted                               │
└─────────────────────────────────────────────────────────────┘
```

## Creating an Auction

```protobuf
message CreateAuction {
    string name = 1;
    string description = 2;
    optional double bin_price = 3;  // Optional buy-it-now
    string image_filename = 4;      // Optional image
}
```

Example:
```
CreateAuction {
    name: "Rare Trading Card",
    description: "Mint condition, signed",
    bin_price: 500.00,
    image_filename: "card.jpg"
}
```

**Owner**: The account that creates the auction becomes the seller.

## Buy-It-Now (BIN)

If an auction has a `bin_price` set, users can purchase instantly:

```protobuf
message BuyAuction {
    int64 auction_id = 1;
}
```

### BIN Flow

1. User sends `BuyAuction { auction_id: 123 }`
2. Server validates:
   - Auction exists and not settled
   - Auction has BIN price
   - Buyer has sufficient balance
   - Buyer ≠ Seller
3. Server settles at BIN price
4. Balances transferred
5. Response sent with settlement details

### Implementation Detail

BIN uses `settle_price = -1.0` as a magic value to trigger BIN settlement:

```rust
// In ../backend/src/db.rs
if (settle_price - (-1.0)).abs() < f64::EPSILON {
    // This is a BIN purchase
    actual_price = auction.bin_price;
}
```

## Admin Settlement

Admins (with [sudo](./sudo.md)) can settle auctions at any price:

```protobuf
message SettleAuction {
    int64 auction_id = 1;
    int64 buyer_id = 2;
    double settle_price = 3;
}
```

### Settlement Validation

- Auction must exist and not be settled
- Buyer must exist and have sufficient balance
- Buyer ≠ Seller
- Settle price must be valid (positive, proper precision)

### Balance Transfer

On settlement:

```rust
// Buyer pays
buyer.balance -= settle_price;

// Seller receives
seller.balance += settle_price;

// Create transfer record
transfer {
    from: buyer,
    to: seller,
    amount: settle_price,
    note: "Auction Settlement of {auction_name}"
}
```

## Editing Auctions

Owners can edit unsettled auctions:

```protobuf
message EditAuction {
    int64 auction_id = 1;
    optional string name = 2;
    optional string description = 3;
    optional double bin_price = 4;
    optional string image_filename = 5;
}
```

**Restriction**: Cannot edit after settlement (`buyer_id > 0`).

## Deleting Auctions

Owners can delete unsettled auctions:

```protobuf
message DeleteAuction {
    int64 auction_id = 1;
}
```

**Restriction**: Cannot delete after settlement.

## Auction Images

Auctions can have associated images:

1. Upload image via HTTP POST to `/upload`
2. Server returns filename
3. Include filename in `CreateAuction` or `EditAuction`
4. Images served at `/images/{filename}`

## Fetching Auctions

**All Auctions:**
```protobuf
message GetAllAuctions {}
```

Response includes all auctions (settled and unsettled).

**Rate Limited**: Falls under "expensive" category (180/min for users).

## What Auctions Are NOT

- **Not a bidding system**: No bid tracking, no outbid notifications
- **Not time-based**: No start/end times, no automatic close
- **Not price discovery**: Price determined by admin or BIN, not bids

The auction system is essentially a **facilitated direct sale** mechanism.

## Use Cases

1. **Physical item sales**: Sell physical items to bootcamp participants
2. **Prize distribution**: Admin settles prizes to winners at $0
3. **Special assets**: Items that don't fit the prediction market model
4. **Fundraising**: Sell items with proceeds going to seller account

## Error Cases

| Error | Cause |
|-------|-------|
| `AuctionNotFound` | Invalid auction ID |
| `AuctionAlreadySettled` | Trying to settle/edit/delete settled auction |
| `InsufficientFunds` | Buyer can't afford settlement price |
| `CannotBuyOwnAuction` | Buyer = Seller |
| `NoBinPrice` | BuyAuction on auction without BIN price |
| `NotOwner` | Edit/delete by non-owner |

## Database Schema

```sql
CREATE TABLE auction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES account(id),
    buyer_id INTEGER NOT NULL DEFAULT 0,  -- 0 = unsold
    settle_price REAL NOT NULL DEFAULT 0, -- 0 = unsettled
    bin_price REAL,                        -- NULL = no BIN
    image_filename TEXT
);
```

## Related Documentation

- [Account System](./accounts.md) - How balances and transfers work
- [Sudo and Admin System](./sudo.md) - Admin settlement permissions
