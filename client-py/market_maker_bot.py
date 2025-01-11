import logging
import math
from time import sleep
from typing import Optional

import typer
from dotenv import load_dotenv
from trading_client import TradingClient
from typing_extensions import Annotated
from websocket_api import ClientMessage, CreateOrder, CancelOrder, Side

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = typer.Typer(pretty_exceptions_show_locals=False)


@app.command()
def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[str, typer.Option(envvar="ACT_AS")],
    market_id: int,
    spread: float = 1.0,
    size: float = 1.0,
    fade_per_order: Optional[float] = None,
    fade: Optional[float] = None,
    temp_fade: float = 0,
    temp_fade_half_life: float = 10,
    depth: int = 5,
    prior: Optional[float] = None,
):
    if fade_per_order is not None:
        assert(fade is None)
    elif fade is not None:
        assert(fade_per_order is None)
        fade_per_order = fade * size
    with TradingClient(api_url, jwt, act_as) as client:
        market_maker_bot(
            client,
            market_id=market_id,
            spread=spread,
            size=size,
            fade_per_order=fade_per_order,
            temp_fade=temp_fade,
            temp_fade_half_life=temp_fade_half_life,
            depth=depth,
            prior=prior,
        )


def market_maker_bot(
    client: TradingClient,
    *,
    market_id: int,
    spread: float,
    size: float,
    fade_per_order: float,
    temp_fade: float,
    temp_fade_half_life: float,
    depth: int,
    prior: Optional[float] = None,
) -> None:
    fade = fade_per_order / size
    
    def clamp(value: float):
            assert market is not None
            return round(
                max(
                    market.min_settlement,
                    min(market.max_settlement, value),
                ),
                2,
            )
    
    # Clear out any existing orders
    client.out(market_id)
    logger.info(f"Starting market maker bot for market {market_id}")

    temp_fade_sell = 0
    temp_fade_buy = 0
    temp_fade_decay_per_second = math.pow(0.5, 1/temp_fade_half_life)
    logger.info(f"Temp fade is being multiplied by {temp_fade_decay_per_second} every second")

    last_fair = None

    while True:
        sleep(1)

        state = client.state()
        market = state.markets.get(market_id)
        if market is None:
            logger.info(f"No market data available for market {market_id}")
            continue

        if prior is None:
            prior = (market.max_settlement + market.min_settlement) / 2

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

        our_best_bid = max(our_bids + [market.min_settlement])
        our_best_offer = min(our_offers + [market.max_settlement])

        fair_price = prior - round(current_position / (size*2)) * fade_per_order*2
        if last_fair is None:
            last_fair = fair_price
        d_price = fair_price - last_fair
        d_cts = d_price / fade
        if last_fair > fair_price:
            logger.info(f"Fair decreased by {-d_price}!")
            temp_fade_buy += temp_fade*-(d_cts+0.5)
        elif last_fair < fair_price:
            logger.info(f"Fair increased by {d_price}!")
            temp_fade_sell += temp_fade*(d_cts+0.5)
        last_fair = fair_price
        logger.info(f"Current fair: {fair_price}")


        temp_fade_buy *= temp_fade_decay_per_second
        temp_fade_sell *= temp_fade_decay_per_second
        if temp_fade_buy < 0.1 * temp_fade:
            temp_fade_buy = 0
        if temp_fade_sell < 0.1 * temp_fade:
            temp_fade_sell = 0
        logger.info(f"Temp fades: {temp_fade_buy}:{temp_fade_sell}")


        our_desired_best_bid = clamp(fair_price - spread / 2 - temp_fade_buy)
        our_desired_best_offer = clamp(fair_price + spread / 2 + temp_fade_sell)
        
        logger.info(f"Current spread: {our_best_bid}@{our_best_offer} Goal spread: {our_desired_best_bid}@{our_desired_best_offer}")
        if our_best_bid == our_desired_best_bid and our_best_offer == our_desired_best_offer:
            continue

        desired_bid_prices = [
            clamp((fair_price - i * fade_per_order * 2 - spread / 2))
            for i in range(depth)
            if i*fade_per_order >= temp_fade_buy or i == depth-1
        ]
        desired_offer_prices = [
            clamp((fair_price + i * fade_per_order * 2 + spread / 2))
            for i in range(depth)
            if i*fade_per_order >= temp_fade_sell or i == depth-1
        ]

        new_bid_prices = [
            bid for bid in desired_bid_prices if bid not in our_bids
        ]
        new_offer_prices = [
            offer for offer in desired_offer_prices if offer not in our_offers
        ]
        new_cancel_prices = [
            bid for bid in our_bids if bid not in desired_bid_prices
        ] + [
            offer for offer in our_offers if offer not in desired_offer_prices
        ]
        new_cancel_ids = [
            order.id
            for order in market.orders
            for price in new_cancel_prices if order.price == price and order.owner_id == state.acting_as.user_id
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
            ClientMessage(
                cancel_order=CancelOrder(
                    id=id
                )
            ) for id in new_cancel_ids
        ]
        logger.info(f"Placing {len(bids)} bids, {len(offers)} offers, and {len(cancels)} cancels")
        if len(bids+offers+cancels) > 0:
            client.request_many(bids + offers + cancels)


if __name__ == "__main__":
    app()
