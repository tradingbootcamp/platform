import logging
import random
from time import sleep
import math

import typer
from dotenv import load_dotenv
from trading_client import TradingClient
from typing_extensions import Annotated
from websocket_api import Side

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
    loss_per_trade: float = 1.0,
    max_size: float = 1.0,
    seconds_per_trade: float = 1.0,
    trades_per_chance: int = 1,
    loss_falloff: float = 1.0,
    always_trade_in_full: bool = False,
    trade_offset: float = 0.0
):
    """
    Note: If use_loss_falloff is wrong, the desired size function is changed such that the effective loss may be completely different from loss_per_trade.
          loss_per_trade should be interpreted as the loss-per-trade when the spread is 1 (*before* capping size at max_size).
          I've made a graph here: https://www.desmos.com/calculator/toylhnw4ia
          The right parameters to define for this are probably max_loss_per_trade, optimal_spread. Then we should be able to solve for loss_per_trade and max_size.
    """
    with TradingClient(api_url, jwt, act_as) as client:
        naive_bot(
            client,
            market_id=market_id,
            loss_per_trade=loss_per_trade,
            max_size=max_size,
            seconds_per_trade=seconds_per_trade,
            trades_per_chance=trades_per_chance,
            loss_falloff=loss_falloff,
            always_trade_in_full=always_trade_in_full,
            trade_offset=trade_offset
        )

#@app.command()
#def quadratic(
#    jwt: Annotated[str, typer.Option(envvar="JWT")],
#    api_url: Annotated[str, typer.Option(envvar="API_URL")],
#    act_as: Annotated[str, typer.Option(envvar="ACT_AS")],
#    market_id: int,
#    max_loss_per_trade: float = 1.0,
#    optimal_spread: float = 1.0,
#    seconds_per_trade: float = 1.0,
#    ):
#    # uhh need to do this math
#    with TradingClient(api_url, jwt, act_as) as client:
#        naive_bot(
#            client,
#            market_id=market_id,
#            loss_per_trade=loss_per_trade,
#            max_size=max_size,
#            seconds_per_trade=seconds_per_trade,
#            use_quadratic=True
#        )


def naive_bot(
    client: TradingClient,
    *,
    market_id: int,
    loss_per_trade: float,
    max_size: float,
    seconds_per_trade: float,
    trades_per_chance: int,
    loss_falloff: float,
    always_trade_in_full: bool,
    trade_offset: float
):
    client.out(market_id)

    def trade():
        state = client.state()
        market = state.markets.get(market_id)
        if not market or not market.orders:
            logger.info(f"No market data available for market {market_id}")
            return
        
        positions = [x for x in state.portfolio.market_exposures if x.market_id == market.id]
        if len(positions) > 0:
            position = positions[0].position
        else:
            position = 0
        logger.info(f"My position is {position}")

        bids = [order for order in market.orders if order.side == Side.BID]
        offers = [order for order in market.orders if order.side == Side.OFFER]

        if not bids:
            logger.info(f"No bids available for market {market_id}")
            return

        if not offers:
            logger.info(f"No offers available for market {market_id}")
            return

        best_bid = max(bids, key=lambda x: x.price)
        best_offer = min(offers, key=lambda x: x.price)
        spread = best_offer.price - best_bid.price

        if not always_trade_in_full:
            available_size = min(best_bid.size, best_offer.size)
            desired_size = min(loss_per_trade * 2 / math.pow(spread, loss_falloff), max_size)
            size = min(available_size, desired_size)
        else:
            size = max_size
        
        if random.random() < 0.5:
            side = Side.BID
            price = min(market.max_settlement, best_offer.price + trade_offset)
        else:
            side = Side.OFFER
            price = max(market.min_settlement, best_bid.price - trade_offset)

        if position > 0 and side == Side.BID:
            size *= 0.9
        elif position > 0 and side == Side.OFFER:
            size *= 1
        elif position < 0 and side == Side.BID:
            size *= 1
        elif position < 0 and side == Side.OFFER:
            size *= 0.9

        

        logger.info(
            f"Market {market_id}: Placing {side.name} order, spread {spread}, size {size}, price {price}"
        )

        client.create_order(
            market_id=market_id,
            side=side,
            size=size,
            price=price,
        )
        client.out(market_id)


    while True:
        sleep(1)
        if random.random() >= (1 / seconds_per_trade):
            continue

        for i in range(trades_per_chance):
            logger.info(f"Doing trade {i}")
            trade()
            sleep(0.25)

        

if __name__ == "__main__":
    app()
