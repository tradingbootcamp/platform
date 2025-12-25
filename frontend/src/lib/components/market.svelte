<script lang="ts">
	import { accountName, sendClientMessage, serverState, type MarketData } from '$lib/api.svelte';
	import {
		midPrice as getMidPrice,
		maxClosedTransactionId,
		ordersAtTransaction,
		shouldShowPuzzleHuntBorder,
		sortedBids,
		sortedOffers,
		tradesAtTransaction,
		getShortUserName
	} from '$lib/components/marketDataUtils';
	import EditMarketGroup from '$lib/components/forms/editMarketGroup.svelte';
	import GroupPauseControls from '$lib/components/groupPauseControls.svelte';
	import MarketHead from '$lib/components/marketHead.svelte';
	import MarketOrders from '$lib/components/marketOrders.svelte';
	import MarketTrades from '$lib/components/marketTrades.svelte';
	import PriceChart from '$lib/components/priceChart.svelte';
	import VideoPlayer from '$lib/components/videoPlayer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { cn } from '$lib/utils';
	import { websocket_api } from 'schema-js';

	let { marketData }: { marketData: MarketData } = $props();
	let id = $derived(marketData.definition.id);

	let marketDefinition = $derived(marketData.definition);

	// Video element reference for syncing pause controls with video player
	let videoRef = $state<HTMLVideoElement | null>(null);

	$effect(() => {
		if (!marketData.hasFullTradeHistory) {
			sendClientMessage({ getFullTradeHistory: { marketId: id } });
		}
	});

	let showChart = $state(true);
	let displayTransactionIdBindable: number[] = $state([]);
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
	const position = $derived(
		serverState.portfolio?.marketExposures?.find((me) => me.marketId === id)?.position ?? 0
	);
	const lastPrice = $derived(trades[trades.length - 1]?.price || '');
	const midPrice = $derived(getMidPrice(bids, offers));
	const isRedeemable = $derived(marketDefinition.redeemableFor?.length);
	let showParticipantPositions = $state(false);
	const activeAccountId = $derived(serverState.actingAs ?? serverState.userId);
	const participantPositions = $derived.by(() => {
		const positionMap = new Map<number, number>();
		const grossTradesMap = new Map<number, number>();

		for (const trade of trades) {
			const size = Number(trade.size ?? 0);
			const buyerId = trade.buyerId;
			const sellerId = trade.sellerId;
			if (buyerId != null) {
				positionMap.set(buyerId, (positionMap.get(buyerId) ?? 0) + size);
				grossTradesMap.set(buyerId, (grossTradesMap.get(buyerId) ?? 0) + size);
			}
			if (sellerId != null) {
				positionMap.set(sellerId, (positionMap.get(sellerId) ?? 0) - size);
				grossTradesMap.set(sellerId, (grossTradesMap.get(sellerId) ?? 0) + size);
			}
		}

		return [...positionMap.entries()]
			.map(([accountId, pos]) => ({
				accountId,
				name: getShortUserName(accountId),
				position: Number(pos.toFixed(4)),
				grossTrades: Number((grossTradesMap.get(accountId) ?? 0).toFixed(4)),
				isSelf: accountId === activeAccountId
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
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
		for (const number of visibleTo) {
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
		if (marketDefinition.visibleTo?.includes(serverState.actingAs)) return true;
		if (!viewerAccount) return false;
		return false;
	});

	let showBorder = $derived(shouldShowPuzzleHuntBorder(marketData?.definition));
	let shouldShowOrderUI = $derived(
		marketDefinition.open && displayTransactionId === undefined && allowOrderPlacing
	);
	let canPlaceOrders = $derived(shouldShowOrderUI && marketStatusAllowsOrders);
</script>

<div class={cn('flex-grow', showBorder && 'leaf-background mt-8')}>
	<MarketHead
		{marketData}
		{canPlaceOrders}
		isRedeemable={Boolean(isRedeemable)}
		bind:showChart
		bind:displayTransactionIdBindable
		{maxTransactionId}
	/>
	<div class="w-full justify-between gap-8 md:flex">
		<div class="flex flex-grow flex-col gap-4">
			<Tabs.Root class="mt-4 md:hidden" value="chart w-full">
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="chart">Chart</Tabs.Trigger>
					<Tabs.Trigger value="trades">Trades</Tabs.Trigger>
					<Tabs.Trigger value="orders">Orders</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="chart">
					<PriceChart
						{trades}
						minSettlement={marketDefinition.minSettlement}
						maxSettlement={marketDefinition.maxSettlement}
					/>
				</Tabs.Content>
				<Tabs.Content value="trades">
					<MarketTrades {trades} />
				</Tabs.Content>
				<Tabs.Content value="orders">
					<MarketOrders
						{bids}
						{offers}
						{displayTransactionId}
						marketId={id}
						minSettlement={marketDefinition.minSettlement}
						maxSettlement={marketDefinition.maxSettlement}
						{canPlaceOrders}
						{canCancelOrders}
						{shouldShowOrderUI}
						{marketStatusAllowsOrders}
					/>
				</Tabs.Content>
			</Tabs.Root>
			<div class="hidden md:block">
				{#if showChart}
					<PriceChart
						{trades}
						minSettlement={marketDefinition.minSettlement}
						maxSettlement={marketDefinition.maxSettlement}
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
			{#if marketDefinition.open || displayTransactionId !== undefined}
				<Table.Root class="font-bold">
					<Table.Header>
						<Table.Row>
							<Table.Head class="h-auto px-1 py-2 text-center">Last price</Table.Head>
							<Table.Head class="h-auto px-1 py-2 text-center">Mid price</Table.Head>
							<Table.Head class="h-auto px-1 py-2 text-center">Your Position</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="text-center">
						<Table.Row>
							<Table.Cell class="px-1 py-2">{lastPrice}</Table.Cell>
							<Table.Cell class="px-1 py-2">{midPrice}</Table.Cell>
							<Table.Cell class="px-1 py-2">{Number(position.toFixed(4))}</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
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
					'hidden justify-between gap-8 px-8 text-center md:flex',
					displayTransactionId !== undefined && 'min-h-screen'
				)}
			>
				<div>
					<div class="flex h-8 items-center justify-center gap-3">
						<h2 class="text-center text-lg font-bold">Trade Log</h2>
					</div>
					{#if shouldShowOrderUI}
						<div class="h-10"></div>
					{/if}
					<MarketTrades {trades} />

					{#if marketDefinition.groupId && marketDefinition.groupId > 0}
						{@const group = serverState.marketGroups.get(marketDefinition.groupId)}
						{#if group?.videoUrl}
							<div class="mt-4">
								<div class="mb-2 flex items-center justify-between">
									<h2 class="text-lg font-bold">Video</h2>
									<div class="flex items-center gap-2">
										<EditMarketGroup groupId={marketDefinition.groupId} />
										<GroupPauseControls groupId={marketDefinition.groupId} {videoRef} />
									</div>
								</div>
								<VideoPlayer groupId={marketDefinition.groupId} bind:videoRef />
							</div>
						{/if}
					{/if}
				</div>
				<div>
					<div class="flex h-8 items-center gap-4 px-0.5">
						<div class="flex flex-1 justify-end">
							<span class="text-lg font-bold">Order Book</span>
						</div>
						<div class="flex flex-1 justify-start">
							{#if shouldShowOrderUI}
								<Button
									variant="inverted"
									class={cn(
										'h-8 px-3 text-sm',
										!canCancelOrders && 'pointer-events-none opacity-50'
									)}
									disabled={!canCancelOrders}
									onclick={() => sendClientMessage({ out: { marketId: id } })}>Clear Orders</Button
								>
							{/if}
						</div>
					</div>
					<MarketOrders
						{bids}
						{offers}
						{displayTransactionId}
						marketId={id}
						minSettlement={marketDefinition.minSettlement}
						maxSettlement={marketDefinition.maxSettlement}
						{canPlaceOrders}
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
