# Python Client Skill

Help users write trading bots using the MetaGame Python client.

## Overview

The MetaGame Python client (`metagame`) is a WebSocket-based library for building trading bots that interact with the MetaGame trading exchange. It uses Protocol Buffers for efficient communication and provides a high-level API for order placement, market management, and account operations.

**Requirements:** Python >= 3.12, uv

## Installation

Install uv if needed:

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Add metagame to your project:

```bash
uv add metagame python-dotenv
```

## Configuration

Create a `.env` file with your credentials:

```
JWT=<your_jwt_token>           # Get from "Accounts" page on the exchange
ACT_AS=<account_id>            # Account ID to trade as (integer)
API_URL=wss://trading-bootcamp.fly.dev/api  # WebSocket endpoint
```

Load with python-dotenv:

```python
from dotenv import load_dotenv
load_dotenv()
```

## Quick Start

```python
from metagame import TradingClient
from metagame.websocket_api import Side
from dotenv import load_dotenv
import os

load_dotenv()

jwt = os.getenv("JWT")
api_url = os.getenv("API_URL")
act_as = int(os.getenv("ACT_AS"))

with TradingClient(api_url, jwt, act_as) as client:
    state = client.state()

    # Look up market by name
    market_id = state.market_name_to_id["My Market"]

    # Place a bid at $0.50 for 10 shares
    order = client.create_order(
        market_id=market_id,
        price=0.50,
        size=10.0,
        side=Side.BID
    )
    print(f"Order placed: {order.order.id}")
```

## TradingClient API Reference

### Constructor

```python
TradingClient(api_url: str, jwt: str, act_as: int)
```

Opens WebSocket connection, authenticates with JWT, and waits for initial state. Supports context manager (`with` statement) for automatic cleanup.

### Order Management

| Method | Description |
|--------|-------------|
| `create_order(market_id, price, size, side)` | Place limit order. Side: `Side.BID` or `Side.OFFER` |
| `cancel_order(order_id)` | Cancel a single order |
| `out(market_id=None, side=None)` | Cancel multiple orders (all in market, or by side) |

### State Access

| Method | Description |
|--------|-------------|
| `state()` | Returns current `State` object |
| `state().markets[id]` | Get `MarketData` for a market |
| `state().market_name_to_id["Name"]` | Look up market ID by name |
| `state().portfolio` | Current account's portfolio |
| `state().portfolios[id]` | Portfolio for specific account |

### Market Creation & Settlement

| Method | Description |
|--------|-------------|
| `create_market(name, description, min_settlement, max_settlement, redeemable_for=[], redeem_fee=0.0, hide_account_ids=False, visible_to=[], type_id=None, group_id=None)` | Create new market |
| `settle_market(market_id, settle_price)` | Settle market at price |
| `edit_market(market_id, name=None, description=None, pinned=None, status=None, hide_account_ids=None, visible_to=None, redeemable_for=None, redeem_fee=None)` | Edit market properties |

### Market Status & Properties

| Method | Description |
|--------|-------------|
| `set_market_status(market_id, status)` | Set status (OPEN, SEMI_PAUSED, PAUSED) |
| `pause_market(market_id)` | Pause trading |
| `unpause_market(market_id)` | Resume trading |
| `semi_pause_market(market_id)` | Semi-pause (cancels only) |
| `rename_market(market_id, name)` | Rename market |
| `set_market_description(market_id, description)` | Set description |
| `pin_market(market_id)` | Pin to top |
| `unpin_market(market_id)` | Unpin |
| `set_market_visibility(market_id, visible_to)` | Set account visibility |
| `set_market_hide_account_ids(market_id, hide)` | Hide/show account IDs |
| `set_market_redeemable(market_id, redeemable_for, redeem_fee)` | Configure redemption |

### Market Types & Groups (Admin)

| Method | Description |
|--------|-------------|
| `create_market_type(name, description, public=False)` | Create category |
| `delete_market_type(market_type_id)` | Delete category |
| `create_market_group(name, description, type_id)` | Create group |

### Account Operations

| Method | Description |
|--------|-------------|
| `create_account(owner_id, name)` | Create alt account |
| `make_transfer(from_account_id, to_account_id, amount, note)` | Transfer funds |
| `act_as(account_id)` | Switch trading account |
| `share_ownership(of_account_id, to_account_id)` | Share account access |
| `revoke_ownership(of_account_id, from_account_id)` | Revoke access |

### Redemption

| Method | Description |
|--------|-------------|
| `redeem(fund_id, amount)` | Redeem shares in redeemable market |

### Auctions

| Method | Description |
|--------|-------------|
| `create_auction(name, description, image_filename=None, bin_price=None)` | Create auction |
| `settle_auction(auction_id, buyer_id, settle_price)` | Settle auction (admin) |
| `buy_auction(auction_id)` | Buy at buy-it-now price |
| `delete_auction(auction_id)` | Delete auction (admin) |

### History

| Method | Description |
|--------|-------------|
| `get_full_order_history(market_id)` | Get all orders for market |
| `get_full_trade_history(market_id)` | Get all trades for market |

### Admin

| Method | Description |
|--------|-------------|
| `set_sudo(enabled)` | Enable/disable sudo mode |

### Low-Level / Connection

| Method | Description |
|--------|-------------|
| `request(message)` | Send request, wait for response |
| `request_many(messages)` | Batch send multiple requests |
| `recv(timeout=None)` | Receive next server message |
| `send(message)` | Send without waiting |
| `wait_portfolio_update(acting_as_only=False)` | Block until portfolio updates |
| `close(code=NORMAL_CLOSURE, reason="")` | Close connection |

## Data Structures

### State

```python
@dataclass
class State:
    user_id: int                                    # Your user account ID
    acting_as: int                                  # Currently active account ID
    sudo_enabled: bool                              # Whether sudo mode is on
    portfolio: websocket_api.Portfolio              # Current account's portfolio
    portfolios: Dict[int, websocket_api.Portfolio]  # All portfolios by account ID
    transfers: List[websocket_api.Transfer]         # Transfer history
    accounts: List[websocket_api.Account]           # All accessible accounts
    markets: Dict[int, MarketData]                  # All markets by ID
    market_name_to_id: Dict[str, int]               # Market name -> ID lookup
    market_types: Dict[int, websocket_api.MarketType]
    market_groups: Dict[int, websocket_api.MarketGroup]
```

### MarketData

```python
@dataclass
class MarketData:
    definition: websocket_api.Market  # Market metadata (id, name, min/max settlement, status)
    trades: List[websocket_api.Trade] # Trade history
    orders: List[websocket_api.Order] # All orders
    bids: List[websocket_api.Order]   # Buy orders (sorted high to low by price)
    offers: List[websocket_api.Order] # Sell orders (sorted low to high by price)
    hasFullOrderHistory: bool         # Whether full history is loaded
    hasFullTradeHistory: bool         # Whether full history is loaded
```

### Key Protobuf Types

Import from `metagame.websocket_api`:

- `Side` - Enum: `BID`, `OFFER`
- `MarketStatus` - Enum: `MARKET_STATUS_OPEN`, `MARKET_STATUS_SEMI_PAUSED`, `MARKET_STATUS_PAUSED`
- `Portfolio` - Account balances and market exposures
- `Market` - Market definition with settlement bounds
- `Order` - Limit order (id, price, size, side, market_id, owner_id)
- `Trade` - Executed trade (buyer_id, seller_id, price, size)
- `Account` - Account metadata
- `Transfer` - Balance transfer record
- `Auction` - Auction listing

## Example Patterns

### Batch Orders

```python
from metagame.websocket_api import ClientMessage, CreateOrder

with TradingClient(api_url, jwt, act_as) as client:
    state = client.state()
    market_id = state.market_name_to_id["My Market"]

    # Place bid and offer simultaneously using batch
    messages = [
        ClientMessage(create_order=CreateOrder(
            market_id=market_id,
            price=49.50,
            size=10.0,
            side=Side.BID
        )),
        ClientMessage(create_order=CreateOrder(
            market_id=market_id,
            price=50.50,
            size=10.0,
            side=Side.OFFER
        ))
    ]
    responses = client.request_many(messages)
```

### Cancel All Orders

```python
# Cancel all orders in a specific market
client.out(market_id=market_id)

# Cancel all bids across all markets
client.out(side=Side.BID)

# Cancel everything
client.out()
```

### Check Position

```python
state = client.state()
portfolio = state.portfolio

print(f"Available balance: {portfolio.available_balance}")
print(f"Total balance: {portfolio.total_balance}")

for exposure in portfolio.market_exposures:
    print(f"Market {exposure.market_id}: position={exposure.position}")
```

## Running Scripts

```bash
# Run a script
uv run my_bot.py

# With explicit python
uv run python my_bot.py
```

## Important Notes

- **Price/Size Quantization**: Values rounded to 0.01 (warnings logged if precision lost)
- **Order Matching**: Price-time priority
- **Rate Limits**: 100 mutations/sec (1000 burst), 180 expensive queries/min
- **Available Balance**: Accounts for worst-case exposure from open positions
- **Prices**: Typically 0-100 for prediction markets (percentage/probability)
- **Market Visibility**: Empty `visible_to` = public; non-empty = restricted

## Error Handling

Handle `RequestFailed` for rejected operations:

```python
from metagame.websocket_api import RequestFailed

try:
    order = client.create_order(market_id, price=50, size=100, side=Side.BID)
except Exception as e:
    # Check response for RequestFailed
    print(f"Order rejected: {e}")
```

## Dependencies

| Package | Purpose |
|---------|---------|
| metagame | Trading client (PyPI) |
| python-dotenv | Environment config |
