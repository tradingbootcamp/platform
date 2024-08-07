import asyncio

import typer
import websockets
from dotenv import load_dotenv
from state import State
from typing_extensions import Annotated
from websocket_api import Authenticate, ClientMessage

load_dotenv()


def main(
    api_url: Annotated[str, typer.Argument(envvar="API_URL")],
    jwt: Annotated[str, typer.Argument(envvar="JWT")],
    id_jwt: Annotated[str, typer.Argument(envvar="ID_JWT")],
):
    asyncio.run(entrypoint(api_url, jwt, id_jwt))


async def entrypoint(api_url: str, jwt: str, id_jwt: str):
    async with websockets.connect(api_url) as ws:
        authenticate = ClientMessage(authenticate=Authenticate(jwt=jwt, id_jwt=id_jwt))
        await ws.send(bytes(authenticate))

        state = State()
        await state.init(ws)
        await bot(state, ws)


async def bot(
    state: State,
    ws: websockets.WebSocketClientProtocol,
):
    while True:
        kind, message = await state.recv(ws)
        print(kind, message)


if __name__ == "__main__":
    typer.run(main)
