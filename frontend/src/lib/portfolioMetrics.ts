import type { MarketData } from '$lib/api.svelte';
import {
	lastTradePrice,
	midPriceValue,
	referencePriceValue,
	sortedBids,
	sortedOffers
} from '$lib/components/marketDataUtils';
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
	mid?: number;
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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_marketVersion?: string
): PortfolioMetrics => {
	if (!portfolio) {
		return {
			rows: [],
			totals: { capitalUsed: 0, lockedBids: 0, lockedOffers: 0, markToMarket: 0 }
		};
	}

	const rows: PortfolioRow[] = [];
	let totalPositionValue = 0;

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

		const last = lastTradePrice(marketData);
		const referencePrice = referencePriceValue(marketData);
		const mid = midPriceValue(bids, offers);

		// Accumulate position value for MtM (position * current market price)
		if (referencePrice !== undefined) {
			totalPositionValue += position * referencePrice;
		}

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
					? position * (referencePrice - minSettlement)
					: position * (referencePrice - maxSettlement);
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
			bestOwnBid: bestOwnBid ?? undefined,
			bestOwnOffer: bestOwnOffer ?? undefined,
			mid: mid ?? undefined,
			last
		});
	}

	const totalCapitalUsed = sum(rows.map((row) => row.capitalUsed));
	const totalLockedBids = sum(rows.map((row) => row.lockedBids));
	const totalLockedOffers = sum(rows.map((row) => row.lockedOffers));
	// MtM = cash + position value at market prices
	const markToMarket = (portfolio.totalBalance ?? 0) + totalPositionValue;

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
