import asyncio
import logging
from typing import Annotated

import typer
from dotenv import load_dotenv

from constants import agg_market_name_len, arbs
from metagame import TradingClient
from metagame.websocket_api import ClientMessage, CreateOrder, Side

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)
load_dotenv()
app = typer.Typer(pretty_exceptions_show_locals=False)

# def round(n: float, up: bool=False):
#     import math
#     if up:
#         return math.ceil(n * 100) / 100
#     return math.floor(n * 100) / 100

# TODO: ensure position is not too far from 0
def get_orders_to_fulfill_size(state, market_name, size):
    market_id = state.market_name_to_id[market_name]
    market = state.markets.get(market_id)
    orders = []
    epsilon = 10
    cutoff = size * 2 * epsilon
    top_offers = [
        order
        for order in
        sorted(market.orders, key=lambda x: x.price)
        if order.side == Side.OFFER
    ][:cutoff]
    top_bids = [
        order
        for order in sorted(market.orders, key=lambda x: x.price)
        if order.side == Side.BID
    ][:cutoff][::-1]
    if size > 0:
        for order in top_offers:
            order.size = size # avoid order.size > size
            size += order.size
            orders.append((market_id, order))
    else:
        for order in top_bids: # reverse reverse
            order.size = size
            size -= order.size
            orders.append((market_id, order))
    return orders,

async def run_arb_if_profitable(client, arb: dict):
    while True:
        try:
            state = client.recv(timeout=0)
        except TimeoutError:
            continue
        expected_profit = 0
        orders = []
        redeem_id, redeem_amount = None, None
        for market_name, size in arb.items():
            orders.extend(get_orders_to_fulfill_size(state, market_name, size))
            expected_profit += sum(order.price for order in orders)
            if len(market_name) == agg_market_name_len:
                redeem_id = market_name
                if size < 0:
                    redeem_amount = max(order.price for order in orders)
                else:
                    redeem_amount = min(order.price for order in orders)
        if expected_profit > 0:
            client.redeem(redeem_id, redeem_amount)

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
        asyncio.run(
            arbs_bot(
                client,
                arbs=arbs
            )
        )

if __name__ == "__main__":
    app()
