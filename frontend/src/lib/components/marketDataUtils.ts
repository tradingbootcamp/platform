import type { MarketData } from '$lib/api.svelte';
import { accountName } from '$lib/api.svelte';
import { formatUsername } from '$lib/utils';
import { websocket_api } from 'schema-js';

export const maxClosedTransactionId = (
	orders: websocket_api.IOrder[],
	trades: websocket_api.ITrade[],
	marketDefinition: websocket_api.IMarket
): number => {
	const closedTxn = marketDefinition.closed?.transactionId;
	if (closedTxn != null) return closedTxn - 1;
	return Math.max(
		...orders.map((o) => o.transactionId),
		...orders.flatMap((o) => o.sizes || []).map((s) => s.transactionId),
		...trades.map((t) => t.transactionId),
		marketDefinition.transactionId ?? 0
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

export const positionsAtTransaction = (
	trades: websocket_api.ITrade[],
	redemptions: websocket_api.IRedeemed[],
	displayTransactionId: number | undefined
): websocket_api.IParticipantPosition[] | null => {
	if (displayTransactionId === undefined) return null;

	const filteredTrades = trades.filter((t) => (t.transactionId ?? 0) <= displayTransactionId);
	const filteredRedemptions = redemptions.filter(
		(r) => (r.transactionId ?? 0) <= displayTransactionId
	);

	const accounts = new Map<
		number,
		{ buySize: number; sellSize: number; buyValue: number; sellValue: number; redeemed: number }
	>();

	const getOrCreate = (accountId: number) => {
		let entry = accounts.get(accountId);
		if (!entry) {
			entry = { buySize: 0, sellSize: 0, buyValue: 0, sellValue: 0, redeemed: 0 };
			accounts.set(accountId, entry);
		}
		return entry;
	};

	// Seed all participants from the full trade list so future participants show as zero rows
	for (const t of trades) {
		getOrCreate(Number(t.buyerId));
		getOrCreate(Number(t.sellerId));
	}
	for (const r of redemptions) {
		getOrCreate(Number(r.accountId));
	}

	for (const t of filteredTrades) {
		const size = t.size ?? 0;
		const price = t.price ?? 0;
		const value = size * price;

		const buyer = getOrCreate(Number(t.buyerId));
		buyer.buySize += size;
		buyer.buyValue += value;

		const seller = getOrCreate(Number(t.sellerId));
		seller.sellSize += size;
		seller.sellValue += value;
	}

	for (const r of filteredRedemptions) {
		const entry = getOrCreate(Number(r.accountId));
		entry.redeemed += r.amount ?? 0;
	}

	const positions: websocket_api.IParticipantPosition[] = [];
	for (const [accountId, data] of accounts) {
		const gross = data.buySize + data.sellSize;
		const net = data.buySize - data.sellSize - data.redeemed;
		positions.push({
			accountId,
			gross,
			net,
			avgBuyPrice: data.buySize > 0 ? data.buyValue / data.buySize : null,
			avgSellPrice: data.sellSize > 0 ? data.sellValue / data.sellSize : null
		});
	}

	return positions;
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

export const midPriceValue = (
	bids: websocket_api.IOrder[],
	offers: websocket_api.IOrder[]
): number | undefined => {
	const bestBid = bids[0];
	const bestOffer = offers[0];

	if (!bestBid || !bestOffer) return undefined;

	return ((bestBid.price ?? 0) + (bestOffer.price ?? 0)) / 2;
};

export const lastTradePrice = (marketData: MarketData): number | undefined => {
	const lastTrade =
		marketData.trades
			.slice()
			.sort(
				(a, b) =>
					(b.transactionId ?? 0) - (a.transactionId ?? 0) ||
					(b.transactionTimestamp?.seconds ?? 0) - (a.transactionTimestamp?.seconds ?? 0)
			)
			.at(0) || marketData.trades.at(-1);
	return lastTrade?.price ?? undefined;
};

export const referencePriceValue = (marketData: MarketData): number | undefined => {
	return lastTradePrice(marketData);
};

export const midPrice = (bids: websocket_api.IOrder[], offers: websocket_api.IOrder[]): string => {
	const price = midPriceValue(bids, offers);
	if (price === undefined) return '---';
	return price.toFixed(2);
};

export const getShortUserName = (id: number | null | undefined): string => {
	const name = accountName(id, undefined, { raw: true });
	return formatUsername(name, 'compact');
};

/**
 * Determines if a market should display a border
 * @param market The market definition or name to check
 * @returns boolean indicating if the market should have a border
 */
export function shouldShowPuzzleHuntBorder(
	market: websocket_api.IMarket | undefined | null
): boolean {
	if (!market) return false;

	// If we have a full market object
	return market.name?.startsWith('ASCII') ?? false;
}

export function formatPrice(price: number | null | undefined): string {
	if (price === null || price === undefined) return '--';
	return price.toFixed(1);
}

export function formatBalance(value: number | null | undefined): string {
	return new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 0
	}).format(value ?? 0);
}

const tenthFormatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 1,
	useGrouping: false
});

const wholeFormatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 0,
	useGrouping: false
});

export function roundToTenth<T extends number | string | null | undefined>(value: T): T | number {
	if (value === '' || value === null || value === undefined) return value;
	const numeric = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(numeric)) return value;
	return Number(tenthFormatter.format(numeric));
}

export function roundToWhole<T extends number | string | null | undefined>(value: T): T | number {
	if (value === '' || value === null || value === undefined) return value;
	const numeric = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(numeric)) return value;
	return Number(wholeFormatter.format(numeric));
}
