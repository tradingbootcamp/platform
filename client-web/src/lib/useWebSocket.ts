import { useState, useEffect, useCallback, useRef } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";
import { websocket_api } from "schema-js";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;
const JWT = import.meta.env.VITE_JWT;
const ID_JWT = import.meta.env.VITE_ID_JWT;
const ACT_AS = import.meta.env.VITE_ACT_AS;

if (!API_URL || !JWT || !ID_JWT || !ACT_AS) {
  console.error("Environment variables:", import.meta.env);
  throw Error(
    ".env file doesn't contain entries for either VITE_API_URL, VITE_JWT, VITE_ID_JWT, or VITE_ACT_AS. Did you forget to copy .env.example into .env and set the missing variables?"
  );
}

const useWebSocket = () => {
  const [stale, setStale] = useState(true);
  const [actingAs, setActingAs] = useState<string | undefined>(undefined);
  const [portfolio, setPortfolio] = useState<
    websocket_api.IPortfolio | undefined
  >(undefined);
  const [payments, setPayments] = useState<websocket_api.IPayment[]>([]);
  const [ownerships, setOwnerships] = useState<websocket_api.IOwnership[]>([]);
  const [users, setUsers] = useState<Map<string, websocket_api.IUser>>(
    new Map()
  );
  const [markets, setMarkets] = useState<Record<number, websocket_api.IMarket>>(
    {}
  );
  const socketRef = useRef<ReconnectingWebSocket | null>(null);

  const sendClientMessage = useCallback((msg: websocket_api.IClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const data = websocket_api.ClientMessage.encode(msg).finish();
      socketRef.current.send(data);
      console.log("Sent client message:", msg);
    } else {
      console.warn("Attempted to send message, but socket is not ready");
    }
  }, []);

  useEffect(() => {
    console.log("Initializing WebSocket connection...");
    const newSocket = new ReconnectingWebSocket(API_URL);
    newSocket.binaryType = "arraybuffer";
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      console.log("WebSocket connection opened");
      const authenticate = {
        jwt: JWT,
        idJwt: ID_JWT,
        actAs: ACT_AS,
      };
      console.log("Sending authentication info:", authenticate);
      sendClientMessage({ authenticate });
    };

    newSocket.onclose = (event) => {
      console.log("WebSocket connection closed", event);
      setStale(true);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onmessage = (event: MessageEvent) => {
      const data = event.data;
      const msg = websocket_api.ServerMessage.decode(new Uint8Array(data));
      console.log("Received server message:", msg);

      if (msg.requestFailed) {
        throw Error(
          `Error in ${JSON.stringify(msg.requestFailed.requestDetails)}: ${JSON.stringify(msg.requestFailed.errorDetails)}`
        );
      }
      if (msg.actingAs) {
        console.log("Received actingAs message, setting stale to false");
        setStale(false);
        localStorage.setItem("actAs", msg.actingAs.userId!);
        setActingAs(msg.actingAs.userId!);
      }
      if (msg.portfolio) setPortfolio(msg.portfolio);
      if (msg.payments) setPayments(msg.payments.payments || []);
      if (msg.paymentCreated) {
        setPayments((prev) => {
          if (prev.find((p) => p.id === msg.paymentCreated!.id)) return prev;
          return [...prev, msg.paymentCreated!];
        });
      }
      if (msg.ownerships) setOwnerships(msg.ownerships.ownerships || []);
      if (msg.ownershipReceived) {
        setOwnerships((prev) => {
          if (prev.find((o) => o.ofBotId === msg.ownershipReceived!.ofBotId))
            return prev;
          return [...prev, msg.ownershipReceived!];
        });
      }
      if (msg.users) {
        setUsers(
          new Map(msg.users.users?.map((user) => [user.id!, user]) || [])
        );
      }
      if (msg.userCreated) {
        setUsers((prev) =>
          new Map(prev).set(msg.userCreated!.id!, msg.userCreated!)
        );
      }
      if (msg.marketData || msg.marketCreated) {
        const market = msg.marketData || msg.marketCreated;
        setMarkets((prev) => ({ ...prev, [market!.id]: market! }));
      }
      if (msg.marketSettled) {
        setMarkets((prev) => {
          const updatedMarket = { ...prev[msg.marketSettled!.id] };
          delete updatedMarket.open;
          updatedMarket.closed = {
            settlePrice: msg.marketSettled!.settlePrice,
          };
          updatedMarket.orders = [];
          return { ...prev, [msg.marketSettled!.id]: updatedMarket };
        });
      }
      if (msg.orderCancelled) {
        setMarkets((prev) => {
          const updatedMarket = { ...prev[msg.orderCancelled!.marketId] };
          updatedMarket.orders = updatedMarket.orders?.map((order) =>
            order.id === msg.orderCancelled!.id ? { ...order, size: 0 } : order
          );
          return { ...prev, [msg.orderCancelled!.marketId]: updatedMarket };
        });
      }
      if (msg.orderCreated) {
        setMarkets((prev) => {
          const updatedMarket = { ...prev[msg.orderCreated!.marketId] };
          if (msg.orderCreated!.order) {
            updatedMarket.orders = [
              ...(updatedMarket.orders || []),
              msg.orderCreated!.order,
            ];
          }
          if (msg.orderCreated!.fills) {
            updatedMarket.orders = updatedMarket.orders?.map((order) => {
              const fill = msg.orderCreated!.fills!.find(
                (f) => f.id === order.id
              );
              return fill ? { ...order, size: fill.sizeRemaining } : order;
            });
          }
          if (msg.orderCreated!.trades) {
            updatedMarket.trades = [
              ...(updatedMarket.trades || []),
              ...msg.orderCreated!.trades,
            ];
          }
          return { ...prev, [msg.orderCreated!.marketId]: updatedMarket };
        });
      }
    };

    return () => {
      console.log("Closing WebSocket connection");
      newSocket.close();
    };
  }, [sendClientMessage]);

  return {
    sendClientMessage,
    stale,
    actingAs,
    portfolio,
    payments,
    ownerships,
    users,
    markets,
  };
};

export default useWebSocket;
