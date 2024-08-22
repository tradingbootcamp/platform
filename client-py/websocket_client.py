import asyncio
from dataclasses import dataclass, field

import betterproto
import websocket_api
import websockets
from typing_extensions import Any, Dict, List, Tuple


@dataclass
class WebsocketClient:
    """
    Client for interacting with the exchange server.
    """

    ws: websockets.WebSocketClientProtocol
    _initializing: bool = True
    acting_as: websocket_api.ActingAs = field(default_factory=websocket_api.ActingAs)
    portfolio: websocket_api.Portfolio = field(default_factory=websocket_api.Portfolio)
    payments: List[websocket_api.Payment] = field(default_factory=list)
    ownerships: List[websocket_api.Ownership] = field(default_factory=list)
    users: List[websocket_api.User] = field(default_factory=list)
    markets: Dict[int, websocket_api.Market] = field(default_factory=dict)

    async def init(self, authenticate: websocket_api.Authenticate):
        """
        Authenticate, then make sure all of the messages holding initial state have been received.
        """
        await self.send(websocket_api.ClientMessage(authenticate=authenticate))
        while self._initializing:
            _, message = await self.recv()
            if isinstance(message, websocket_api.RequestFailed):
                raise RuntimeError(
                    f"{message.request_details.kind} request failed during initialization: {message.error_details.message}"
                )

    async def act_as(self, user_id: str):
        """
        Set the user ID to act as.
        """
        await self.send(
            websocket_api.ClientMessage(act_as=websocket_api.ActAs(user_id=user_id))
        )
        self._initializing = True
        while self._initializing:
            _, message = await self.recv()
            if isinstance(message, websocket_api.RequestFailed):
                raise RuntimeError(
                    f"{message.request_details.kind} request failed during act_as: {message.error_details.message}"
                )

    async def recv(self) -> Tuple[str, Any]:
        """
        Wait for a message from the server and update the state accordingly,
        returning the kind of message and the message.
        """
        message = await self.ws.recv()
        assert isinstance(message, bytes)
        decoded = websocket_api.ServerMessage().parse(message)
        one_of = betterproto.which_one_of(decoded, "message")
        self._update(one_of)
        return one_of

    async def get_buffered_messages(self) -> List[Tuple[str, Any]]:
        """
        Return new messages waiting to be received, updating the state.
        If you're not calling `recv` constantly, make sure to call this periodically.
        """
        messages = []

        async def recv_forever():
            while True:
                messages.append(await self.recv())

        try:
            # Buffered messages are received without yielding to the event loop,
            # so an arbitrarily small timeout is fine.
            await asyncio.wait_for(recv_forever(), timeout=1e-100)
        except asyncio.TimeoutError:
            pass
        return messages

    async def send(self, message: websocket_api.ClientMessage):
        """
        Send a message to the server.
        """
        await self.ws.send(bytes(message))

    def _update(self, one_of: Tuple[str, Any]):
        kind, message = one_of

        if isinstance(message, websocket_api.ActingAs):
            # ActingAs is always the last message in the initialization sequence
            self.acting_as = message
            self._initializing = False

        elif isinstance(message, websocket_api.Portfolio):
            self.portfolio = message

        elif isinstance(message, websocket_api.Payments):
            self.payments = message.payments

        elif isinstance(message, websocket_api.Payment):
            assert kind == "payment_created"
            if all(payment.id != message.id for payment in self.payments):
                self.payments.append(message)

        elif isinstance(message, websocket_api.Ownerships):
            self.ownerships = message.ownerships

        elif isinstance(message, websocket_api.Ownership):
            assert kind == "ownership_received"
            if all(
                ownership.of_bot_id != message.of_bot_id
                for ownership in self.ownerships
            ):
                self.ownerships.append(message)

        elif isinstance(message, websocket_api.Users):
            self.users = message.users

        elif isinstance(message, websocket_api.User):
            assert kind == "user_created"
            if all(user.id != message.id for user in self.users):
                self.users.append(message)

        elif isinstance(message, websocket_api.Market):
            self.markets[message.id] = message

        elif isinstance(message, websocket_api.MarketSettled):
            self.markets[message.id].closed = websocket_api.MarketClosed(
                settle_price=message.settle_price
            )

        elif isinstance(message, websocket_api.OrderCancelled):
            self.markets[message.market_id].orders = [
                order
                for order in self.markets[message.market_id].orders
                if order.id != message.id
            ]

        elif isinstance(message, websocket_api.OrderCreated):
            orders = self.markets[message.market_id].orders
            if message.order.id:
                orders.append(message.order)
            if message.fills:
                for order in orders:
                    if fill := next(
                        (fill for fill in message.fills if fill.id == order.id),
                        None,
                    ):
                        order.size = fill.size_remaining
                self.markets[message.market_id].orders = [
                    order for order in orders if float(order.size) > 0
                ]
            if message.trades:
                self.markets[message.market_id].trades.extend(message.trades)
