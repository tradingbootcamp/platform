import type { MarketData } from '$lib/api.svelte';
import { referencePriceValue, sortedBids, sortedOffers } from '$lib/components/marketDataUtils';
import { websocket_api } from 'schema-js';

export type PortfolioRow = {
	marketId: number;
	name: string;
	position: number;
	openBids: number;
	openOffers: number;
	capitalUsed: number;
	lockedBids: number;
	lockedOffers: number;
	lockedTotal: number;
	minSettlement: number;
	maxSettlement: number;
	bestBid?: number;
	bestOffer?: number;
	bestOwnBid?: number;
	bestOwnOffer?: number;
	referencePrice?: number;
	last?: number;
};

export type PortfolioMetrics = {
	rows: PortfolioRow[];
	totals: {
		capitalUsed: number;
		lockedBids: number;
		lockedOffers: number;
		markToMarket: number;
	};
};

const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

export const computePortfolioMetrics = (
	portfolio: websocket_api.IPortfolio | undefined,
	markets: Map<number, MarketData>,
	actingAs: number | undefined,
	_marketVersion?: string
): PortfolioMetrics => {
	if (!portfolio) {
		return {
			rows: [],
			totals: { capitalUsed: 0, lockedBids: 0, lockedOffers: 0, markToMarket: 0 }
		};
	}

	const rows: PortfolioRow[] = [];

	for (const exposure of portfolio.marketExposures || []) {
		const marketId = Number(exposure.marketId ?? 0);
		const marketData = markets.get(marketId);
		if (!marketData) continue;
		if (!marketData.definition?.open) continue;

		const position = exposure.position ?? 0;
		const openBids = exposure.totalBidSize ?? 0;
		const openOffers = exposure.totalOfferSize ?? 0;
		if (!position && !openBids && !openOffers) continue;

		const name = marketData.definition.name || `Market ${marketId}`;
		const minSettlement = marketData.definition.minSettlement ?? 0;
		const maxSettlement = marketData.definition.maxSettlement ?? 0;

		const bids = sortedBids(marketData.orders);
		const offers = sortedOffers(marketData.orders);
		const referencePrice = referencePriceValue(bids, offers);

		// Pick most recent trade by transaction id, then timestamp, else fallback to tail.
		const lastTrade =
			marketData.trades
				.slice()
				.sort(
					(a, b) =>
						(b.transactionId ?? 0) - (a.transactionId ?? 0) ||
						(b.transactionTimestamp?.seconds ?? 0) - (a.transactionTimestamp?.seconds ?? 0)
				)
				.at(0) || marketData.trades.at(-1);
		const last = lastTrade?.price ?? undefined;

		const ownOrders = marketData.orders.filter(
			(o) => actingAs !== undefined && o.ownerId === actingAs && (o.size ?? 0) > 0
		);
		const lockedBids = ownOrders
			.filter((o) => o.side === websocket_api.Side.BID)
			.reduce(
				(acc, order) => acc + (order.size ?? 0) * Math.max(0, (order.price ?? 0) - minSettlement),
				0
			);
		const lockedOffers = ownOrders
			.filter((o) => o.side === websocket_api.Side.OFFER)
			.reduce(
				(acc, order) => acc + (order.size ?? 0) * Math.max(0, maxSettlement - (order.price ?? 0)),
				0
			);
		const lockedTotal = lockedBids + lockedOffers;

		let capitalUsed = 0;
		if (referencePrice !== undefined) {
			capitalUsed =
				position >= 0
					? position * referencePrice
					: position * (referencePrice - maxSettlement);
			capitalUsed = Math.max(0, capitalUsed);
		}

		// Best own orders
		const bestOwnBid = bids.find((b) => b.ownerId === actingAs)?.price;
		const bestOwnOffer = offers.find((o) => o.ownerId === actingAs)?.price;

		rows.push({
			marketId,
			name,
			position,
			openBids,
			openOffers,
			capitalUsed,
			lockedBids,
			lockedOffers,
			lockedTotal,
			minSettlement,
			maxSettlement,
			bestBid: bids[0]?.price ?? undefined,
			bestOffer: offers[0]?.price ?? undefined,
			bestOwnBid,
			bestOwnOffer,
			referencePrice,
			last
		});
	}

	const totalCapitalUsed = sum(rows.map((row) => row.capitalUsed));
	const totalLockedBids = sum(rows.map((row) => row.lockedBids));
	const totalLockedOffers = sum(rows.map((row) => row.lockedOffers));
	const markToMarket =
		(portfolio.availableBalance ?? 0) + totalCapitalUsed + totalLockedBids + totalLockedOffers;

	return {
		rows,
		totals: {
			capitalUsed: totalCapitalUsed,
			lockedBids: totalLockedBids,
			lockedOffers: totalLockedOffers,
			markToMarket
		}
	};
};
