import asyncio
import logging
from dataclasses import dataclass
from decimal import Decimal
from typing import Awaitable, Optional

import typer
import websockets
from dotenv import load_dotenv
from http_api.client import AuthenticatedClient
from market_maker_bot import market_maker_bot
from naive_bot import naive_bot
from typing_extensions import Annotated, Callable
from websocket_api import Authenticate
from websocket_client import WebsocketClient

logging.basicConfig(level=logging.INFO)
load_dotenv()

app = typer.Typer()


@dataclass
class Options:
    websocket_url: str
    http_url: str
    jwt: str
    id_jwt: str
    act_as: str


OPTIONS: Options


@app.callback()
def set_options(
    jwt: Annotated[str, typer.Option(envvar="JWT")],
    id_jwt: Annotated[str, typer.Option(envvar="ID_JWT")],
    websocket_url: Annotated[str, typer.Option(envvar="WEBSOCKET_URL")],
    http_url: Annotated[str, typer.Option(envvar="HTTP_URL")],
    act_as: Annotated[str, typer.Option(envvar="ACT_AS")] = "",
):
    global OPTIONS
    OPTIONS = Options(
        websocket_url=websocket_url,
        http_url=http_url,
        jwt=jwt,
        id_jwt=id_jwt,
        act_as=act_as,
    )


async def entrypoint(bot: Callable[[WebsocketClient, AuthenticatedClient], Awaitable]):
    async with websockets.connect(
        OPTIONS.websocket_url, ping_interval=None
    ) as ws, AuthenticatedClient(OPTIONS.http_url, OPTIONS.jwt) as http_client:
        websocket_client = WebsocketClient(ws=ws)
        await websocket_client.init(
            Authenticate(jwt=OPTIONS.jwt, id_jwt=OPTIONS.id_jwt)
        )

        if OPTIONS.act_as:
            await websocket_client.act_as(OPTIONS.act_as)

        await bot(websocket_client, http_client)


@app.command()
def run_naive(
    market_id: int,
    loss_per_trade: float = 1.0,
    max_size: float = 10000.0,
    seconds_per_trade: float = 5.0,
):
    loss_per_trade_dec = Decimal(loss_per_trade)
    max_size_dec = Decimal(max_size)

    async def bot(websocket_client: WebsocketClient, http_client: AuthenticatedClient):
        await naive_bot(
            websocket_client,
            http_client,
            market_id=market_id,
            loss_per_trade=loss_per_trade_dec,
            max_size=max_size_dec,
            seconds_per_trade=seconds_per_trade,
        )

    asyncio.run(entrypoint(bot))


@app.command()
def run_market_maker(
    market_id: int,
    prior: Optional[float] = None,
    spread: float = 3.0,
    size: float = 1.0,
    fade_per_order: float = 1.0,
):
    prior_dec = Decimal(prior) if prior is not None else None
    spread_dec = Decimal(spread)
    size_dec = Decimal(size)
    fade_per_order_dec = Decimal(fade_per_order)

    async def bot(websocket_client: WebsocketClient, http_client: AuthenticatedClient):
        await market_maker_bot(
            websocket_client,
            http_client,
            market_id=market_id,
            prior=prior_dec,
            spread=spread_dec,
            size=size_dec,
            fade_per_order=fade_per_order_dec,
        )

    asyncio.run(entrypoint(bot))


if __name__ == "__main__":
    app()
