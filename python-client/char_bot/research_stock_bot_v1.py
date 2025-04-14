import logging
import time
from collections import deque
from metagame import TradingClient
from metagame.websocket_api import Side

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def buy_stock_to_mean(
    client: TradingClient,
    market_id: int,
    own_acc_id: int,
    size: float,
    delta: float,
    test: bool = True,
):
    """
    Places a buy order at the best available offer price plus a delta.
    """
    market = client.state().markets.get(market_id)
    if not market or not market.offers:
        logger.warning(f"No offers available in market {market_id}. Skipping order.")
        return

    # Get the best offer price (exclude own orders if not in test mode)
    best_offer = (
        market.offers[0]
        if test
        else next(filter(lambda x: x.owner_id != own_acc_id, market.offers), None)
    )

    if not best_offer:
        logger.warning(f"No valid offers found in market {market_id}.")
        return

    best_price = best_offer.price
    target_price = best_price + delta

    logger.info(
        f"Best offer price: {best_price}, placing order at {target_price} with size {size}"
    )

    # Place the buy order
    order = client.create_order(
        market_id=market_id,
        price=target_price,
        size=size,
        side=Side.BID,  # BID means buying
    )

    logger.info(f"Order created: {order}")


def sell_stock_to_mean(
    client: TradingClient,
    market_id: int,
    own_acc_id: int,
    size: float,
    delta: float,
    test: bool = True,
):
    """
    Places a sell order at the best available bid price minus a delta.
    """
    market = client.state().markets.get(market_id)
    if not market or not market.bids:
        logger.warning(f"No bids available in market {market_id}. Skipping order.")
        return

    # Get the best bid price (exclude own orders if not in test mode)
    best_bid = (
        market.bids[0]
        if test
        else next(filter(lambda x: x.owner_id != own_acc_id, market.bids), None)
    )

    if not best_bid:
        logger.warning(f"No valid bids found in market {market_id}.")
        return

    best_price = best_bid.price
    target_price = best_price - delta

    logger.info(
        f"Best bid price: {best_price}, placing offer at {target_price} with size {size}"
    )

    # Place the sell order
    order = client.create_order(
        market_id=market_id,
        price=target_price,
        size=size,
        side=Side.OFFER,  # OFFER means selling
    )

    logger.info(f"Order created: {order}")


DELTA = 0.51


def research_bot_v1(
    client: TradingClient,
    *,
    market_name: str,
    price_up: str,
    price_down: str,
    diff_percent: int,
    recovery_percent: int,
    size: float = 0.1,
    test: bool = True,
):
    logger.info("Inside bot!")
    logger.info(f"Market name: {market_name}")
    logger.info(f"Price down action: {price_down}")
    logger.info(f"Price up action: {price_up}")

    historical_prices = deque(
        maxlen=10
    )  # Rolling window for last 10 filled order prices

    market_id = client.state().market_name_to_id.get(market_name)
    if not market_id:
        logger.error(f"Market {market_name} not found!")
        return  # Use return instead of break in functions

    own_acc_id = client.state().user_id

    while True:
        # Keep an eye on the market
        market = client.state().markets.get(market_id)
        trade_history = market.trades if market else None

        if not trade_history:
            logger.info("No trade history available yet.")
            time.sleep(1)
            continue

        last_trade_price = trade_history[-1].price
        historical_prices.append(last_trade_price)

        # Calculate the rolling average price
        if len(historical_prices) == 10 and last_trade_price is not None:
            rolling_avg = sum(historical_prices) / len(historical_prices)
            price_diff = (
                (last_trade_price - rolling_avg) / rolling_avg * 100
            )  # Signed difference

            if abs(price_diff) >= diff_percent:
                logger.info(
                    f"Price deviation detected! Last trade price: {last_trade_price}, "
                    f"Rolling Avg: {rolling_avg}, Diff: {price_diff:.2f}%"
                )

                # **New While Loop**: Wait until price is within 1% of stored rolling_avg
                while (
                    abs(last_trade_price - rolling_avg) / rolling_avg * 100
                    >= recovery_percent
                ):
                    trade_history = trade_history
                    last_trade_price = trade_history[-1].price  # Refresh latest price

                    # **Determine action based on sign of price_diff**
                    if price_diff > 0:
                        logger.info(
                            "Price is above rolling average. Taking corrective action..."
                        )
                        if price_up == "buy":
                            buy_stock_to_mean(
                                client=client,
                                market_id=market_id,
                                own_acc_id=own_acc_id,
                                size=size,
                                delta=DELTA,
                                test=test,
                            )
                        else:
                            sell_stock_to_mean(
                                client=client,
                                market_id=market_id,
                                own_acc_id=own_acc_id,
                                size=size,
                                delta=DELTA,
                                test=test,
                            )
                    else:
                        logger.info(
                            "Price is below rolling average. Taking corrective action..."
                        )
                        if price_down == "buy":
                            buy_stock_to_mean(
                                client=client,
                                market_id=market_id,
                                own_acc_id=own_acc_id,
                                size=size,
                                delta=DELTA,
                                test=test,
                            )
                        else:
                            sell_stock_to_mean(
                                client=client,
                                market_id=market_id,
                                own_acc_id=own_acc_id,
                                size=size,
                                delta=DELTA,
                                test=test,
                            )

                    time.sleep(0.25)  # Avoid excessive API calls
                    client.out(market_id)  # Be out of the market
            else:
                logger.info(
                    f"Price deviation within tolerance: {price_diff:.2f}%. Waiting for further data..."
                )

        else:
            logger.info(f"Insufficient trade volume: {len(historical_prices)} trades")
        time.sleep(0.25)  # Avoid excessive API calls
