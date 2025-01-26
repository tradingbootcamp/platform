import asyncio
import logging
import time
from datetime import datetime
from typing import Annotated

import typer
from dotenv import load_dotenv

from constants import agg_market_name_len, arbs
from metagame import TradingClient
from metagame.websocket_api import ClientMessage, CreateOrder, Side

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()
app = typer.Typer(pretty_exceptions_show_locals=False)


# def round(n: float, up: bool = False):
#     import math
#
#     if up:
#         return math.ceil(n * 100) / 100
#     return math.floor(n * 100) / 100


# TODO: ensure position is not too far from 0
def get_orders_to_fulfill_size(state, market_name, size):
    market_id = state.market_name_to_id[market_name]
    market = state.markets.get(market_id)
    orders = []
    if size > 0:
        top_offers = [
            order
            for order in sorted(market.orders, key=lambda x: x.price)
            if order.side == Side.OFFER
        ][::-1]
        for order in top_offers:
            order.size = min(size, order.size)
            if order.size == 0:
                break
            size -= order.size
            orders.append((market_id, order))
    else:
        top_bids = [
            order
            for order in sorted(market.orders, key=lambda x: x.price)
            if order.side == Side.BID
        ]
        for order in top_bids:
            # size is neg | order.size is pos
            order.size = min(abs(size), order.size)
            if order.size == 0:
                break
            size += order.size
            orders.append((market_id, order))
    return orders


def fill_orders(client, orders):
    bids = []
    offers = []
    for market_id, order in orders:
        # client.out(market_id)
        if order.side == Side.OFFER:
            bids.append(
                ClientMessage(
                    create_order=CreateOrder(
                        market_id, order.price, order.size, Side.BID
                    )
                )
            )
        else:
            offers.append(
                ClientMessage(
                    create_order=CreateOrder(
                        market_id, order.price, order.size, Side.OFFER
                    )
                )
            )
    client.request_many(bids + offers)


def run_arb_if_profitable(state, client, arb: dict):
    # TODO
    # +/- epsilon: .51
    expected_profit = 0
    orders = []
    # redeem_id, redeem_amount, redeem_market = None, 0, ""
    for market_name, size in arb.items():
        # size *= constants.multiplier
        new_orders = get_orders_to_fulfill_size(state, market_name, size)
        # orders.extend(new_orders)
        if len(market_name) == agg_market_name_len:
            # redeem_id = new_orders[0][0]
            redeem_market = market_name
            # redeem_amount = size
            # redeem_market_id = state.market_name_to_id[market_name]
        if size < 0:
            expected_profit += sum(order.price * order.size for _, order in new_orders)
        else:
            expected_profit -= sum(order.price * order.size for _, order in new_orders)
        orders.extend(new_orders)
    # if expected_profit - transaction_fee - 2 > 0:
    #     redeem_amount += 0.51
    #     logger.info(f"executing in market {redeem_market} for +0.51 {expected_profit}, {redeem_amount}")
    #     client.redeem(redeem_id, redeem_amount)
    if expected_profit > 0:
        logger.info(
            f"{datetime.now()}: executing in market {redeem_market} for expected profit {expected_profit}"
        )
        fill_orders(client, orders)
    else:
        logger.info(
            f"{datetime.now()}: not executing in market {redeem_market} for expected profit {expected_profit}"
        )
        # current_position = next(
        #     (
        #         exp.position
        #         for exp in state.portfolio.market_exposures
        #         if exp.market_id == market_id
        #     ),
        #     0,
        # )
        # client.redeem(redeem_id, redeem_amount)


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
    while True:
        time.sleep(2)
        state = client.state()
        for arb in arbs:
            run_arb_if_profitable(state, client, arb)
    # TODO
    # while True:
    #     time.sleep(2)
    #     state = client.state()
    #     tasks = [run_arb_if_profitable(state, client, arb) for arb in arbs]
    #     await asyncio.gather(*tasks)


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
