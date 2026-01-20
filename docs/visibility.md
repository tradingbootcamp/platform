# Market Visibility System

This document explains how market visibility and account ID hiding work.

## Overview

The platform has two independent privacy mechanisms:

1. **Market Visibility (`visible_to`)**: Controls which users can see a market
2. **Account ID Hiding (`hide_account_ids`)**: Anonymizes trader identities in a market

## Market Visibility (`visible_to`)

### How It Works

Markets can be restricted to specific accounts. The `market_visible_to` junction table controls access:

```
market_visible_to
├── market_id (FK to market)
└── account_id (FK to account)
```

**Visibility Logic:**
- If `market_visible_to` has **no entries** for a market → visible to everyone
- If `market_visible_to` has **entries** for a market → only listed accounts can see it

### Setting Visibility

Only admins (with sudo) can set visibility restrictions:

```protobuf
message CreateMarket {
    // ... other fields
    repeated int64 visible_to = 14;  // Admin-only field
}
```

Example: Create a market visible only to accounts 5 and 12:
```
CreateMarket {
    description: "Private market",
    visible_to: [5, 12]
}
```

### Visibility Check

```rust
// ../backend/src/db.rs - is_market_visible_to()
fn is_market_visible_to(market_id: i64, account_id: i64) -> bool {
    // Check if market has any visibility restrictions
    let has_restrictions = market_visible_to.exists(market_id);

    if !has_restrictions {
        return true;  // No restrictions = visible to all
    }

    // Check if account is in the allowed list
    market_visible_to.contains(market_id, account_id)
}
```

### What Gets Filtered

When a non-admin connects, the server filters:

1. **Initial market list**: Invisible markets are skipped entirely
2. **Orders for invisible markets**: Not sent to client
3. **Trades for invisible markets**: Not sent to client

Admins with [sudo](./sudo.md) bypass all visibility filters.

## Account ID Hiding (`hide_account_ids`)

### How It Works

Per-market boolean that anonymizes trader identities:

```sql
market.hide_account_ids BOOLEAN DEFAULT FALSE
```

When enabled, account IDs are replaced with `0` for non-owners.

### Setting the Flag

Admin-only field on market creation/edit:

```protobuf
message CreateMarket {
    // ... other fields
    bool hide_account_ids = 15;  // Admin-only
}
```

### What Gets Anonymized

The `conditionally_hide_user_ids()` function replaces IDs in:

| Message Type | Fields Affected |
|--------------|-----------------|
| `OrderCreated` | `owner_id`, fills[].owner_id, trades[].buyer_id, trades[].seller_id |
| `Orders` | orders[].owner_id |
| `Trades` | trades[].buyer_id, trades[].seller_id |
| `Redeemed` | account_id |

### Exception: Owned Accounts

Users can **always see their own account IDs**:

```rust
fn hide_id(id: &mut i64, owned_accounts: &HashSet<i64>) {
    if !owned_accounts.contains(id) {
        *id = 0;  // Replace with 0
    }
}
```

This means:
- You see your own orders normally
- You see other participants as "Account 0"
- You can identify your own trades in the history

### Admin Override

Admins with [sudo](./sudo.md) enabled see all [account](./accounts.md) IDs regardless of the `hide_account_ids` setting.

## Interaction Between Features

| Scenario | visible_to | hide_account_ids | Result |
|----------|------------|------------------|--------|
| Public market, no hiding | empty | false | Everyone sees everything |
| Public market, anonymous | empty | true | Everyone sees market, IDs hidden |
| Private market, visible | [5,12] | false | Only 5,12 see market, IDs visible |
| Private market, anonymous | [5,12] | true | Only 5,12 see market, IDs hidden |

## Data Flow Example

```
Market created with:
- visible_to: [5, 12]
- hide_account_ids: true

User 5 connects:
1. Server checks visibility → User 5 is in [5, 12] → market visible
2. Server sends market data
3. Orders/trades anonymized → other account IDs replaced with 0
4. User 5's own orders show their real account ID

User 99 connects:
1. Server checks visibility → User 99 not in [5, 12] → market hidden
2. Market not sent to client
3. User 99 doesn't know the market exists

Admin (sudo enabled) connects:
1. Visibility bypassed → all markets visible
2. ID hiding bypassed → all account IDs visible
```

## Refresh on Sudo Toggle

When an admin toggles sudo, the server re-sends initial public data:

```rust
// ../backend/src/handle_socket.rs
if sudo_status_changed {
    send_initial_public_data(/* with new visibility rules */);
}
```

This ensures the admin sees updated data reflecting their new permission level.

## Implementation Details

### Filter Location

Visibility filtering happens in `../backend/src/handle_socket.rs`:

1. `send_initial_public_data()` - Filters markets and orders during initial sync
2. Public subscription broadcasts - Filtered before sending updates
3. Expensive queries (full history) - Filtered in response

### Performance Consideration

The visibility check is efficient:
- Single query to check if market has restrictions
- Indexed lookup for account membership
- Cached in-memory for active connections

## Common Patterns

### Creating a Private Market

```
1. Admin enables sudo
2. Admin sends CreateMarket {
       description: "Private trading club",
       visible_to: [account1, account2, account3],
       hide_account_ids: true
   }
3. Only listed accounts can access
4. Even members can't see each other's identities
```

### Making a Market Public

```
1. Admin enables sudo
2. Admin sends EditMarket {
       market_id: 123,
       visible_to: []  // Empty = visible to all
   }
3. Market now visible to everyone
```

## Related Documentation

- [Sudo and Admin System](./sudo.md) - How admin permissions work
- [Architecture Overview](./architecture.md) - System overview
