<script lang="ts">
	import { serverState, sendClientMessage } from '$lib/api.svelte';
	import { sortedBids, sortedOffers, midPriceValue } from '$lib/components/marketDataUtils';
	import { Chart, Svg, Axis, Spline } from 'layerchart';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn, formatMarketName } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import X from '@lucide/svelte/icons/x';
	import Plus from '@lucide/svelte/icons/plus';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	interface Term {
		id: number;
		marketId: number | null;
		coefficient: number;
		open: boolean;
	}

	interface ChartPoint {
		timestamp: Date;
		discrepancy: number;
	}

	// Parse formula from URL: ?left=coef:id,coef:id&right=coef:id,coef:id
	function parseFormulaFromUrl(): { left: Term[]; right: Term[]; nextId: number } | null {
		const leftParam = $page.url.searchParams.get('left');
		const rightParam = $page.url.searchParams.get('right');
		if (!leftParam && !rightParam) return null;

		function parseTerms(param: string | null, startId: number): { terms: Term[]; nextId: number } {
			if (!param) return { terms: [], nextId: startId };
			const terms: Term[] = [];
			let id = startId;
			for (const part of param.split(',')) {
				const [coefStr, marketIdStr] = part.split(':');
				const coefficient = parseFloat(coefStr);
				const marketId = parseInt(marketIdStr, 10);
				if (isNaN(coefficient) || isNaN(marketId)) continue;
				terms.push({ id: id++, marketId, coefficient, open: false });
			}
			return { terms, nextId: id };
		}

		const leftResult = parseTerms(leftParam, 1);
		const rightResult = parseTerms(rightParam, leftResult.nextId);

		if (leftResult.terms.length === 0 && rightResult.terms.length === 0) return null;

		return {
			left: leftResult.terms.length > 0 ? leftResult.terms : [{ id: leftResult.nextId, marketId: null, coefficient: 1, open: false }],
			right: rightResult.terms.length > 0 ? rightResult.terms : [{ id: rightResult.nextId + 1, marketId: null, coefficient: 1, open: false }],
			nextId: Math.max(leftResult.nextId, rightResult.nextId) + 2
		};
	}

	function encodeTerms(terms: Term[]): string {
		return terms
			.filter((t) => t.marketId !== null)
			.map((t) => `${t.coefficient}:${t.marketId}`)
			.join(',');
	}

	function updateUrlWithFormula() {
		const url = new URL($page.url);
		const leftEncoded = encodeTerms(leftTerms);
		const rightEncoded = encodeTerms(rightTerms);

		if (leftEncoded) {
			url.searchParams.set('left', leftEncoded);
		} else {
			url.searchParams.delete('left');
		}
		if (rightEncoded) {
			url.searchParams.set('right', rightEncoded);
		} else {
			url.searchParams.delete('right');
		}
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	// Initialize from URL or defaults
	const initialState = parseFormulaFromUrl();
	let leftTerms = $state<Term[]>(
		initialState?.left ?? [{ id: 1, marketId: null, coefficient: 1, open: false }]
	);
	let rightTerms = $state<Term[]>(
		initialState?.right ?? [{ id: 2, marketId: null, coefficient: 1, open: false }]
	);
	let nextTermId = $state(initialState?.nextId ?? 3);
	let isEditing = $state(!initialState);

	let availableMarkets = $derived(
		[...serverState.markets.values()]
			.filter((m) => m.definition.open)
			.sort((a, b) => (a.definition.name ?? '').localeCompare(b.definition.name ?? ''))
	);

	function getMarketPrices(marketId: number) {
		const marketData = serverState.markets.get(marketId);
		if (!marketData) return { mid: null, bestBid: null, bestOffer: null, bestBidSize: null, bestOfferSize: null };

		const bids = sortedBids(marketData.orders);
		const offers = sortedOffers(marketData.orders);
		const mid = midPriceValue(bids, offers);
		const bestBid = bids[0]?.price ?? null;
		const bestOffer = offers[0]?.price ?? null;
		const bestBidSize = bids[0]?.size ?? null;
		const bestOfferSize = offers[0]?.size ?? null;

		return { mid, bestBid, bestOffer, bestBidSize, bestOfferSize };
	}

	function calculateCurrentValues() {
		let leftMid = 0;
		let rightMid = 0;
		let leftBid = 0;
		let leftOffer = 0;
		let rightBid = 0;
		let rightOffer = 0;
		let hasMid = true;
		let hasBidOffer = true;

		for (const term of leftTerms) {
			if (term.marketId === null) {
				return { discrepancy: null, profitSellLeft: null, profitSellRight: null };
			}
			const { mid, bestBid, bestOffer } = getMarketPrices(term.marketId);
			if (mid === null || mid === undefined) hasMid = false;
			if (bestBid === null || bestOffer === null) hasBidOffer = false;

			if (hasMid && mid != null) leftMid += term.coefficient * mid;
			if (hasBidOffer && bestBid !== null && bestOffer !== null) {
				leftBid += term.coefficient * bestBid;
				leftOffer += term.coefficient * bestOffer;
			}
		}

		for (const term of rightTerms) {
			if (term.marketId === null) {
				return { discrepancy: null, profitSellLeft: null, profitSellRight: null };
			}
			const { mid, bestBid, bestOffer } = getMarketPrices(term.marketId);
			if (mid === null || mid === undefined) hasMid = false;
			if (bestBid === null || bestOffer === null) hasBidOffer = false;

			if (hasMid && mid != null) rightMid += term.coefficient * mid;
			if (hasBidOffer && bestBid !== null && bestOffer !== null) {
				rightBid += term.coefficient * bestBid;
				rightOffer += term.coefficient * bestOffer;
			}
		}

		return {
			discrepancy: hasMid ? leftMid - rightMid : null,
			// Sell left side (at bid), buy right side (at offer)
			profitSellLeft: hasBidOffer ? leftBid - rightOffer : null,
			// Buy left side (at offer), sell right side (at bid)
			profitSellRight: hasBidOffer ? rightBid - leftOffer : null
		};
	}

	// Request trade history for all markets in the formula (debounced)
	let requestTimeout: ReturnType<typeof setTimeout> | null = null;
	let lastRequestedIds = '';

	function requestTradeHistory() {
		const ids = new Set<number>();
		for (const term of leftTerms) {
			if (term.marketId !== null) ids.add(term.marketId);
		}
		for (const term of rightTerms) {
			if (term.marketId !== null) ids.add(term.marketId);
		}

		const idsKey = [...ids].sort().join(',');
		if (idsKey && idsKey !== lastRequestedIds) {
			lastRequestedIds = idsKey;
			for (const marketId of ids) {
				sendClientMessage({ getFullTradeHistory: { marketId } });
			}
		}
	}

	$effect(() => {
		// Track changes to terms
		const _left = leftTerms.map(t => t.marketId);
		const _right = rightTerms.map(t => t.marketId);

		// Debounce the request
		if (requestTimeout) clearTimeout(requestTimeout);
		requestTimeout = setTimeout(requestTradeHistory, 500);

		return () => {
			if (requestTimeout) clearTimeout(requestTimeout);
		};
	});

	// Build historical chart data from trades
	let historicalData = $derived.by(() => {
		// Collect all market IDs from the formula
		const allTerms = [...leftTerms, ...rightTerms];
		if (allTerms.some((t) => t.marketId === null)) return [];

		// Get trades for all markets
		const marketTrades: Map<number, { timestamp: Date; price: number }[]> = new Map();
		let latestStartTime: Date | null = null;

		for (const term of allTerms) {
			const marketData = serverState.markets.get(term.marketId!);
			if (!marketData || !marketData.trades.length) return [];

			const trades = marketData.trades
				.filter((t) => t.transactionTimestamp && t.price !== null && t.price !== undefined)
				.map((t) => ({
					timestamp: new Date(Number(t.transactionTimestamp!.seconds) * 1000),
					price: t.price!
				}))
				.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

			if (trades.length === 0) return [];

			marketTrades.set(term.marketId!, trades);

			// Track the latest start time (market that opened last)
			const firstTradeTime = trades[0].timestamp;
			if (!latestStartTime || firstTradeTime > latestStartTime) {
				latestStartTime = firstTradeTime;
			}
		}

		// Collect all unique timestamps and sort them
		const allTimestamps = new Set<number>();
		for (const trades of marketTrades.values()) {
			for (const trade of trades) {
				if (trade.timestamp >= latestStartTime!) {
					allTimestamps.add(trade.timestamp.getTime());
				}
			}
		}

		const sortedTimestamps = [...allTimestamps].sort((a, b) => a - b);
		if (sortedTimestamps.length === 0) return [];

		// For each timestamp, calculate discrepancy using last known price for each market
		const lastPrices: Map<number, number> = new Map();
		const result: ChartPoint[] = [];

		// Initialize last prices with first trade before or at latestStartTime
		for (const [marketId, trades] of marketTrades) {
			for (const trade of trades) {
				if (trade.timestamp <= latestStartTime!) {
					lastPrices.set(marketId, trade.price);
				}
			}
		}

		// Build chart points
		let tradeIndices: Map<number, number> = new Map();
		for (const marketId of marketTrades.keys()) {
			// Find first trade at or after latestStartTime
			const trades = marketTrades.get(marketId)!;
			let idx = 0;
			while (idx < trades.length && trades[idx].timestamp < latestStartTime!) {
				idx++;
			}
			tradeIndices.set(marketId, idx);
		}

		for (const ts of sortedTimestamps) {
			const timestamp = new Date(ts);

			// Update last prices for any trades at this timestamp
			for (const [marketId, trades] of marketTrades) {
				let idx = tradeIndices.get(marketId)!;
				while (idx < trades.length && trades[idx].timestamp.getTime() <= ts) {
					lastPrices.set(marketId, trades[idx].price);
					idx++;
				}
				tradeIndices.set(marketId, idx);
			}

			// Calculate discrepancy if we have prices for all markets
			if (lastPrices.size === allTerms.length) {
				let leftValue = 0;
				let rightValue = 0;

				for (const term of leftTerms) {
					leftValue += term.coefficient * lastPrices.get(term.marketId!)!;
				}
				for (const term of rightTerms) {
					rightValue += term.coefficient * lastPrices.get(term.marketId!)!;
				}

				result.push({
					timestamp,
					discrepancy: leftValue - rightValue
				});
			}
		}

		return result;
	});

	let currentValues = $derived(calculateCurrentValues());

	// Generate arbitrage recommendation
	interface ArbitrageRecommendation {
		available: boolean;
		profit: number;
		lockup: number;
		buyInstructions: { quantity: number; marketName: string }[];
		sellInstructions: { quantity: number; marketName: string }[];
	}

	let arbitrageRecommendation = $derived.by((): ArbitrageRecommendation | null => {
		const { profitSellLeft, profitSellRight } = currentValues;

		// No valid prices
		if (profitSellLeft === null || profitSellRight === null) {
			return null;
		}

		// Check if there's an arbitrage opportunity
		if (profitSellLeft <= 0 && profitSellRight <= 0) {
			return { available: false, profit: 0, lockup: 0, buyInstructions: [], sellInstructions: [] };
		}

		// Determine which direction is profitable
		const sellLeft = profitSellLeft > profitSellRight;
		const profitPerUnit = sellLeft ? profitSellLeft : profitSellRight;

		// Calculate the maximum units we can trade based on available liquidity
		// The limiting factor is: min across all terms of (available_size / coefficient)
		let maxUnits = Infinity;

		if (sellLeft) {
			// Sell left side (need bid liquidity), buy right side (need offer liquidity)
			for (const term of leftTerms) {
				if (term.marketId === null) continue;
				const { bestBidSize } = getMarketPrices(term.marketId);
				if (bestBidSize === null || bestBidSize <= 0) {
					maxUnits = 0;
					break;
				}
				maxUnits = Math.min(maxUnits, bestBidSize / term.coefficient);
			}
			for (const term of rightTerms) {
				if (term.marketId === null) continue;
				const { bestOfferSize } = getMarketPrices(term.marketId);
				if (bestOfferSize === null || bestOfferSize <= 0) {
					maxUnits = 0;
					break;
				}
				maxUnits = Math.min(maxUnits, bestOfferSize / term.coefficient);
			}
		} else {
			// Buy left side (need offer liquidity), sell right side (need bid liquidity)
			for (const term of leftTerms) {
				if (term.marketId === null) continue;
				const { bestOfferSize } = getMarketPrices(term.marketId);
				if (bestOfferSize === null || bestOfferSize <= 0) {
					maxUnits = 0;
					break;
				}
				maxUnits = Math.min(maxUnits, bestOfferSize / term.coefficient);
			}
			for (const term of rightTerms) {
				if (term.marketId === null) continue;
				const { bestBidSize } = getMarketPrices(term.marketId);
				if (bestBidSize === null || bestBidSize <= 0) {
					maxUnits = 0;
					break;
				}
				maxUnits = Math.min(maxUnits, bestBidSize / term.coefficient);
			}
		}

		// If no liquidity available, no arbitrage
		if (maxUnits === 0 || maxUnits === Infinity) {
			return { available: false, profit: 0, lockup: 0, buyInstructions: [], sellInstructions: [] };
		}

		// Calculate actual quantities, profit, and lockup
		const buyInstructions: { quantity: number; marketName: string }[] = [];
		const sellInstructions: { quantity: number; marketName: string }[] = [];
		let lockup = 0;
		const profit = profitPerUnit * maxUnits;

		if (sellLeft) {
			// Sell left side, buy right side
			for (const term of leftTerms) {
				if (term.marketId === null) continue;
				sellInstructions.push({
					quantity: term.coefficient * maxUnits,
					marketName: getMarketName(term.marketId)
				});
			}
			for (const term of rightTerms) {
				if (term.marketId === null) continue;
				const { bestOffer } = getMarketPrices(term.marketId);
				const quantity = term.coefficient * maxUnits;
				if (bestOffer !== null) {
					lockup += quantity * bestOffer;
				}
				buyInstructions.push({
					quantity,
					marketName: getMarketName(term.marketId)
				});
			}
		} else {
			// Buy left side, sell right side
			for (const term of leftTerms) {
				if (term.marketId === null) continue;
				const { bestOffer } = getMarketPrices(term.marketId);
				const quantity = term.coefficient * maxUnits;
				if (bestOffer !== null) {
					lockup += quantity * bestOffer;
				}
				buyInstructions.push({
					quantity,
					marketName: getMarketName(term.marketId)
				});
			}
			for (const term of rightTerms) {
				if (term.marketId === null) continue;
				sellInstructions.push({
					quantity: term.coefficient * maxUnits,
					marketName: getMarketName(term.marketId)
				});
			}
		}

		return { available: true, profit, lockup, buyInstructions, sellInstructions };
	});

	// Calculate individual side values for display
	let leftSideValue = $derived(() => {
		let total = 0;
		for (const term of leftTerms) {
			if (term.marketId === null) return null;
			const { mid } = getMarketPrices(term.marketId);
			if (mid === null || mid === undefined) return null;
			total += term.coefficient * mid;
		}
		return total;
	});

	let rightSideValue = $derived(() => {
		let total = 0;
		for (const term of rightTerms) {
			if (term.marketId === null) return null;
			const { mid } = getMarketPrices(term.marketId);
			if (mid === null || mid === undefined) return null;
			total += term.coefficient * mid;
		}
		return total;
	});

	function addTerm(side: 'left' | 'right') {
		const newTerm = { id: nextTermId++, marketId: null, coefficient: 1, open: false };
		if (side === 'left') {
			leftTerms = [...leftTerms, newTerm];
		} else {
			rightTerms = [...rightTerms, newTerm];
		}
	}

	function removeTerm(side: 'left' | 'right', id: number) {
		if (side === 'left') {
			leftTerms = leftTerms.filter((t) => t.id !== id);
		} else {
			rightTerms = rightTerms.filter((t) => t.id !== id);
		}
	}

	function setMarket(side: 'left' | 'right', termId: number, marketId: number) {
		if (side === 'left') {
			leftTerms = leftTerms.map((t) => (t.id === termId ? { ...t, marketId, open: false } : t));
		} else {
			rightTerms = rightTerms.map((t) => (t.id === termId ? { ...t, marketId, open: false } : t));
		}
	}

	function setCoefficient(side: 'left' | 'right', termId: number, value: string) {
		const num = parseFloat(value);
		if (!isNaN(num) && num > 0) {
			if (side === 'left') {
				leftTerms = leftTerms.map((t) => (t.id === termId ? { ...t, coefficient: num } : t));
			} else {
				rightTerms = rightTerms.map((t) => (t.id === termId ? { ...t, coefficient: num } : t));
			}
		}
	}

	function setTermOpen(side: 'left' | 'right', termId: number, open: boolean) {
		if (side === 'left') {
			leftTerms = leftTerms.map((t) => (t.id === termId ? { ...t, open } : t));
		} else {
			rightTerms = rightTerms.map((t) => (t.id === termId ? { ...t, open } : t));
		}
	}

	function getMarketName(marketId: number | null): string {
		if (marketId === null) return 'Select market...';
		return formatMarketName(serverState.markets.get(marketId)?.definition.name) ?? 'Unknown';
	}

	function formatValue(val: number | null): string {
		if (val === null) return '---';
		return val.toFixed(1);
	}

	function formatCoefficient(coef: number): string {
		return `${coef} × `;
	}

	let isFormulaValid = $derived(
		leftTerms.length > 0 &&
		rightTerms.length > 0 &&
		leftTerms.every((t) => t.marketId !== null) &&
		rightTerms.every((t) => t.marketId !== null)
	);

	// Chart data from historical trades
	let discrepancyData = $derived(
		historicalData.map((d) => ({ timestamp: d.timestamp, value: d.discrepancy }))
	);

	let allValues = $derived(discrepancyData.map((d) => d.value));
	let yMin = $derived(allValues.length > 0 ? Math.min(...allValues, 0) : -1);
	let yMax = $derived(allValues.length > 0 ? Math.max(...allValues, 0) : 1);
	let yPadding = $derived(Math.max((yMax - yMin) * 0.1, 0.1));
	let yDomain = $derived([yMin - yPadding, yMax + yPadding] as [number, number]);

	let chartContainer: HTMLDivElement | undefined = $state();
	let hasWidth = $state(false);
	$effect(() => {
		if (!chartContainer) return;
		const observer = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				if (chartContainer) {
					hasWidth = chartContainer.offsetWidth > 0;
				}
			});
		});
		observer.observe(chartContainer);
		return () => observer.disconnect();
	});

	const seriesColors = {
		discrepancy: 'hsl(var(--primary))'
	};

	function formatTime(value: unknown): string {
		if (value instanceof Date) {
			return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		}
		if (typeof value === 'number') {
			return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		}
		return String(value);
	}
</script>

<div class="flex w-full flex-col gap-6 p-4">
	<h1 class="text-2xl font-bold">Arbitrage Visualizer</h1>

	<!-- Formula Builder -->
	<div class="rounded-lg border p-4">
		{#if isEditing}
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Formula</h2>
				<Button
					variant="default"
					size="sm"
					disabled={!isFormulaValid}
					onclick={() => {
						isEditing = false;
						updateUrlWithFormula();
					}}
				>
					Save
				</Button>
			</div>
		{/if}

		{#if isEditing}
			<p class="mb-4 text-sm text-muted-foreground">
				Define an equation between markets. If the relationship holds, left side should equal right side.
			</p>

			<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
				<!-- Left side -->
				<div class="flex-1">
					<div class="mb-2 text-sm font-medium text-muted-foreground">Left Side</div>
					<div class="flex flex-col gap-2">
						{#each leftTerms as term (term.id)}
							<div class="flex items-center gap-2">
								<Input
									type="number"
									step="any"
									min="0.01"
									value={term.coefficient}
									onchange={(e) => setCoefficient('left', term.id, e.currentTarget.value)}
									class="w-16 text-center"
								/>
								<span class="text-muted-foreground">×</span>

								<Popover.Root
									open={term.open}
									onOpenChange={(open) => setTermOpen('left', term.id, open)}
								>
									<Popover.Trigger
										class={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-between')}
									>
										<span class="truncate">{getMarketName(term.marketId)}</span>
										<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Popover.Trigger>
									<Popover.Content class="w-64 p-0">
										<Command.Root>
											<Command.Input placeholder="Search markets..." class="h-9" />
											<Command.Empty>No markets found</Command.Empty>
											<Command.Group class="max-h-64 overflow-y-auto">
												{#each availableMarkets as market (market.definition.id)}
													<Command.Item
														value={market.definition.name ?? ''}
														onSelect={() => setMarket('left', term.id, market.definition.id!)}
													>
														{formatMarketName(market.definition.name)}
														<Check
															class={cn(
																'ml-auto h-4 w-4',
																term.marketId !== market.definition.id && 'text-transparent'
															)}
														/>
													</Command.Item>
												{/each}
											</Command.Group>
										</Command.Root>
									</Popover.Content>
								</Popover.Root>

								{#if leftTerms.length > 1}
									<Button variant="ghost" size="icon" onclick={() => removeTerm('left', term.id)}>
										<X class="h-4 w-4" />
									</Button>
								{/if}
							</div>
						{/each}
						<Button variant="outline" size="sm" class="w-fit" onclick={() => addTerm('left')}>
							<Plus class="mr-2 h-4 w-4" />
							Add
						</Button>
					</div>
				</div>

				<!-- Equals sign -->
				<div class="flex items-center justify-center py-4 lg:py-8">
					<span class="text-2xl font-bold text-muted-foreground">=</span>
				</div>

				<!-- Right side -->
				<div class="flex-1">
					<div class="mb-2 text-sm font-medium text-muted-foreground">Right Side</div>
					<div class="flex flex-col gap-2">
						{#each rightTerms as term (term.id)}
							<div class="flex items-center gap-2">
								<Input
									type="number"
									step="any"
									min="0.01"
									value={term.coefficient}
									onchange={(e) => setCoefficient('right', term.id, e.currentTarget.value)}
									class="w-16 text-center"
								/>
								<span class="text-muted-foreground">×</span>

								<Popover.Root
									open={term.open}
									onOpenChange={(open) => setTermOpen('right', term.id, open)}
								>
									<Popover.Trigger
										class={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-between')}
									>
										<span class="truncate">{getMarketName(term.marketId)}</span>
										<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Popover.Trigger>
									<Popover.Content class="w-64 p-0">
										<Command.Root>
											<Command.Input placeholder="Search markets..." class="h-9" />
											<Command.Empty>No markets found</Command.Empty>
											<Command.Group class="max-h-64 overflow-y-auto">
												{#each availableMarkets as market (market.definition.id)}
													<Command.Item
														value={market.definition.name ?? ''}
														onSelect={() => setMarket('right', term.id, market.definition.id!)}
													>
														{formatMarketName(market.definition.name)}
														<Check
															class={cn(
																'ml-auto h-4 w-4',
																term.marketId !== market.definition.id && 'text-transparent'
															)}
														/>
													</Command.Item>
												{/each}
											</Command.Group>
										</Command.Root>
									</Popover.Content>
								</Popover.Root>

								{#if rightTerms.length > 1}
									<Button variant="ghost" size="icon" onclick={() => removeTerm('right', term.id)}>
										<X class="h-4 w-4" />
									</Button>
								{/if}
							</div>
						{/each}
						<Button variant="outline" size="sm" class="w-fit" onclick={() => addTerm('right')}>
							<Plus class="mr-2 h-4 w-4" />
							Add
						</Button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Saved formula display -->
			<div class="flex items-center justify-between">
				<div class="flex flex-wrap items-center gap-2 font-mono text-xl">
					{#each leftTerms as term, i (term.id)}
						{#if i > 0}
							<span class="text-muted-foreground">+</span>
						{/if}
						<span>
							<span class={term.coefficient >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{formatCoefficient(term.coefficient)}</span>{getMarketName(term.marketId)}
						</span>
					{/each}
					<span class="text-muted-foreground">({formatValue(leftSideValue())})</span>
					<span class="text-muted-foreground">=</span>
					<span class="text-muted-foreground">({formatValue(rightSideValue())})</span>
					{#each rightTerms as term, i (term.id)}
						{#if i > 0}
							<span class="text-muted-foreground">+</span>
						{/if}
						<span>
							<span class={term.coefficient >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{formatCoefficient(term.coefficient)}</span>{getMarketName(term.marketId)}
						</span>
					{/each}
				</div>
				<Button variant="ghost" size="sm" onclick={() => (isEditing = true)}>Edit</Button>
			</div>
		{/if}
	</div>

	<!-- Arbitrage Recommendation -->
	<div class="rounded-lg border p-4">
		{#if arbitrageRecommendation === null}
			<div class="text-lg text-muted-foreground">Waiting for market data...</div>
		{:else if !arbitrageRecommendation.available}
			<div class="text-lg text-muted-foreground">No arbitrage available</div>
		{:else}
			<div class="text-lg">
				{#each arbitrageRecommendation.buyInstructions as instr, i}
					{#if i > 0}<span class="text-muted-foreground">, </span>{/if}
					<span class="text-green-600/70 dark:text-green-400/70">Buy</span> <span class="font-semibold text-green-600 dark:text-green-400">{formatValue(instr.quantity)}</span> <span class="text-green-600/70 dark:text-green-400/70">{instr.marketName}</span>
				{/each}
				<span class="text-muted-foreground">, </span>
				{#each arbitrageRecommendation.sellInstructions as instr, i}
					{#if i > 0}<span class="text-muted-foreground">, </span>{/if}
					<span class="text-red-600/70 dark:text-red-400/70">Sell</span> <span class="font-semibold text-red-600 dark:text-red-400">{formatValue(instr.quantity)}</span> <span class="text-red-600/70 dark:text-red-400/70">{instr.marketName}</span>
				{/each}
				<span class="text-muted-foreground ml-2">
					(earn {formatValue(arbitrageRecommendation.profit)} profit, lock up {formatValue(arbitrageRecommendation.lockup)} available balance)
				</span>
			</div>
		{/if}
	</div>

	<!-- Chart -->
	<div class="rounded-lg border p-4">
		<h2 class="mb-4 text-lg font-semibold">Discrepancy History</h2>
		<div bind:this={chartContainer} class="h-72">
			{#key discrepancyData.length}
				{#if discrepancyData.length >= 2 && hasWidth}
					<Chart
						data={discrepancyData}
						x="timestamp"
						y="value"
						yDomain={yDomain}
						padding={{ top: 20, right: 20, bottom: 30, left: 50 }}
					>
						<Svg>
							<Axis placement="left" grid={{ class: 'stroke-muted/50' }} />
							<Axis placement="bottom" format={formatTime} />
							<Spline data={discrepancyData} stroke={seriesColors.discrepancy} stroke-width={2} />
						</Svg>
					</Chart>
				{:else}
					<div class="flex h-full flex-col items-center justify-center text-muted-foreground">
						{#if !isFormulaValid}
							Select markets to see history
						{:else}
							No trade history available ({discrepancyData.length} points)
							<div class="mt-2 text-xs">
								{#each [...leftTerms, ...rightTerms] as term}
									{@const md = term.marketId !== null ? serverState.markets.get(term.marketId) : null}
									<div>Market {term.marketId}: {md ? md.trades.length : 'not found'} trades</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/key}
		</div>
	</div>
</div>
