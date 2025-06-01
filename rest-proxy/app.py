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
        act_as=0,
    )
    logger.info("Successfully connected to trading client")
except Exception as e:
    logger.error(f"Failed to connect to trading client: {e}")
    raise


# Cache client instances
@lru_cache(maxsize=100)
def get_cached_client(jwt: str) -> TradingClient:
    return TradingClient(
        api_url=os.environ["API_URL"],
        jwt=jwt,
        act_as=0,  # Default to acting as self
    )


def get_client_for_request():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Authorization header is required"}), 401

    try:
        # Parse standard Bearer token format
        if not auth_header.startswith("Bearer "):
            raise ValueError("Invalid authorization header format")

        jwt = auth_header[7:]  # Remove "Bearer " prefix
        return get_cached_client(jwt)
    except Exception as e:
        logger.error(f"Error creating client: {e}")
        return jsonify({"error": "Invalid authorization"}), 401


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
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    markets = {id: market.definition.to_dict() for id, market in state.markets.items()}
    return jsonify(markets)


@app.route("/market/<int:market_id>/trades", methods=["GET"])
def get_market_trades(market_id):
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    if not state.markets[market_id].hasFullTradeHistory:
        client_or_error.get_full_trade_history(market_id)
        state = client_or_error.state()

    trades = state.markets[market_id].trades
    if not trades:
        return jsonify({"error": "No trades found for this market"}), 404
    return jsonify(trades)


@app.route("/market/<int:market_id>/orders", methods=["GET"])
def get_market_orders(market_id):
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    orders = state.markets[market_id].orders
    if not orders:
        return jsonify({"error": "No orders found for this market"}), 404
    return jsonify(orders)


@app.route("/market/<int:market_id>/orders/<int:order_id>", methods=["GET"])
def get_market_order(market_id, order_id):
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    order = next((o for o in state.markets[market_id].orders if o.id == order_id), None)
    if not order:
        return jsonify({"error": "Cannot find order"}), 404
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
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    order = get_order_at_depth(market_id, state, Side.BID, depth)
    return jsonify(order)


@app.route("/market/<int:market_id>/offer/<int:depth>", methods=["GET"])
def get_market_offer_by_depth(market_id, depth):
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    order = get_order_at_depth(market_id, state, Side.OFFER, depth)
    return jsonify(order)


@app.route("/market/<int:market_id>/mid", methods=["GET"])
def get_market_midprice(market_id):
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    best_bid = get_order_at_depth(market_id, state, Side.BID, 1)
    best_offer = get_order_at_depth(market_id, state, Side.OFFER, 1)
    if not best_bid or not best_offer:
        return jsonify({"error": "Unable to calculate mid - missing bid or offer"}), 404
    return jsonify({"midprice": (best_bid.price + best_offer.price) / 2})


@app.route("/market/<int:market_id>/last", methods=["GET"])
def get_market_last_trade(market_id):
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
    trades = state.markets[market_id].trades
    if not trades:
        return jsonify({"error": "No trades found for this market"}), 404
    return jsonify(trades[-1])


@app.route("/portfolio", methods=["GET"])
def get_portfolio():
    client_or_error = get_client_for_request()
    if not isinstance(client_or_error, TradingClient):
        return client_or_error  # Return the error response

    state = client_or_error.state()
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
