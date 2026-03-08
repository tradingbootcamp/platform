import type { MarketData } from '$lib/api.svelte';
import { websocket_api } from 'schema-js';

export type PnLMarkingMode = 'settlement' | 'market' | 'theoretical';

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
	type: 'trade';
	timestamp: Date;
	transactionId: number;
	marketId: number;
	price: number;
	size: number;
	isBuyer: boolean;
	isAccountTrade: boolean;
};

type RedemptionEvent = {
	type: 'redemption';
	timestamp: Date;
	transactionId: number;
	fundId: number;
	amount: number;
	constituents: { marketId: number; multiplier: number }[];
	redeemFee: number;
	isAccountRedemption: boolean;
};

type TimelineEvent = TradeEvent | RedemptionEvent;

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
	_version?: string,
	markingMode: PnLMarkingMode = 'settlement',
	theoreticalPrice?: number
): PnLResult {
	if (!accountId) return emptyResult();

	// 1. Collect all trades, redemptions, and market metadata
	const events: TimelineEvent[] = [];
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
				type: 'trade',
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

	// Collect redemption events from all fund markets (not just filtered ones,
	// since a redemption on a fund affects constituent markets that may be in the filter)
	const seenRedemptionTxns = new Set<string>();
	for (const [marketId, marketData] of markets) {
		const fundId = Number(marketId);
		if (!marketData.redemptions.length) continue;

		const def = marketData.definition;
		const constituents = (def.redeemableFor ?? []).map((r) => ({
			marketId: Number(r.constituentId),
			multiplier: Number(r.multiplier ?? 0)
		}));
		const redeemFee = def.redeemFee ?? 0;

		// Check if the fund or any constituent is relevant to our filter
		const fundIsRelevant = !filterMarketIds || filterMarketIds.has(fundId);
		const anyConstituentRelevant =
			!filterMarketIds || constituents.some((c) => filterMarketIds.has(c.marketId));
		if (!fundIsRelevant && !anyConstituentRelevant) continue;

		for (const redemption of marketData.redemptions) {
			const txnKey = `${redemption.accountId}-${redemption.fundId}-${redemption.transactionId}`;
			if (seenRedemptionTxns.has(txnKey)) continue;
			seenRedemptionTxns.add(txnKey);

			const isAccountRedemption = redemption.accountId === accountId;

			events.push({
				type: 'redemption',
				timestamp: toDate(redemption.transactionTimestamp),
				transactionId: Number(redemption.transactionId ?? 0),
				fundId,
				amount: redemption.amount ?? 0,
				constituents,
				redeemFee,
				isAccountRedemption
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
			let price: number;
			if (
				markingMode === 'theoretical' &&
				theoreticalPrice !== undefined &&
				filterMarketIds?.has(mid)
			) {
				price = theoreticalPrice;
			} else if (markingMode === 'market') {
				price = lastPriceByMarket.get(mid) ?? 0;
			} else {
				// settlement mode (default) — current behavior
				const meta = marketMeta.get(mid);
				price =
					meta?.isSettled && meta.settlePrice !== undefined
						? meta.settlePrice
						: (lastPriceByMarket.get(mid) ?? 0);
			}
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
		clipsByMarket.set(
			event.marketId,
			(clipsByMarket.get(event.marketId) ?? 0) + event.price * event.size
		);
	};

	// Track total redeem fees paid (not attributed to any market)
	let totalRedeemFees = 0;

	const processSettlements = (beforeTransactionId: number) => {
		for (const mid of settledMarketsToProcess) {
			const meta = marketMeta.get(mid)!;
			if (meta.settleTransactionId! <= beforeTransactionId) {
				// Settlement happened at or before this event - finalize the position
				const pos = positionByMarket.get(mid) ?? 0;
				if (pos !== 0) {
					const prevCash = cashFlowByMarket.get(mid) ?? 0;
					cashFlowByMarket.set(mid, prevCash + pos * meta.settlePrice!);
					positionByMarket.set(mid, 0);

					const { totalCash, totalMtM } = computePnLAtPoint();
					dataPoints.push({
						timestamp: meta.settleTimestamp!,
						cumulativePnL: totalCash + totalMtM - totalRedeemFees,
						cashFlow: totalCash - totalRedeemFees
					});
					if (trackPosition) {
						positionTimeline.push({ timestamp: meta.settleTimestamp!, position: 0 });
					}
				}
				settledMarketsToProcess.delete(mid);
			}
		}
	};

	for (const event of events) {
		// Check if any settled markets should be processed before this event
		processSettlements(event.transactionId);

		if (event.type === 'trade') {
			// Always update last price (market-wide event)
			lastPriceByMarket.set(event.marketId, event.price);

			if (event.isAccountTrade) {
				processAccountTrade(event);

				const { totalCash, totalMtM } = computePnLAtPoint();
				dataPoints.push({
					timestamp: event.timestamp,
					cumulativePnL: totalCash + totalMtM - totalRedeemFees,
					cashFlow: totalCash - totalRedeemFees
				});
				if (trackPosition) {
					positionTimeline.push({
						timestamp: event.timestamp,
						position: positionByMarket.get(singleMarketId!) ?? 0
					});
				}
			}
		} else if (event.type === 'redemption' && event.isAccountRedemption) {
			// Redemption: decrease fund position, increase constituent positions
			const fundId = event.fundId;
			const amount = event.amount;

			// Decrease fund position
			if (!filterMarketIds || filterMarketIds.has(fundId)) {
				const prevPos = positionByMarket.get(fundId) ?? 0;
				positionByMarket.set(fundId, prevPos - amount);
				// Ensure the fund market has an entry in cashFlowByMarket for PnL computation
				if (!cashFlowByMarket.has(fundId)) cashFlowByMarket.set(fundId, 0);
			}

			// Increase constituent positions
			for (const { marketId: cid, multiplier } of event.constituents) {
				if (filterMarketIds && !filterMarketIds.has(cid)) continue;
				const prevPos = positionByMarket.get(cid) ?? 0;
				positionByMarket.set(cid, prevPos + amount * multiplier);
				if (!cashFlowByMarket.has(cid)) cashFlowByMarket.set(cid, 0);
			}

			// Track redeem fee (attributed to the fund market)
			if (!filterMarketIds || filterMarketIds.has(fundId)) {
				totalRedeemFees += event.redeemFee * amount;
			}

			const { totalCash, totalMtM } = computePnLAtPoint();
			dataPoints.push({
				timestamp: event.timestamp,
				cumulativePnL: totalCash + totalMtM - totalRedeemFees,
				cashFlow: totalCash - totalRedeemFees
			});
			if (trackPosition) {
				positionTimeline.push({
					timestamp: event.timestamp,
					position: positionByMarket.get(singleMarketId!) ?? 0
				});
			}
		}
	}

	// Process any remaining settlements that happened after the last event
	processSettlements(Infinity);

	// 3. Compute per-market summaries
	// Include all markets that have trades OR were affected by redemptions
	const affectedMarkets = new Set<number>();
	for (const mid of cashFlowByMarket.keys()) affectedMarkets.add(mid);
	for (const mid of positionByMarket.keys()) affectedMarkets.add(mid);

	const marketSummaries: MarketPnLSummary[] = [];
	let totalPnL = -totalRedeemFees;
	let totalVolume = 0;
	let totalBuyVolume = 0;
	let totalClipsTraded = 0;

	for (const mid of affectedMarkets) {
		const meta = marketMeta.get(mid);
		const cash = cashFlowByMarket.get(mid) ?? 0;
		const position = positionByMarket.get(mid) ?? 0;
		const tradeCount = tradeCountByMarket.get(mid) ?? 0;
		if (tradeCount === 0 && position === 0 && cash === 0) continue;

		let markPrice: number;
		if (
			markingMode === 'theoretical' &&
			theoreticalPrice !== undefined &&
			filterMarketIds?.has(mid)
		) {
			markPrice = theoreticalPrice;
		} else if (markingMode === 'market') {
			markPrice = lastPriceByMarket.get(mid) ?? 0;
		} else {
			markPrice =
				meta?.isSettled && meta.settlePrice !== undefined
					? meta.settlePrice
					: (lastPriceByMarket.get(mid) ?? 0);
		}

		const marketPnL = cash + position * markPrice;

		totalPnL += marketPnL;
		totalVolume += volumeByMarket.get(mid) ?? 0;
		totalBuyVolume += totalBoughtByMarket.get(mid) ?? 0;
		totalClipsTraded += clipsByMarket.get(mid) ?? 0;

		// Look up name from meta or from the markets map
		let marketName = meta?.name ?? `Market ${mid}`;
		if (!meta) {
			const md = markets.get(mid);
			if (md) marketName = md.definition.name || marketName;
		}

		marketSummaries.push({
			marketId: mid,
			marketName,
			groupId: meta?.groupId,
			totalPnL: marketPnL,
			isSettled: meta?.isSettled ?? false,
			settlePrice: meta?.settlePrice,
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

	// Markets where account appears in existing trades or redemptions
	for (const [marketId, marketData] of markets) {
		const mid = Number(marketId);
		if (marketData.hasFullTradeHistory || seen.has(mid)) continue;
		const hasOurTrades = marketData.trades.some(
			(t) => t.buyerId === accountId || t.sellerId === accountId
		);
		const hasOurRedemptions = marketData.redemptions.some((r) => r.accountId === accountId);
		if (hasOurTrades || hasOurRedemptions) {
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
