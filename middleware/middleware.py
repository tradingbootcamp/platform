from flask import Flask, jsonify, request
from metagame import TradingClient
from metagame.websocket_api import Side
import os
from dotenv import load_dotenv
import logging
from functools import lru_cache

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load environment variables
load_dotenv()  # This will still work but fall back to actual env vars in production

logger.info("Starting middleware application...")
logger.info(f"API_URL: {os.environ.get('API_URL')}")
logger.info("Attempting to connect to trading client...")

try:
    # Initialize the WebSocket client
    client = TradingClient(
        api_url=os.environ["API_URL"],
        jwt=os.environ["JWT"],
        act_as=int(os.environ["ACT_AS"]),
    )
    logger.info("Successfully connected to trading client")
except Exception as e:
    logger.error(f"Failed to connect to trading client: {e}")
    raise


# Cache client instances
@lru_cache(maxsize=100)
def get_cached_client(jwt: str, act_as: int) -> TradingClient:
    return TradingClient(api_url=os.environ["API_URL"], jwt=jwt, act_as=act_as)


def get_client_for_request():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return client  # fallback to default client

    try:
        jwt, act_as = auth_header.split("|")
        return get_cached_client(jwt, int(act_as))
    except Exception as e:
        logger.error(f"Error creating client: {e}")
        return client


# Add basic health check endpoint
@app.route("/", methods=["GET"])
def health_check():
    logger.info("Health check endpoint called")
    return jsonify(
        {
            "status": "healthy",
            "endpoints": [
                "/markets",
                "/market/<market_id>/trades",
                "/market/<market_id>/orders",
                "/portfolio",
                "/market/<market_id>/last",
                "/market/<market_id>/mid",
                "/market/<market_id>/bid/<depth>",
                "/market/<market_id>/offer/<depth>",
            ],
        }
    )


@app.route("/markets", methods=["GET"])
def get_markets():
    state = client.state()
    markets = {
        id: {
            "name": market.definition.name,
            "description": market.definition.description,
            "min_settlement": market.definition.min_settlement,
            "max_settlement": market.definition.max_settlement,
        }
        for id, market in state.markets.items()
    }
    return jsonify(markets)


@app.route("/market/<int:market_id>/trades", methods=["GET"])
def get_market_trades(market_id):
    state = client.state()
    if not state.markets[market_id].hasFullTradeHistory:
        client.get_full_trade_history(market_id)
        state = client.state()

    trades = [
        {
            "id": trade.id,
            "market_id": trade.market_id,
            "transaction_id": trade.transaction_id,
            "price": trade.price,
            "size": trade.size,
            "buyer_id": trade.buyer_id,
            "seller_id": trade.seller_id,
        }
        for trade in state.markets[market_id].trades
    ]
    return jsonify(trades)


@app.route("/market/<int:market_id>/orders", methods=["GET"])
def get_market_orders(market_id):
    client = get_client_for_request()
    state = client.state()
    orders = [
        {
            "id": order.id,
            "market_id": order.market_id,
            "owner_id": order.owner_id
            if order.owner_id == state.acting_as
            else None,  # to do: show owner if we're not hiding ids
            "self_id": state.user_id,
            "acting_as": state.acting_as,
            "transaction_id": order.transaction_id,
            "price": order.price,
            "size": order.size,
            "side": order.side,
            "sizes": [
                {"transaction_id": size.transaction_id, "size": size.size}
                for size in order.sizes
            ],
        }
        for order in state.markets[market_id].orders
    ]
    return jsonify(orders)


@app.route("/market/<int:market_id>/orders/<int:order_id>", methods=["GET"])
def get_market_order(market_id, order_id):
    client = get_client_for_request()
    state = client.state()
    order = next((o for o in state.markets[market_id].orders if o.id == order_id), None)
    return jsonify(order)


def get_sorted_orders(market_id: int, state, side: Side):
    orders = [o for o in state.markets[market_id].orders if o.side == side]
    return sorted(
        orders,
        key=lambda x: (-x.price if side == Side.BID else x.price, x.transaction_id),
    )


def get_order_at_depth(market_id: int, state, side: Side, depth: int):
    sorted_orders = get_sorted_orders(market_id, state, side)
    return sorted_orders[depth - 1] if 0 < depth <= len(sorted_orders) else None


@app.route("/market/<int:market_id>/bid/<int:depth>", methods=["GET"])
def get_market_bid_by_depth(market_id, depth):
    client = get_client_for_request()
    state = client.state()
    order = get_order_at_depth(market_id, state, Side.BID, depth)
    return jsonify(order)


@app.route("/market/<int:market_id>/offer/<int:depth>", methods=["GET"])
def get_market_offer_by_depth(market_id, depth):
    client = get_client_for_request()
    state = client.state()
    order = get_order_at_depth(market_id, state, Side.OFFER, depth)
    return jsonify(order)


@app.route("/market/<int:market_id>/mid", methods=["GET"])
def get_market_midprice(market_id):
    client = get_client_for_request()
    state = client.state()

    best_bid = get_order_at_depth(market_id, state, Side.BID, 1)
    best_offer = get_order_at_depth(market_id, state, Side.OFFER, 1)
    if not best_bid or not best_offer:
        return jsonify(
            {"error": "Unable to calculate midprice - missing bid or offer"}
        ), 400

    return jsonify({"midprice": (best_bid.price + best_offer.price) / 2})


@app.route("/market/<int:market_id>/last", methods=["GET"])
def get_market_last_trade(market_id):
    client = get_client_for_request()
    state = client.state()
    trades = state.markets[market_id].trades
    if not trades:
        return jsonify({"error": "No trades found for this market"}), 404
    return jsonify(trades[-1])


@app.route("/portfolio", methods=["GET"])
def get_portfolio():
    client = get_client_for_request()
    state = client.state()
    if state.portfolio:
        return jsonify(
            {
                "total_balance": state.portfolio.total_balance,
                "available_balance": state.portfolio.available_balance,
                "market_exposures": [
                    {
                        "market_id": exposure.market_id,
                        "position": exposure.position,
                        "total_bid_size": exposure.total_bid_size,
                        "total_offer_size": exposure.total_offer_size,
                    }
                    for exposure in (state.portfolio.market_exposures or [])
                ],
            }
        )
    return jsonify({})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting Flask server on port {port}")
    app.run(host="0.0.0.0", port=port)
