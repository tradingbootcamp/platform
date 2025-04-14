import logging

from dotenv import load_dotenv
from metagame import TradingClient
from metagame.websocket_api import Side
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()


def penny_bid_bot_v1(
    client: TradingClient,
    *,
    market_name: str = "bond_tw",
    size: float,
):
    # naive bot that makes a single offer on bond at highest possible price
    # cancels it and makes a single bid at lowest possible price
    # cancels that

    state = client.state()
    market_id = state.market_name_to_id[market_name]
    market = state.markets.get(market_id)
    if not market:
        logger.info(f"No market data available for market {market_name}")
        return

    orders = market.bids
    offers = market.offers
    own_acc_id = client.state().user_id

    penny_order = next(filter(lambda x: x.owner_id != own_acc_id, orders))

    if not penny_order:
        logger.info("No penny order found")
        return

    penny_price = penny_order.price + 0.0001

    logger.info(penny_price)
    if penny_order.price < offers[0].price:
        client.create_order(market_id, penny_order.price + 0.0001, 0.01, Side.BID)

    time.sleep(10)

    client.out(market_id)


def balanced_penny_bot(
    client: TradingClient, *, market_name: str, check_interval: float = 1.0
):
    """
    A penny bot that:
    - Bids slightly above others when position < 1
    - Offers slightly below others when position > -1
    """
    while True:
        try:
            state = client.state()
            market_id = state.market_name_to_id[market_name]
            market = state.markets.get(market_id)

            if not market:
                logger.info(f"No market data available for market {market_name}")
                time.sleep(check_interval)
                continue

            # Get current position
            portfolio = state.portfolio
            position = next(
                (
                    exp.position
                    for exp in portfolio.market_exposures
                    if exp.market_id == market_id
                ),
                0,
            )

            # Cancel existing orders
            client.out(market_id)

            bids = market.bids
            offers = market.offers
            own_acc_id = state.user_id

            # Filter out own orders
            other_bids = [b for b in bids if b.owner_id != own_acc_id]
            other_offers = [o for o in offers if o.owner_id != own_acc_id]

            if position < 1 and other_bids:
                # Place a bid slightly higher than the best bid
                best_bid = max((b.price for b in other_bids), default=995)
                client.create_order(market_id, best_bid + 0.01, 0.1, Side.BID)
                logger.info(f"Placed bid at {best_bid + 0.01}")

            if position > -1 and other_offers:
                # Place an offer slightly lower than the best offer
                best_offer = min((o.price for o in other_offers), default=1005)
                client.create_order(market_id, best_offer - 0.01, 0.1, Side.OFFER)
                logger.info(f"Placed offer at {best_offer - 0.01}")

            time.sleep(check_interval)

        except Exception as e:
            logger.error(f"Error in penny bot: {e}")
            time.sleep(check_interval)
