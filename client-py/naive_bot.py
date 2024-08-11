import asyncio
import logging
import random
from decimal import Decimal

import websockets
from state import State
from websocket_api import ClientMessage, CreateOrder, Out, Side

logger = logging.getLogger(__name__)


async def naive_bot(
    state: State,
    ws: websockets.WebSocketClientProtocol,
    *,
    market_id: int,
    loss_per_trade: Decimal,
    seconds_per_trade: float,
) -> None:
    # Clear out any existing orders
    await send_out_message(ws, market_id)

    while True:
        # Update state for exactly one second
        try:
            async with asyncio.timeout(1):
                while True:
                    await state.recv(ws)
        except TimeoutError:
            # One second has passed, continue with trading logic
            pass

        # Decide whether to trade (on average, once every seconds_per_trade)
        if random.random() >= 1 / seconds_per_trade:
            continue

        market = state.markets.get(market_id)
        if not market or not market.orders:
            logger.debug(f"No market data available for market {market_id}")
            continue

        bids = [order for order in market.orders if order.side == Side.BID]
        offers = [order for order in market.orders if order.side == Side.OFFER]

        if not bids or not offers:
            logger.debug(f"No bids or offers available for market {market_id}")
            continue

        best_bid = max(bids, key=lambda x: Decimal(x.price))
        best_offer = min(offers, key=lambda x: Decimal(x.price))
        spread = Decimal(best_offer.price) - Decimal(best_bid.price)

        # Calculate the maximum size the bot is willing to trade
        available_size = min(Decimal(best_bid.size), Decimal(best_offer.size))
        desired_size = loss_per_trade * 2 / spread
        size = min(available_size, desired_size)

        # Create the base CreateOrder message
        create_order = CreateOrder(market_id=market_id, size=str(size))

        # Randomly choose whether to buy or sell
        if random.random() < 0.5:
            create_order.side = Side.BID
            create_order.price = best_offer.price
            side_str = "BID"
        else:
            create_order.side = Side.OFFER
            create_order.price = best_bid.price
            side_str = "OFFER"

        logger.info(
            f"Market {market_id}: Placing {side_str} order, spread {spread}, size {size}, price {create_order.price}"
        )

        order = ClientMessage(create_order=create_order)
        await ws.send(bytes(order))
        await send_out_message(ws, market_id)


async def send_out_message(
    ws: websockets.WebSocketClientProtocol, market_id: int
) -> None:
    out_message = ClientMessage(out=Out(market_id=market_id))
    await ws.send(bytes(out_message))
    logger.debug(f"Sent OUT message for market {market_id}")
