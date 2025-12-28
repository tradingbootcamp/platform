<script lang="ts">
	import { accountName, isAltAccount, sendClientMessage, serverState, type MarketData } from '$lib/api.svelte';
	import {
		maxClosedTransactionId,
		ordersAtTransaction,
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
	import Button from '$lib/components/ui/button/button.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { cn } from '$lib/utils';
	import { websocket_api } from 'schema-js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { marketData }: { marketData: MarketData } = $props();
	let id = $derived(marketData.definition.id);

	let marketDefinition = $derived(marketData.definition);

	$effect(() => {
		if (!marketData.hasFullTradeHistory) {
			sendClientMessage({ getFullTradeHistory: { marketId: id } });
		}
	});

	$effect(() => {
		// Request market positions from the server when trades update
		const _tradeCount = marketData.trades.length; // dependency to refetch on new trades
		sendClientMessage({ getMarketPositions: { marketId: id } });
	});

	let showChart = $state(true);
	let showMyTrades = $state(true);
	let displayTransactionIdBindable: number[] = $state([]);
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

	const displayTransactionId = $derived(
		hasFullHistory ? displayTransactionIdBindable[0] : undefined
	);
	const maxTransactionId = $derived(
		marketDefinition.open
			? serverState.lastKnownTransactionId
			: maxClosedTransactionId(marketData.orders, marketData.trades, marketDefinition)
	);
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
	let showParticipantPositions = $state(true);
	const activeAccountId = $derived(serverState.actingAs ?? serverState.userId);
	// For open markets, use portfolio exposure; for closed markets, use server-calculated positions
	const position = $derived(
		serverState.portfolio?.marketExposures?.find((me) => me.marketId === id)?.position ??
		marketData.positions.find((p) => Number(p.accountId) === activeAccountId)?.net ??
		0
	);
	const participantPositions = $derived.by(() => {
		const serverPositions = marketData.positions;

		// Map server positions to the format expected by the template
		const positions = serverPositions.map((p) => {
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
		if (serverState.isAdmin) return true;
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
		marketDefinition.open && displayTransactionId === undefined && allowOrderPlacing
	);
	let canPlaceOrders = $derived(shouldShowOrderUI && marketStatusAllowsOrders);
</script>

<div class={cn('market-query-container min-w-0 flex-grow', showBorder && 'leaf-background mt-8')}>
	<MarketHead
		{marketData}
		canPlaceOrders={canPlaceOrders ?? undefined}
		isRedeemable={Boolean(isRedeemable)}
		bind:showChart
		bind:showMyTrades
		bind:displayTransactionIdBindable
		{maxTransactionId}
	/>
	<div class="w-full overflow-visible">
		<div class="flex flex-grow flex-col gap-4 overflow-visible">
			<div class="mt-4 tabbed-view">
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
							onTradeClick={handleTradeClick}
						/>
					</div>
				{/if}
				<!-- Orders/Trades tabs below -->
				<Tabs.Root class="mt-4 max-w-[29rem]" value="orders">
					<Tabs.List class="grid w-full grid-cols-2">
						<Tabs.Trigger value="orders">Orders</Tabs.Trigger>
						<Tabs.Trigger value="trades">Trades</Tabs.Trigger>
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
						/>
					</Tabs.Content>
					<Tabs.Content value="trades" class="flex justify-center">
						<div class="max-w-[17rem] w-full">
							<MarketTrades {trades} {highlightedTradeId} />
						</div>
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
						onTradeClick={handleTradeClick}
					/>
				{/if}
			</div>
			{#if displayTransactionId !== undefined}
				<div class="mx-4">
					<h2 class="mb-4 ml-2 text-lg">Time Slider</h2>
					<Slider
						type="multiple"
						bind:value={displayTransactionIdBindable}
						max={maxTransactionId}
						min={marketDefinition.transactionId ?? 0}
						step={1}
					/>
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
					'side-by-side gap-2 text-center justify-between overflow-visible',
					displayTransactionId !== undefined && 'min-h-screen'
				)}
			>
				<div class="flex-[22] max-w-[17rem] overflow-visible">
					<div class="flex h-10 items-center justify-center gap-3">
						<h2 class="text-center text-lg font-bold">Trade Log</h2>
					</div>
					{#if displayTransactionId === undefined}
						<div class="flex h-10 items-center justify-center text-base font-semibold">
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
							<span class="text-sm font-semibold">Position<span class="inline-block w-2 text-left">{showParticipantPositions ? 's' : ':'}</span></span>
							<span class={cn(
									"flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold",
									position > 0 && "bg-green-500/20 text-green-600 dark:text-green-400",
									position < 0 && "bg-red-500/20 text-red-600 dark:text-red-400",
									position === 0 && "bg-muted"
								)}>{Number(position.toFixed(2))}</span>
						</div>
						{#if showParticipantPositions && participantPositions.length > 0}
							<Table.Root class="mx-auto mt-2 w-fit border-collapse border-spacing-0 text-sm">
								<Table.Header>
									<Table.Row class="grid h-8 grid-cols-[5rem_3rem_3rem_3rem_3rem_3rem] items-center border-b border-border/60">
										<Table.Head class="flex h-full items-center justify-center px-1 py-0 text-center">Name</Table.Head>
										<Table.Head class="flex h-full items-center justify-center px-1 py-0 text-center text-green-600 dark:text-green-400">Buys</Table.Head>
										<Table.Head class="flex h-full items-center justify-center px-1 py-0 text-center text-green-600 dark:text-green-400">Avg B</Table.Head>
										<Table.Head class="flex h-full items-center justify-center px-1 py-0 text-center text-red-600 dark:text-red-400">Avg S</Table.Head>
										<Table.Head class="flex h-full items-center justify-center px-1 py-0 text-center text-red-600 dark:text-red-400">Sells</Table.Head>
										<Table.Head class="flex h-full items-center justify-center px-1 py-0 text-center">Net</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body class="border-b border-border/60">
									{#each participantPositions as participant, index (participant.accountId)}
										<Table.Row class={cn(
											"grid h-8 grid-cols-[5rem_3rem_3rem_3rem_3rem_3rem] items-center border-b border-border/60 last:border-b-0",
											index % 2 === 0 && "bg-accent/35"
										)}>
											<Table.Cell class={cn(
												"flex h-full items-center justify-center truncate px-1 py-0 text-center",
												participant.isSelf && "ring-2 ring-inset ring-primary"
											)}><span class:italic={isAltAccount(participant.accountId)}>{participant.name}</span></Table.Cell>
											<Table.Cell class="flex h-full items-center justify-center px-1 py-0 text-center text-green-600 dark:text-green-400">{participant.buys}</Table.Cell>
											<Table.Cell class="flex h-full items-center justify-center px-1 py-0 text-center text-muted-foreground">{participant.avgBuyPrice ?? '-'}</Table.Cell>
											<Table.Cell class="flex h-full items-center justify-center px-1 py-0 text-center text-muted-foreground">{participant.avgSellPrice ?? '-'}</Table.Cell>
											<Table.Cell class="flex h-full items-center justify-center px-1 py-0 text-center text-red-600 dark:text-red-400">{participant.sells}</Table.Cell>
											<Table.Cell class="flex h-full items-center justify-center px-1 py-0 text-center">
												{#if participant.isSelf}
													<span class={cn(
														"flex h-5 min-w-6 items-center justify-center rounded-full px-1.5 font-semibold",
														participant.position > 0 && "bg-green-500/20 text-green-600 dark:text-green-400",
														participant.position < 0 && "bg-red-500/20 text-red-600 dark:text-red-400",
														participant.position === 0 && "bg-muted"
													)}>{participant.position}</span>
												{:else}
													<span class={cn(
														participant.position > 0 && "text-green-600 dark:text-green-400",
														participant.position < 0 && "text-red-600 dark:text-red-400"
													)}>{participant.position}</span>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						{/if}
					{/if}
					<MarketTrades {trades} {highlightedTradeId} />
				</div>
				<div class="flex-[39] max-w-[29rem] overflow-visible">
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

	/* When container is >= 31rem, switch to desktop layout */
	/* 31rem = Trade Log min (11rem) + Order Book min (19.5rem) + gap (0.5rem) */
	@container (min-width: 31rem) {
		.tabbed-view {
			display: none;
		}
		.desktop-chart {
			display: block;
		}
		.side-by-side {
			display: flex;
		}
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
