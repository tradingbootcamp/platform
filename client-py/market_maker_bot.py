import logging
import asyncio
from decimal import Decimal
from typing import Optional

from trading_client import TradingClient
from websocket_api import (
    ClientMessage,
    CreateOrder,
    Out,
    Portfolio,
    RequestFailed,
    Side,
)

logger = logging.getLogger(__name__)


async def market_maker_bot(
    client: TradingClient,
    *,
    market_id: int,
    spread: Decimal,
    size: Decimal,
    fade: Decimal,
    prior: Optional[Decimal] = None,
) -> None:
    fade_per_order = fade * size
    await send_out_message(client, market_id)
    logger.info(f"Starting market maker bot for market {market_id}")

    async def iteration():
        market = client.markets.get(market_id)
        if market is None:
            logger.info(f"No market data available for market {market_id}")
            return

        nonlocal prior
        if prior is None:
            prior = (
                Decimal(market.max_settlement) + Decimal(market.min_settlement)
            ) / 2

        current_position = next(
            (
                Decimal(exp.position)
                for exp in client.portfolio.market_exposures
                if exp.market_id == market_id
            ),
            Decimal(0),
        )
        logger.info(f"Current position: {current_position}")

        our_bids = [
            order
            for order in market.orders
            if order.side == Side.BID and order.owner_id == client.acting_as.user_id
        ]
        our_offers = [
            order
            for order in market.orders
            if order.side == Side.OFFER and order.owner_id == client.acting_as.user_id
        ]

        try:
            our_best_bid = max(our_bids, key=lambda x: Decimal(x.price)).price
        except ValueError:
            our_best_bid = Decimal(market.min_settlement)
        try:
            our_best_offer = min(our_offers, key=lambda x: Decimal(x.price)).price
        except ValueError:
            our_best_offer = Decimal(market.max_settlement)

        our_current_spread = Decimal(our_best_offer) - Decimal(our_best_bid)
        logger.info(f"Current spread: {our_current_spread}")
        if our_current_spread <= spread:
            return

        fair_price = prior - round(Decimal(current_position) * fade)

        def clamp(value: Decimal):
            assert market is not None
            return max(
                Decimal(market.min_settlement),
                min(Decimal(market.max_settlement), value),
            )

        desired_bids = [
            clamp(
                (fair_price - i * fade_per_order - spread / 2).quantize(Decimal("0.01"))
            )
            for i in range(5)
        ]
        desired_offers = [
            clamp(
                (fair_price + i * fade_per_order + spread / 2).quantize(Decimal("0.01"))
            )
            for i in range(5)
        ]

        for bid_price in desired_bids:
            if any(Decimal(our_bid.price) == bid_price for our_bid in our_bids):
                continue
            logger.info(f"Creating bid at {bid_price}")
            create_order = ClientMessage(
                create_order=CreateOrder(
                    market_id=market_id,
                    price=str(bid_price),
                    size=str(size),
                    side=Side.BID,
                )
            )
            await client.send(create_order)
        for offer_price in desired_offers:
            if any(Decimal(out_offer.price) == offer_price for out_offer in our_offers):
                continue
            logger.info(f"Creating offer at {offer_price}")
            create_order = ClientMessage(
                create_order=CreateOrder(
                    market_id=market_id,
                    price=str(offer_price),
                    size=str(size),
                    side=Side.OFFER,
                )
            )
            await client.send(create_order)
    
    while True:
        await asyncio.sleep(2)
        await client.get_buffered_messages()
        await iteration()


async def send_out_message(client: TradingClient, market_id: int) -> None:
    msg = ClientMessage(out=Out(market_id=market_id))
    await client.send(msg)
    logger.debug(f"Sent OUT message for market {market_id}")
