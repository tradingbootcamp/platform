<script lang="ts">
	import {
		accountName,
		isAltAccount,
		sendClientMessage,
		serverState,
		type MarketData
	} from '$lib/api.svelte';
	import {
		ordersAtTransaction,
		positionsAtTransaction,
		shouldShowPuzzleHuntBorder,
		sortedBids,
		sortedOffers,
		tradesAtTransaction,
		getShortUserName
	} from '$lib/components/marketDataUtils';
	import MarketHead from '$lib/components/marketHead.svelte';
	import MarketOrders from '$lib/components/marketOrders.svelte';
	import MarketTrades from '$lib/components/marketTrades.svelte';
	import PriceChart from '$lib/components/priceChart.svelte';
	import { Slider as SliderPrimitive } from 'bits-ui';
	import { pauseIntervals, toMarketMs, toRealMs } from '$lib/marketTime';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { cn } from '$lib/utils';
	import { websocket_api } from 'schema-js';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';

	let { marketData }: { marketData: MarketData } = $props();
	let id = $derived(marketData.definition.id);

	let marketDefinition = $derived(marketData.definition);

	$effect(() => {
		if (!marketData.hasFullTradeHistory) {
			sendClientMessage({ getFullTradeHistory: { marketId: id } });
		}
	});

	// Auto-request full order history for closed markets
	$effect(() => {
		if (marketDefinition.closed && !marketData.hasFullOrderHistory) {
			sendClientMessage({ getFullOrderHistory: { marketId: id } });
		}
	});

	let showChart = $state(true);
	let showMyTrades = $state(true);
	// History window in **market-clock** ms (paused wall-clock time collapsed
	// out). Empty array means "live mode" (no history filter applied). Stored
	// in market-clock so slider positions line up exactly with the price
	// chart x-axis, which is also market-clock.
	let displayCutoffMsBindable: number[] = $state([]);

	const marketOpenTime = $derived.by(() => {
		const ts = marketDefinition.transactionTimestamp;
		if (!ts || ts.seconds == null) return undefined;
		return new Date(Number(ts.seconds) * 1000);
	});
	const marketOpenMs = $derived(marketOpenTime?.getTime() ?? 0);

	// Wall-clock pause windows for this market. Empty array means "no pauses
	// recorded" — in that case market-clock and wall-clock are identical and
	// all the toMarketMs/toRealMs calls become no-ops.
	const pauses = $derived(pauseIntervals(marketData.statusChanges, Date.now()));

	// Right edge of the slider in market-clock ms.
	const maxCutoffMs = $derived.by(() => {
		let maxMs = marketOpenMs;
		for (const t of marketData.trades) {
			const ms = (Number(t.transactionTimestamp?.seconds) || 0) * 1000;
			if (ms > maxMs) maxMs = ms;
		}
		for (const o of marketData.orders) {
			const oms = (Number(o.transactionTimestamp?.seconds) || 0) * 1000;
			if (oms > maxMs) maxMs = oms;
			for (const sz of o.sizes ?? []) {
				const sm = (Number(sz.transactionTimestamp?.seconds) || 0) * 1000;
				if (sm > maxMs) maxMs = sm;
			}
		}
		return toMarketMs(maxMs, pauses);
	});
	// Map a market-clock cutoff back to the highest transaction id for this
	// market's data. Transaction timestamps live in wall-clock so the cutoff
	// is converted before comparison; the downstream filters all take a txn id.
	function txnIdAtCutoffMs(cutoffMarketMs: number): number {
		const cutoffRealMs = toRealMs(cutoffMarketMs, pauses);
		let best = marketDefinition.transactionId ?? 0;
		const consider = (id: number | null | undefined, ms: number) => {
			if (ms <= cutoffRealMs && (id ?? 0) > best) best = id ?? 0;
		};
		for (const t of marketData.trades) {
			consider(t.transactionId, (Number(t.transactionTimestamp?.seconds) || 0) * 1000);
		}
		for (const o of marketData.orders) {
			consider(o.transactionId, (Number(o.transactionTimestamp?.seconds) || 0) * 1000);
			for (const sz of o.sizes ?? []) {
				consider(sz.transactionId, (Number(sz.transactionTimestamp?.seconds) || 0) * 1000);
			}
		}
		return best;
	}
	let highlightedTradeId: number | null = $state(null);

	const handleTradeClick = (trade: websocket_api.ITrade) => {
		highlightedTradeId = trade.id ?? null;
		// Scroll page to trade log with smooth animation
		requestAnimationFrame(() => {
			const tradeLog = document.getElementById('trade-log');
			if (tradeLog) {
				tradeLog.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		});
	};
	let hasFullHistory = $derived(marketData.hasFullOrderHistory && marketData.hasFullTradeHistory);

	// Auto-enable history view for closed markets once full history is loaded (once only)
	let historyAutoEnabled = false;
	$effect(() => {
		if (
			!historyAutoEnabled &&
			hasFullHistory &&
			marketDefinition.closed &&
			displayCutoffMsBindable.length === 0
		) {
			displayCutoffMsBindable = [marketOpenMs, maxCutoffMs];
			historyAutoEnabled = true;
		}
	});

	// Playback state. Speed N means N seconds of market time per real second;
	// BASE_RATE_MS_PER_MS calibrates speed=1 so the full ~80-min seed replays
	// in roughly 20 seconds.
	let isPlaying = $state(false);
	let playSpeed = $state(1);
	const PLAY_SPEEDS = [1, 2, 5, 10, 50, 100] as const;
	const BASE_RATE_MS_PER_MS = 250;

	$effect(() => {
		if (!isPlaying) return;
		const speed = playSpeed; // tracked: effect restarts on speed change
		const startTime = performance.now();
		const trimStart = untrack(() => displayCutoffMsBindable[0] ?? marketOpenMs);
		const startCutoff = untrack(() => displayCutoffMsBindable[1]) ?? trimStart;
		let animId: number;
		const step = (now: number) => {
			const elapsed = now - startTime;
			const target = startCutoff + Math.floor(elapsed * speed * BASE_RATE_MS_PER_MS);
			if (target >= maxCutoffMs) {
				displayCutoffMsBindable = [trimStart, maxCutoffMs];
				isPlaying = false;
				return;
			}
			displayCutoffMsBindable = [trimStart, target];
			animId = requestAnimationFrame(step);
		};
		animId = requestAnimationFrame(step);
		return () => cancelAnimationFrame(animId);
	});

	const displayPlayheadMs = $derived(hasFullHistory ? displayCutoffMsBindable[1] : undefined);
	const displayTrimStartMs = $derived(hasFullHistory ? displayCutoffMsBindable[0] : undefined);
	const displayTransactionId = $derived(
		displayPlayheadMs !== undefined ? txnIdAtCutoffMs(displayPlayheadMs) : undefined
	);
	const effectiveTrimStartMs = $derived.by((): number | undefined => {
		if (displayTrimStartMs === undefined) return undefined;
		return displayTrimStartMs > marketOpenMs ? displayTrimStartMs : undefined;
	});
	const marketStatus = $derived(
		marketDefinition.status ?? websocket_api.MarketStatus.MARKET_STATUS_OPEN
	);
	const marketStatusAllowsOrders = $derived(
		marketStatus === websocket_api.MarketStatus.MARKET_STATUS_OPEN
	);
	const canCancelOrders = $derived(
		marketStatus !== websocket_api.MarketStatus.MARKET_STATUS_PAUSED
	);

	const orders = $derived(ordersAtTransaction(marketData, displayTransactionId));
	const trades = $derived(tradesAtTransaction(marketData.trades, displayTransactionId));
	const bids = $derived(sortedBids(orders));
	const offers = $derived(sortedOffers(orders));
	const isRedeemable = $derived(marketDefinition.redeemableFor?.length);
	const isOption = $derived(!!marketDefinition.option);
	let showParticipantPositions = $state(true);
	const activeAccountId = $derived(serverState.actingAs ?? serverState.userId);
	const clientPositions = $derived(
		positionsAtTransaction(marketData.trades, marketData.redemptions, displayTransactionId)
	);
	const position = $derived.by(() => {
		const clientPosition =
			clientPositions.find((p) => Number(p.accountId) === activeAccountId)?.net ?? 0;
		if (displayTransactionId !== undefined) {
			return clientPosition;
		}
		return (
			serverState.portfolio?.marketExposures?.find((me) => me.marketId === id)?.position ??
			clientPosition
		);
	});
	const participantPositions = $derived.by(() => {
		const positions = clientPositions.map((p) => {
			const net = p.net ?? 0;
			const gross = p.gross ?? 0;
			const buys = (gross + net) / 2;
			const sells = (gross - net) / 2;
			return {
				accountId: Number(p.accountId),
				name: getShortUserName(Number(p.accountId)),
				position: Number(net.toFixed(4)),
				grossTrades: Number(gross.toFixed(4)),
				buys: Number(buys.toFixed(4)),
				sells: Number(sells.toFixed(4)),
				avgBuyPrice: p.avgBuyPrice != null ? Number(p.avgBuyPrice.toFixed(2)) : null,
				avgSellPrice: p.avgSellPrice != null ? Number(p.avgSellPrice.toFixed(2)) : null,
				isSelf: Number(p.accountId) === activeAccountId
			};
		});

		// Always include the active user even if they have no trades
		if (activeAccountId != null && !positions.some((p) => p.accountId === activeAccountId)) {
			positions.push({
				accountId: activeAccountId,
				name: getShortUserName(activeAccountId),
				position: 0,
				grossTrades: 0,
				buys: 0,
				sells: 0,
				avgBuyPrice: null,
				avgSellPrice: null,
				isSelf: true
			});
		}

		return positions.sort((a, b) => a.name.localeCompare(b.name));
	});

	let viewerAccount = $derived.by(() => {
		const owned = serverState.portfolios.keys();
		if (serverState.portfolios.size === 0) {
			console.log('owned empty!');
		}
		const visibleTo = marketDefinition.visibleTo;
		console.log(
			'owned:',
			$state.snapshot(serverState.portfolios.keys()),
			'visible to:',
			$state.snapshot(marketDefinition.visibleTo)
		);
		console.log('acting as:', serverState.actingAs);
		console.log('userId:', serverState.userId);
		const ownedKeysSet = new Set(owned);
		for (const number of visibleTo ?? []) {
			if (ownedKeysSet.has(number)) {
				console.log('found:', number);
				return number;
			}
		}
		return undefined;
	});
	let allowOrderPlacing = $derived.by(() => {
		console.log('serverState.isAdmin:', serverState.isAdmin);
		if (serverState.isAdmin && serverState.sudoEnabled) return true;
		console.log('viewerAccount:', viewerAccount);
		console.log('marketDefinition:', marketDefinition.visibleTo);
		if (marketDefinition.visibleTo == null) return true;
		if (marketDefinition.visibleTo.length == 0) return true;
		// Use Number() to handle potential Long vs number type mismatch from protobuf
		const actingAsNum = Number(serverState.actingAs);
		if (marketDefinition.visibleTo?.some((id) => Number(id) === actingAsNum)) return true;
		if (!viewerAccount) return false;
		return false;
	});

	let showBorder = $derived(shouldShowPuzzleHuntBorder(marketData?.definition));
	let shouldShowOrderUI = $derived(
		Boolean(marketDefinition.open) && displayTransactionId === undefined && allowOrderPlacing
	);
	let canPlaceOrders = $derived(shouldShowOrderUI && marketStatusAllowsOrders);

	// Dark order book for Options markets: only show user's orders + best bid/offer
	// Exception: markets with "Time" in the name are not dark
	const isDarkOrderBook = $derived.by(() => {
		const typeId = marketDefinition.typeId;
		if (typeId == null) return false;
		const marketType = serverState.marketTypes.get(typeId);
		if (marketType?.name !== 'Options') return false;
		// Markets with "Time" in the name are not dark even in Options group
		if (marketDefinition.name?.includes('Time')) return false;
		return true;
	});
</script>

<div class={cn('market-query-container min-w-0 flex-grow', showBorder && 'leaf-background mt-8')}>
	<MarketHead
		{marketData}
		canPlaceOrders={canPlaceOrders ?? undefined}
		isRedeemable={Boolean(isRedeemable)}
		{isOption}
		bind:showChart
		bind:showMyTrades
		bind:displayCutoffMsBindable
		{marketOpenMs}
		{maxCutoffMs}
	/>
	<div class="w-full overflow-visible">
		<div class="flex flex-grow flex-col gap-4 overflow-visible">
			<div class="tabbed-view mt-4">
				<!-- Collapsible chart at top -->
				<button
					class="flex w-full items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium"
					onclick={() => (showChart = !showChart)}
				>
					{#if showChart}
						<ChevronDown class="h-4 w-4" />
					{:else}
						<ChevronRight class="h-4 w-4" />
					{/if}
					<span>Chart</span>
				</button>
				{#if showChart}
					<div class="mt-2">
						<PriceChart
							{trades}
							minSettlement={marketDefinition.minSettlement}
							maxSettlement={marketDefinition.maxSettlement}
							{showMyTrades}
							{marketOpenTime}
							pauseIntervals={pauses}
							onTradeClick={handleTradeClick}
						/>
					</div>
				{/if}
				<!-- Orders/Trades tabs below -->
				<Tabs.Root class="mt-4 max-w-[29rem]" value="orders">
					<Tabs.List class="grid w-full grid-cols-3">
						<Tabs.Trigger value="orders">Orders</Tabs.Trigger>
						<Tabs.Trigger value="trades">Trades</Tabs.Trigger>
						<Tabs.Trigger value="positions">Positions</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="orders">
						<MarketOrders
							{bids}
							{offers}
							{displayTransactionId}
							marketId={id}
							minSettlement={marketDefinition.minSettlement}
							maxSettlement={marketDefinition.maxSettlement}
							{canCancelOrders}
							{shouldShowOrderUI}
							{marketStatusAllowsOrders}
							tabbedMode={true}
							{isDarkOrderBook}
						/>
					</Tabs.Content>
					<Tabs.Content value="trades" class="flex justify-center">
						<div class="w-full max-w-[17rem]">
							<MarketTrades {trades} {highlightedTradeId} />
						</div>
					</Tabs.Content>
					<Tabs.Content value="positions">
						<div class="flex items-center justify-center gap-2 py-2 text-base font-semibold">
							<span class="text-sm font-semibold">Position:</span>
							<span
								class={cn(
									'flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold',
									position > 0 && 'bg-green-500/20 text-green-600 dark:text-green-400',
									position < 0 && 'bg-red-500/20 text-red-600 dark:text-red-400',
									position === 0 && 'bg-muted'
								)}>{Number(position.toFixed(2))}</span
							>
						</div>
						{#if participantPositions.length > 0}
							<Table.Root class="mx-auto mt-2 w-fit border-collapse border-spacing-0 text-xs">
								<Table.Header>
									<Table.Row
										class="grid h-7 grid-cols-[4rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem] items-center border-b border-border/60"
									>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center"
											>Name</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-green-600 dark:text-green-400"
											>Buys</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-green-600 dark:text-green-400"
											>Avg B</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-red-600 dark:text-red-400"
											>Avg S</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-red-600 dark:text-red-400"
											>Sells</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center"
											>Net</Table.Head
										>
									</Table.Row>
								</Table.Header>
								<Table.Body class="border-b border-border/60">
									{#each participantPositions as participant, index (participant.accountId)}
										<Table.Row
											class={cn(
												'grid h-7 grid-cols-[4rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem] items-center border-b border-border/60 last:border-b-0',
												index % 2 === 0 && 'bg-accent/35'
											)}
										>
											<Table.Cell
												class={cn(
													'flex h-full items-center justify-center truncate px-0.5 py-0 text-center',
													participant.isSelf && 'ring-2 ring-inset ring-primary'
												)}
												><span class:italic={isAltAccount(participant.accountId)}
													>{participant.name}</span
												></Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-green-600 dark:text-green-400"
												>{participant.buys}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-muted-foreground"
												>{participant.avgBuyPrice ?? '-'}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-muted-foreground"
												>{participant.avgSellPrice ?? '-'}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-red-600 dark:text-red-400"
												>{participant.sells}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center"
											>
												{#if participant.isSelf}
													<span
														class={cn(
															'flex h-5 min-w-6 items-center justify-center rounded-full px-1.5 font-semibold',
															participant.position > 0 &&
																'bg-green-500/20 text-green-600 dark:text-green-400',
															participant.position < 0 &&
																'bg-red-500/20 text-red-600 dark:text-red-400',
															participant.position === 0 && 'bg-muted'
														)}>{participant.position}</span
													>
												{:else}
													<span
														class={cn(
															participant.position > 0 && 'text-green-600 dark:text-green-400',
															participant.position < 0 && 'text-red-600 dark:text-red-400'
														)}>{participant.position}</span
													>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						{/if}
					</Tabs.Content>
				</Tabs.Root>
			</div>
			<div class="desktop-chart">
				{#if showChart}
					<PriceChart
						{trades}
						minSettlement={marketDefinition.minSettlement}
						maxSettlement={marketDefinition.maxSettlement}
						{showMyTrades}
						trimStartMs={effectiveTrimStartMs}
						allTrades={marketData.trades}
						playheadMs={displayPlayheadMs}
						{marketOpenTime}
						pauseIntervals={pauses}
						onTradeClick={handleTradeClick}
					/>
				{/if}
			</div>
			{#if displayTransactionId !== undefined}
				<div class="mx-4">
					<div class="mb-2 flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							class="h-7 w-7"
							onclick={() => {
								if (isPlaying) {
									isPlaying = false;
								} else {
									const trimStart = displayCutoffMsBindable[0] ?? marketOpenMs;
									if ((displayCutoffMsBindable[1] ?? 0) >= maxCutoffMs) {
										displayCutoffMsBindable = [trimStart, trimStart];
									}
									isPlaying = true;
								}
							}}
						>
							{#if isPlaying}
								<Pause class="h-3.5 w-3.5" />
							{:else}
								<Play class="h-3.5 w-3.5" />
							{/if}
						</Button>
						<div class="flex gap-1">
							{#each PLAY_SPEEDS as speed}
								<button
									class={cn(
										'rounded px-1.5 py-0.5 text-xs font-medium transition-colors',
										playSpeed === speed
											? 'bg-primary text-primary-foreground'
											: 'bg-muted text-muted-foreground hover:bg-accent'
									)}
									onclick={() => (playSpeed = speed)}
								>
									{speed}x
								</button>
							{/each}
						</div>
					</div>
					<SliderPrimitive.Root
						type="multiple"
						bind:value={displayCutoffMsBindable}
						max={maxCutoffMs}
						min={marketOpenMs}
						step={1000}
						class="relative flex w-full touch-none select-none items-center"
					>
						{#snippet children({ thumbs })}
							<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
								<SliderPrimitive.Range class="absolute h-full bg-primary" />
							</span>
							{#each thumbs as thumb, i (thumb)}
								{@const value = displayCutoffMsBindable[i] ?? marketOpenMs}
								{@const elapsedSec = Math.max(0, Math.round((value - marketOpenMs) / 1000))}
								{@const m = Math.floor(elapsedSec / 60)}
								{@const s = elapsedSec % 60}
								{@const wallClock = new Date(toRealMs(value, pauses)).toLocaleTimeString()}
								{#if i === 0}
									<SliderPrimitive.Thumb
										index={thumb}
										class="group relative block h-6 w-1 rounded-sm bg-amber-500 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										aria-label="Trim start"
									>
										<span
											class="pointer-events-none absolute -top-7 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-1.5 py-0.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
										>
											{m}m {s}s ({wallClock})
										</span>
									</SliderPrimitive.Thumb>
								{:else}
									<SliderPrimitive.Thumb
										index={thumb}
										class="group relative block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										aria-label="Playhead"
									>
										<span
											class="pointer-events-none absolute -top-7 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-1.5 py-0.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
										>
											{m}m {s}s ({wallClock})
										</span>
									</SliderPrimitive.Thumb>
								{/if}
							{/each}
						{/snippet}
					</SliderPrimitive.Root>
				</div>
			{/if}
			{#if marketDefinition.open && displayTransactionId === undefined && !allowOrderPlacing}
				<div class="pt-4 text-center">
					<h2>You are not authorized to trade in this market.</h2>
					<br />
					<h2>Act as the `{accountName(viewerAccount)}` account to access this market.</h2>
				</div>
			{/if}
			<div
				class={cn(
					'side-by-side gap-2 overflow-visible text-center',
					displayTransactionId !== undefined && 'min-h-screen'
				)}
			>
				<div class="positions-col overflow-visible">
					<div class="flex h-8 items-center justify-center text-base font-semibold">
						<button
							class="p-1 transition-colors hover:text-primary"
							onclick={() => (showParticipantPositions = !showParticipantPositions)}
						>
							{#if showParticipantPositions}
								<ChevronDown class="h-4 w-4" />
							{:else}
								<ChevronRight class="h-4 w-4" />
							{/if}
						</button>
						<span class="text-sm font-semibold"
							>Position<span class="inline-block w-2 text-left"
								>{showParticipantPositions ? 's' : ':'}</span
							></span
						>
						<span
							class={cn(
								'flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold',
								position > 0 && 'bg-green-500/20 text-green-600 dark:text-green-400',
								position < 0 && 'bg-red-500/20 text-red-600 dark:text-red-400',
								position === 0 && 'bg-muted'
							)}>{Number(position.toFixed(2))}</span
						>
					</div>
					{#if showParticipantPositions && participantPositions.length > 0}
						<div class="positions-table-container">
							<Table.Root class="mx-auto mt-2 w-full border-collapse border-spacing-0 text-xs">
								<Table.Header>
									<Table.Row
										class="positions-table-cols grid h-7 items-center border-b border-border/60"
									>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center"
											>Name</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-green-600 dark:text-green-400"
											>Buys</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-green-600 dark:text-green-400"
											>Avg B</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-red-600 dark:text-red-400"
											>Avg S</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center text-red-600 dark:text-red-400"
											>Sells</Table.Head
										>
										<Table.Head
											class="flex h-full items-center justify-center px-0.5 py-0 text-center"
											>Net</Table.Head
										>
									</Table.Row>
								</Table.Header>
								<Table.Body class="border-b border-border/60">
									{#each participantPositions as participant, index (participant.accountId)}
										<Table.Row
											class={cn(
												'positions-table-cols grid h-7 items-center border-b border-border/60 last:border-b-0',
												index % 2 === 0 && 'bg-accent/35'
											)}
										>
											<Table.Cell
												class={cn(
													'flex h-full items-center justify-center truncate px-0.5 py-0 text-center',
													participant.isSelf && 'ring-2 ring-inset ring-primary'
												)}
												><span class:italic={isAltAccount(participant.accountId)}
													>{participant.name}</span
												></Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-green-600 dark:text-green-400"
												>{participant.buys}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-muted-foreground"
												>{participant.avgBuyPrice ?? '-'}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-muted-foreground"
												>{participant.avgSellPrice ?? '-'}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center text-red-600 dark:text-red-400"
												>{participant.sells}</Table.Cell
											>
											<Table.Cell
												class="flex h-full items-center justify-center px-0.5 py-0 text-center"
											>
												{#if participant.isSelf}
													<span
														class={cn(
															'flex h-5 min-w-6 items-center justify-center rounded-full px-1.5 font-semibold',
															participant.position > 0 &&
																'bg-green-500/20 text-green-600 dark:text-green-400',
															participant.position < 0 &&
																'bg-red-500/20 text-red-600 dark:text-red-400',
															participant.position === 0 && 'bg-muted'
														)}>{participant.position}</span
													>
												{:else}
													<span
														class={cn(
															participant.position > 0 && 'text-green-600 dark:text-green-400',
															participant.position < 0 && 'text-red-600 dark:text-red-400'
														)}>{participant.position}</span
													>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					{/if}
				</div>
				<div class="tradelog-col">
					<div class="flex h-8 items-center justify-center gap-3">
						<h2 class="text-center text-lg font-bold">Trade Log</h2>
					</div>
					<MarketTrades {trades} {highlightedTradeId} />
				</div>
				<div class="orderbook-col overflow-visible">
					<MarketOrders
						{bids}
						{offers}
						{displayTransactionId}
						marketId={id}
						minSettlement={marketDefinition.minSettlement}
						maxSettlement={marketDefinition.maxSettlement}
						{canCancelOrders}
						{shouldShowOrderUI}
						{marketStatusAllowsOrders}
						{isDarkOrderBook}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Container query setup */
	:global(.market-query-container) {
		container-type: inline-size;
		overflow: visible;
	}

	/* Default: show tabbed view, hide desktop views */
	.tabbed-view {
		display: block;
	}
	.desktop-chart {
		display: none;
	}
	.side-by-side {
		display: none;
	}

	/* 2-column mode: positions+tradelog stacked in col 1, orderbook in col 2 */
	@container (min-width: 31rem) {
		.tabbed-view {
			display: none;
		}
		.desktop-chart {
			display: block;
		}
		.side-by-side {
			display: grid;
			grid-template-columns: minmax(11rem, 17rem) minmax(19rem, 29rem);
			grid-template-rows: auto 1fr;
			align-items: start;
		}
		.positions-col {
			grid-column: 1;
			grid-row: 1;
		}
		.tradelog-col {
			grid-column: 1;
			grid-row: 2;
		}
		.orderbook-col {
			grid-column: 2;
			grid-row: 1 / -1;
		}
	}

	/* 3-column mode: positions left, tradelog centered, orderbook right */
	@container (min-width: 50rem) {
		.side-by-side {
			grid-template-columns: auto 1fr auto;
			grid-template-rows: 1fr;
		}
		.positions-col {
			width: clamp(10rem, 22cqi, 17rem);
		}
		.tradelog-col {
			grid-column: 2;
			grid-row: 1;
			justify-self: center;
			width: min(17rem, 100%);
		}
		.orderbook-col {
			grid-column: 3;
			grid-row: 1;
			width: clamp(19rem, 40cqi, 29rem);
		}
	}

	/* Positions table: responsive columns using container query units */
	:global(.positions-table-container) {
		container-type: inline-size;
		width: 100%;
		min-width: 0;
	}

	/* Name: 24.24cqi, Others (×5): 15.15cqi each — proportional to 4:2.5:2.5:2.5:2.5:2.5 */
	:global(.positions-table-cols) {
		grid-template-columns:
			clamp(2.5rem, 24.24cqi, 4rem)
			clamp(1.5rem, 15.15cqi, 2.5rem)
			clamp(1.5rem, 15.15cqi, 2.5rem)
			clamp(1.5rem, 15.15cqi, 2.5rem)
			clamp(1.5rem, 15.15cqi, 2.5rem)
			clamp(1.5rem, 15.15cqi, 2.5rem);
	}

	.leaf-background {
		position: relative;
	}

	.leaf-background::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url('$lib/assets/leaf.png');
		background-size: contain;
		background-position: center;
		background-repeat: no-repeat;
		opacity: 0.3;
		z-index: -1;
		pointer-events: none;
	}

	:global(html.dark) .leaf-background::before {
		opacity: 0.5;
	}
</style>
