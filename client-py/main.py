import asyncio
import logging
from dataclasses import dataclass
from decimal import Decimal
from typing import Awaitable, Optional

import typer
import websockets
from dotenv import load_dotenv
from market_maker_bot import market_maker_bot
from naive_bot import naive_bot
from trading_client import TradingClient
from typing_extensions import Annotated, Callable
from websocket_api import ActAs, Authenticate, ClientMessage

logging.basicConfig(level=logging.INFO)
load_dotenv()

app = typer.Typer()


@dataclass
class Options:
    api_url: str
    jwt: str
    id_jwt: str
    act_as: str


OPTIONS: Options


@app.callback()
def set_options(
    api_url: Annotated[str, typer.Option(envvar="API_URL")],
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    id_jwt: Annotated[str, typer.Option(envvar="ID_JWT")],
    act_as: Annotated[str, typer.Option(envvar="ACT_AS")],
):
    global OPTIONS
    OPTIONS = Options(api_url=api_url, jwt=jwt, id_jwt=id_jwt, act_as=act_as)


async def entrypoint(bot: Callable[[TradingClient], Awaitable]):
    async with websockets.connect(OPTIONS.api_url, ping_interval=None) as ws:
        client = TradingClient(ws=ws)
        await client.init(Authenticate(jwt=OPTIONS.jwt, id_jwt=OPTIONS.id_jwt))

        if OPTIONS.act_as:
            act_as_msg = ClientMessage(act_as=ActAs(user_id=OPTIONS.act_as))
            await client.send(act_as_msg)

        await bot(client)


@app.command()
def run_naive(
    market_id: int,
    loss_per_trade: float = 1.0,
    seconds_per_trade: float = 5.0,
):
    loss_per_trade_dec = Decimal(loss_per_trade)

    async def bot(client: TradingClient):
        await naive_bot(
            client,
            market_id=market_id,
            loss_per_trade=loss_per_trade_dec,
            seconds_per_trade=seconds_per_trade,
        )

    asyncio.run(entrypoint(bot))


@app.command()
def run_market_maker(
    market_id: int,
    prior: Optional[float] = None,
    spread: float = 3.0,
    size: float = 1.0,
    fade: float = 1.0,
):
    prior_dec = Decimal(prior) if prior is not None else None
    spread_dec = Decimal(spread)
    size_dec = Decimal(size)
    fade_dec = Decimal(fade)

    async def bot(client: TradingClient):
        await market_maker_bot(
            client,
            market_id=market_id,
            prior=prior_dec,
            spread=spread_dec,
            size=size_dec,
            fade=fade_dec,
        )

    asyncio.run(entrypoint(bot))


if __name__ == "__main__":
    app()
