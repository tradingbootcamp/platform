<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import PnlChart from '$lib/components/pnlChart.svelte';
	import * as Table from '$lib/components/ui/table';
	import {
		computePnLOverTime,
		getMarketIdsForGroup,
		getMarketsNeedingHistory
	} from '$lib/pnlMetrics';
	import MarketName from '$lib/components/marketName.svelte';
	import { cn } from '$lib/utils';

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

	// --- Trade history loading ---
	let requestedMarkets = new Set<number>();
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
		const needed = getMarketsNeedingHistory(accountId, serverState.markets, portfolio);

		let delay = 0;
		for (const marketId of needed) {
			if (requestedMarkets.has(marketId)) continue;
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
					`${m.definition.id}:${m.trades.length}:${m.hasFullTradeHistory}:${m.definition.closed?.settlePrice ?? ''}`
			)
			.join('|')
	);

	// --- Compute PnL ---
	const pnlResult = $derived(
		computePnLOverTime(effectiveAccountId, serverState.markets, filterMarketIds, marketsVersion)
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

	// --- Markets the account has traded (for market filter) ---
	const tradedMarkets = $derived.by(() => {
		const accountId = effectiveAccountId;
		if (!accountId) return [];

		const result: { id: number; name: string; groupId: number | undefined }[] = [];
		for (const [marketId, marketData] of serverState.markets) {
			if (!marketData.hasFullTradeHistory) continue;
			const hasTrades = marketData.trades.some(
				(t) => t.buyerId === accountId || t.sellerId === accountId
			);
			if (hasTrades) {
				result.push({
					id: Number(marketId),
					name: marketData.definition.name || `Market ${marketId}`,
					groupId: marketData.definition.groupId ? Number(marketData.definition.groupId) : undefined
				});
			}
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
	type SortKey = 'marketName' | 'position' | 'totalPnL' | 'averageEntryPrice' | 'tradeCount';
	let sortKey = $state<SortKey>('totalPnL');
	let sortDir = $state<'asc' | 'desc'>('desc');

	const sortedSummaries = $derived.by(() => {
		const rows = [...pnlResult.marketSummaries];
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
</script>

<div class="w-full pt-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-xl font-bold">Performance</h1>
		{#if isLoading}
			<span class="text-sm text-muted-foreground">
				Loading trade history: {loadingProgress.loaded}/{loadingProgress.total} markets...
			</span>
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
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-md border bg-muted/30 p-4">
			<p class="text-sm text-muted-foreground">Total PnL</p>
			<p class={cn('text-2xl font-semibold', pnlColor(pnlResult.totalPnL))}>
				{formatPnL(pnlResult.totalPnL)}
			</p>
		</div>
		<div class="rounded-md border bg-muted/30 p-4">
			<p class="text-sm text-muted-foreground">Realized PnL</p>
			<p class={cn('text-2xl font-semibold', pnlColor(pnlResult.totalRealizedPnL))}>
				{formatPnL(pnlResult.totalRealizedPnL)}
			</p>
		</div>
		<div class="rounded-md border bg-muted/30 p-4">
			<p class="text-sm text-muted-foreground">Unrealized PnL</p>
			<p class={cn('text-2xl font-semibold', pnlColor(pnlResult.totalUnrealizedPnL))}>
				{formatPnL(pnlResult.totalUnrealizedPnL)}
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
					<p class={cn(
						'mb-2 text-xs font-semibold uppercase tracking-wide',
						selectedGroupId === String(groupId)
							? 'text-primary'
							: 'text-muted-foreground'
					)}>
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
								<span class={cn('ml-1 text-xs font-medium', pnlColor(mPnl))}>{formatPnL(mPnl)}</span>
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
								<span class={cn('ml-1 text-xs font-medium', pnlColor(mPnl))}>{formatPnL(mPnl)}</span>
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
		<h2 class="text-lg font-semibold">PnL Over Time</h2>
		<PnlChart dataPoints={pnlResult.dataPoints} />
	</div>

	<!-- Best / Worst markets -->
	{#if pnlResult.bestMarket && pnlResult.worstMarket && pnlResult.marketSummaries.length > 1}
		<div class="mt-8 grid gap-4 md:grid-cols-2">
			<div class="rounded-md border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground">Best Market</p>
				<p class="font-medium"><MarketName name={pnlResult.bestMarket.marketName} variant="compact" /></p>
				<p class={cn('text-lg font-semibold', pnlColor(pnlResult.bestMarket.totalPnL))}>
					{formatPnL(pnlResult.bestMarket.totalPnL)}
				</p>
			</div>
			<div class="rounded-md border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground">Worst Market</p>
				<p class="font-medium"><MarketName name={pnlResult.worstMarket.marketName} variant="compact" /></p>
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
								<button type="button" onclick={() => toggleSort('averageEntryPrice')}>
									Avg Entry{sortSymbol('averageEntryPrice')}
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
								<Table.Cell class="font-medium"><MarketName name={row.marketName} variant="compact" /></Table.Cell>
								<Table.Cell class="text-right">{formatDecimal(row.position)}</Table.Cell>
								<Table.Cell class={cn('text-right font-medium', pnlColor(row.totalPnL))}>
									{formatPnL(row.totalPnL)}
								</Table.Cell>
								<Table.Cell class="text-right">{formatDecimal(row.averageEntryPrice)}</Table.Cell>
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
