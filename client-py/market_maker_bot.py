import asyncio
import logging
from decimal import Decimal
from typing import Optional

import http_api.models as http_models
import websocket_api as ws_models
from http_api.api.default import create_order, out
from http_api.client import AuthenticatedClient
from utils import handle_detailed_response
from websocket_client import WebsocketClient

logger = logging.getLogger(__name__)


async def market_maker_bot(
    websocket_client: WebsocketClient,
    http_client: AuthenticatedClient,
    *,
    market_id: int,
    spread: Decimal,
    size: Decimal,
    fade_per_order: Decimal,
    prior: Optional[Decimal] = None,
) -> None:
    # Clear out any existing orders
    handle_detailed_response(
        await out.asyncio_detailed(
            client=http_client,
            body=http_models.Out(market_id=market_id),
            act_as=websocket_client.acting_as.user_id,
        )
    )
    logger.info(f"Starting market maker bot for market {market_id}")
    size = size.quantize(Decimal("0.01"))

    async def iteration():
        market = websocket_client.markets.get(market_id)
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
                for exp in websocket_client.portfolio.market_exposures
                if exp.market_id == market_id
            ),
            Decimal(0),
        )
        logger.info(f"Current position: {current_position}")

        our_bids = [
            order
            for order in market.orders
            if order.side == ws_models.Side.BID
            and order.owner_id == websocket_client.acting_as.user_id
        ]
        our_offers = [
            order
            for order in market.orders
            if order.side == ws_models.Side.OFFER
            and order.owner_id == websocket_client.acting_as.user_id
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
        logger.info(f"Current spread: {our_current_spread}")
        if our_current_spread <= spread:
            return

        fair_price = prior - round(Decimal(current_position) / size) * fade_per_order
        fair_price = prior - round(Decimal(current_position) / size) * fade_per_order

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
            create_order_body = http_models.CreateOrder(
                market_id=market_id,
                price=str(bid_price),
                size=str(size),
                side=http_models.Side.BID,
            )
            handle_detailed_response(
                await create_order.asyncio_detailed(
                    client=http_client,
                    body=create_order_body,
                    act_as=websocket_client.acting_as.user_id,
                )
            )
        for offer_price in desired_offers:
            if any(Decimal(out_offer.price) == offer_price for out_offer in our_offers):
                continue
            logger.info(f"Creating offer at {offer_price}")
            create_order_body = http_models.CreateOrder(
                market_id=market_id,
                price=str(offer_price),
                size=str(size),
                side=http_models.Side.OFFER,
            )
            handle_detailed_response(
                await create_order.asyncio_detailed(
                    client=http_client,
                    body=create_order_body,
                    act_as=websocket_client.acting_as.user_id,
                )
            )

    await iteration()
    while True:
        await asyncio.sleep(2)
        await websocket_client.get_buffered_messages()
        await iteration()
