<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import * as Table from '$lib/components/ui/table';
	import { computePortfolioMetrics, type PortfolioRow } from '$lib/portfolioMetrics';
	import Minus from '@lucide/svelte/icons/minus';

	type SortKey =
		| 'name'
		| 'position'
		| 'openBids'
		| 'openOffers'
		| 'capitalUsed'
		| 'lockedTotal'
		| 'lockedBids'
		| 'lockedOffers'
		| 'minSettlement'
		| 'maxSettlement'
		| 'bestOwnBid'
		| 'bestOwnOffer'
		| 'mid'
		| 'last';

	let sortKey: SortKey = $state('capitalUsed');
	let sortDirection: 'asc' | 'desc' = $state('desc');
	let hiddenColumns = $state<Set<SortKey>>(
		new Set<SortKey>([
			'minSettlement',
			'maxSettlement',
			'lockedBids',
			'lockedOffers',
			'openBids',
			'openOffers'
		])
	);

	const marketsVersion = $derived(
		[...serverState.markets.values()]
			.map(
				(m) =>
					`${m.definition.id}:${m.orders.length}:${m.trades.length}:${m.hasFullTradeHistory}:${m.hasFullOrderHistory}:${
						m.trades.at(-1)?.transactionId ?? 0
					}`
			)
			.join('|')
	);

	let metrics = $derived(
		computePortfolioMetrics(
			serverState.portfolio,
			serverState.markets,
			serverState.actingAs,
			marketsVersion
		)
	);
	let rows: PortfolioRow[] = $state([]);

	$effect(() => {
		rows = metrics.rows;
	});

	// Ensure we have last prices by requesting trade history for relevant markets.
	let requestedTrades = new Set<number>();
	$effect(() => {
		for (const exposure of serverState.portfolio?.marketExposures || []) {
			const marketId = Number(exposure.marketId ?? 0);
			const marketData = serverState.markets.get(marketId);
			if (!marketData?.definition?.open) continue;
			if (marketData.hasFullTradeHistory) continue;
			if (requestedTrades.has(marketId)) continue;
			requestedTrades.add(marketId);
			sendClientMessage({ getFullTradeHistory: { marketId } });
		}
	});

	const getValue = (row: PortfolioRow, key: SortKey) => {
		switch (key) {
			case 'name':
				return row.name;
			case 'position':
				return row.position;
			case 'openBids':
				return row.openBids;
			case 'openOffers':
				return row.openOffers;
			case 'capitalUsed':
				return row.capitalUsed;
			case 'lockedTotal':
				return row.lockedTotal;
			case 'lockedBids':
				return row.lockedBids;
			case 'lockedOffers':
				return row.lockedOffers;
			case 'minSettlement':
				return row.minSettlement;
			case 'maxSettlement':
				return row.maxSettlement;
			case 'bestOwnBid':
				return row.bestOwnBid;
			case 'bestOwnOffer':
				return row.bestOwnOffer;
			case 'mid':
				return row.mid;
			case 'last':
				return row.last;
		}
	};

	let sortedRows: PortfolioRow[] = $state([]);

	$effect(() => {
		const copy = [...rows];
		copy.sort((a, b) => {
			const valA = getValue(a, sortKey);
			const valB = getValue(b, sortKey);
			if (valA === undefined && valB === undefined) return 0;
			if (valA === undefined) return 1;
			if (valB === undefined) return -1;

			if (typeof valA === 'string' && typeof valB === 'string') {
				return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
			}
			const diff = Number(valA) - Number(valB);
			return sortDirection === 'asc' ? diff : -diff;
		});
		sortedRows = copy;
	});

	const positionExtent = $derived.by(() => {
		const values = rows.map((r) => r.position);
		return {
			min: values.length ? Math.min(0, ...values) : 0,
			max: values.length ? Math.max(0, ...values) : 0
		};
	});

	const positiveExtents = $derived.by(() => ({
		openBids: rows.length ? Math.max(0, ...rows.map((r) => r.openBids)) : 0,
		openOffers: rows.length ? Math.max(0, ...rows.map((r) => r.openOffers)) : 0,
		capitalUsed: rows.length ? Math.max(0, ...rows.map((r) => r.capitalUsed)) : 0,
		lockedTotal: rows.length ? Math.max(0, ...rows.map((r) => r.lockedTotal)) : 0,
		lockedBids: rows.length ? Math.max(0, ...rows.map((r) => r.lockedBids)) : 0,
		lockedOffers: rows.length ? Math.max(0, ...rows.map((r) => r.lockedOffers)) : 0
	}));

	const numberFormat2 = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	const formatInt = (value: number) => Math.round(value).toLocaleString();
	const formatPrice = (value: number | undefined) =>
		value === undefined ? '---' : value.toFixed(1);
	const withClip = (value: string) => `📎 ${value}`;
	const mixChannel = (from: number, to: number, t: number) => from + (to - from) * t;
	const colorFromScale = (target: [number, number, number], t: number) => {
		const clampT = Math.max(0, Math.min(1, t));
		return `rgb(${Math.round(mixChannel(255, target[0], clampT))}, ${Math.round(mixChannel(255, target[1], clampT))}, ${Math.round(mixChannel(255, target[2], clampT))})`;
	};

	const divergingColor = (value: number, min: number, max: number) => {
		if (value === 0 || (min === 0 && max === 0)) return 'transparent';
		if (value > 0 && max > 0) {
			return colorFromScale([249, 115, 22], Math.min(1, value / max));
		}
		if (value < 0 && min < 0) {
			return colorFromScale([168, 85, 247], Math.min(1, Math.abs(value / min)));
		}
		return 'transparent';
	};

	const positiveColor = (value: number, max: number) => {
		if (value <= 0 || max <= 0) return 'transparent';
		return colorFromScale([234, 179, 8], Math.min(1, value / max));
	};

	const sortBy = (key: SortKey) => {
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = key === 'name' ? 'asc' : 'desc';
		}
	};

	const sortSymbol = (key: SortKey) => {
		if (sortKey !== key) return '↕';
		return sortDirection === 'asc' ? '↑' : '↓';
	};

	const ariaSort = (key: SortKey) => {
		if (sortKey !== key) return 'none';
		return sortDirection === 'asc' ? 'ascending' : 'descending';
	};

	const sortLabels: Record<SortKey, string> = {
		name: 'Market',
		position: 'Position',
		openBids: 'Bids',
		openOffers: 'Offers',
		capitalUsed: 'Position',
		lockedTotal: 'Open orders',
		lockedBids: 'Bids',
		lockedOffers: 'Offers',
		minSettlement: 'Min',
		maxSettlement: 'Max',
		bestOwnBid: 'Bid',
		bestOwnOffer: 'Offer',
		mid: 'Mid',
		last: 'Last'
	};

	type Column = {
		key: SortKey;
		label: string;
	};

	const columns: Column[] = [
		{ key: 'name', label: sortLabels.name },
		{ key: 'position', label: sortLabels.position },
		{ key: 'capitalUsed', label: sortLabels.capitalUsed },
		{ key: 'lockedTotal', label: sortLabels.lockedTotal },
		{ key: 'lockedBids', label: sortLabels.lockedBids },
		{ key: 'lockedOffers', label: sortLabels.lockedOffers },
		{ key: 'openBids', label: sortLabels.openBids },
		{ key: 'openOffers', label: sortLabels.openOffers },
		{ key: 'bestOwnBid', label: sortLabels.bestOwnBid },
		{ key: 'bestOwnOffer', label: sortLabels.bestOwnOffer },
		{ key: 'mid', label: sortLabels.mid },
		{ key: 'last', label: sortLabels.last },
		{ key: 'minSettlement', label: sortLabels.minSettlement },
		{ key: 'maxSettlement', label: sortLabels.maxSettlement }
	];

	const columnGroups: { label: string; keys: SortKey[] }[] = [
		{
			label: 'Capital locked by',
			keys: ['capitalUsed', 'lockedTotal', 'lockedBids', 'lockedOffers']
		},
		{ label: 'Open order size', keys: ['openBids', 'openOffers'] },
		{ label: 'Your best', keys: ['bestOwnBid', 'bestOwnOffer'] },
		{ label: 'Settlement', keys: ['minSettlement', 'maxSettlement'] }
	];

	const hideColumn = (key: SortKey) => {
		if (key === 'name') return;
		const next = new Set(hiddenColumns);
		next.add(key);
		hiddenColumns = next;
		if (sortKey === key) {
			const firstVisible = columns.find((c) => !next.has(c.key));
			sortKey = firstVisible?.key ?? 'capitalUsed';
			sortDirection = 'desc';
		}
	};

	const hideColumns = (keys: SortKey[]) => {
		const next = new Set(hiddenColumns);
		for (const key of keys) {
			if (key === 'name') continue;
			next.add(key);
		}
		hiddenColumns = next;
		if (next.has(sortKey)) {
			const firstVisible = columns.find((c) => !next.has(c.key));
			sortKey = firstVisible?.key ?? 'capitalUsed';
			sortDirection = 'desc';
		}
	};

	const showColumn = (key: SortKey) => {
		const next = new Set(hiddenColumns);
		next.delete(key);
		hiddenColumns = next;
	};

	const visibleColumns = $derived(columns.filter((c) => !hiddenColumns.has(c.key)));
	const groupBounds = (label: string) => {
		let start = -1;
		let end = -1;
		visibleColumns.forEach((column, index) => {
			const group = columnGroups.find((g) => g.keys.includes(column.key));
			if (group?.label !== label) return;
			if (start === -1) start = index;
			end = index;
		});
		return { start, end };
	};

	const visibleGroup = (group: { label: string; keys: SortKey[] }) =>
		group.keys.filter((key) => !hiddenColumns.has(key));

	const cellBackground = (row: PortfolioRow, key: SortKey) => {
		switch (key) {
			case 'position':
				return divergingColor(row.position, positionExtent.min, positionExtent.max);
			case 'openBids':
				return positiveColor(row.openBids, positiveExtents.openBids);
			case 'openOffers':
				return positiveColor(row.openOffers, positiveExtents.openOffers);
			case 'capitalUsed':
				return positiveColor(row.capitalUsed, positiveExtents.capitalUsed);
			case 'lockedTotal':
				return positiveColor(row.lockedTotal, positiveExtents.lockedTotal);
			case 'lockedBids':
				return positiveColor(row.lockedBids, positiveExtents.lockedBids);
			case 'lockedOffers':
				return positiveColor(row.lockedOffers, positiveExtents.lockedOffers);
			default:
				return 'transparent';
		}
	};
</script>

<div class="w-full pt-8">
	<h1 class="mb-6 text-xl font-bold">Portfolio overview</h1>

	{#if serverState.portfolio}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-md border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground">Available Balance</p>
				<p class="text-2xl font-semibold">
					📎 {numberFormat2.format(serverState.portfolio.availableBalance ?? 0)}
				</p>
			</div>
			<div class="rounded-md border bg-muted/30 p-4">
				<p class="text-sm text-muted-foreground">Mark to Market</p>
				<p class="text-2xl font-semibold">📎 {numberFormat2.format(metrics.totals.markToMarket)}</p>
			</div>
		</div>

		<div class="mt-8">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Open markets</h2>
				<p class="text-sm text-muted-foreground">
					Sorted by {sortLabels[sortKey]} ({sortDirection === 'asc' ? 'ascending' : 'descending'})
				</p>
			</div>
			{#if hiddenColumns.size}
				<div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
					<span class="text-muted-foreground">Hidden columns:</span>
					{#each [...hiddenColumns] as key}
						<button
							type="button"
							class="rounded-full border border-muted-foreground/50 px-2 py-1 text-muted-foreground hover:text-foreground"
							onclick={() => showColumn(key)}
						>
							+ {(() => {
								switch (key) {
									case 'openBids':
										return 'Open bid size';
									case 'openOffers':
										return 'Open offer size';
									case 'lockedTotal':
										return 'Capital locked by open orders';
									case 'lockedBids':
										return 'Capital locked by bids';
									case 'lockedOffers':
										return 'Capital locked by offers';
									case 'capitalUsed':
										return 'Capital used by position';
									case 'bestOwnBid':
										return 'Your best bid';
									case 'bestOwnOffer':
										return 'Your best offer';
									case 'minSettlement':
										return 'Min settlement';
									case 'maxSettlement':
										return 'Max settlement';
									default:
										return sortLabels[key];
								}
							})()}
						</button>
					{/each}
				</div>
			{/if}
			{#if sortedRows.length === 0}
				<p class="mt-4 text-muted-foreground">No open positions or orders to display.</p>
			{:else}
				<div class="mt-4 overflow-x-hidden rounded-md border">
					<Table.Root class="w-full text-center">
						<Table.Header class="[&_tr]:border-b-0">
							<Table.Row class="border-b-0">
								{#each visibleColumns as column, index}
									{@const group = columnGroups.find((g) => g.keys.includes(column.key))}
									{@const groupVisibleKeys = group ? visibleGroup(group) : []}
									{@const bounds = group ? groupBounds(group.label) : undefined}
									{@const nextAfterGroup =
										bounds && bounds.end + 1 < visibleColumns.length
											? visibleColumns[bounds.end + 1]
											: undefined}
									{@const nextAfterGroupIsGrouped = nextAfterGroup
										? columnGroups.some((g) => g.keys.includes(nextAfterGroup.key))
										: false}
									{@const hasLeftDivider = !!bounds && bounds.start > 0}
									{@const hasRightDivider =
										!!bounds && bounds.end + 1 < visibleColumns.length && !nextAfterGroupIsGrouped}
									{@const dividerShadow =
										hasLeftDivider && hasRightDivider
											? 'shadow-[inset_1px_0_0_rgba(148,163,184,0.2),inset_-1px_0_0_rgba(148,163,184,0.2)]'
											: hasLeftDivider
												? 'shadow-[inset_1px_0_0_rgba(148,163,184,0.2)]'
												: hasRightDivider
													? 'shadow-[inset_-1px_0_0_rgba(148,163,184,0.2)]'
													: ''}
									{#if group && groupVisibleKeys[0] === column.key}
										<Table.Head
											class={`border-b border-border/70 px-2 py-1 text-sm text-muted-foreground ${dividerShadow}`}
											colspan={groupVisibleKeys.length}
										>
											<div class="flex items-center justify-center gap-2">
												<span>{group.label}</span>
												<button
													class="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/60 text-[10px] text-muted-foreground hover:text-foreground"
													type="button"
													onclick={() => hideColumns(group.keys)}
													aria-label={`Hide ${group.label}`}
												>
													<Minus class="h-3 w-3" />
												</button>
											</div>
										</Table.Head>
									{:else if !group}
										<Table.Head
											class="px-2 py-1 text-[11px] text-muted-foreground/60"
											aria-hidden="true"
										/>
									{/if}
								{/each}
							</Table.Row>
							<Table.Row class="border-b-0">
								{#each visibleColumns as column, index}
									{@const group = columnGroups.find((g) => g.keys.includes(column.key))}
									{@const hasTopCell = !!group}
									{@const sectionKey = group ? group.label : column.key}
									{@const prevColumn = index > 0 ? visibleColumns[index - 1] : undefined}
									{@const prevGroup = prevColumn
										? columnGroups.find((g) => g.keys.includes(prevColumn.key))
										: undefined}
									{@const prevSectionKey = prevGroup ? prevGroup.label : prevColumn?.key}
									{@const isSectionStart = index > 0 && prevSectionKey !== sectionKey}
									{@const hasDivider = isSectionStart && hasTopCell && !!prevGroup}
									{@const nextColumn =
										index + 1 < visibleColumns.length ? visibleColumns[index + 1] : undefined}
									{@const nextGroup = nextColumn
										? columnGroups.find((g) => g.keys.includes(nextColumn.key))
										: undefined}
									{@const nextSectionKey = nextGroup ? nextGroup.label : nextColumn?.key}
									{@const isSectionEnd =
										index + 1 >= visibleColumns.length || nextSectionKey !== sectionKey}
									{@const hasLeftDivider = hasTopCell && isSectionStart}
									{@const hasRightDivider = hasTopCell && isSectionEnd && !nextGroup}
									{@const dividerShadow =
										hasLeftDivider && hasRightDivider
											? 'shadow-[inset_1px_0_0_rgba(148,163,184,0.2),inset_-1px_0_0_rgba(148,163,184,0.2)]'
											: hasLeftDivider
												? 'shadow-[inset_1px_0_0_rgba(148,163,184,0.2)]'
												: hasRightDivider
													? 'shadow-[inset_-1px_0_0_rgba(148,163,184,0.2)]'
													: ''}
									<Table.Head
										aria-sort={ariaSort(column.key)}
										class={`relative border-b border-border/70 px-2 py-2 ${
											isSectionStart ? 'pl-4' : ''
										} ${dividerShadow} ${
											hasLeftDivider
												? 'before:absolute before:bottom-0 before:left-0 before:h-px before:w-3 before:bg-background'
												: ''
										}`}
									>
										<div class="flex items-center justify-center gap-2 text-sm">
											<button
												class="flex items-center gap-1"
												type="button"
												onclick={() => sortBy(column.key)}
											>
												<span>{column.label}</span>
												<span class="text-xs text-muted-foreground">{sortSymbol(column.key)}</span>
											</button>
											{#if column.key !== 'name'}
												<button
													class="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/60 text-[10px] text-muted-foreground hover:text-foreground"
													type="button"
													onclick={() => hideColumn(column.key)}
													aria-label={`Hide ${column.label}`}
												>
													<Minus class="h-3 w-3" />
												</button>
											{/if}
										</div>
									</Table.Head>
								{/each}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each sortedRows as row (row.marketId)}
								<Table.Row>
									{#each visibleColumns as column}
										<Table.Cell style={`background:${cellBackground(row, column.key)}`}>
											{#if column.key === 'name'}
												{row.name}
											{:else if column.key === 'position'}
												{formatInt(row.position)}
											{:else if column.key === 'openBids'}
												{formatInt(row.openBids)}
											{:else if column.key === 'openOffers'}
												{formatInt(row.openOffers)}
											{:else if column.key === 'capitalUsed'}
												{withClip(formatInt(row.capitalUsed))}
											{:else if column.key === 'lockedTotal'}
												{withClip(formatInt(row.lockedTotal))}
											{:else if column.key === 'lockedBids'}
												{withClip(formatInt(row.lockedBids))}
											{:else if column.key === 'lockedOffers'}
												{withClip(formatInt(row.lockedOffers))}
											{:else if column.key === 'minSettlement'}
												{formatPrice(row.minSettlement)}
											{:else if column.key === 'maxSettlement'}
												{formatPrice(row.maxSettlement)}
											{:else if column.key === 'bestOwnBid'}
												{formatPrice(row.bestOwnBid)}
											{:else if column.key === 'bestOwnOffer'}
												{formatPrice(row.bestOwnOffer)}
											{:else if column.key === 'mid'}
												{formatPrice(row.mid)}
											{:else if column.key === 'last'}
												{formatPrice(row.last)}
											{/if}
										</Table.Cell>
									{/each}
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</div>
	{/if}
</div>
