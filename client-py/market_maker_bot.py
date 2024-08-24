import logging
from time import sleep
from typing import Optional

import typer
from dotenv import load_dotenv
from trading_client import TradingClient
from typing_extensions import Annotated
from websocket_api import ClientMessage, CreateOrder, Side

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()


def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[str, typer.Option(envvar="ACT_AS")],
    market_id: int,
    spread: float,
    size: float,
    fade_per_order: float,
    prior: Optional[float] = None,
):
    with TradingClient(api_url, jwt, act_as) as client:
        market_maker_bot(
            client,
            market_id=market_id,
            spread=spread,
            size=size,
            fade_per_order=fade_per_order,
            prior=prior,
        )


def market_maker_bot(
    client: TradingClient,
    *,
    market_id: int,
    spread: float,
    size: float,
    fade_per_order: float,
    prior: Optional[float] = None,
) -> None:
    # Clear out any existing orders
    client.out(market_id)
    logger.info(f"Starting market maker bot for market {market_id}")

    while True:
        sleep(1)
        state = client.state()
        market = state.markets.get(market_id)
        if market is None:
            logger.info(f"No market data available for market {market_id}")
            return

        if prior is None:
            prior = (float(market.max_settlement) + float(market.min_settlement)) / 2

        current_position = next(
            (
                float(exp.position)
                for exp in state.portfolio.market_exposures
                if exp.market_id == market_id
            ),
            0,
        )
        logger.info(f"Current position: {current_position}")

        our_bids = [
            float(order.price)
            for order in market.orders
            if order.side == Side.BID and order.owner_id == state.acting_as.user_id
        ]
        our_offers = [
            float(order.price)
            for order in market.orders
            if order.side == Side.OFFER and order.owner_id == state.acting_as.user_id
        ]

        try:
            our_best_bid = max(our_bids)
        except ValueError:
            our_best_bid = float(market.min_settlement)
        try:
            our_best_offer = min(our_offers)
        except ValueError:
            our_best_offer = float(market.max_settlement)

        our_current_spread = our_best_offer - our_best_bid
        logger.info(f"Current spread: {our_current_spread}")
        if our_current_spread <= spread:
            return

        fair_price = prior - round(float(current_position) / size) * fade_per_order

        def clamp(value: float):
            assert market is not None
            return round(
                max(
                    float(market.min_settlement),
                    min(float(market.max_settlement), value),
                ),
                2,
            )

        desired_bid_prices = [
            bid
            for i in range(5 - len(our_bids))
            if (bid := clamp((fair_price - i * fade_per_order - spread / 2)))
            not in our_bids
        ]
        desired_offer_prices = [
            offer
            for i in range(5 - len(our_offers))
            if (offer := clamp((fair_price + i * fade_per_order + spread / 2)))
            not in our_offers
        ]
        bids = [
            ClientMessage(
                create_order=CreateOrder(
                    market_id=market_id,
                    price=str(bid_price),
                    size=str(size),
                    side=Side.BID,
                )
            )
            for bid_price in desired_bid_prices
        ]
        offers = [
            ClientMessage(
                create_order=CreateOrder(
                    market_id=market_id,
                    price=str(offer_price),
                    size=str(size),
                    side=Side.OFFER,
                )
            )
            for offer_price in desired_offer_prices
        ]
        logger.info(f"Placing {len(bids)} bids and {len(offers)} offers")
        client.request_many(bids + offers)
