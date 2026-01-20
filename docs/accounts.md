# Account System

This document explains how accounts, ownership, portfolios, and transfers work.

## Account Types

### User Accounts

User accounts are linked to Kinde authentication:

```
account
├── id: 42
├── kinde_id: "kp_abc123..."  ← Linked to Kinde
├── name: "Alice"
├── balance: "1000.00"
└── is_user: true (computed: kinde_id IS NOT NULL)
```

Created automatically on first authentication via `ensure_user_created()`.

### Alt Accounts

Alt accounts are created by users for portfolio separation. **The key difference: alt accounts have `kinde_id = NULL`**, meaning they aren't directly linked to any authentication identity. This is how the system distinguishes user accounts from alt accounts.

```
account
├── id: 100
├── kinde_id: NULL  ← No Kinde link
├── name: "Alice's Bot"
├── balance: "500.00"
└── is_user: false
```

Created via `CreateAccount` message.

## Ownership Model

Ownership is tracked in the `account_owner` table:

```
account_owner
├── owner_id: 42     ← The owning account
├── account_id: 100  ← The owned account
└── credit: "0.00"   ← Balance credit (for shared accounts)
```

### Ownership Hierarchy

```
User Account (Alice, id=42)
    │
    ├── owns → Alt Account (Alice's Bot, id=100)
    │              │
    │              └── owns → Alt Account (Sub-Bot, id=101)
    │
    └── owns → Alt Account (Trading Fund, id=102)
                   │
                   └── shared with → User Account (Bob, id=50)
```

### Transitive Ownership

The `get_owned_accounts()` function returns all accounts a user can access:

```sql
-- Direct alt accounts owned by accounts the user owns
SELECT ao2.account_id
FROM account_owner ao1
JOIN account_owner ao2 ON ao1.account_id = ao2.owner_id
WHERE ao1.owner_id = ?
UNION
-- Accounts where this user is listed as owner
SELECT account_id FROM account_owner WHERE owner_id = ?
UNION
-- The user's own primary account
SELECT ?
```

Result: User can act as any account in their ownership tree.

## ActAs (Account Switching)

Users can switch their active account:

```
Client ──── ActAs { account_id: 100 } ────▶ Server
       ◀─── ActingAs { account_id: 100 } ── Server
```

### Permission Check

```rust
if owned_accounts.contains(&target_account_id) {
    // User owns this account → allow
    acting_as = target_account_id;
} else if admin_id.is_some() {
    // Admin can impersonate anyone
    admin_as_user = true;
    acting_as = target_account_id;
} else {
    // Not owned and not admin → deny
    return Err("Account not owned");
}
```

### Effect of ActAs

After switching:
- All [orders](./order-matching.md) placed are attributed to the new account
- Portfolio updates reflect the new account's balances
- Trades show the new account as buyer/seller

## Ownership Sharing

Users can share account access with other users:

```
Owner ──── ShareOwnership { account_id: 100, new_owner_id: 50 } ────▶ Server
```

### Requirements

1. Sharer must be a user account (have `kinde_id`)
2. Sharer must directly own the account being shared
3. Recipient must be a user account (have `kinde_id`)

### Immediate Effect

- New owner appears in recipient's `get_owned_accounts()`
- Recipient can ActAs the shared account
- Recipient receives portfolio updates for the account
- Recipient subscribed to transfers involving the account

## Ownership Revocation

**Admin-only operation** (requires [sudo](./sudo.md)):

```
Admin ──── RevokeOwnership { account_id: 100, owner_id: 50 } ────▶ Server
```

### Restrictions

Cannot revoke if the owner has outstanding credits:

```rust
if owner_credit > 0 {
    return Err("CreditRemaining");  // Must settle credits first
}
```

This prevents someone from abandoning debt.

## Owner Credits

When transferring to a shared alt account, credits track who contributed:

```
account_owner
├── owner_id: 42     ← Alice
├── account_id: 100  ← Shared account
└── credit: "500.00" ← Alice contributed 500
```

```
account_owner
├── owner_id: 50     ← Bob
├── account_id: 100  ← Shared account
└── credit: "300.00" ← Bob contributed 300
```

### Credit Flow

**Transfer to shared account:**
- Sender's balance decreases
- Shared account balance increases
- Sender's credit in that account increases

**Transfer from shared account:**
- Shared account balance decreases
- Recipient's balance increases
- Recipient's credit in that account decreases (if they have credit)

### Why Credits Exist

Credits allow fair settlement when winding down a shared account. Each co-owner can withdraw up to their credited amount.

## Portfolios

Portfolios summarize an account's financial state:

```protobuf
message Portfolio {
    int64 account_id = 1;
    double total_balance = 2;      // Cash balance
    double available_balance = 3;  // Cash + worst-case positions
    repeated MarketExposure market_exposures = 4;
    repeated OwnerCredit owner_credits = 5;
}
```

### Balance Calculation

**Total Balance**: Direct cash balance from account record

**Available Balance**:
```
available = total_balance + sum(worst_case_outcome for each market)
```

Where `worst_case_outcome` considers:
- Long positions: Could lose entire position value
- Short positions: Could lose up to max settlement
- Open orders: Reserved for potential fills

### Market Exposures

Pre-computed in `exposure_cache` table:

```
exposure_cache
├── account_id
├── market_id
├── position (net long/short)
├── total_bid_size
├── total_offer_size
├── total_bid_value
└── total_offer_value
```

Updated on every order creation, cancellation, and trade.

## Transfers

Transfers move funds between accounts:

```
Client ──── MakeTransfer { from: 42, to: 100, amount: "100.00" } ────▶ Server
```

### Transfer Types

| From | To | Credit Behavior |
|------|-----|-----------------|
| User → User | No credits involved |
| Owner → Owned alt | Credit increases for owner |
| Owned alt → Owner | Credit decreases for owner |
| Shared → Non-owner | Uses shared account's credit to owner |

### Validation

- Initiator must be a user account
- Both accounts must exist
- Amount must be positive (max 4 decimal places)
- From account must have sufficient available balance
- Cannot transfer to same account

### Transfer Record

Every transfer creates an audit record:

```
transfer
├── id
├── initiator_id (who initiated)
├── from_account_id
├── to_account_id
├── transaction_id
├── amount
└── note
```

## Hide Account IDs

Per-market setting that anonymizes account IDs:

```
market.hide_account_ids = true
```

When enabled:
- Order owner IDs show as `0` for non-owners
- Trade buyer/seller IDs show as `0` for non-participants
- User can still see their own account ID

See [Market Visibility](./visibility.md) for details.

## Connection Data Flow

When a user connects:

```
1. JWT validated, user_id determined
2. ensure_user_created() - create account if new
3. get_owned_accounts() - fetch all accessible accounts
4. Subscribe to channels:
   - Public (markets, orders, trades)
   - Private transfers (for each owned account)
   - Portfolio updates (for each owned account)
   - Ownership changes (to detect new/revoked access)
5. send_initial_private_data():
   - Transfers for all owned accounts
   - Portfolios for all owned accounts
6. send_initial_public_data():
   - All accounts
   - Visible markets (filtered)
   - Live orders (IDs possibly hidden)
7. ActingAs message sent (signals ready)
```

## Validation Failures

Account-related errors:

| Error | Meaning |
|-------|---------|
| `InvalidOwner` | Can't create account under specified owner |
| `OwnerNotAUser` | Can only share from user accounts (accounts with `kinde_id`) |
| `NotOwner` | User doesn't own the account to share |
| `RecipientNotAUser` | Can only share to user accounts |
| `AlreadyOwner` | Recipient already owns the account |
| `AccountNotShared` | Account not shared with user trying to revoke |
| `CreditRemaining` | Can't revoke if co-owner has balance > 0 |
| `AccountNotOwned` | Transfer from/to unowned account |
| `InitiatorNotUser` | Transfers must be initiated by a user account |
| `InsufficientCredit` | Owner credit too low for withdrawal |
| `EmptyName` | Account name can't be blank |
| `NameAlreadyExists` | Duplicate account name |

## Related Documentation

- [Sudo and Admin System](./sudo.md) - Admin operations on accounts
- [Architecture Overview](./architecture.md) - System overview
