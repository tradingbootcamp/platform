import asyncio
import logging
from decimal import Decimal

import typer
import websockets
from dotenv import load_dotenv
from naive_bot import naive_bot
from state import State
from typing_extensions import Annotated
from websocket_api import ActAs, Authenticate, ClientMessage

logging.basicConfig(level=logging.INFO)
load_dotenv()


def main(
    api_url: Annotated[str, typer.Argument(envvar="API_URL")],
    jwt: Annotated[str, typer.Argument(envvar="JWT")],
    id_jwt: Annotated[str, typer.Argument(envvar="ID_JWT")],
    act_as: Annotated[str, typer.Argument(envvar="ACT_AS")],
):
    asyncio.run(entrypoint(api_url, jwt, id_jwt, act_as))


async def entrypoint(api_url: str, jwt: str, id_jwt: str, act_as: str):
    async with websockets.connect(api_url) as ws:
        authenticate = ClientMessage(authenticate=Authenticate(jwt=jwt, id_jwt=id_jwt))
        await ws.send(bytes(authenticate))
        act_as_msg = ClientMessage(act_as=ActAs(user_id=act_as))
        await ws.send(bytes(act_as_msg))

        state = State()
        await state.init(ws)
        await naive_bot(
            state, ws, market_id=2, loss_per_trade=Decimal("0.1"), seconds_per_trade=2.0
        )


if __name__ == "__main__":
    typer.run(main)
