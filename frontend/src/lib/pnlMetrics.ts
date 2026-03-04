import type { MarketData } from '$lib/api.svelte';
import { websocket_api } from 'schema-js';

export type PnLDataPoint = {
	timestamp: Date;
	cumulativePnL: number;
	cashFlow: number;
};

export type PositionDataPoint = { timestamp: Date; position: number };

export type MarketPnLSummary = {
	marketId: number;
	marketName: string;
	groupId: number | undefined;
	totalPnL: number;
	isSettled: boolean;
	settlePrice: number | undefined;
	position: number;
	tradeCount: number;
	volume: number;
	clipsTraded: number;
};

export type PnLResult = {
	dataPoints: PnLDataPoint[];
	positionTimeline: PositionDataPoint[];
	marketSummaries: MarketPnLSummary[];
	totalPnL: number;
	totalVolume: number;
	totalBuyVolume: number;
	totalSellVolume: number;
	totalClipsTraded: number;
	bestMarket: MarketPnLSummary | undefined;
	worstMarket: MarketPnLSummary | undefined;
	totalTradesCount: number;
	hasHiddenIdMarkets: boolean;
};

type TradeEvent = {
	timestamp: Date;
	transactionId: number;
	marketId: number;
	price: number;
	size: number;
	isBuyer: boolean;
	isAccountTrade: boolean;
};

type MarketMeta = {
	name: string;
	groupId: number | undefined;
	isSettled: boolean;
	settlePrice: number | undefined;
	settleTimestamp: Date | undefined;
	settleTransactionId: number | undefined;
};

const emptyResult = (): PnLResult => ({
	dataPoints: [],
	positionTimeline: [],
	marketSummaries: [],
	totalPnL: 0,
	totalVolume: 0,
	totalBuyVolume: 0,
	totalSellVolume: 0,
	totalClipsTraded: 0,
	bestMarket: undefined,
	worstMarket: undefined,
	totalTradesCount: 0,
	hasHiddenIdMarkets: false
});

function toDate(ts: { seconds?: number | null } | null | undefined): Date {
	if (!ts) return new Date(0);
	return new Date(Number(ts.seconds ?? 0) * 1000);
}

/**
 * Compute PnL over time from trade history.
 *
 * PnL(T) = cashFlow(T) + sum(position_M(T) * lastPrice_M(T))
 *
 * where cashFlow tracks cumulative cash from buys (negative) and sells (positive),
 * and positions are marked to the last trade price (or settle price for closed markets).
 */
export function computePnLOverTime(
	accountId: number,
	markets: Map<number, MarketData>,
	filterMarketIds?: Set<number>,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	_version?: string
): PnLResult {
	if (!accountId) return emptyResult();

	// 1. Collect all trades and market metadata
	const events: TradeEvent[] = [];
	const marketMeta = new Map<number, MarketMeta>();
	let hasHiddenIdMarkets = false;

	for (const [marketId, marketData] of markets) {
		const mid = Number(marketId);
		if (filterMarketIds && !filterMarketIds.has(mid)) continue;
		if (!marketData.hasFullTradeHistory) continue;

		const def = marketData.definition;
		const isSettled = !!def.closed;

		marketMeta.set(mid, {
			name: def.name || `Market ${mid}`,
			groupId: def.groupId ? Number(def.groupId) : undefined,
			isSettled,
			settlePrice: def.closed?.settlePrice ?? undefined,
			settleTimestamp: def.closed?.transactionTimestamp
				? toDate(def.closed.transactionTimestamp)
				: undefined,
			settleTransactionId: def.closed?.transactionId ? Number(def.closed.transactionId) : undefined
		});

		// Check for hidden account IDs
		const accountTrades = marketData.trades.filter(
			(t) => t.buyerId === accountId || t.sellerId === accountId
		);
		if (
			accountTrades.length === 0 &&
			marketData.trades.some((t) => t.buyerId === 0 || t.sellerId === 0)
		) {
			// This market may have hidden IDs affecting our view
			hasHiddenIdMarkets = true;
		}

		for (const trade of marketData.trades) {
			const isAccountTrade = trade.buyerId === accountId || trade.sellerId === accountId;

			events.push({
				timestamp: toDate(trade.transactionTimestamp),
				transactionId: Number(trade.transactionId ?? 0),
				marketId: mid,
				price: trade.price ?? 0,
				size: trade.size ?? 0,
				isBuyer: trade.buyerId === accountId,
				isAccountTrade
			});
		}
	}

	// Sort by transaction ID (reliable ordering) then timestamp as tiebreaker
	events.sort(
		(a, b) => a.transactionId - b.transactionId || a.timestamp.getTime() - b.timestamp.getTime()
	);

	// 2. Walk through events, maintaining per-market state
	const positionByMarket = new Map<number, number>();
	const cashFlowByMarket = new Map<number, number>();
	const lastPriceByMarket = new Map<number, number>();
	const tradeCountByMarket = new Map<number, number>();
	const volumeByMarket = new Map<number, number>();
	const clipsByMarket = new Map<number, number>();
	const totalBoughtByMarket = new Map<number, number>();

	const dataPoints: PnLDataPoint[] = [];
	const positionTimeline: PositionDataPoint[] = [];
	const trackPosition = filterMarketIds?.size === 1;
	const singleMarketId = trackPosition ? [...filterMarketIds!][0] : undefined;

	// Track which settled markets still need a settlement event injected
	const settledMarketsToProcess = new Set<number>();
	for (const [mid, meta] of marketMeta) {
		if (meta.isSettled && meta.settleTransactionId !== undefined) {
			settledMarketsToProcess.add(mid);
		}
	}

	const computePnLAtPoint = (): { totalCash: number; totalMtM: number } => {
		let totalCash = 0;
		let totalMtM = 0;

		for (const [mid, cash] of cashFlowByMarket) {
			totalCash += cash;
			const pos = positionByMarket.get(mid) ?? 0;
			const meta = marketMeta.get(mid);
			const price =
				meta?.isSettled && meta.settlePrice !== undefined
					? meta.settlePrice
					: (lastPriceByMarket.get(mid) ?? 0);
			totalMtM += pos * price;
		}

		return { totalCash, totalMtM };
	};

	const processAccountTrade = (event: TradeEvent) => {
		const prevPosition = positionByMarket.get(event.marketId) ?? 0;
		const prevCash = cashFlowByMarket.get(event.marketId) ?? 0;

		if (event.isBuyer) {
			positionByMarket.set(event.marketId, prevPosition + event.size);
			cashFlowByMarket.set(event.marketId, prevCash - event.price * event.size);
			totalBoughtByMarket.set(
				event.marketId,
				(totalBoughtByMarket.get(event.marketId) ?? 0) + event.size
			);
		} else {
			positionByMarket.set(event.marketId, prevPosition - event.size);
			cashFlowByMarket.set(event.marketId, prevCash + event.price * event.size);
		}

		tradeCountByMarket.set(event.marketId, (tradeCountByMarket.get(event.marketId) ?? 0) + 1);
		volumeByMarket.set(event.marketId, (volumeByMarket.get(event.marketId) ?? 0) + event.size);
		clipsByMarket.set(event.marketId, (clipsByMarket.get(event.marketId) ?? 0) + event.price * event.size);
	};

	for (const event of events) {
		// Always update last price (market-wide event)
		lastPriceByMarket.set(event.marketId, event.price);

		// Check if any settled markets should be processed before this event
		for (const mid of settledMarketsToProcess) {
			const meta = marketMeta.get(mid)!;
			if (meta.settleTransactionId! <= event.transactionId) {
				// Settlement happened at or before this event - finalize the position
				const pos = positionByMarket.get(mid) ?? 0;
				if (pos !== 0) {
					const prevCash = cashFlowByMarket.get(mid) ?? 0;
					cashFlowByMarket.set(mid, prevCash + pos * meta.settlePrice!);
					positionByMarket.set(mid, 0);

					const { totalCash, totalMtM } = computePnLAtPoint();
					dataPoints.push({
						timestamp: meta.settleTimestamp!,
						cumulativePnL: totalCash + totalMtM,
						cashFlow: totalCash
					});
					if (trackPosition) {
						positionTimeline.push({ timestamp: meta.settleTimestamp!, position: 0 });
					}
				}
				settledMarketsToProcess.delete(mid);
			}
		}

		if (event.isAccountTrade) {
			processAccountTrade(event);

			const { totalCash, totalMtM } = computePnLAtPoint();
			dataPoints.push({
				timestamp: event.timestamp,
				cumulativePnL: totalCash + totalMtM,
				cashFlow: totalCash
			});
			if (trackPosition) {
				positionTimeline.push({
					timestamp: event.timestamp,
					position: positionByMarket.get(singleMarketId!) ?? 0
				});
			}
		}
	}

	// Process any remaining settlements that happened after the last trade
	for (const mid of settledMarketsToProcess) {
		const meta = marketMeta.get(mid)!;
		const pos = positionByMarket.get(mid) ?? 0;
		if (pos !== 0) {
			const prevCash = cashFlowByMarket.get(mid) ?? 0;
			cashFlowByMarket.set(mid, prevCash + pos * meta.settlePrice!);
			positionByMarket.set(mid, 0);

			const { totalCash, totalMtM } = computePnLAtPoint();
			dataPoints.push({
				timestamp: meta.settleTimestamp!,
				cumulativePnL: totalCash + totalMtM,
				cashFlow: totalCash
			});
			if (trackPosition) {
				positionTimeline.push({ timestamp: meta.settleTimestamp!, position: 0 });
			}
		}
	}

	// 3. Compute per-market summaries
	const marketSummaries: MarketPnLSummary[] = [];
	let totalPnL = 0;
	let totalVolume = 0;
	let totalBuyVolume = 0;
	let totalClipsTraded = 0;

	for (const [mid, meta] of marketMeta) {
		const cash = cashFlowByMarket.get(mid) ?? 0;
		const position = positionByMarket.get(mid) ?? 0;
		const tradeCount = tradeCountByMarket.get(mid) ?? 0;
		if (tradeCount === 0) continue;

		const markPrice = meta.isSettled ? (meta.settlePrice ?? 0) : (lastPriceByMarket.get(mid) ?? 0);

		const marketPnL = cash + position * markPrice;

		totalPnL += marketPnL;
		totalVolume += volumeByMarket.get(mid) ?? 0;
		totalBuyVolume += totalBoughtByMarket.get(mid) ?? 0;
		totalClipsTraded += clipsByMarket.get(mid) ?? 0;

		marketSummaries.push({
			marketId: mid,
			marketName: meta.name,
			groupId: meta.groupId,
			totalPnL: marketPnL,
			isSettled: meta.isSettled,
			settlePrice: meta.settlePrice,
			position,
			tradeCount,
			volume: volumeByMarket.get(mid) ?? 0,
			clipsTraded: clipsByMarket.get(mid) ?? 0
		});
	}

	marketSummaries.sort((a, b) => b.totalPnL - a.totalPnL);

	return {
		dataPoints,
		positionTimeline,
		marketSummaries,
		totalPnL,
		totalVolume,
		totalBuyVolume,
		totalSellVolume: totalVolume - totalBuyVolume,
		totalClipsTraded,
		bestMarket: marketSummaries[0],
		worstMarket: marketSummaries[marketSummaries.length - 1],
		totalTradesCount: marketSummaries.reduce((sum, m) => sum + m.tradeCount, 0),
		hasHiddenIdMarkets
	};
}

/**
 * Get market IDs that need full trade history loaded for PnL computation.
 * Includes markets with current exposure and markets where the account appears in existing trades.
 */
export function getMarketsNeedingHistory(
	accountId: number,
	markets: Map<number, MarketData>,
	portfolio: websocket_api.IPortfolio | undefined
): number[] {
	const needed: number[] = [];
	const seen = new Set<number>();

	// Markets with current exposure
	for (const exposure of portfolio?.marketExposures || []) {
		const marketId = Number(exposure.marketId ?? 0);
		const marketData = markets.get(marketId);
		if (marketData && !marketData.hasFullTradeHistory && !seen.has(marketId)) {
			seen.add(marketId);
			needed.push(marketId);
		}
	}

	// Markets where account appears in existing trades
	for (const [marketId, marketData] of markets) {
		const mid = Number(marketId);
		if (marketData.hasFullTradeHistory || seen.has(mid)) continue;
		const hasOurTrades = marketData.trades.some(
			(t) => t.buyerId === accountId || t.sellerId === accountId
		);
		if (hasOurTrades) {
			seen.add(mid);
			needed.push(mid);
		}
	}

	return needed;
}

/**
 * Get the set of market IDs that belong to a given market group.
 */
export function getMarketIdsForGroup(
	groupId: number,
	markets: Map<number, MarketData>
): Set<number> {
	const ids = new Set<number>();
	for (const [marketId, marketData] of markets) {
		if (Number(marketData.definition.groupId ?? 0) === groupId) {
			ids.add(Number(marketId));
		}
	}
	return ids;
}
