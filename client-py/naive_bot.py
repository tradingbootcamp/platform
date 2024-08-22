import asyncio
import logging
import random
from decimal import Decimal

import http_api.models as http_models
import websocket_api as ws_models
from http_api.api.default import create_order, out
from http_api.client import AuthenticatedClient
from utils import handle_detailed_response
from websocket_client import WebsocketClient

logger = logging.getLogger(__name__)


async def naive_bot(
    websocket_client: WebsocketClient,
    http_client: AuthenticatedClient,
    *,
    market_id: int,
    loss_per_trade: Decimal,
    max_size: Decimal,
    seconds_per_trade: float,
) -> None:
    # Clear out any existing orders
    handle_detailed_response(
        await out.asyncio_detailed(
            client=http_client,
            body=http_models.Out(market_id=market_id),
            act_as=websocket_client.acting_as.user_id,
        )
    )

    while True:
        await asyncio.sleep(1)
        await websocket_client.get_buffered_messages()

        if random.random() >= (1 / seconds_per_trade):
            continue

        market = websocket_client.markets.get(market_id)
        if not market or not market.orders:
            logger.info(f"No market data available for market {market_id}")
            continue

        bids = [order for order in market.orders if order.side == ws_models.Side.BID]
        offers = [
            order for order in market.orders if order.side == ws_models.Side.OFFER
        ]

        if not bids or not offers:
            logger.info(f"No bids or offers available for market {market_id}")
            continue

        best_bid = max(bids, key=lambda x: Decimal(x.price))
        best_offer = min(offers, key=lambda x: Decimal(x.price))
        spread = Decimal(best_offer.price) - Decimal(best_bid.price)

        available_size = min(Decimal(best_bid.size), Decimal(best_offer.size))
        desired_size = min(loss_per_trade * 2 / spread, max_size)
        size = min(available_size, desired_size)
        size_str = str(size.quantize(Decimal("0.01")))

        if random.random() < 0.5:
            side = http_models.Side.BID
            price = best_offer.price
            side_str = "BID"
        else:
            side = http_models.Side.OFFER
            price = best_bid.price
            side_str = "OFFER"

        create_order_body = http_models.CreateOrder(
            market_id=market_id,
            side=side,
            size=size_str,
            price=price,
        )

        logger.info(
            f"""\
Market {market_id}: Placing {side_str} order, \
spread {spread}, size {size_str}, price {create_order_body.price}"""
        )

        handle_detailed_response(
            await create_order.asyncio_detailed(
                client=http_client,
                body=create_order_body,
                act_as=websocket_client.acting_as.user_id,
            )
        )

        handle_detailed_response(
            await out.asyncio_detailed(
                client=http_client,
                body=http_models.Out(market_id=market_id),
                act_as=websocket_client.acting_as.user_id,
            )
        )
