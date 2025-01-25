import type { MarketData } from '$lib/api.svelte';
import { accountName } from '$lib/api.svelte';
import { websocket_api } from 'schema-js';

export const maxClosedTransactionId = (
	orders: websocket_api.IOrder[],
	trades: websocket_api.ITrade[],
	marketDefinition: websocket_api.IMarket
): number => {
	return Math.max(
		...orders.map((o) => o.transactionId),
		...orders.flatMap((o) => o.sizes || []).map((s) => s.transactionId),
		...trades.map((t) => t.transactionId),
		marketDefinition.transaction?.id ?? 0
	);
};

export const ordersAtTransaction = (
	marketData: MarketData,
	displayTransactionId: number | undefined
): websocket_api.IOrder[] => {
	if (!marketData.hasFullOrderHistory) return marketData.orders;

	if (displayTransactionId === undefined) {
		return marketData.orders.filter((o) => o.size !== 0);
	}

	return marketData.orders
		.map((o) => {
			const size = o.sizes?.findLast((s) => s.transactionId <= displayTransactionId);
			return { ...o, size: size?.size ?? 0 };
		})
		.filter((o) => o.size !== 0);
};

export const tradesAtTransaction = (
	trades: websocket_api.ITrade[] | undefined,
	displayTransactionId: number | undefined
): websocket_api.ITrade[] => {
	if (!trades) return [];

	if (displayTransactionId === undefined) {
		return trades;
	}

	return trades.filter((t) => t.transactionId <= displayTransactionId);
};

export const sortedBids = (orders: websocket_api.IOrder[]): websocket_api.IOrder[] => {
	return orders
		.filter((order) => order.side === websocket_api.Side.BID)
		.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
};

export const sortedOffers = (orders: websocket_api.IOrder[]): websocket_api.IOrder[] => {
	return orders
		.filter((order) => order.side === websocket_api.Side.OFFER)
		.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
};

export const midPrice = (bids: websocket_api.IOrder[], offers: websocket_api.IOrder[]): string => {
	const bestBid = bids[0];
	const bestOffer = offers[0];

	if (bestBid) {
		if (bestOffer) {
			return (((bestBid.price ?? 0) + (bestOffer.price ?? 0)) / 2).toFixed(2);
		}
		return bestBid.price?.toString() ?? '';
	}

	if (bestOffer) {
		return bestOffer.price?.toString() ?? '';
	}

	return '';
};

export const getShortUserName = (id: number | null | undefined): string => {
	return accountName(id).split(' ')[0];
};
