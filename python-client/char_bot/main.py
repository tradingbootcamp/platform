import logging
from typing import Annotated

import typer
from dotenv import load_dotenv
from metagame import TradingClient
from research_stock_bot_v1 import research_bot_v1
import os


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

app = typer.Typer(pretty_exceptions_show_locals=False)


@app.command()
def main(
    market_name: str = "golf_mon",
    price_down: str = "buy",
    price_up: str = "sell",
    diff_percent: int = 10,
    recovery_percent: int = 5,
    size: float = 100.0,
):
    logger.info("Bots started!")

    # Retrieve environment variables directly
    jwt = os.getenv("JWT")
    api_url = os.getenv("API_URL")
    act_as = os.getenv("ACT_AS")

    if not jwt or not api_url or not act_as:
        logger.error("Missing required environment variables.")
        return

    # Convert act_as to int (since os.getenv returns strings)
    act_as = int(act_as)

    with TradingClient(api_url, jwt, act_as) as client:
        research_bot_v1(
            client,
            market_name=market_name,
            price_up=price_up,
            price_down=price_down,
            diff_percent=diff_percent,
            recovery_percent=recovery_percent,
            size=0.1,
            test=False,
        )


if __name__ == "__main__":
    app()
