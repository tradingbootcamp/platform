# Exchange WebSocket API Reference

This is a complete reference for the Arbor exchange's client-server protocol. The exchange exposes a single long-lived WebSocket per cohort. All messages are framed Protocol Buffer payloads (binary). You open one socket, keep it open, and over it two streams flow at once.

## How the Protocol Works

**Outbound** — every frame you send is a `ClientMessage`. Each one carries a `request_id` you generate.

**Inbound** — every frame you receive is a `ServerMessage`. Look at its `request_id` field to know which flavor you're looking at: a response to a specific request you sent, part of the post-auth initial snapshot, or a spontaneous broadcast.

### What arrives spontaneously, just by having the connection open

```
LIVE FEED — request_id is empty
————————————————————————————————————————————
Trades              every match in any market visible to you
OrderCreated        every new resting order anyone places
OrdersCancelled     every cancellation
Market              market created, edited, paused, or settled
MarketSettled       a market closes
Auction             new or edited auction
AuctionSettled      auction was bought / settled
AuctionDeleted      auction was removed
PortfolioUpdated    your balance or position changed
Transfer            someone transferred to or from your account
```

### What arrives once, right after `Authenticate` (initial snapshot)

```
SNAPSHOT — request_id matches your Authenticate
————————————————————————————————————————————
Universes              every universe
Accounts               every account you can see
MarketTypes            market type catalog
MarketGroups           market group catalog
Market                 one per visible market
Orders                 one per market (current book)
Trades                 one per market (recent tape)
Auction                one per active auction
Transfers              for accounts you own
Portfolios             for accounts you own
ActingAs               "ready — you can start sending requests"
```

After this you have a complete view; everything new flows in via the live feed.

### What you have to ask for

Most data is pushed to you. A few things you must request explicitly — typically large historical reads the server doesn't continuously broadcast.

```
EXPLICIT READS
————————————————————————————————————————————
GetFullOrderHistory     all historical orders for one market
GetFullTradeHistory     all historical trades for one market
GetOptionContracts      your option contracts in a market
```

The live feed only carries events from when you connected onward — to backfill, send these once at startup. They're rate-limited under the "expensive" bucket; don't poll them in a loop.

### What you send to do things (mutations)

Most `ClientMessage`s are mutations — the equivalent of REST POSTs. The server replies to you with a response (`request_id` matches what you sent) and broadcasts the resulting state change to everyone else.

```
TYPICAL MUTATIONS
————————————————————————————————————————————
Authenticate, ActAs, SetSudo            session control
CreateOrder, CancelOrder, Out           trading
MakeTransfer, Gift                      move balances
CreateAccount, ShareOwnership,          account management
  RevokeOwnership
CreateMarket, EditMarket, SettleMarket  markets (mostly admin)
CreateAuction, BuyAuction,              auctions
  SettleAuction
Redeem, ExerciseOption                  funds, options
CreateUniverse, CreateRedeemCode,       misc
  ClaimRedeemCode
```

The rest of this doc lists every message type, with full field definitions, grouped by domain.

---

## Connection

```
ws://localhost:8080/api/ws/<cohort_name>          (local dev)
wss://exchange.<domain>/api/ws/<cohort_name>      (production)
```

`<cohort_name>` selects which database / cohort the connection trades in. Each cohort has its own accounts, markets, and balances.

The wire encoding is `application/octet-stream` framed Protocol Buffers. Every client-to-server frame is one encoded `ClientMessage`; every server-to-client frame is one encoded `ServerMessage`.

---

## Message Envelope

Both directions use a oneof envelope with a `request_id` for correlation.

### `ClientMessage`

```proto
message ClientMessage {
  string request_id = 14;     // client-generated; echoed back on response
  oneof message {
    Authenticate              authenticate              = 7;
    ActAs                     act_as                    = 8;
    SetSudo                   set_sudo                  = 26;

    CreateOrder               create_order              = 3;
    CancelOrder               cancel_order              = 4;
    Out                       out                       = 5;

    MakeTransfer              make_transfer             = 6;
    Gift                      gift                      = 28;
    RedistributeOwnerCredit   redistribute_owner_credit = 29;

    CreateAccount             create_account            = 9;
    ShareOwnership            share_ownership           = 10;
    RevokeOwnership           revoke_ownership          = 19;

    GetFullOrderHistory       get_full_order_history    = 11;
    GetFullTradeHistory       get_full_trade_history    = 12;

    CreateMarket              create_market             = 1;
    EditMarket                edit_market               = 18;
    SettleMarket              settle_market             = 2;
    CreateMarketType          create_market_type        = 21;
    DeleteMarketType          delete_market_type        = 22;
    CreateMarketGroup         create_market_group       = 23;

    CreateAuction             create_auction            = 15;
    EditAuction               edit_auction              = 25;
    SettleAuction             settle_auction            = 16;
    DeleteAuction             delete_auction            = 17;
    BuyAuction                buy_auction               = 20;

    CreateUniverse            create_universe           = 27;

    Redeem                    redeem                    = 13;
    ExerciseOption            exercise_option           = 30;
    GetOptionContracts        get_option_contracts      = 31;

    CreateRedeemCode          create_redeem_code        = 32;
    ClaimRedeemCode           claim_redeem_code         = 33;
  }
}
```

### `ServerMessage`

```proto
message ServerMessage {
  string request_id = 19;     // empty for broadcasts, populated for responses
  oneof message {
    Authenticated             authenticated             = 10;
    ActingAs                  acting_as                 = 14;
    RequestFailed             request_failed            = 11;
    SudoStatus                sudo_status               = 32;

    Account                   account_created           = 12;
    Accounts                  accounts                  = 13;
    OwnershipGiven            ownership_given           = 17;
    OwnershipRevoked          ownership_revoked         = 25;

    Portfolio                 portfolio_updated         = 1;
    Portfolios                portfolios                = 2;

    Market                    market                    = 3;
    MarketSettled             market_settled            = 4;
    MarketType                market_type               = 26;
    MarketTypes               market_types              = 27;
    MarketTypeDeleted         market_type_deleted       = 28;
    MarketGroup               market_group              = 29;
    MarketGroups              market_groups             = 30;

    OrderCreated              order_created             = 5;
    OrdersCancelled           orders_cancelled          = 6;
    Orders                    orders                    = 20;
    Trades                    trades                    = 21;

    Out                       out                       = 9;

    Transfer                  transfer_created          = 8;
    Transfers                 transfers                 = 7;

    Auction                   auction                   = 22;
    AuctionSettled            auction_settled           = 23;
    AuctionDeleted            auction_deleted           = 24;

    Universe                  universe                  = 33;
    Universes                 universes                 = 34;
    OwnerCreditRedistributed  owner_credit_redistributed = 35;

    Redeemed                  redeemed                  = 18;
    OptionExercised           option_exercised          = 36;
    OptionContracts           option_contracts          = 37;

    RedeemCodeCreated         redeem_code_created       = 38;
    RedeemCodeClaimed         redeem_code_claimed       = 39;
  }
}
```

### Request / response correlation

1. Client generates a `request_id` (UUID is fine, any unique string works).
2. Client sends `ClientMessage { request_id, ... }`.
3. Server processes the request and:
   - Sends one or more `ServerMessage` with the same `request_id` directly to the requester (e.g. `OrderCreated`, `RequestFailed`, `Authenticated`).
   - Broadcasts related state changes to all eligible subscribers with `request_id` empty (e.g. `Trades`, `OrdersCancelled`, `Market`, other accounts' `PortfolioUpdated`).

Clients should keep a `Map<request_id, callback>` to resolve in-flight requests when responses arrive.

---

## Connection Lifecycle

```
1.  WebSocket open
2.  Client → Authenticate { jwt, id_jwt, act_as }
3.  Server → Authenticated { account_id, is_cohort_member, auction_enabled }
4.  Server → initial state snapshot (in this order):
        Universes
        MarketTypes, MarketGroups
        Accounts
        Markets (one Market message per visible market)
        Orders   (one per market)
        Trades   (one per market)
        Auctions (one Auction per auction)
        Transfers (for owned accounts only)
        Portfolios (for owned accounts only)
5.  Server → ActingAs { account_id, universe_id, user_id }
        ↑ this signals "the connection is ready for operations"
6.  Open-ended bidirectional traffic until disconnect.
```

After step 5, the connection stays open indefinitely. Every state change (a trade somewhere, a new order, a settled auction, an updated portfolio) arrives as a broadcast. To "issue an API call," you send another `ClientMessage`; the matching `ServerMessage` (with the same `request_id`) is your response.

On disconnect, reconnect and re-authenticate. The server replays the full snapshot — clients should treat reconnection as "blow away local state and rebuild," not "merge."

---

## Authentication

### `Authenticate`

```proto
message Authenticate {
  string jwt    = 1;     // Kinde access token (RS256)
  string id_jwt = 2;     // Optional Kinde ID token (used to populate display name on first login)
  int64  act_as = 4;     // Optional. If non-zero, switches to this account on connect.
}
```

The JWT is validated against Kinde's public JWKS. Required claims: `sub`, `iss` matching `KINDE_ISSUER`, `aud` matching `KINDE_AUDIENCE`. Optional: `roles` (`admin`, `trader`), `email`.

In dev mode (server compiled with `--features dev-mode`), test tokens are accepted in place of real JWTs:

```
test::<kinde_id>::<display_name>::<is_admin>[::<email>[::<auto_join_cohort>]]
```

### `Authenticated`

```proto
message Authenticated {
  int64 account_id       = 1;     // your user account id (not the act_as id)
  bool  is_cohort_member = 2;
  bool  auction_enabled  = 3;
}
```

### `ActAs`

```proto
message ActAs {
  int64 account_id = 1;     // must be an account you own (your own + alts + shared)
}
```

Used to switch the current connection's acting account mid-session. Server replies with `ActingAs`.

### `ActingAs`

```proto
message ActingAs {
  int64 account_id  = 1;
  int64 universe_id = 2;
  int64 user_id     = 3;
}
```

Sent after `Authenticate` (using the `act_as` field), after a mid-session `ActAs`, and any time the acting context otherwise changes.

### `SetSudo` (admin only)

```proto
message SetSudo { bool enabled = 1; }
```

Toggles admin override mode for the current connection. Returns `SudoStatus { enabled }`.

---

## Trading

### `CreateOrder`

```proto
message CreateOrder {
  int64  market_id = 2;
  double price     = 5;
  double size      = 6;
  Side   side      = 7;     // BID = 1, OFFER = 2
}
```

Places a limit order. The matching engine fills any crossing resting orders at the resting price (price-time priority); any unfilled remainder rests on the book. There is no IOC/FOK flag — to "take only," size your order to known available depth and accept that any residual rests.

**Response (to requester):** `OrderCreated`

```proto
message OrderCreated {
  int64                      market_id              = 1;
  int64                      account_id             = 2;
  optional Order             order                  = 3;     // the resting portion, if any
  repeated OrderFill         fills                  = 4;     // resting orders that matched
  repeated Trade             trades                 = 5;
  int64                      transaction_id         = 7;
  google.protobuf.Timestamp  transaction_timestamp  = 8;

  message OrderFill {
    int64  id              = 1;     // id of the resting order that filled
    int64  market_id       = 2;
    int64  owner_id        = 8;
    double size_filled     = 4;
    double size_remaining  = 5;     // 0 means the order is fully gone
    double price           = 6;
    Side   side            = 7;
  }
}
```

**Broadcasts:** `OrderCreated` (public, possibly with hidden account ids), `Trades` (one per executed match), `PortfolioUpdated` (to maker and taker).

### `CancelOrder`

```proto
message CancelOrder { int64 id = 1; }
```

Cancels one order by id. You can only cancel your own orders.

**Broadcast:** `OrdersCancelled { order_ids: [id], market_id }`.

### `Out` — bulk cancel

```proto
message Out {
  optional int64 market_id = 1;
  optional Side  side      = 2;
}
```

Cancels every resting order owned by the acting account, optionally scoped to a market and/or a side. With both fields unset, cancels everything across every market.

**Broadcast:** `OrdersCancelled` per affected market.

---

## Order, Trade, and Book Messages

### `Order` and `Orders`

```proto
message Order {
  int64                      id                     = 1;
  int64                      market_id              = 2;
  int64                      owner_id               = 9;     // 0 if hidden
  int64                      transaction_id         = 4;
  google.protobuf.Timestamp  transaction_timestamp  = 10;
  double                     price                  = 5;
  double                     size                   = 6;     // current remaining size
  Side                       side                   = 7;
  repeated Size              sizes                  = 8;     // historical size mutations
}

message Size {
  int64                      transaction_id         = 1;
  google.protobuf.Timestamp  transaction_timestamp  = 3;
  double                     size                   = 2;
}

message Orders {
  int64           market_id        = 1;
  repeated Order  orders           = 2;
  bool            hasFullHistory   = 3;     // false on initial snapshot, true after GetFullOrderHistory
}
```

Sent on initial snapshot (one `Orders` per visible market) and again with `hasFullHistory: true` when `GetFullOrderHistory` is requested. Incremental updates afterward arrive as `OrderCreated` and `OrdersCancelled`.

### `Trade` and `Trades`

```proto
message Trade {
  int64                      id                     = 1;
  int64                      market_id              = 2;
  int64                      transaction_id         = 3;
  google.protobuf.Timestamp  transaction_timestamp  = 10;
  double                     price                  = 4;
  double                     size                   = 5;
  int64                      buyer_id               = 8;     // 0 if hidden
  int64                      seller_id              = 9;     // 0 if hidden
  bool                       buyer_is_taker         = 11;
}

message Trades {
  int64              market_id        = 1;
  repeated Trade     trades           = 2;
  bool               hasFullHistory   = 3;
  repeated Redeemed  redemptions      = 4;
}
```

### `OrdersCancelled`

```proto
message OrdersCancelled {
  repeated int64             order_ids              = 1;
  int64                      market_id              = 2;
  int64                      transaction_id         = 4;
  google.protobuf.Timestamp  transaction_timestamp  = 5;
}
```

### `GetFullOrderHistory` / `GetFullTradeHistory`

```proto
message GetFullOrderHistory { int64 market_id = 1; }
message GetFullTradeHistory { int64 market_id = 1; }
```

Both are rate-limited under the **expensive** bucket. Replies with the full historical `Orders` / `Trades` for the market, with `hasFullHistory: true`. Use sparingly; backfill once and live off the broadcast stream.

---

## Markets

### `Market`

```proto
message Market {
  int64                      id                     = 1;
  string                     name                   = 2;
  string                     description            = 3;
  int64                      owner_id               = 10;
  int64                      transaction_id         = 12;
  google.protobuf.Timestamp  transaction_timestamp  = 13;
  double                     min_settlement         = 6;
  double                     max_settlement         = 7;
  repeated Redeemable        redeemable_for         = 4;
  double                     redeem_fee             = 11;
  repeated int64             visible_to             = 14;    // empty = visible to all
  bool                       pinned                 = 15;
  int64                      type_id                = 16;
  int64                      group_id               = 17;
  MarketStatus               status                 = 18;    // OPEN, SEMI_PAUSED, PAUSED
  int64                      universe_id            = 19;
  OptionInfo                 option                 = 20;

  oneof market_state {
    Open    open    = 8;
    Closed  closed  = 9;
  }
  message Open {}
  message Closed {
    double                     settle_price           = 1;
    int64                      transaction_id         = 2;
    google.protobuf.Timestamp  transaction_timestamp  = 3;
  }
}

enum MarketStatus {
  MARKET_STATUS_OPEN        = 0;
  MARKET_STATUS_SEMI_PAUSED = 1;
  MARKET_STATUS_PAUSED      = 2;
}

message OptionInfo {
  int64                      underlying_market_id   = 1;
  double                     strike_price           = 2;
  bool                       is_call                = 3;
  google.protobuf.Timestamp  expiration_date        = 4;     // zero value = no expiration
}

message Redeemable {
  int64  constituent_id = 1;
  sint64 multiplier     = 2;
}
```

### `CreateMarket`

```proto
message CreateMarket {
  string              name             = 1;
  string              description      = 2;
  double              min_settlement   = 3;
  double              max_settlement   = 4;
  repeated Redeemable redeemable_for   = 5;
  double              redeem_fee       = 6;
  bool                hide_account_ids = 7;
  repeated int64      visible_to       = 8;
  int64               type_id          = 9;
  int64               group_id         = 10;
  OptionInfo          option           = 11;
}
```

Expensive bucket. **Response:** `Market` (broadcast to all eligible subscribers).

### `EditMarket`

```proto
message EditMarket {
  int64                       id                  = 1;
  optional string             name                = 2;
  optional string             description         = 3;
  optional bool               pinned              = 4;
  optional RedeemableSettings redeemable_settings = 5;
  optional bool               hide_account_ids    = 6;
  optional bool               update_visible_to   = 7;     // must be true to apply visible_to
  repeated int64              visible_to          = 8;
  MarketStatus                status              = 9;
}

message RedeemableSettings {
  repeated Redeemable redeemable_for = 1;
  double              redeem_fee     = 2;
}
```

### `SettleMarket`

```proto
message SettleMarket {
  int64  market_id    = 1;
  double settle_price = 2;
}
```

Closes the market at `settle_price`. **Broadcasts:** `MarketSettled`, `PortfolioUpdated` for every account with exposure.

```proto
message MarketSettled {
  int64                      id                     = 1;
  double                     settle_price           = 2;
  int64                      transaction_id         = 4;
  google.protobuf.Timestamp  transaction_timestamp  = 5;
}
```

### Market types and groups

```proto
message MarketType  { int64 id = 1; string name = 2; string description = 3; bool public = 4; }
message MarketGroup { int64 id = 1; string name = 2; string description = 3; int64 type_id = 4; }

message CreateMarketType  { string name = 1; string description = 2; bool public = 3; }
message DeleteMarketType  { int64 market_type_id = 1; }
message CreateMarketGroup { string name = 1; string description = 2; int64 type_id = 3; }
```

---

## Accounts and Ownership

### `Account`

```proto
message Account {
  int64           id          = 1;
  string          name        = 2;
  bool            is_user     = 3;     // false = alt account
  int64           universe_id = 4;
  optional string color       = 5;     // hex #RRGGBB
}
```

### `CreateAccount`

```proto
message CreateAccount {
  int64           owner_id        = 1;
  string          name            = 2;
  int64           universe_id     = 3;     // default 0 = main universe
  double          initial_balance = 4;     // only meaningful when creating in a universe you own
  optional string color           = 5;
}
```

### `ShareOwnership` / `RevokeOwnership`

```proto
message ShareOwnership  { int64 of_account_id = 1; int64 to_account_id = 2; }
message RevokeOwnership { int64 of_account_id = 1; int64 from_account_id = 2; }
```

After a successful share, the granted account receives `OwnershipGiven` and re-fetches the snapshot for the newly accessible account.

---

## Portfolios and Balances

### `Portfolio`

```proto
message Portfolio {
  int64                       account_id          = 1;
  double                      total_balance       = 2;
  double                      available_balance   = 3;     // worst-case, considers open exposure
  repeated MarketExposure     market_exposures    = 4;
  repeated OwnerCredit        owner_credits       = 5;
  repeated int64              traded_market_ids   = 6;

  message MarketExposure {
    int64  market_id           = 1;
    double position            = 2;     // signed; positive = long, negative = short
    double total_bid_size      = 3;     // sum of resting bid sizes
    double total_offer_size    = 4;
    double total_bid_value     = 5;     // size * price summed
    double total_offer_value   = 6;
  }

  message OwnerCredit { int64 owner_id = 1; double credit = 2; }
}

message Portfolios {
  repeated Portfolio portfolios       = 1;
  bool               are_new_ownerships = 2;
}
```

`PortfolioUpdated` is broadcast on every fill, transfer, settlement, redemption, or auction settle that touches an account you own. `Portfolios` is sent in the initial snapshot.

---

## Transfers

### `MakeTransfer`

```proto
message MakeTransfer {
  int64  from_account_id = 1;
  int64  to_account_id   = 2;
  double amount          = 3;
  string note            = 4;
}
```

Mutate bucket. **Response:** `Transfer { ... }` to both sender and receiver.

### `Transfer`

```proto
message Transfer {
  int64                      id                     = 1;
  int64                      initiator_id           = 2;
  int64                      from_account_id        = 3;
  int64                      to_account_id          = 4;
  int64                      transaction_id         = 8;
  google.protobuf.Timestamp  transaction_timestamp  = 9;
  double                     amount                 = 6;
  string                     note                   = 7;
}

message Transfers { repeated Transfer transfers = 1; }
```

### `Gift`

```proto
message Gift {
  int64  to_account_id = 1;
  double amount        = 2;
  string note          = 3;
}
```

Like `MakeTransfer` but `from` is implicit (the user's account). Used for non-owned recipients.

### `RedistributeOwnerCredit` (admin / dev)

```proto
message RedistributeOwnerCredit {
  int64 account_id    = 1;
  int64 from_owner_id = 2;
}
```

Returns `OwnerCreditRedistributed {}`.

---

## Auctions

### `Auction`

```proto
message Auction {
  int64                      id                     = 1;
  string                     name                   = 2;
  string                     description            = 3;
  int64                      owner_id               = 4;
  int64                      transaction_id         = 5;
  google.protobuf.Timestamp  transaction_timestamp  = 6;
  optional string            image_url              = 9;
  optional double            bin_price              = 10;    // buy-it-now price
  int64                      buyer_id               = 11;    // 0 = no owner picked (split)
  repeated AuctionBuyer      buyers                 = 12;    // empty until settled

  oneof status {
    Open    open    = 7;
    Closed  closed  = 8;
  }
  message Open   {}
  message Closed { double settle_price = 1; }
}

message AuctionBuyer { int64 account_id = 1; double amount = 2; }
```

### `CreateAuction` / `EditAuction` / `DeleteAuction`

```proto
message CreateAuction {
  string          name           = 1;
  string          description    = 2;
  string          image_filename = 3;     // optional, from POST /api/upload-image
  optional double bin_price      = 4;
}

message EditAuction {
  int64           id             = 1;
  optional string name           = 2;
  optional string description    = 3;
  optional string image_filename = 4;
  optional double bin_price      = 5;
}

message DeleteAuction { int64 auction_id = 1; }
```

### `BuyAuction`

```proto
message BuyAuction { int64 auction_id = 1; }
```

Buy-it-now at `bin_price`. Settles the auction immediately to the acting account.

### `SettleAuction` (admin)

```proto
message SettleAuction {
  int64                  auction_id    = 1;
  int64                  buyer_id      = 2;     // legacy single-buyer path
  double                 settle_price  = 3;
  repeated Contribution  contributions = 4;     // multi-buyer split; sum must equal settle_price
  optional int64         owner_id      = 5;     // labeled owner from contributors

  message Contribution { int64 buyer_id = 1; double amount = 2; }
}
```

### `AuctionSettled`

```proto
message AuctionSettled {
  int64                      id                     = 1;
  double                     settle_price           = 2;
  int64                      transaction_id         = 3;
  google.protobuf.Timestamp  transaction_timestamp  = 4;
  int64                      buyer_id               = 5;
  repeated AuctionBuyer      buyers                 = 6;
}
```

---

## Funds, Redemption, and Options

### `Redeem`

```proto
message Redeem {
  int64  fund_id = 1;
  double amount  = 2;
}
```

Swaps `amount` shares of the fund market for the equivalent constituent positions per `Market.redeemable_for`. Charges `redeem_fee` per share.

### `Redeemed`

```proto
message Redeemed {
  int64                      transaction_id         = 5;
  google.protobuf.Timestamp  transaction_timestamp  = 6;
  int64                      account_id             = 2;
  int64                      fund_id                = 3;
  double                     amount                 = 4;
}
```

### `ExerciseOption`

```proto
message ExerciseOption {
  int64  option_market_id = 1;
  int64  contract_id      = 2;
  double amount           = 3;
}
```

### `OptionExercised`

```proto
message OptionExercised {
  int64                      transaction_id         = 1;
  google.protobuf.Timestamp  transaction_timestamp  = 2;
  int64                      option_market_id       = 3;
  int64                      exerciser_id           = 4;
  int64                      counterparty_id        = 5;
  double                     amount                 = 6;
  bool                       is_cash_settled        = 7;
  int64                      contract_id            = 8;
}
```

### `GetOptionContracts` / `OptionContracts`

```proto
message GetOptionContracts { int64 market_id = 1; }

message OptionContract {
  int64  id               = 1;
  int64  option_market_id = 2;
  int64  buyer_id         = 3;
  int64  writer_id        = 4;
  double remaining_amount = 5;
}

message OptionContracts {
  int64                    market_id = 1;
  repeated OptionContract  contracts = 2;
}
```

`GetOptionContracts` is in the **expensive** rate bucket.

---

## Universes

### `Universe`

```proto
message Universe {
  int64  id          = 1;
  string name        = 2;
  string description = 3;
  int64  owner_id    = 4;     // 0 = main universe (no owner)
}

message Universes { repeated Universe universes = 1; }
```

### `CreateUniverse`

```proto
message CreateUniverse {
  string name        = 1;
  string description = 2;
}
```

Expensive bucket.

---

## Redeem Codes

### Create / claim

```proto
message CreateRedeemCode { double amount = 1; }
message ClaimRedeemCode  { string code   = 1; }

message RedeemCodeCreated {
  string                     code        = 1;
  double                     amount      = 2;
  google.protobuf.Timestamp  expires_at  = 3;
}

message RedeemCodeClaimed {
  string code   = 1;
  double amount = 2;
}
```

`ClaimRedeemCode` is allowed even for non-cohort-members (so codes can be claimed by guests).

---

## Errors

### `RequestFailed`

```proto
message RequestFailed {
  RequestDetails request_details = 1;
  ErrorDetails   error_details   = 2;

  message RequestDetails { string kind    = 1; }     // e.g. "CreateOrder"
  message ErrorDetails   { string message = 1; }
}
```

Sent only to the requesting connection. Common `error_details.message` values:

| Cause | Message |
|---|---|
| Validation / business logic | descriptive string from the engine (e.g., `"Insufficient balance"`) |
| Mutate quota exceeded | `"Rate Limited"` (or `"ADMIN Rate Limited"`) |
| Auth missing | `"Unauthenticated"` |
| Read-only cohort | `"Cohort is read-only"` |
| Non-cohort guest mutation | `"Auction access only"` |
| Admin-only operation without admin | `"AdminRequired"` |

---

## Subscriptions and Broadcasts

The server maintains three flavors of subscription per connection. Clients don't manage these explicitly; they're set up automatically based on the authenticated user's owned accounts.

| Channel | Recipients | Carries |
|---|---|---|
| Public | All connections in the cohort | `Market`, `MarketSettled`, `Orders`, `OrderCreated`, `OrdersCancelled`, `Trades`, `Auction`, `AuctionSettled`, `AuctionDeleted`, `MarketType`, `MarketGroup`, `Universe` |
| Private (per account) | All connections acting as an account that owns this account | `Transfer`, `PortfolioUpdated`, `Redeemed`, `OptionExercised` |
| Ownership watcher | Account owners | `OwnershipGiven`, `OwnershipRevoked` (which prompt re-fetching the snapshot for changed access) |

Visibility of public events is filtered by `Market.visible_to`. Account ids on broadcasts may be zeroed out when `Market.hide_account_ids` is set, except for the requester's own ids.

---

## Rate Limits

Two token-bucket quotas, keyed by **user id** (alts under one user share the same buckets).

| Bucket | User | Admin |
|---|---|---|
| Mutate (`CreateOrder`, `CancelOrder`, `Out`, `MakeTransfer`, `Gift`, `Redeem`, `ExerciseOption`, `CreateAccount`, ownership ops, `RedistributeOwnerCredit`, redeem-code ops) | 100 / sec, burst 1000 | 1000 / sec, burst 10000 |
| Expensive (`GetFullOrderHistory`, `GetFullTradeHistory`, `GetOptionContracts`, `CreateMarket`, `SettleMarket`, `CreateUniverse`, all auction CRUD, `CreateMarketType`, `DeleteMarketType`, `CreateMarketGroup`) | 180 / min | 1800 / min |

**Not rate-limited:** `Authenticate`, `ActAs`, `SetSudo`, `BuyAuction`.

When a request is rate-limited the response is `RequestFailed { error_details: { message: "Rate Limited" } }` with the same `request_id`. The server does not queue or retry; the client should back off.

---

## Reconnection

On transport-level disconnect:

1. Reconnect to the same URL.
2. Send `Authenticate` again. Include `act_as` if you want to resume on a non-default account.
3. Discard local state and accept the new snapshot. Do **not** merge — server-side state is authoritative and the snapshot is complete.

There is no resume token, no replay-from-cursor, and no missed-message buffer. The snapshot is the resync.

---

## Quick Reference Card

| Goal | Send | Receive (on success) | Public broadcasts |
|---|---|---|---|
| Authenticate | `Authenticate` | `Authenticated` + snapshot + `ActingAs` | — |
| Switch acting account | `ActAs` | `ActingAs` + replay private state | — |
| Place limit order | `CreateOrder` | `OrderCreated` (with fills/trades) | `OrderCreated`, `Trades`, `PortfolioUpdated` |
| Cancel one order | `CancelOrder` | `OrdersCancelled` | `OrdersCancelled` |
| Cancel many orders | `Out` | `OrdersCancelled` per market | `OrdersCancelled` |
| Transfer balance | `MakeTransfer` | `Transfer` | — (private only) |
| Read full history | `GetFullTradeHistory` / `GetFullOrderHistory` | `Trades` / `Orders` with `hasFullHistory: true` | — |
| Buy-it-now | `BuyAuction` | `AuctionSettled` | `AuctionSettled`, `PortfolioUpdated` |
| Redeem fund shares | `Redeem` | `Redeemed` + `PortfolioUpdated` | — |
| Exercise option | `ExerciseOption` | `OptionExercised` + `PortfolioUpdated` | — |
| Create alt account | `CreateAccount` | `Account` (account_created) | `Accounts` to other owners |

---

## Source of Truth

- All proto definitions: `schema/*.proto` in this repository.
- Server dispatch: `backend/src/handle_socket.rs`.
- Subscription fanout: `backend/src/subscriptions.rs`.
- Auth: `backend/src/auth.rs`.
- Generated TypeScript bindings: `schema-js/index.d.ts` (built from `schema/*.proto` via `pnpm --filter schema-js build-proto`).
