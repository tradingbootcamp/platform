import asyncio
import logging
from typing import Annotated

import typer
from dotenv import load_dotenv

from constants import agg_market_name_len, arbs
from metagame import TradingClient
from metagame.websocket_api import ClientMessage, CreateOrder, Side
import time as timer

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)
load_dotenv()
app = typer.Typer(pretty_exceptions_show_locals=False)

# def round(n: float, up: bool=False):
#     import math
#     if up:
#         return math.ceil(n * 100) / 100
#     return math.floor(n * 100) / 100


def fair_price_abc(a, b, c, abc):
    return a + b + c + (abc * 0.5)


def delta_abc(a, b, c, abc):
    return fair_price_abc(a, b, c, abc) - abc


def fair_price(x, etf):
    return x + (etf / 6)


def get_35(orders):
    try:
        return orders[34]
    except IndexError:
        return orders[-1]


# TODO: ensure position is not too far from 0
def get_orders_to_fulfill_size(state, market_name):
    market_id = state.market_name_to_id[market_name]
    market = state.markets.get(market_id)
    top_offers = [
        order
        for order in sorted(market.orders, key=lambda x: x.price)
        if order.side == Side.OFFER
    ]

    top_bids = [
        order
        for order in sorted(market.orders, key=lambda x: x.price)
        if order.side == Side.BID
    ]

    bid = get_35(top_bids)
    offer = get_35(top_offers)

    spread = top_bids[0].price - top_offers[0].price

    return (bid, offer, spread)


async def run_arb_if_profitable(client, arb: dict):
    while True:
        state = client.state()
        timer.sleep(1)

        for market_name in arb.items():
            (bid, offer, spread) = get_orders_to_fulfill_size(state, market_name[0])
            print(bid, offer, spread)
            if int(spread) < 3.0:
                client.create_order(market_name[0], bid.price + 0.01, 1, Side.BID)
                client.create_order(market_name[0], offer.price - 0.01, 1, Side.OFFER)
                logging.info(f"Order place: {market_name[0]}")


async def arbs_bot(
    client: TradingClient,
    *,
    arbs: list[dict],
):
    # Run all arb strategies concurrently
    # 4 reads
    # 3 arbs * max 1 reqs per arb
    # 7 max
    # 100/s rate limit: 100 / 7 = 14x/s max runs
    # TOOD: try pulling state here if we hit ratelimits too often

    tasks = [run_arb_if_profitable(client, arb) for arb in arbs]
    await asyncio.gather(*tasks)


@app.command()
def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[int, typer.Option(envvar="ACT_AS")],
):
    with TradingClient(api_url, jwt, act_as) as client:
        asyncio.run(arbs_bot(client, arbs=arbs))


if __name__ == "__main__":
    app()
