<script lang="ts">
	import { untrack } from 'svelte';
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import PnlChart from '$lib/components/pnlChart.svelte';
	import PriceChart from '$lib/components/priceChart.svelte';
	import { pauseIntervals } from '$lib/marketTime';
	import * as Table from '$lib/components/ui/table';
	import {
		computePnLOverTime,
		getMarketIdsForGroup,
		getMarketsNeedingHistory
	} from '$lib/pnlMetrics';
	import type { PnLMarkingMode } from '$lib/pnlMetrics';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { LineChart, Rule } from 'layerchart';
	import MarketName from '$lib/components/marketName.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { cn } from '$lib/utils';
	import CircleHelp from '@lucide/svelte/icons/circle-help';
	import Paperclip from '@lucide/svelte/icons/paperclip';

	let sidebar = useSidebar();

	// --- Account selector ---
	let selectedAccountId = $state<number | undefined>(undefined);

	// Default to actingAs on first load or when actingAs changes and no explicit selection
	$effect(() => {
		if (selectedAccountId === undefined && serverState.actingAs) {
			selectedAccountId = serverState.actingAs;
		}
	});

	const effectiveAccountId = $derived(selectedAccountId ?? serverState.actingAs ?? 0);

	// All owned accounts (from portfolios map)
	const ownedAccounts = $derived.by(() => {
		const accounts: { id: number; name: string }[] = [];
		for (const accountId of serverState.portfolios.keys()) {
			accounts.push({
				id: accountId,
				name: accountName(accountId) ?? `Account ${accountId}`
			});
		}
		return accounts.sort((a, b) => a.name.localeCompare(b.name));
	});

	// --- Filter state ---
	let selectedGroupId = $state<string>('');
	let selectedMarketId = $state<string>('');
	let pnlMarkingMode = $state<PnLMarkingMode>('settlement');
	let theoreticalPriceInput = $state<string>('');
	let highlightedTradeClientX = $state<number | undefined>(undefined);
	let hoverClientX = $state<number | undefined>(undefined);

	const effectiveClientX = $derived(hoverClientX ?? highlightedTradeClientX);

	const handleHoverClientX = (clientX: number | undefined) => {
		hoverClientX = clientX;
	};


	// Reset theoretical mode when no single market is selected
	$effect(() => {
		if (!selectedMarketId && pnlMarkingMode === 'theoretical') {
			pnlMarkingMode = 'settlement';
		}
	});

	// Clear highlight when market selection changes
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		selectedMarketId;
		highlightedTradeClientX = undefined;
	});

	// --- Trade history loading ---
	let requestedMarkets = $state(new Set<number>());
	let prevAccountId: number | undefined = undefined;

	// Request trade history for relevant markets
	$effect(() => {
		const accountId = effectiveAccountId;
		if (!accountId) return;

		// Reset when account changes
		if (prevAccountId !== accountId) {
			requestedMarkets = new Set();
			prevAccountId = accountId;
		}

		const portfolio = serverState.portfolios.get(accountId);
		const tradedMarketIds = serverState.tradedMarketIds.get(accountId);
		const needed = getMarketsNeedingHistory(
			accountId,
			serverState.markets,
			portfolio,
			tradedMarketIds
		);

		let delay = 0;
		for (const marketId of needed) {
			if (untrack(() => requestedMarkets.has(marketId))) continue;
			requestedMarkets.add(marketId);
			setTimeout(() => {
				sendClientMessage({ getFullTradeHistory: { marketId } });
			}, delay);
			delay += 350; // ~170/min, safely under 180/min rate limit
		}
	});

	// Track loading progress
	const loadingProgress = $derived.by(() => {
		let total = requestedMarkets.size;
		let loaded = 0;
		for (const mid of requestedMarkets) {
			if (serverState.markets.get(mid)?.hasFullTradeHistory) loaded++;
		}
		return { total, loaded };
	});

	const isLoading = $derived(
		loadingProgress.total > 0 && loadingProgress.loaded < loadingProgress.total
	);

	// --- Compute filter set ---
	const filterMarketIds = $derived.by(() => {
		if (selectedGroupId) {
			return getMarketIdsForGroup(Number(selectedGroupId), serverState.markets);
		}
		if (selectedMarketId) {
			return new Set([Number(selectedMarketId)]);
		}
		return undefined;
	});

	// --- Reactivity version (same pattern as home page) ---
	const marketsVersion = $derived(
		[...serverState.markets.values()]
			.map(
				(m) =>
					`${m.definition.id}:${m.trades.length}:${m.redemptions.length}:${m.hasFullTradeHistory}:${m.definition.closed?.settlePrice ?? ''}`
			)
			.join('|')
	);

	// --- Compute PnL ---
	const pnlResult = $derived(
		computePnLOverTime(
			effectiveAccountId,
			serverState.markets,
			filterMarketIds,
			marketsVersion,
			pnlMarkingMode,
			pnlMarkingMode === 'theoretical' && theoreticalPriceInput !== ''
				? Number(theoreticalPriceInput)
				: undefined
		)
	);

	// Unfiltered PnL for per-market chip labels
	const allPnlResult = $derived(
		computePnLOverTime(effectiveAccountId, serverState.markets, undefined, marketsVersion)
	);

	const marketPnlMap = $derived.by(() => {
		const map = new Map<number, number>();
		for (const s of allPnlResult.marketSummaries) {
			map.set(s.marketId, s.totalPnL);
		}
		return map;
	});

	// --- Selected market data (for price chart) ---
	const selectedMarketData = $derived(
		selectedMarketId ? serverState.markets.get(Number(selectedMarketId)) : undefined
	);

	// Pause windows for the selected market, used to render grey overlays on
	// the wall-clock charts. Empty when no market is selected (or the selected
	// market never paused), in which case overlays no-op.
	const selectedPauses = $derived(
		selectedMarketData
			? pauseIntervals(selectedMarketData.statusChanges, Date.now())
			: []
	);

	// Shared x-domain so PnL chart and price chart align when a market is selected
	const sharedXDomain = $derived.by<[Date, Date] | undefined>(() => {
		if (!selectedMarketData || !pnlResult.dataPoints.length) return undefined;
		const trades = selectedMarketData.trades;
		if (!trades.length) return undefined;

		// Gather all timestamps from both datasets
		let min = Infinity;
		let max = -Infinity;
		for (const dp of pnlResult.dataPoints) {
			const t = dp.timestamp.getTime();
			if (t < min) min = t;
			if (t > max) max = t;
		}
		for (const trade of trades) {
			const ts = trade.transactionTimestamp;
			if (ts) {
				const t = ts.seconds * 1000;
				if (t < min) min = t;
				if (t > max) max = t;
			}
		}
		if (!isFinite(min) || !isFinite(max)) return undefined;
		return [new Date(min), new Date(max)];
	});

	// --- Markets the account has traded or been affected by via redemptions ---
	const tradedMarkets = $derived.by(() => {
		const seen = new Set<number>();
		const result: { id: number; name: string; groupId: number | undefined }[] = [];
		for (const s of allPnlResult.marketSummaries) {
			if (seen.has(s.marketId)) continue;
			seen.add(s.marketId);
			result.push({
				id: s.marketId,
				name: s.marketName,
				groupId: s.groupId
			});
		}
		return result.sort((a, b) => a.name.localeCompare(b.name));
	});

	// --- Grouped traded markets (for chip selector) ---
	const groupedTradedMarkets = $derived.by(() => {
		const groups = new Map<number, { groupName: string; markets: typeof tradedMarkets }>();
		const ungrouped: typeof tradedMarkets = [];
		for (const m of tradedMarkets) {
			if (m.groupId != null) {
				if (!groups.has(m.groupId)) {
					const name = serverState.marketGroups.get(m.groupId)?.name ?? `Group ${m.groupId}`;
					groups.set(m.groupId, { groupName: name, markets: [] });
				}
				groups.get(m.groupId)!.markets.push(m);
			} else {
				ungrouped.push(m);
			}
		}
		return {
			groups: [...groups.entries()].sort(([, a], [, b]) => a.groupName.localeCompare(b.groupName)),
			ungrouped
		};
	});

	// --- Table sorting ---
	type SortKey = 'marketName' | 'position' | 'totalPnL' | 'tradeCount' | 'volume' | 'clipsTraded';
	let sortKey = $state<SortKey>('totalPnL');
	let sortDir = $state<'asc' | 'desc'>('desc');

	const sortedSummaries = $derived.by(() => {
		const rows = [...allPnlResult.marketSummaries];
		rows.sort((a, b) => {
			const va = a[sortKey];
			const vb = b[sortKey];
			if (typeof va === 'string' && typeof vb === 'string') {
				return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
			}
			return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va);
		});
		return rows;
	});

	const toggleSort = (key: SortKey) => {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = key === 'marketName' ? 'asc' : 'desc';
		}
	};

	const sortSymbol = (key: SortKey) => {
		if (sortKey !== key) return '';
		return sortDir === 'asc' ? ' \u2191' : ' \u2193';
	};

	const formatPnL = (v: number) => {
		const sign = v >= 0 ? '+' : '';
		return `${sign}${Math.round(v).toLocaleString()}`;
	};

	const formatDecimal = (v: number) => {
		if (v === 0) return '0';
		return v.toFixed(1);
	};

	const pnlColor = (v: number) =>
		v >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

	// Step-after curve so position changes step at trade events rather than
	// interpolating diagonals.
	type PathCtx = { moveTo: (x: number, y: number) => void; lineTo: (x: number, y: number) => void };
	function curveStepAfter(context: PathCtx) {
		let x = NaN;
		let y = NaN;
		let point = 0;
		return {
			areaStart() {},
			areaEnd() {},
			lineStart() {
				x = y = NaN;
				point = 0;
			},
			lineEnd() {},
			point(nx: number, ny: number) {
				nx = +nx;
				ny = +ny;
				if (point === 0) {
					context.moveTo(nx, ny);
					point = 1;
				} else {
					context.lineTo(nx, y);
					context.lineTo(nx, ny);
				}
				x = nx;
				y = ny;
			}
		};
	}

	// Max absolute values for scaling cell backgrounds
	const maxAbsPnL = $derived(
		Math.max(...allPnlResult.marketSummaries.map((r) => Math.abs(r.totalPnL)), 1)
	);
	const maxClips = $derived(Math.max(...allPnlResult.marketSummaries.map((r) => r.clipsTraded), 1));

	const pnlBg = (v: number) => {
		const intensity = Math.min(Math.abs(v) / maxAbsPnL, 1) * 0.35;
		if (v >= 0) return `rgba(34, 197, 94, ${intensity})`;
		return `rgba(239, 68, 68, ${intensity})`;
	};

	const clipsBg = (v: number) => {
		const intensity = Math.min(v / maxClips, 1) * 0.35;
		return `rgba(234, 179, 8, ${intensity})`;
	};
</script>

<div class="w-full pt-8">
	<div class="mb-6">
		<div class="flex items-center justify-between">
			<h1 class="text-xl font-bold">Performance</h1>
			{#if isLoading}
				<span class="text-sm text-muted-foreground">
					Loading trade history: {loadingProgress.loaded}/{loadingProgress.total} markets...
				</span>
			{/if}
		</div>
		{#if isLoading}
			<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
				<div
					class="h-full rounded-full bg-primary transition-all duration-300"
					style="width: {loadingProgress.total > 0
						? (loadingProgress.loaded / loadingProgress.total) * 100
						: 0}%"
				></div>
			</div>
		{/if}
	</div>

	<!-- Account selector -->
	{#if ownedAccounts.length > 1}
		<div class="mb-6">
			<p class="mb-2 text-sm font-medium text-muted-foreground">Viewing performance for:</p>
			<div class="flex flex-wrap gap-2">
				{#each ownedAccounts as account (account.id)}
					<button
						type="button"
						onclick={() => {
							selectedAccountId = account.id;
							selectedGroupId = '';
							selectedMarketId = '';
						}}
						class={cn(
							'rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all',
							effectiveAccountId === account.id
								? 'border-primary bg-primary/10 text-primary shadow-sm'
								: 'border-transparent bg-muted/40 text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/60'
						)}
					>
						{account.name}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Summary stat cards -->
	<div class={cn('grid gap-4', selectedMarketId ? 'md:grid-cols-4' : 'md:grid-cols-3')}>
		<div class="rounded-md border bg-muted/30 p-4">
			<p class="text-sm text-muted-foreground">Total PnL</p>
			<p class={cn('text-2xl font-semibold', pnlColor(pnlResult.totalPnL))}>
				{formatPnL(pnlResult.totalPnL)}
			</p>
		</div>
		{#if selectedMarketId}
			<div class="rounded-md border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground">Volume Traded</p>
				<p class="text-2xl font-semibold">
					{formatDecimal(pnlResult.totalVolume)}
				</p>
				<p class="mt-1 text-xs">
					<span class="text-green-600 dark:text-green-400"
						>{formatDecimal(pnlResult.totalBuyVolume)} bought</span
					>
					<span class="mx-1 text-muted-foreground">/</span>
					<span class="text-red-600 dark:text-red-400"
						>{formatDecimal(pnlResult.totalSellVolume)} sold</span
					>
				</p>
			</div>
		{/if}
		<div class="rounded-md border bg-muted/30 p-4">
			<p class="text-sm text-muted-foreground">Clips Traded</p>
			<p class="text-2xl font-semibold">
				{formatDecimal(pnlResult.totalClipsTraded)}
			</p>
		</div>
		<div class="rounded-md border bg-muted/30 p-4">
			<p class="text-sm text-muted-foreground">Total Trades</p>
			<p class="text-2xl font-semibold">
				{pnlResult.totalTradesCount.toLocaleString()}
			</p>
		</div>
	</div>

	<!-- Hidden ID warning -->
	{#if pnlResult.hasHiddenIdMarkets}
		<div class="mt-4 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
			Some markets have hidden account IDs. PnL from those markets may be incomplete.
		</div>
	{/if}

	<!-- Market / Group filter chips -->
	{#if tradedMarkets.length > 0}
		<div class="mt-8 space-y-4">
			<!-- All Markets chip -->
			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					onclick={() => {
						selectedGroupId = '';
						selectedMarketId = '';
					}}
					class={cn(
						'rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all',
						!selectedGroupId && !selectedMarketId
							? 'border-primary bg-primary/10 text-primary shadow-sm'
							: 'border-transparent bg-muted/40 text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/60'
					)}
				>
					All Markets
				</button>
			</div>

			<!-- Grouped markets -->
			{#each groupedTradedMarkets.groups as [groupId, group] (groupId)}
				{@const groupPnl = group.markets.reduce((sum, m) => sum + (marketPnlMap.get(m.id) ?? 0), 0)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					onclick={(e) => {
						if ((e.target as HTMLElement).closest('[data-market-chip]')) return;
						selectedGroupId = String(groupId);
						selectedMarketId = '';
					}}
					class={cn(
						'cursor-pointer rounded-lg border-2 px-3 py-2.5 transition-all',
						selectedGroupId === String(groupId)
							? 'border-primary bg-primary/10 shadow-sm'
							: 'border-transparent bg-muted/40 hover:border-muted-foreground/30 hover:bg-muted/60'
					)}
				>
					<p
						class={cn(
							'mb-2 text-xs font-semibold uppercase tracking-wide',
							selectedGroupId === String(groupId) ? 'text-primary' : 'text-muted-foreground'
						)}
					>
						{group.groupName}
						<span class={cn('ml-1.5 text-xs font-semibold', pnlColor(groupPnl))}>
							{formatPnL(groupPnl)}
						</span>
					</p>
					<div class="flex flex-wrap gap-1.5">
						{#each group.markets as market (market.id)}
							{@const mPnl = marketPnlMap.get(market.id) ?? 0}
							<button
								type="button"
								data-market-chip
								onclick={() => {
									selectedMarketId = String(market.id);
									selectedGroupId = '';
								}}
								class={cn(
									'rounded-md border px-2.5 py-1 text-sm transition-all',
									selectedMarketId === String(market.id)
										? 'border-primary bg-primary/10 text-primary shadow-sm'
										: selectedGroupId === String(groupId)
											? 'border-primary/30 bg-primary/5 text-primary'
											: 'border-transparent bg-background/60 text-muted-foreground hover:border-muted-foreground/30 hover:bg-background/80'
								)}
							>
								<MarketName name={market.name} variant="compact" inGroup={true} />
								<span class={cn('ml-1 text-xs font-medium', pnlColor(mPnl))}>{formatPnL(mPnl)}</span
								>
							</button>
						{/each}
					</div>
				</div>
			{/each}

			<!-- Ungrouped markets -->
			{#if groupedTradedMarkets.ungrouped.length > 0}
				<div>
					<p class="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Ungrouped
					</p>
					<div class="flex flex-wrap gap-2">
						{#each groupedTradedMarkets.ungrouped as market (market.id)}
							{@const mPnl = marketPnlMap.get(market.id) ?? 0}
							<button
								type="button"
								onclick={() => {
									selectedMarketId = String(market.id);
									selectedGroupId = '';
								}}
								class={cn(
									'rounded-lg border-2 px-3 py-1.5 text-sm transition-all',
									selectedMarketId === String(market.id)
										? 'border-primary bg-primary/10 text-primary shadow-sm'
										: 'border-transparent bg-muted/40 text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/60'
								)}
							>
								<MarketName name={market.name} variant="compact" />
								<span class={cn('ml-1 text-xs font-medium', pnlColor(mPnl))}>{formatPnL(mPnl)}</span
								>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{:else if !isLoading}
		<p class="mt-8 text-muted-foreground">No traded markets found.</p>
	{/if}

	<!-- PnL Chart -->
	<div class="mt-8">
		<div class="flex items-center gap-3">
			<h2 class="text-lg font-semibold">Profits and Losses</h2>
			<ToggleGroup.Root bind:value={pnlMarkingMode} type="single" variant="outline" size="sm">
				<Tooltip.Root>
					<Tooltip.Trigger>
						<ToggleGroup.Item value="settlement">Mark to Settlement</ToggleGroup.Item>
					</Tooltip.Trigger>
					<Tooltip.Content>
						Value positions at the final settlement price, or the last trade price if market is
						still open
					</Tooltip.Content>
				</Tooltip.Root>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<ToggleGroup.Item value="market">Mark to Market</ToggleGroup.Item>
					</Tooltip.Trigger>
					<Tooltip.Content>
						Value positions at each point in time using the most recent trade price at that moment,
						regardless of settlement price
					</Tooltip.Content>
				</Tooltip.Root>
				{#if selectedMarketId}
					<Tooltip.Root>
						<Tooltip.Trigger>
							<ToggleGroup.Item value="theoretical">Input Custom</ToggleGroup.Item>
						</Tooltip.Trigger>
						<Tooltip.Content>Value positions at a custom price you specify</Tooltip.Content>
					</Tooltip.Root>
				{/if}
			</ToggleGroup.Root>
			{#if pnlMarkingMode === 'theoretical'}
				<input
					type="number"
					bind:value={theoreticalPriceInput}
					placeholder="Price"
					class="h-9 w-24 rounded-md border bg-background px-2 text-sm"
				/>
			{/if}
		</div>
		<PnlChart
			dataPoints={pnlResult.dataPoints}
			xDomain={sharedXDomain}
			pauseOverlays={selectedPauses}
		/>
	</div>

	<!-- Market Price Chart (when single market selected) -->
	{#if selectedMarketId && selectedMarketData}
		<div class="mt-8">
			<h2 class="text-lg font-semibold">
				<MarketName name={selectedMarketData.definition.name} variant="compact" /> — Price Chart
			</h2>
			<PriceChart
				trades={selectedMarketData.trades}
				minSettlement={selectedMarketData.definition.minSettlement}
				maxSettlement={selectedMarketData.definition.maxSettlement}
				showMyTrades={true}
				accountId={effectiveAccountId}
				xDomain={sharedXDomain}
				highlightClientX={effectiveClientX}
				settlePrice={selectedMarketData.definition.closed?.settlePrice ?? undefined}
				pauseOverlays={selectedPauses}
				onHoverClientX={handleHoverClientX}
				onTradeClick={(_trade, clientX) => {
					highlightedTradeClientX = clientX;
				}}
			/>
		</div>
	{/if}

	<!-- Position Chart (when single market selected) -->
	{#if selectedMarketId && selectedMarketData && pnlResult.positionTimeline.length > 0}
		<div class="mt-8">
			<h2 class="text-lg font-semibold">
				<MarketName name={selectedMarketData.definition.name} variant="compact" /> — Position
			</h2>
			<div class="pos-chart-container relative h-[20rem] w-full pt-4 md:h-96">
				<LineChart
					data={pnlResult.positionTimeline}
					x="timestamp"
					y="position"
					xDomain={sharedXDomain}
					props={{
						xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
						yAxis: { grid: { class: 'stroke-surface-content/30' } },
						spline: { curve: curveStepAfter }
					}}
					tooltip={false}
				>
					<svelte:fragment slot="belowMarks" let:xScale let:padding let:height>
						<Rule
							y={0}
							class="stroke-muted-foreground/60"
							stroke-dasharray="6 3"
							stroke-width="1.5"
						/>
						{#if selectedPauses.length > 0}
							{@const plotBottom = height - (padding?.top ?? 0) - (padding?.bottom ?? 0)}
							{#each selectedPauses as iv, i (i)}
								{@const x1 = xScale(new Date(iv.start))}
								{@const x2 = xScale(new Date(iv.end))}
								<rect
									x={Math.min(x1, x2)}
									y={0}
									width={Math.max(1, Math.abs(x2 - x1))}
									height={plotBottom}
									class="fill-muted-foreground/15 pointer-events-none"
								/>
							{/each}
						{/if}
					</svelte:fragment>
				</LineChart>
			</div>
		</div>
	{/if}

	<!-- Best / Worst markets -->
	{#if pnlResult.bestMarket && pnlResult.worstMarket && pnlResult.marketSummaries.length > 1}
		<div class="mt-8 grid gap-4 md:grid-cols-2">
			<div class="rounded-md border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground">Best Market</p>
				<p class="font-medium">
					<MarketName name={pnlResult.bestMarket.marketName} variant="compact" />
				</p>
				<p class={cn('text-lg font-semibold', pnlColor(pnlResult.bestMarket.totalPnL))}>
					{formatPnL(pnlResult.bestMarket.totalPnL)}
				</p>
			</div>
			<div class="rounded-md border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground">Worst Market</p>
				<p class="font-medium">
					<MarketName name={pnlResult.worstMarket.marketName} variant="compact" />
				</p>
				<p class={cn('text-lg font-semibold', pnlColor(pnlResult.worstMarket.totalPnL))}>
					{formatPnL(pnlResult.worstMarket.totalPnL)}
				</p>
			</div>
		</div>
	{/if}

	<!-- Market Performance Table -->
	{#if sortedSummaries.length > 0}
		<div class="mt-8">
			<h2 class="text-lg font-semibold">Market Breakdown</h2>
			<div class="mt-4 overflow-x-auto rounded-md border">
				<Table.Root class="min-w-max">
					<Table.Header>
						<Table.Row>
							<Table.Head>
								<button type="button" onclick={() => toggleSort('marketName')}>
									Market{sortSymbol('marketName')}
								</button>
							</Table.Head>
							<Table.Head class="text-right">
								<button type="button" onclick={() => toggleSort('position')}>
									Position{sortSymbol('position')}
								</button>
							</Table.Head>
							<Table.Head class="text-right">
								<button type="button" onclick={() => toggleSort('totalPnL')}>
									PnL{sortSymbol('totalPnL')}
								</button>
							</Table.Head>
							<Table.Head class="text-right">
								<button type="button" onclick={() => toggleSort('volume')}>
									Volume Traded{sortSymbol('volume')}
									<span title="sum(abs(size)) across all your trades in this market"
										><CircleHelp class="mb-0.5 inline size-3.5 text-muted-foreground" /></span
									>
								</button>
							</Table.Head>
							<Table.Head class="text-right">
								<button type="button" onclick={() => toggleSort('clipsTraded')}>
									Clips Traded{sortSymbol('clipsTraded')}
									<span title="sum(abs(price*size)) across all your trades in this market"
										><CircleHelp class="mb-0.5 inline size-3.5 text-muted-foreground" /></span
									>
								</button>
							</Table.Head>
							<Table.Head class="text-right">
								<button type="button" onclick={() => toggleSort('tradeCount')}>
									Trades{sortSymbol('tradeCount')}
								</button>
							</Table.Head>
							<Table.Head class="text-center">Status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each sortedSummaries as row (row.marketId)}
							<Table.Row
								class="cursor-pointer hover:bg-muted/50"
								onclick={() => {
									selectedMarketId = String(row.marketId);
									selectedGroupId = '';
								}}
							>
								<Table.Cell class="font-medium"
									><MarketName name={row.marketName} variant="compact" /></Table.Cell
								>
								<Table.Cell class="text-right">{formatDecimal(row.position)}</Table.Cell>
								<Table.Cell
									class={cn('text-right font-medium', pnlColor(row.totalPnL))}
									style="background-color: {pnlBg(row.totalPnL)}"
								>
									{formatPnL(row.totalPnL)}
								</Table.Cell>
								<Table.Cell class="text-right">{formatDecimal(row.volume)}</Table.Cell>
								<Table.Cell class="text-right" style="background-color: {clipsBg(row.clipsTraded)}"
									><Paperclip class="mb-0.5 inline size-3 text-muted-foreground" />{formatDecimal(
										row.clipsTraded
									)}</Table.Cell
								>
								<Table.Cell class="text-right">{row.tradeCount}</Table.Cell>
								<Table.Cell class="text-center">
									{#if row.isSettled}
										<span
											class="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
										>
											Settled{row.settlePrice !== undefined
												? ` @ ${formatDecimal(row.settlePrice)}`
												: ''}
										</span>
									{:else}
										<span
											class="inline-block rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-600 dark:text-green-400"
										>
											Open
										</span>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	{:else if !isLoading}
		<div class="mt-8">
			<p class="text-muted-foreground">No trade data found for this account.</p>
		</div>
	{/if}
</div>
