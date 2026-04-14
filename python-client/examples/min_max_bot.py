import logging
from typing import Annotated

import typer
from dotenv import load_dotenv
from metagame import TradingClient
from metagame.websocket_api import Side

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = typer.Typer(pretty_exceptions_show_locals=False)


@app.command()
def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[int, typer.Option(envvar="ACT_AS")],
    market_name: str,
    size: float = 100.0,
):
    with TradingClient(api_url, jwt, act_as) as client:
        min_max_bot(
            client,
            market_name=market_name,
            size=size,
        )


def min_max_bot(
    client: TradingClient,
    *,
    market_name: str,
    size: float,
):
    state = client.state()
    market_id = state.market_name_to_id[market_name]
    market = state.markets.get(market_id)
    if not market:
        logger.info(f"No market data available for market {market_name}")
        return

    min_settlement = market.definition.min_settlement
    max_settlement = market.definition.max_settlement

    client.create_order(market_id, min_settlement, size, Side.BID)
    client.create_order(market_id, max_settlement, size, Side.OFFER)


if __name__ == "__main__":
    app()
