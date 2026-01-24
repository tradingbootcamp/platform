# Sudo and Admin System

This document explains how administrator privileges and sudo mode work in the platform.

## Overview

The platform has a two-tier admin system:
1. **Admin role**: Granted via Kinde authentication (stored in JWT claims)
2. **Sudo mode**: A per-connection toggle that activates admin privileges

This design prevents accidental admin actions—admins must explicitly enable sudo mode.

## Admin Role Assignment

Admins are designated in Kinde via the Kinde dashboard (Users → select user → Roles). When a user authenticates:

1. Backend validates JWT against Kinde's public keys (`../backend/src/auth.rs`)
2. JWT `claims` are checked for admin role
3. `is_admin` flag is set on the connection

```rust
// In ../backend/src/auth.rs - Role extraction from JWT
pub enum Role {
    User,
    Admin,
}
```

**Admin Initial Balance**: Admins start with 100,000,000 balance vs 0 for regular users.

## Sudo Mode

Sudo is a **per-connection state** that must be explicitly enabled.

### Enabling Sudo

```
Client (admin) ──── SetSudo { enabled: true } ────▶ Server
               ◀─── SudoStatus { enabled: true } ── Server
```

### What Sudo Enables

When sudo is enabled, the admin's `effective_admin_id` is set, unlocking:

- See hidden account IDs (bypasses `hide_account_ids`)
- See all markets (ignores [visibility](./visibility.md) restrictions)
- Edit market name, visibility, and admin-only fields
- Create and delete market types/groups
- Settle auctions at any price
- Revoke ownership between users
- ActAs any user (impersonation)
- Higher rate limits (10x user limits)

### Non-Obvious Behaviors

1. **Data refresh on sudo toggle**: When sudo is enabled/disabled, the server re-sends initial public data because [visibility](./visibility.md) rules change (hidden IDs, restricted markets).

2. **Admin without sudo sees limited data**: Even admins see anonymized [account](./accounts.md) IDs and only visible markets when sudo is off.

3. **Rate limits are sudo-dependent**: Admin rate limits (10x higher) only apply when `admin_id.is_some()`.

## Admin-Only Operations

These operations check `admin_id.is_some()`:

### Market Operations
```rust
// Only admin can set these fields on CreateMarket/EditMarket:
- name (non-admin can't name markets)
- visible_to (restrict [market visibility](./visibility.md))
- hide_account_ids (anonymize traders)
- pinned (pin market to top)
- redeemable settings (fund redemption)
```

### Administrative Operations
```rust
CreateMarketType   // Create market categories
DeleteMarketType   // Delete market categories
CreateMarketGroup  // Create market groupings
RevokeOwnership    // Remove [account](./accounts.md) ownership
SettleAuction      // Settle [auction](./auctions.md) at price
```

### ActAs Any User
Admins can impersonate any user (see [Account System](./accounts.md) for details on account ownership):
```
Admin ──── ActAs { account_id: <any_user> } ────▶ Server
```

When admin uses ActAs:
- `admin_as_user` flag is set to `true`
- Admin's `user_id` switches to target user
- All owned accounts reloaded for target
- Operations attributed to target user

## Permission Checks in Code

### `../backend/src/handle_socket.rs` Pattern

```rust
// Check if operation requires admin
if admin_id.is_none() {
    return Err("Admin permission required");
}

// Or for specific field access
let name = if admin_id.is_some() {
    request.name
} else {
    None  // Non-admins can't set name
};
```

### Rate Limiting Pattern

```rust
// In ../backend/src/handle_socket.rs
let rate_limiter = if admin_id.is_some() {
    &app_state.admin_expensive_ratelimit
} else {
    &app_state.user_expensive_ratelimit
};

if !rate_limiter.check_key(&user_id) {
    return Err("Rate limited");
}
```

## Testing Admin Features

The `test-auth-bypass` feature enables test tokens that bypass Kinde authentication:

```
test::<kinde_id>::<name>::<is_admin>
```

- `<kinde_id>`: Any arbitrary string. Each unique value creates a separate account.
- `<name>`: Display name for the account.
- `<is_admin>`: `true` or `false` to control admin status.

**Initial balances:**
- Admin accounts (`is_admin=true`): **100,000,000 clips**
- Non-admin accounts (`is_admin=false`): **0 clips**

**Examples:**
- `test::admin123::Test Admin::true` — admin with 100M clips
- `test::alice::Alice Smith::false` — non-admin with 0 clips
- `test::user1::User One::false` — another non-admin account

## Security Considerations

1. **Sudo is connection-scoped**: Sudo state doesn't persist; each new connection starts with sudo disabled.

2. **JWT validation required**: Admin status comes from validated Kinde JWT, not client claims.

3. **Explicit activation**: The sudo toggle prevents accidental privileged actions.

4. **Audit trail**: All admin actions use the same code paths and are logged via standard mechanisms.

## Related Documentation

- [Market Visibility](./visibility.md) - How visibility restrictions work
- [Account System](./accounts.md) - How ActAs and ownership work
