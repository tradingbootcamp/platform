<script lang="ts">
	import { serverState } from '$lib/api.svelte';
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

	interface ArbTerm {
		id: number;
		marketId: number | null;
		coefficient: number;
		open: boolean;
	}

	interface ChartPoint {
		timestamp: Date;
		discrepancy: number | null;
		profitSellLeft: number | null;
		profitBuyLeft: number | null;
	}

	// Parse formula from URL query params: ?formula=coef1:marketId1,coef2:marketId2
	function parseFormulaFromUrl(): { terms: ArbTerm[]; nextId: number } | null {
		const formulaParam = $page.url.searchParams.get('formula');
		if (!formulaParam) return null;

		try {
			const parsedTerms: ArbTerm[] = [];
			let id = 1;
			for (const part of formulaParam.split(',')) {
				const [coefStr, marketIdStr] = part.split(':');
				const coefficient = parseFloat(coefStr);
				const marketId = parseInt(marketIdStr, 10);
				if (isNaN(coefficient) || isNaN(marketId)) continue;
				parsedTerms.push({ id: id++, marketId, coefficient, open: false });
			}
			if (parsedTerms.length > 0) {
				return { terms: parsedTerms, nextId: id };
			}
		} catch {
			// Invalid format, ignore
		}
		return null;
	}

	// Encode current terms to URL query param
	function encodeFormulaToUrl(): string {
		return terms
			.filter((t) => t.marketId !== null)
			.map((t) => `${t.coefficient}:${t.marketId}`)
			.join(',');
	}

	// Update URL with current formula (without navigation)
	function updateUrlWithFormula() {
		const formula = encodeFormulaToUrl();
		const url = new URL($page.url);
		if (formula) {
			url.searchParams.set('formula', formula);
		} else {
			url.searchParams.delete('formula');
		}
		goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	// Initialize from URL or defaults
	const initialState = parseFormulaFromUrl();
	let terms = $state<ArbTerm[]>(
		initialState?.terms ?? [
			{ id: 1, marketId: null, coefficient: 1, open: false },
			{ id: 2, marketId: null, coefficient: -1, open: false }
		]
	);
	let nextTermId = $state(initialState?.nextId ?? 3);
	let history = $state<ChartPoint[]>([]);
	let isEditing = $state(!initialState);

	let availableMarkets = $derived(
		[...serverState.markets.values()]
			.filter((m) => m.definition.open)
			.sort((a, b) => (a.definition.name ?? '').localeCompare(b.definition.name ?? ''))
	);

	function getMarketPrices(marketId: number) {
		const marketData = serverState.markets.get(marketId);
		if (!marketData) return { mid: null, bestBid: null, bestOffer: null };

		const bids = sortedBids(marketData.orders);
		const offers = sortedOffers(marketData.orders);
		const mid = midPriceValue(bids, offers);
		const bestBid = bids[0]?.price ?? null;
		const bestOffer = offers[0]?.price ?? null;

		return { mid, bestBid, bestOffer };
	}

	function calculateCurrentValues() {
		let discrepancy: number | null = 0;
		let profitSellLeft: number | null = 0;
		let profitBuyLeft: number | null = 0;

		for (const term of terms) {
			if (term.marketId === null) {
				return { discrepancy: null, profitSellLeft: null, profitBuyLeft: null };
			}

			const { mid, bestBid, bestOffer } = getMarketPrices(term.marketId);

			if (mid === null || mid === undefined) {
				discrepancy = null;
			}
			if (bestBid === null || bestOffer === null) {
				profitSellLeft = null;
				profitBuyLeft = null;
			}

			if (discrepancy !== null && mid !== null && mid !== undefined) {
				discrepancy += term.coefficient * mid;
			}

			if (profitSellLeft !== null && bestBid !== null && bestOffer !== null) {
				profitSellLeft +=
					term.coefficient > 0 ? term.coefficient * bestBid : term.coefficient * bestOffer;
			}

			if (profitBuyLeft !== null && bestBid !== null && bestOffer !== null) {
				profitBuyLeft +=
					term.coefficient > 0
						? term.coefficient * -bestOffer
						: term.coefficient * -bestBid;
			}
		}

		return { discrepancy, profitSellLeft, profitBuyLeft };
	}

	// Track formula changes to reset history
	let formulaFingerprint = $derived(terms.map((t) => `${t.marketId}:${t.coefficient}`).join(','));
	let lastFingerprint = $state('');

	// Data collection effect
	$effect(() => {
		// Reset history when formula changes
		if (formulaFingerprint !== lastFingerprint) {
			lastFingerprint = formulaFingerprint;
			history = [];
		}

		// Only collect data when not editing
		if (isEditing) return;

		const interval = setInterval(() => {
			const values = calculateCurrentValues();
			const point: ChartPoint = { timestamp: new Date(), ...values };
			history = [...history, point].slice(-300);
		}, 1000);

		return () => clearInterval(interval);
	});

	let currentValues = $derived(calculateCurrentValues());

	function addTerm() {
		terms = [...terms, { id: nextTermId++, marketId: null, coefficient: 1, open: false }];
	}

	function removeTerm(id: number) {
		terms = terms.filter((t) => t.id !== id);
	}

	function setMarket(termId: number, marketId: number) {
		terms = terms.map((t) => (t.id === termId ? { ...t, marketId, open: false } : t));
	}

	function setCoefficient(termId: number, value: string) {
		const num = parseFloat(value);
		if (!isNaN(num)) {
			terms = terms.map((t) => (t.id === termId ? { ...t, coefficient: num } : t));
		}
	}

	function getMarketName(marketId: number | null): string {
		if (marketId === null) return 'Select market...';
		return formatMarketName(serverState.markets.get(marketId)?.definition.name) ?? 'Unknown';
	}

	function formatValue(val: number | null): string {
		if (val === null) return '---';
		return val.toFixed(2);
	}

	function formatCoefficient(coef: number): string {
		if (coef === 1) return '+1';
		if (coef === -1) return '-1';
		if (coef > 0) return `+${coef}`;
		return coef.toString();
	}

	let isFormulaValid = $derived(terms.length > 0 && terms.every((t) => t.marketId !== null));

	// Chart data - filter to valid points only
	let discrepancyData = $derived(
		history
			.filter((d) => d.discrepancy !== null)
			.map((d) => ({ timestamp: d.timestamp, value: d.discrepancy! }))
	);
	let sellLeftData = $derived(
		history
			.filter((d) => d.profitSellLeft !== null)
			.map((d) => ({ timestamp: d.timestamp, value: d.profitSellLeft! }))
	);
	let buyLeftData = $derived(
		history
			.filter((d) => d.profitBuyLeft !== null)
			.map((d) => ({ timestamp: d.timestamp, value: d.profitBuyLeft! }))
	);

	// Y domain calculation
	let allValues = $derived([
		...discrepancyData.map((d) => d.value),
		...sellLeftData.map((d) => d.value),
		...buyLeftData.map((d) => d.value)
	]);
	let yMin = $derived(allValues.length > 0 ? Math.min(...allValues, 0) : -1);
	let yMax = $derived(allValues.length > 0 ? Math.max(...allValues, 0) : 1);
	let yPadding = $derived(Math.max((yMax - yMin) * 0.1, 0.1));
	let yDomain = $derived([yMin - yPadding, yMax + yPadding] as [number, number]);

	// Track container width to avoid LayerCake zero-width warning
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
		discrepancy: 'hsl(var(--primary))',
		sellLeft: 'hsl(142, 76%, 36%)',
		buyLeft: 'hsl(0, 84%, 60%)'
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
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-semibold">Formula</h2>
			{#if isEditing}
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
			{:else}
				<Button variant="outline" size="sm" onclick={() => (isEditing = true)}>Edit</Button>
			{/if}
		</div>

		{#if isEditing}
			<p class="mb-4 text-sm text-muted-foreground">
				Define a linear combination of markets. If the relationship holds, the sum should equal 0.
			</p>

			<div class="flex flex-col gap-3">
				{#each terms as term (term.id)}
					<div class="flex items-center gap-2">
						<Input
							type="number"
							step="any"
							value={term.coefficient}
							onchange={(e) => setCoefficient(term.id, e.currentTarget.value)}
							class="w-20 text-center"
						/>
						<span class="text-muted-foreground">×</span>

						<Popover.Root bind:open={term.open}>
							<Popover.Trigger
								class={cn(buttonVariants({ variant: 'outline' }), 'w-64 justify-between')}
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
												onSelect={() => setMarket(term.id, market.definition.id!)}
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

						{#if terms.length > 1}
							<Button variant="ghost" size="icon" onclick={() => removeTerm(term.id)}>
								<X class="h-4 w-4" />
							</Button>
						{/if}
					</div>
				{/each}

				<Button variant="outline" class="w-fit" onclick={addTerm}>
					<Plus class="mr-2 h-4 w-4" />
					Add Term
				</Button>
			</div>
		{:else}
			<!-- Saved formula display -->
			<div class="flex flex-wrap items-center gap-1 font-mono text-xl">
				{#each terms as term (term.id)}
					<span
						class={cn(
							'font-bold',
							term.coefficient >= 0
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'
						)}
					>
						{formatCoefficient(term.coefficient)}
					</span>
					<span
						class={term.coefficient >= 0
							? 'text-green-600/70 dark:text-green-400/70'
							: 'text-red-600/70 dark:text-red-400/70'}
					>
						({getMarketName(term.marketId)})
					</span>
				{/each}
				<span class="text-muted-foreground">=</span>
				<span>0</span>
			</div>
		{/if}
	</div>

	<!-- Current Values Display -->
	<div class="grid grid-cols-3 gap-4">
		<div class="rounded-lg border p-4">
			<div class="text-sm text-muted-foreground">Discrepancy (midpoints)</div>
			<div class="text-2xl font-bold">{formatValue(currentValues.discrepancy)}</div>
		</div>
		<div class="rounded-lg border p-4">
			<div class="text-sm text-muted-foreground">Profit: Sell +coef / Buy -coef</div>
			<div class="text-2xl font-bold">{formatValue(currentValues.profitSellLeft)}</div>
		</div>
		<div class="rounded-lg border p-4">
			<div class="text-sm text-muted-foreground">Profit: Buy +coef / Sell -coef</div>
			<div class="text-2xl font-bold">{formatValue(currentValues.profitBuyLeft)}</div>
		</div>
	</div>

	<!-- Chart -->
	<div class="rounded-lg border p-4">
		<h2 class="mb-4 text-lg font-semibold">History</h2>
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
							{#if sellLeftData.length >= 2}
								<Spline data={sellLeftData} stroke={seriesColors.sellLeft} stroke-width={2} />
							{/if}
							{#if buyLeftData.length >= 2}
								<Spline data={buyLeftData} stroke={seriesColors.buyLeft} stroke-width={2} />
							{/if}
						</Svg>
					</Chart>
					<!-- Legend -->
					<div class="mt-2 flex justify-center gap-6 text-sm">
						<div class="flex items-center gap-2">
							<div class="h-0.5 w-4" style="background-color: {seriesColors.discrepancy}"></div>
							<span>Discrepancy</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="h-0.5 w-4" style="background-color: {seriesColors.sellLeft}"></div>
							<span>Sell +coef / Buy -coef</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="h-0.5 w-4" style="background-color: {seriesColors.buyLeft}"></div>
							<span>Buy +coef / Sell -coef</span>
						</div>
					</div>
			{:else}
				<div class="flex h-full items-center justify-center text-muted-foreground">
					Collecting data... ({history.length}/2 points)
				</div>
			{/if}
			{/key}
		</div>
	</div>
</div>
