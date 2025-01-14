import logging
from time import sleep
from typing import Optional

import typer
from dotenv import load_dotenv
from trading_client import TradingClient
from typing_extensions import Annotated
from websocket_api import CancelOrder, ClientMessage, CreateOrder, Side

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = typer.Typer(pretty_exceptions_show_locals=False)


@app.command()
def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[str, typer.Option(envvar="ACT_AS")],
    market_name: str,
    spread: float = 1.0,
    size: float = 1.0,
    fade_per_order: float = 1.0,
    prior: Optional[float] = None,
):
    with TradingClient(api_url, jwt, act_as) as client:
        market_maker_bot(
            client,
            market_name=market_name,
            spread=spread,
            size=size,
            fade_per_order=fade_per_order,
            prior=prior,
        )


def market_maker_bot(
    client: TradingClient,
    *,
    market_name: str,
    spread: float,
    size: float,
    fade_per_order: float,
    prior: Optional[float] = None,
) -> None:
    # Clear out any existing orders
    market_id = client.state().market_name_to_id[market_name]
    client.out(market_id)
    logger.info(f"Starting market maker bot for market {market_name}")

    while True:
        sleep(1)
        state = client.state()
        market = state.markets.get(market_id)
        if market is None:
            logger.info(f"No market data available for market {market_id}")
            continue

        if prior is None:
            prior = (
                market.definition.max_settlement + market.definition.min_settlement
            ) / 2

        current_position = next(
            (
                exp.position
                for exp in state.portfolio.market_exposures
                if exp.market_id == market_id
            ),
            0,
        )
        logger.info(f"Current position: {current_position}")

        our_bids = [
            order.price
            for order in market.orders
            if order.side == Side.BID and order.owner_id == state.acting_as.user_id
        ]
        our_offers = [
            order.price
            for order in market.orders
            if order.side == Side.OFFER and order.owner_id == state.acting_as.user_id
        ]

        our_best_bid = max(our_bids + [market.definition.min_settlement])
        our_best_offer = min(our_offers + [market.definition.max_settlement])

        our_current_spread = our_best_offer - our_best_bid
        logger.info(f"Current spread: {our_current_spread}")
        if our_current_spread <= spread:
            continue

        fair_price = prior - round(current_position / size) * fade_per_order
        logger.info(f"Current fair: {fair_price}")

        def clamp(value: float):
            assert market is not None
            return round(
                max(
                    market.definition.min_settlement,
                    min(market.definition.max_settlement, value),
                ),
                2,
            )

        desired_bid_prices = [
            clamp((fair_price - i * fade_per_order - spread / 2)) for i in range(5)
        ]
        desired_offer_prices = [
            clamp((fair_price + i * fade_per_order + spread / 2)) for i in range(5)
        ]

        new_bid_prices = [bid for bid in desired_bid_prices if bid not in our_bids]
        new_offer_prices = [
            offer for offer in desired_offer_prices if offer not in our_offers
        ]
        new_cancel_prices = [
            bid for bid in our_bids if bid not in desired_bid_prices
        ] + [offer for offer in our_offers if offer not in desired_offer_prices]
        new_cancel_ids = [
            order.id
            for order in market.orders
            for price in new_cancel_prices
            if order.price == price and order.owner_id == state.acting_as.user_id
        ]

        bids = [
            ClientMessage(
                create_order=CreateOrder(
                    market_id=market_id,
                    price=bid_price,
                    size=size,
                    side=Side.BID,
                )
            )
            for bid_price in new_bid_prices
        ]
        offers = [
            ClientMessage(
                create_order=CreateOrder(
                    market_id=market_id,
                    price=offer_price,
                    size=size,
                    side=Side.OFFER,
                )
            )
            for offer_price in new_offer_prices
        ]
        cancels = [
            ClientMessage(cancel_order=CancelOrder(id=id)) for id in new_cancel_ids
        ]
        logger.info(
            f"Placing {len(bids)} bids, {len(offers)} offers, and {len(cancels)} cancels"
        )
        client.request_many(bids + offers + cancels)


if __name__ == "__main__":
    app()
