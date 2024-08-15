import asyncio
import logging
import random
from decimal import Decimal

from trading_client import TradingClient
from websocket_api import ClientMessage, CreateOrder, Out, RequestFailed, Side

logger = logging.getLogger(__name__)


async def naive_bot(
    client: TradingClient,
    *,
    market_id: int,
    loss_per_trade: Decimal,
    seconds_per_trade: float,
) -> None:
    # Clear out any existing orders
    await send_out_message(client, market_id)

    while True:
        await asyncio.sleep(1)
        messages = await client.get_buffered_messages()
        for _kind, message in messages:
            if isinstance(message, RequestFailed):
                logger.error(
                    f"{message.request_details.kind} request failed: {message.error_details.message}"
                )

        if random.random() >= 1 / seconds_per_trade:
            continue

        market = client.markets.get(market_id)
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

        available_size = min(Decimal(best_bid.size), Decimal(best_offer.size))
        desired_size = loss_per_trade * 2 / spread
        size = min(available_size, desired_size)

        create_order = CreateOrder(
            market_id=market_id, size=str(size.quantize(Decimal("0.01")))
        )

        if random.random() < 0.5:
            create_order.side = Side.BID
            create_order.price = best_offer.price
            side_str = "BID"
        else:
            create_order.side = Side.OFFER
            create_order.price = best_bid.price
            side_str = "OFFER"

        logger.info(
            f"""\
Market {market_id}: Placing {side_str} order, \
spread {spread}, size {size}, price {create_order.price}"""
        )

        msg = ClientMessage(create_order=create_order)
        await client.send(msg)
        await send_out_message(client, market_id)


async def send_out_message(client: TradingClient, market_id: int) -> None:
    msg = ClientMessage(out=Out(market_id=market_id))
    await client.send(msg)
    logger.debug(f"Sent OUT message for market {market_id}")
