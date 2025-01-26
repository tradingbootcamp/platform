# Step 1: Get logs of all the markets

import logging
from time import sleep
from typing import Annotated

import typer
from dotenv import load_dotenv
from metagame import TradingClient
from metagame.websocket_api import CancelOrder, ClientMessage, CreateOrder, Side

import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()


class Sector:
    def __init__(self, etf: str, underlying: list[str], composition: list[int]):
        self.etf = etf
        self.underlying = underlying
        self.composition = composition

    def ratio(self, asset):
        """
        ratio from given underlying to index
        i.e. for a 2,1,4 index composition, the first asset has a ratio of 2
        """
        if asset == self.etf:
            return 1
        return self.composition[self.underlying.index(asset)]

    def calculate_min_sizes(self, market_data: pd.DataFrame):
        """
        calculate the minimum size of the arb based on the lowest individual asset size
        Side.BID: sell underlying assets, buy index
        Side.OFFER: sell index, buy underlying assets
        """
        # find the minimum bid and offer sizes
        scaled_bid_sizes, scaled_offer_sizes = {}, {}
        for asset in self.underlying:
            bid_size, offer_size = market_data[asset]['latest_bid_size'], market_data[asset]['offer_size']
            scaled_bid_sizes[asset] = bid_size * self.ratio(asset)
            scaled_offer_sizes[asset] = offer_size * self.ratio(asset)

        etf_bid_size, etf_offer_size  = market_data[self.etf].latest_bid_size, market_data[self.etf].latest_offer_size

        min_size_bid_asset, min_size_offer_asset = self.etf, self.etf
        for size, asset in scaled_bid_sizes:
            if size < min_size_bid_asset:
                min_size_bid_asset = asset
        for size, asset in scaled_offer_sizes:
            if size < min_size_offer_asset:
                min_size_offer_asset = asset

        # truncated size for each direction
        bid_sizes = {asset: size * (self.ratio(min_size_bid_asset) / self.ratio(asset)) for asset, size in scaled_bid_sizes.items()}


    def get_direction(self, market_data: pd.DataFrame) -> tuple[Side, float]:
        """
        Side.BID: sell underlying assets, buy index
        Side.OFFER: sell index, buy underlying assets
        """
        total_bid_profit = 0 + market_data[self.etf].latest_bid_price
        total_offer_profit = 0 - market_data[self.etf].latest_offer_price
        for asset in self.underlying:
            # when we are long the etf, we want to sell the underlying assets
            total_bid_profit = total_bid_profit - market_data[asset].latest_bid_price * self.ratio(asset)

            # when we are short the etf, we want to buy the underlying assets
            total_offer_profit = total_offer_profit + market_data[asset].latest_offer_price * self.ratio(asset)

        if total_bid_profit > total_offer_profit:
            return Side.BID, total_bid_profit
        else:
            return Side.OFFER, total_offer_profit



sector_market_ids = {
    "abc": ["abc_tradewards", "alpha_tradewards", "bravo_tradewards", "charlie_tradewards"],
    "def": ["def_tradewards", "delta_tradewards", "echo_tradewards", "foxtrot_tradewards"],
    "ghi": ["ghi_tradewards", "golf_tradewards", "hotel_tradewards", "india_tradewards"],
}

sector_to_arbs = {
    "abc": Sector(etf="abc", underlying=["a", "b", "c"], composition=[2, 2, 2]),
}

app = typer.Typer(pretty_exceptions_show_locals=False)


@app.command()
def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[int, typer.Option(envvar="ACT_AS")],
    sectors: list[str],
    size: float = 100.0,
):
    with TradingClient(api_url, jwt, act_as) as client:
        arb_model_bot(
            client,
            sectors=sectors,
            size=size,
        )


def arb_model_bot(
    client: TradingClient,
    *,
    sectors: list[str],
    size: float,
):
    df = pd.DataFrame()

    # sectors = ["abc", "def", "ghi"]
    # set up market feeds?
    sector_ids = [client.state().market_name_to_id[name] for name in sectors]

    while True:
        for sector in sectors:  # should be sectors
            state = client.state()
            # 1. collect market data for all constituent markets
            for market_id in sector_market_ids[sector]:
                market_data = get_market_data(state, market_id)
                # append this to the dataframe somehow

            # 2. calculate arbs
            calculate_arbs(market_data, sector)

            # 4. place orders
        sleep(0.01)


def get_market_data(state, market_id: str):
    df = pd.DataFrame()

    # get orderbook
    market_name = state.market_id_to_name[market_id]

    logger.info("Getting market data for market %s", market_name)

    orders = state.markets[market_id].orders
    if not orders:
        logger.info(f"No market data available for market {market_name}")

    # get trades
    bids = [order for order in orders if order.side == Side.BID]
    offers = [order for order in orders if order.side == Side.OFFER]

    if not bids:
        logger.info(f"No bids available for market {market_name}")
        latest_bid = None
    else:
        latest_bid = max(bids, key=lambda x: x.transaction_id)

    if not offers:
        logger.info(f"No offers available for market {market_name}")
        latest_offer = None
    else:
        latest_offer = max(offers, key=lambda x: x.transaction_id)

    if latest_bid and latest_offer:
        spread = latest_bid.price - latest_offer.price
        data = {
            "market_id": {                
                "market_name": market_name,
                "latest_bid_price": latest_bid.price,
                "latest_offer_price": latest_offer.price,
                "latest_offer_size": latest_offer.size,
                "latest_bid_size": latest_bid.size,
                "spread": spread,
                "bids": bids,
                "offers": offers,
            }
        }
        df = pd.concat([df, pd.DataFrame([data])])

    pass


# market data
# "arb path" = sector + side
# max size
# expected profit per path
def calculate_arbs(market_data: pd.DataFrame, sector_id: str):
    arbs = sector_to_arbs[sector_id]
    # find max arb size based on lowest individual asset size
    # df =
    #

    pass


class Signal:
    def __init__(self, market_id: str, side: Side, size: float):
        self.market_id = market_id
        self.side = side
        self.size = size


def place_orders(signals: list[Signal]):
    pass


if __name__ == "__main__":
    app()
