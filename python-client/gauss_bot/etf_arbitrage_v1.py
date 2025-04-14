import logging

from metagame import TradingClient
from metagame.websocket_api import Side
import time

# DELTA < EPSILON ALWAYS
STOCK_DELTA = 0.51
ETF_DELTA = 1.51
ARB_EPISLON = STOCK_DELTA * 3 + ETF_DELTA
DELAY_BETWEEN_TRADES = 0.36

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def arbitrage_etf_sum_lesser_than_parts_1(
    client: TradingClient,
    *,
    etf_market_name: str,
    component_market_names: list[str],
    component_weights: list[int],
    size: float = 0.1,
    test: bool = True,
):
    while True:
        time.sleep(1) if test else time.sleep(DELAY_BETWEEN_TRADES)

        state = client.state()
        etf_id = state.market_name_to_id[etf_market_name]
        etf_market = state.markets.get(etf_id)
        if not etf_market:
            logger.info(f"No market data available for market {etf_market_name}")
            return
        own_acc_id = client.state().user_id

        component_market_ids = [
            state.market_name_to_id[name] for name in component_market_names
        ]
        component_markets = [state.markets.get(id) for id in component_market_ids]

        # ETF < SUM (component_market_prices * component_weights)
        etf_best_offer = (
            etf_market.offers[0]
            if test
            else next(filter(lambda x: x.owner_id != own_acc_id, etf_market.offers))
            if etf_market.offers
            else None
        )
        logger.info(
            f"{time.time()} etf_best_offer: {etf_best_offer.price if etf_best_offer else None}"
        )

        if etf_best_offer:
            # Calculate weighted sum of component ask prices
            component_total = 0
            can_execute = True
            for market, weight in zip(component_markets, component_weights):
                if not market or not market.bids:
                    logger.info(
                        f"No market data available for market {market.definition.name if market else None}"
                    )
                    can_execute = False
                    break
                component_total += market.bids[0].price * weight

            # padding for different between ETF bid and component sum
            if can_execute and (component_total - etf_best_offer.price) > ARB_EPISLON:
                # Arbitrage opportunity found:
                # Buy ETF at bid price
                # Sell components at offer prices
                # Redeem to end up zero
                logger.info(
                    f"YES arb: EV={component_total - etf_best_offer.price}; ETF={etf_best_offer.price} < SUM={component_total}"
                )

                # Buy ETF
                client.create_order(
                    etf_id, etf_best_offer.price + STOCK_DELTA, size, Side.BID
                )

                # Sell components
                for market_id, weight, market in zip(
                    component_market_ids, component_weights, component_markets
                ):
                    if market and market.offers:
                        component_size = size * weight
                        client.create_order(
                            market_id,
                            market.bids[0].price - ETF_DELTA,
                            component_size,
                            Side.OFFER,
                        )
                        # Call redeem with market that's combination of components

                # Redeem to net to 0
                client.redeem(etf_id, size) if not test else logger.info(
                    f"Redeemed {size} {etf_market_name}"
                )

                time.sleep(1) if test else time.sleep(
                    0.01
                )  # Wait for orders to process

                # Be out of all markets because we only trade when we have arbitrage opportunity
                client.out(etf_id)
                for market_id in component_market_ids:
                    client.out(market_id)

            else:
                logger.info(
                    f"NO arb: S-E !({component_total - etf_best_offer.price} > {ARB_EPISLON})"
                )


def arbitrage_etf_sum_greater_parts_bot_1(
    client: TradingClient,
    *,
    etf_market_name: str,
    component_market_names: list[str],
    component_weights: list[int],
    size: float = 0.1,
    test: bool = True,
):
    while True:
        time.sleep(1) if test else time.sleep(DELAY_BETWEEN_TRADES)
        state = client.state()
        etf_id = state.market_name_to_id[etf_market_name]
        etf_market = state.markets.get(etf_id)
        if not etf_market:
            logger.info(f"No market data available for market {etf_market_name}")
            return
        own_acc_id = client.state().user_id

        component_market_ids = [
            state.market_name_to_id[name] for name in component_market_names
        ]
        component_markets = [state.markets.get(id) for id in component_market_ids]

        # ETF > SUM (component_market_prices * component_weights)
        etf_best_bid = (
            etf_market.bids[0]
            if test
            else next(filter(lambda x: x.owner_id != own_acc_id, etf_market.bids))
            if etf_market.bids
            else None
        )
        logger.info(
            f"{time.time()} etf_best_bid: {etf_best_bid.price if etf_best_bid else None}"
        )

        if etf_best_bid:
            # Calculate weighted sum of component ask prices
            component_total = 0
            can_execute = True
            for market, weight in zip(component_markets, component_weights):
                if not market or not market.offers:
                    can_execute = False
                    break
                component_total += market.offers[0].price * weight

            # padding for different between ETF bid and component sum
            if can_execute and (etf_best_bid.price - component_total) > (ARB_EPISLON):
                # Arbitrage opportunity found:
                # Sell ETF at bid price
                # Buy components at offer prices
                # Redeem to end up zero
                logger.info(
                    f"YES arb: EV={etf_best_bid.price - component_total}; ETF={etf_best_bid.price} > SUM={component_total}"
                )

                # Sell ETF
                client.create_order(
                    etf_id, etf_best_bid.price - STOCK_DELTA, size, Side.OFFER
                )

                # Buy components
                for market_id, weight, market in zip(
                    component_market_ids, component_weights, component_markets
                ):
                    if market and market.offers:
                        component_size = size * weight
                        client.create_order(
                            market_id,
                            market.offers[0].price + ETF_DELTA,
                            component_size,
                            Side.BID,
                        )
                        # Call redeem with market that's combination of components

                # Redeem to net to 0
                client.redeem(etf_id, -size) if not test else logger.info(
                    f"Redeemed {size} {etf_market_name}"
                )

                time.sleep(1) if test else time.sleep(
                    0.01
                )  # Wait for orders to process

                # Be out of all markets because we only trade when we have arbitrage opportunity
                client.out(etf_id)
                for market_id in component_market_ids:
                    client.out(market_id)
            else:
                logger.info(
                    f"NO arb: E-S !({etf_best_bid.price - component_total} > {ARB_EPISLON})"
                )
