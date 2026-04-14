import logging
from time import sleep, time
from typing import Annotated, Optional

import typer
import math
import random
from dotenv import load_dotenv
from metagame import TradingClient
from metagame.websocket_api import CancelOrder, ClientMessage, CreateOrder, Side
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = typer.Typer(pretty_exceptions_show_locals=False)


class TWAPState(BaseModel):
    next_trade_time: float | None = None
    desired_position: float = 0
    end_time: float

@app.command()
def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[int, typer.Option(envvar="ACT_AS")],
    market_name: str,
    desired_position: float,
    seconds_per_trade: float = 5.0,
    end_time: float = 300.0,
):
    with TradingClient(api_url, jwt, act_as) as client:
        market_id = client.state().market_name_to_id[market_name]
        state = TWAPState(next_trade_time=None, end_time=end_time, desired_position=desired_position)
        start_time = time()
        while True:
            state = step_twap(client, market_id, time() - start_time, state, seconds_per_trade)
            sleep(0.1)


def step_twap(
    client: TradingClient,
    market_id: int,
    time: float,
    state: TWAPState,
    seconds_per_trade: float,
) -> TWAPState:
    if state.next_trade_time is None:
        state.next_trade_time = time + seconds_per_trade
        return state
    if time < state.next_trade_time:
        return state
    state.next_trade_time = time + seconds_per_trade
    logger.info(f"In market {market_id}, time {time}, next trade time {state.next_trade_time}, time left {state.end_time - time}")

    client_state = client.state()
    market = client_state.markets.get(market_id)
    assert market is not None

    my_position = next(
        (exp.position for exp in client_state.portfolio.market_exposures if exp.market_id == market_id),
        0,
    )

    remaining_trades = (state.end_time - time) / seconds_per_trade
    shortfall = (state.desired_position - my_position)

    side = Side.BID if shortfall > 0 else Side.OFFER

    if abs(shortfall) < .05:
        print("Alice Done!")
        return state
    if remaining_trades <= 1:
        signed_size = shortfall
        size = abs(signed_size)
        print("Alice Nearly Done!")
    else:
        signed_size = shortfall / remaining_trades
        base = math.floor(abs(signed_size)*100)/100
        remainder = abs(signed_size) - base
        if random.random() > remainder/.01:
            size = base
        else:
            size = base + .01

    if size == 0:
        return state

    if side == Side.BID:
        price = market.definition.max_settlement
    else:
        price = market.definition.min_settlement
    logger.info(f"size: {size}")
    for _ in range(5):
        try:
            client.create_order(market_id=market_id, price=price, size=size, side=side)
            break
        except Exception as e:
            logger.error(f"Error placing order: {e}")
            sleep(0.1)

    for _ in range(5):
        try:
            client.out(market_id)
            break
        except Exception as e:
            logger.error(f"Error placing out: {e}")
            sleep(0.1)
    return state



if __name__ == "__main__":
    app()
