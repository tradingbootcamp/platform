import { toast } from "react-toastify";
import { websocket_api } from "schema-js";

export const createNotificationHandler = (
  actingAs: string | undefined,
  users: Map<string, websocket_api.IUser>,
  markets: Record<number, websocket_api.IMarket>
) => {
  return (msg: websocket_api.ServerMessage): void => {
    if (!msg) return;
    console.log(`got ${msg.message} message`, msg.toJSON()[msg.message!]);

    switch (msg.message) {
      case "marketCreated": {
        const marketCreated = msg.marketCreated!;
        if (marketCreated.ownerId === actingAs) {
          toast.success(`Market created: ${marketCreated.name!}`);
        }
        return;
      }
      case "marketSettled": {
        const marketSettled = msg.marketSettled!;
        const market = markets[marketSettled.id];
        if (!market) {
          console.error("Market not in state", { marketSettled });
          return;
        }
        const message = `Market settled: ${market.name} settled at ${marketSettled.settlePrice}`;
        if (market.ownerId === actingAs) {
          toast.success(message);
        } else {
          toast.info(message);
        }
        return;
      }
      case "orderCancelled": {
        const orderCancelled = msg.orderCancelled!;
        const market = markets[orderCancelled.marketId];
        const order = market.orders?.find((o) => o.id === orderCancelled.id);
        if (order?.ownerId === actingAs) {
          if (order?.side == websocket_api.Side.BID) {
            toast.success(`Order cancelled: ${order.price} for ${order.size}`);
          } else if (order?.side == websocket_api.Side.OFFER) {
            toast.success(`Order cancelled: ${order.size} at ${order.price}`);
          } else {
            toast.success(`Order cancelled`);
          }
        }
        return;
      }
      case "orderCreated": {
        const orderCreated = msg.orderCreated!;
        if (orderCreated.userId !== actingAs) {
          return;
        }
        const orderSideString =
          orderCreated.order?.side == websocket_api.Side.BID ? "Bid" : "Offer";
        const realFills =
          orderCreated.fills?.filter((fill) => fill.ownerId !== actingAs) ?? [];
        const fillSize = realFills.reduce(
          (acc, fill) => acc + (fill.sizeFilled ?? 0),
          0
        );
        const fillPrice = realFills.reduce(
          (acc, fill) =>
            acc + ((fill.price ?? 0) * (fill.sizeFilled ?? 0)) / fillSize!,
          0
        );
        const fillSizeString = String(fillSize || "").includes(".")
          ? fillSize.toFixed(2)
          : fillSize;
        const fillPriceString = String(fillPrice || "").includes(".")
          ? fillPrice.toFixed(2)
          : fillPrice;
        const baseMessage = orderCreated.order
          ? realFills.length
            ? `${orderSideString} partially filled`
            : `${orderSideString} created`
          : realFills.length
            ? `${orderSideString} filled`
            : `${orderSideString} self-filled`;
        const message = fillSize
          ? `${baseMessage}: filled ${fillSizeString} @ ${fillPriceString}`
          : baseMessage;
        toast.success(message);
        return;
      }
      case "paymentCreated": {
        const paymentCreated = msg.paymentCreated!;
        const amount = paymentCreated.amount;
        const payer = users.get(paymentCreated.payerId || "");
        const recipient = users.get(paymentCreated.recipientId || "");

        if (payer?.id === actingAs) {
          toast.success(
            `Payment created: You paid ${recipient?.name} ${amount}`
          );
        } else if (recipient?.id === actingAs) {
          toast.info(`Payment created: ${payer?.name} paid you ${amount}`);
        } else {
          console.error("Bad paymentCreated message", { paymentCreated });
        }
        return;
      }
      case "ownershipReceived": {
        const ownership = msg.ownershipReceived!;
        const botName = users.get(ownership?.ofBotId || "")?.name;
        toast.info(`Ownership received: You now own ${botName}`);
        return;
      }
      case "ownershipGiven":
        toast.success("Ownership given");
        return;
      case "requestFailed": {
        const requestFailed = msg.requestFailed!;
        toast.error(
          `${requestFailed.requestDetails?.kind} failed: ${requestFailed.errorDetails?.message}`
        );
        return;
      }
    }
  };
};

export const useNotifications = (
  actingAs: string | undefined,
  users: Map<string, websocket_api.IUser>,
  markets: Record<number, websocket_api.IMarket>
) => {
  return createNotificationHandler(actingAs, users, markets);
};
