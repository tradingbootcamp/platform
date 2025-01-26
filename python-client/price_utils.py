from metagame import TradingClient
from pydantic import BaseModel, ConfigDict


side_dict= {1:"bid", 2:"offer"}

def get_prices(market):
    # highest bid
    try:
        bid = max((order for order in market.orders if order.side==1), key=lambda x: x.price)
        bid_price = bid.price
        bid_size = bid.size
    except (IndexError, ValueError):
        bid_price = -float("inf")
        bid_size = 0
    # lowest offer
    try:
        offer = min((order for order in market.orders if order.side==2), key=lambda x: x.price)
        offer_price = offer.price
        offer_size = offer.size
    except (IndexError, ValueError):
        offer_price = float("inf")
        offer_size = 0
    return {"bid": bid_price, "offer": offer_price, "bid_size": bid_size, "offer_size": offer_size}


def get_market_prices(client, /, market_name: str | None = None, market_id: int | None = None):
    state = client.state()
    if market_id is None:
        market_id = state.market_name_to_id.get(market_name)
    market = state.markets[market_id]
    return get_prices(market)


class MarketPrices(BaseModel):
    id: int
    name: str
    bid: float
    offer: float
    bid_size: float = 0
    offer_size: float = 0
    model_config = ConfigDict(arbitrary_types_allowed=True)

    @classmethod
    def from_client(cls, client, /, name: str | None = None, id: int | None = None):
        state = client.state()
        if id is None:
            id = state.market_name_to_id.get(name)
        prices = get_market_prices(client, market_id=id)

        return cls(#client = client, 
                         id = id,
                         name=name,
                         bid = prices["bid"], 
                         offer = prices["offer"],
                         bid_size = prices["bid_size"],
                         offer_size = prices["offer_size"]
                         )
    
    def __add__(self, other):

        return MarketPrices(id=-1, name=self.name + ' + ' + other.name, 
                            bid=self.bid + other.bid, offer=self.offer + other.offer,
                            bid_size = min(self.bid_size, other.bid_size),
                            offer_size = min(self.offer_size, other.offer_size),
                            )
    
    def __mul__(self, other:float|int):
        return MarketPrices(id=self.id, name=self.name + ' * ' + str(other), 
                            bid=self.bid * other, 
                            offer=self.offer * other,
                            bid_size = self.bid_size * other,
                            offer_size = self.offer_size * other,
                            )

    def __sub__(self, other):
        return MarketPrices(id=-1, name=self.name + ' - ' + other.name, 
                            bid=self.bid - other.bid, offer=self.offer - other.offer,
                            )
class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


if __name__=='__main__':

    from dotenv import load_dotenv, dotenv_values
    from metagame import TradingClient
    import os

    env = dotenv_values()

    client = TradingClient(
        api_url=env["API_URL"],
        jwt=env["JWT"],
        act_as=int(env["ACT_AS"]),
    )


    market_name_a = "test_mix_max"
    prices_a = MarketPrices.from_client(client, market_name_a)
    # prices_a * 2

    state = client.state()
    market_name_b = "Will any team go bankrupt via a rogue bot?"
    prices_b = MarketPrices.from_client(client, market_name_b)
    # prices_b

    state = client.state()
    market_name_c = "Will any team go bankrupt via a rogue bot?"
    prices_c = MarketPrices.from_client(client, market_name_c)

    etf_2a_b_c = prices_a * 2 + prices_b + prices_c
    raw_2a_b_c = prices_a * 1.4 + prices_b + prices_c

    print(#"buy ETF(2a+b) and sell raw (2a+b)",
          bcolors.OKGREEN + "buy ETF(2a + b + c) " + bcolors.ENDC,
          bcolors.RED + "sell raw (2a + b + c) " + bcolors.ENDC,
          etf_2a_b_c.bid - raw_2a_b_c.offer
          )

    print(#"buy raw (2a+b) and sell ETF(2a+b)",
          bcolors.OKGREEN + "raw ETF(2a + b) " + bcolors.ENDC,
          bcolors.RED + "sell ETF (2a + b) " + bcolors.ENDC,
          raw_2a_b_c.bid - etf_2a_b_c.offer
          )
