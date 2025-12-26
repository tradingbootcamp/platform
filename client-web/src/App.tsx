import { FormEvent, useState, useEffect } from "react";

import { websocket_api } from "schema-js";
import useWebSocket from "./lib/useWebSocket";
import { useNotifications } from "./lib/notifications";

function App() {
  const {
    sendClientMessage,
    stale,
    actingAs,
    portfolio,
    payments,
    ownerships,
    users,
    markets,
    lastMessage,
  } = useWebSocket();

  const [marketId, setMarketId] = useState(0);

  const [orderType, setOrderType] = useState("bid");
  const [orderSize, setOrderSize] = useState("");
  const [orderPrice, setOrderPrice] = useState("");

  const marketLoaded = String(marketId) in markets;
  if (!marketLoaded) {
    return (
      <header className="container">
        <details className="dropdown">
          <summary role="button" className="secondary">
            Select market
          </summary>
          <ul>
            {Object.entries(markets).map(([id, market]) => {
              return (
                <li>
                  <a href="#" onClick={() => setMarketId(Number(id))}>
                    {market.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </details>
      </header>
    );
  }
  const market = markets[marketId];
  const bids =
    market.orders?.filter(
      (x) =>
        x.side === websocket_api.Side.BID && x.price !== null && "price" in x
    ) || [];
  const offers =
    market.orders?.filter(
      (x) =>
        x.side === websocket_api.Side.OFFER && x.price !== null && "price" in x
    ) || [];

  bids.sort((a, b) => b.price! - a.price!);
  offers.sort((a, b) => a.price! - b.price!);
  const bestBid = Math.max(market.minSettlement || 0, bids[0]?.price || 0);
  const bestOffer = Math.min(
    market.maxSettlement || 1_000_000_000_000,
    offers[0]?.price || 1_000_000_000_000
  );

  const handleOutAllOrders = () => {
    sendClientMessage({
      out: {
        marketId,
      },
    });
  };

  const handleSubmitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const size = parseInt(orderSize);
    const price = parseFloat(orderPrice);

    if (isNaN(size) || isNaN(price) || size <= 0 || price < 0) {
      alert("Please enter valid size and price values.");
      return;
    }

    const order = {
      marketId: marketId,
      size: size,
      price: price,
      side:
        orderType === "bid" ? websocket_api.Side.BID : websocket_api.Side.OFFER,
    };

    sendClientMessage({
      createOrder: order,
    });
  };

  return (
    <>
      <header className="container">
        <h1>
          Currently viewing <em>{market.name}</em> and acting as{" "}
          <em>{users.get(actingAs || "")?.name}</em>.
        </h1>
        {market.closed ? (
          <h3>Market is settled at {market.closed.settlePrice}.</h3>
        ) : (
          <></>
        )}
        <nav>
          <ul>
            <li>
              <details className="dropdown">
                <summary role="button" className="secondary">
                  Select market
                </summary>
                <ul>
                  {Object.entries(markets).map(([id, market]) => {
                    return (
                      <li>
                        <a href="#" onClick={() => setMarketId(Number(id))}>
                          {market.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container">
        <div className="container">
          <div className="grid">
            <div>
              <h3>Bids</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid, index) => (
                    <tr key={`bid-${index}`}>
                      <td>
                        {bid.ownerId == actingAs ? (
                          <ins>
                            {bid.ownerId ? users.get(bid.ownerId)?.name : ""}
                          </ins>
                        ) : bid.ownerId ? (
                          users.get(bid.ownerId)?.name
                        ) : (
                          ""
                        )}
                      </td>
                      <td>{bid.size}</td>
                      <td>{bid.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3>Offers</h3>
              <table>
                <thead>
                  <tr>
                    <th>Price</th>
                    <th>Size</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer, index) => (
                    <tr key={`offer-${index}`}>
                      <td>{offer.price}</td>
                      <td>{offer.size}</td>
                      <td>
                        {offer.ownerId == actingAs ? (
                          <ins>
                            {offer.ownerId
                              ? users.get(offer.ownerId)?.name
                              : ""}
                          </ins>
                        ) : offer.ownerId ? (
                          users.get(offer.ownerId)?.name
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="container">
          <h3>Place an order</h3>
          <form onSubmit={handleSubmitOrder}>
            <div className="grid">
              <label>
                Order Type:
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="bid">Bid</option>
                  <option value="offer">Offer</option>
                </select>
              </label>
              <label>
                Size:
                <input
                  type="number"
                  value={orderSize}
                  onChange={(e) => setOrderSize(e.target.value)}
                  placeholder="Enter size"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Price:
                <input
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  placeholder="Enter price"
                  step="0.01"
                  required
                />
              </label>
            </div>
            <button type="submit">Place Order</button>
          </form>
        </div>
        <div className="grid">
          <button onClick={handleOutAllOrders} className="contrast">
            Out on all orders
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
