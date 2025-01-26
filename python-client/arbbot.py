from dotenv import load_dotenv
from metagame import TradingClient
import os
import numpy as np
import pandas as pd
from metagame.websocket_api import ClientMessage, CreateOrder, Side
import time


class ArbFinder:
    def __init__(self, tradable_markets, arbs, etfs, min_profit_ratio=0.01):
        load_dotenv()
        self.client = TradingClient(
            api_url=os.environ["API_URL"],
            jwt=os.environ["JWT"],
            act_as=int(os.environ["ACT_AS"]),
        )
        self.tradable_markets = tradable_markets
        self.arbs_sell = np.clip(arbs, 0, np.inf)  # The positive values
        self.arbs_buy = np.clip(arbs, -np.inf, 0)  # The negative values
        self.client_state = self.client.state()
        self.markets2bid_dfs = {}
        self.markets2ask_dfs = {}

        self.min_profit_ratio = min_profit_ratio
        self.market_min_settlements = np.array(
            [
                market.definition.min_settlement
                for market in self.client_state.markets.values()
            ]
        )
        self.market_max_settlements = np.array(
            [
                market.definition.max_settlement
                for market in self.client_state.markets.values()
            ]
        )
        self.etfs = etfs

    def update_state(self):
        self.client_state = self.client.state()
        self.markets2bid_dfs = {}
        self.markets2ask_dfs = {}
        max_orderbook_depth = 25
        for i, market_id in enumerate(self.tradable_markets):
            market = self.client_state.markets[market_id]
            orders_df = pd.DataFrame(market.orders)
            orders_df = pd.concat(
                [
                    orders_df,
                    pd.DataFrame(
                        {
                            "price": [-10000000, 1000000],
                            "size": [500, 500],
                            "side": [1, 2],
                        }
                    ),
                ]
            )
            bids_df = (
                orders_df[orders_df.side == 1]
                .sort_values("price", ascending=False)
                .head(max_orderbook_depth)
            )

            bids_df["cumulative_volume"] = bids_df["size"].cumsum()

            asks_df = (
                orders_df[orders_df.side == 2]
                .sort_values("price", ascending=True)
                .head(max_orderbook_depth)
            )

            asks_df["cumulative_volume"] = asks_df["size"].cumsum()
            self.markets2bid_dfs[market_id] = bids_df
            self.markets2ask_dfs[market_id] = asks_df

    def find_arb_opportunity(self):
        self.update_state()

        best_bid_prices = np.array(
            [bids_df.iloc[0]["price"] for bids_df in self.markets2bid_dfs.values()]
        )
        best_ask_prices = np.array(
            [asks_df.iloc[0]["price"] for asks_df in self.markets2ask_dfs.values()]
        )

        arb_income = self.arbs_sell @ best_bid_prices
        arb_expendature = self.arbs_buy @ best_ask_prices
        profit = arb_income + arb_expendature
        total_capital_investment = np.abs(arb_income) + np.abs(arb_expendature)
        profit_ratio = profit / total_capital_investment

        if np.max(profit_ratio) < self.min_profit_ratio:
            return None

        arb_number = np.argmax(profit_ratio)

        weight_coef = 1

        def get_bid_price_at(volume, bids_df, market_idx):
            bids_above_volume = bids_df[bids_df["cumulative_volume"] > volume]
            if bids_above_volume.empty:
                return self.market_min_settlements[market_idx]
            return float(bids_above_volume.iloc[0]["price"])

        def get_ask_price_at(volume, asks_df, market_idx):
            asks_above_volume = asks_df[asks_df["cumulative_volume"] > volume]
            if asks_above_volume.empty:
                return self.market_max_settlements[market_idx]
            return float(asks_above_volume.iloc[0]["price"])

        def get_average_bid_price_at(volume, bids_df, market_idx):
            """
            If we hit volume amount of bids this function returns the average price paid
            """
            if volume == 0:
                # return the best bid price
                return bids_df.iloc[0]["price"]
            total_paid = 0
            total_volume = 0
            for _, row in bids_df.iterrows():
                if total_volume + row["size"] > volume:
                    total_paid += row["price"] * (volume - total_volume)
                    total_volume = volume
                    break
                total_paid += row["price"] * row["size"]
                total_volume += row["size"]
            return total_paid / total_volume

        def get_average_ask_price_at(volume, asks_df, market_idx):
            """
            If we hit volume amount of asks this function returns the average price paid
            """
            if volume == 0:
                return asks_df.iloc[0]["price"]
            total_paid = 0
            total_volume = 0
            for _, row in asks_df.iterrows():
                if total_volume + row["size"] > volume:
                    total_paid += row["price"] * (volume - total_volume)
                    total_volume = volume
                    break
                total_paid += row["price"] * row["size"]
                total_volume += row["size"]
            return total_paid / total_volume

        def get_profit_ratio_at_coef(weight_coef):
            best_bid_prices = np.array(
                [
                    get_bid_price_at(weight_coef * weight, bids_df, i)
                    for i, (weight, bids_df) in enumerate(
                        zip(self.arbs_sell[arb_number], self.markets2bid_dfs.values())
                    )
                ]
            )
            best_ask_prices = np.array(
                [
                    get_ask_price_at(weight_coef * weight, asks_df, i)
                    for i, (weight, asks_df) in enumerate(
                        zip(-self.arbs_buy[arb_number], self.markets2ask_dfs.values())
                    )
                ]
            )
            arb_income = self.arbs_sell[arb_number] @ best_bid_prices
            arb_expendature = self.arbs_buy[arb_number] @ best_ask_prices
            profit = arb_income + arb_expendature
            total_capital_investment = np.abs(arb_income) + np.abs(arb_expendature)
            profit_ratio = profit / total_capital_investment
            return profit, profit_ratio, best_bid_prices, best_ask_prices

        while get_profit_ratio_at_coef(weight_coef)[1] > self.min_profit_ratio:
            weight_coef *= 2

        while get_profit_ratio_at_coef(weight_coef)[1] < self.min_profit_ratio:
            weight_coef *= 0.9

        _, _, bid_prices, ask_prices = get_profit_ratio_at_coef(weight_coef)

        avg_bids = np.array(
            [
                get_average_bid_price_at(weight_coef * weight, bids_df, i)
                for i, (weight, bids_df) in enumerate(
                    zip(self.arbs_sell[arb_number], self.markets2bid_dfs.values())
                )
            ]
        )
        avg_asks = np.array(
            [
                get_average_ask_price_at(weight_coef * weight, asks_df, i)
                for i, (weight, asks_df) in enumerate(
                    zip(-self.arbs_buy[arb_number], self.markets2ask_dfs.values())
                )
            ]
        )

        income = weight_coef * self.arbs_sell[arb_number] @ avg_bids
        expense = weight_coef * self.arbs_buy[arb_number] @ avg_asks
        capital_investment = np.abs(income) + np.abs(expense)

        profit = income + expense
        profit_ratio = profit / capital_investment

        return {
            "Buy": -weight_coef * self.arbs_buy[arb_number],
            "Sell": weight_coef * self.arbs_sell[arb_number],
            "Buy Levels": ask_prices,
            "Sell Levels": bid_prices,
            "Profit": float(profit),
            "Profit ratio": float(profit_ratio),
            "Capital Investment": float(capital_investment),
        }

    def get_available_balance(self):
        return self.client_state.portfolio.available_balance

    def execute_transactions(self, buy_volumes, sell_volumes, buy_prices, ask_prices):
        for i, market_id in enumerate(self.tradable_markets):
            buy_volume = float(buy_volumes[i])
            sell_volume = float(sell_volumes[i])
            buy_price = float(buy_prices[i])
            sell_price = float(ask_prices[i])

            # round all volumes to 2 decimal places
            buy_volume = round(buy_volume, 2)
            sell_volume = round(sell_volume, 2)

            orders = []

            if buy_volume > 0:
                buy_order = ClientMessage(
                    create_order=CreateOrder(
                        market_id=market_id,
                        price=buy_price,
                        size=buy_volume,
                        side=Side.BID,
                    )
                )
                orders.append(buy_order)

            if sell_volume > 0:
                sell_order = ClientMessage(
                    create_order=CreateOrder(
                        market_id=market_id,
                        price=sell_price,
                        size=sell_volume,
                        side=Side.OFFER,
                    )
                )
                orders.append(sell_order)

        self.client.request_many(orders)

    def get_positions(self):
        positions = np.zeros(len(self.tradable_markets))
        updates = 0
        for me in self.client_state.portfolio.market_exposures:
            if me.market_id in self.tradable_markets:
                positions[self.tradable_markets.index(me.market_id)] = me.position
                updates += 1
        if updates != len(self.tradable_markets):
            print("Error: not all positions were updated.")

        return positions
    
    def clear_etf_with_biggest_position(self):
        positions = self.get_positions() * self.etfs
        max_position_idx = np.argmax(np.abs(positions))
        self.client.redeem(self.tradable_markets[max_position_idx], positions[max_position_idx])


if __name__ == "__main__":
    # .                  A   B.  C   D.  E.  F.  G.  H.  I. bo.  abc, def, ghi
    tradable_markets =  [5,  6,  7,  8,  9, 10,  11, 12, 13, 14, 15,  16,  17]
    arbs = np.array([   [2,  2,  2,  0,  0,  0,  0,  0,   0,  0, -1,   0,   0],
                        [0,  0,  0,  1,  1,  4,  0,  0,   0,  0,  0,  -1,   0],
                        [0,  0,  0,  0,  0,  0,  3,  2,   1,  0,  0,   0,  -1]])
    etfs = np.array(    [0,  0,  0,  0,  0,  0,  0,  0,   0,  0,  1,   1,   1]  )   
    arbs = np.vstack([arbs, -arbs])
    arb_finder = ArbFinder(tradable_markets, arbs, etfs)

    while True:
        arb_opportunity = arb_finder.find_arb_opportunity()

        if arb_finder.get_available_balance() < 300:
            arb_finder.clear_etf_with_biggest_position()

        if arb_opportunity is None:
            # Choose a random number between 1 and 10
            r = np.random.randint(1, 10)
            if r == 1:
                print(
                    f"{time.strftime('%H:%M:%S', time.localtime())} : No arb opportunities found."
                )
        else:
            print(
                f"{time.strftime('%H:%M:%S', time.localtime())} : Arb opportunity found!"
            )
            print(arb_opportunity)
            available_balance = arb_finder.get_available_balance()
            print("Available balance: ", available_balance)

            buys = arb_opportunity["Buy"]
            sells = arb_opportunity["Sell"]

            if arb_opportunity["Capital Investment"] > available_balance:
                ratio = available_balance / (arb_opportunity["Capital Investment"] + 0.01)
                print(
                    "Capital investment exceeds available balance. Using ratio: ", ratio
                )
                buys = buys * ratio
                sells = sells * ratio

            if np.sqrt(np.linalg.norm(buys) ** 2 + np.linalg.norm(sells) ** 2) > 0.05:
                print(f"{time.strftime('%H:%M:%S', time.localtime())} : Executing transactions.")
                arb_finder.execute_transactions(
                    buys,
                    sells,
                    arb_opportunity["Buy Levels"],
                    arb_opportunity["Sell Levels"],
                )

            else:
                print(f"{time.strftime('%H:%M:%S', time.localtime())} : Arb opportunity is too small to execute.")

        time.sleep(0.2)
