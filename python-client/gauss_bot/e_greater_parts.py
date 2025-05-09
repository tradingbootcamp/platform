import logging
from typing import Annotated

import typer
from dotenv import load_dotenv
from metagame import TradingClient
from etf_arbitrage_v1 import (
    arbitrage_etf_sum_greater_parts_bot_1,
)
from constants import etf_market, component_markets, component_weights


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = typer.Typer(pretty_exceptions_show_locals=False)


@app.command()
def main(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    act_as: Annotated[int, typer.Option(envvar="ACT_AS")],
    market_name: str = "bond_test",
    size: float = 100.0,
):
    logger.info("Bots started!")
    with TradingClient(api_url, jwt, act_as) as client:
        arbitrage_etf_sum_greater_parts_bot_1(
            client,
            etf_market_name=etf_market["abc"],
            component_market_names=component_markets["abc"],
            component_weights=component_weights["abc"],
            size=0.9,
            test=False,
        )


if __name__ == "__main__":
    app()
