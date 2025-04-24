<script lang="ts">
	import { sendClientMessage, serverState, type MarketData } from '$lib/api.svelte';
	import CreateOrder from '$lib/components/forms/createOrder.svelte';
	import Redeem from '$lib/components/forms/redeem.svelte';
	import SettleMarket from '$lib/components/forms/settleMarket.svelte';
	import {
		midPrice as getMidPrice,
		maxClosedTransactionId,
		ordersAtTransaction,
		sortedBids,
		sortedOffers,
		tradesAtTransaction
	} from '$lib/components/marketDataUtils';
	import MarketHead from '$lib/components/marketHead.svelte';
	import MarketOrders from '$lib/components/marketOrders.svelte';
	import MarketTrades from '$lib/components/marketTrades.svelte';
	import PriceChart from '$lib/components/priceChart.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { cn } from '$lib/utils';

	let { marketData }: { marketData: MarketData } = $props();
	let id = $derived(marketData.definition.id);

	let marketDefinition = $derived(marketData.definition);

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
</script>

<div class="flex-grow">
	<MarketHead {marketData} bind:showChart bind:displayTransactionIdBindable {maxTransactionId} />
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
					<MarketOrders {bids} {offers} {displayTransactionId} />
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
							<Table.Head class="px-1 text-center">Last price</Table.Head>
							<Table.Head class="px-1 text-center">Mid price</Table.Head>
							<Table.Head class="px-1 text-center">Your Position</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="text-center">
						<Table.Row>
							<Table.Cell class="px-1 pt-2">{lastPrice}</Table.Cell>
							<Table.Cell class="px-1 pt-2">{midPrice}</Table.Cell>
							<Table.Cell class="px-1 pt-2">{Number(position.toFixed(2))}</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			{/if}
			<div
				class={cn(
					'hidden justify-around gap-8 text-center md:flex',
					displayTransactionId !== undefined && 'min-h-screen'
				)}
			>
				<div>
					<h2 class="text-center text-lg font-bold">Trade Log</h2>
					<MarketTrades {trades} />
				</div>
				<div>
					<h2 class="text-center text-lg font-bold">Order Book</h2>
					<MarketOrders {bids} {offers} {displayTransactionId} />
				</div>
			</div>
		</div>
		{#if marketDefinition.open && displayTransactionId === undefined}
			<div>
				<CreateOrder
					marketId={id}
					minSettlement={marketDefinition.minSettlement}
					maxSettlement={marketDefinition.maxSettlement}
				/>
				<div class="pt-8">
					<Button
						variant="inverted"
						class="w-full"
						onclick={() => sendClientMessage({ out: { marketId: id } })}>Clear Orders</Button
					>
				</div>
				{#if isRedeemable}
					<div class="pt-8">
						<Redeem marketId={id} />
					</div>
				{/if}
				{#if marketDefinition.ownerId === serverState.userId}
					<div class="pt-8">
						<SettleMarket
							{id}
							name={marketDefinition.name}
							minSettlement={marketDefinition.minSettlement}
							maxSettlement={marketDefinition.maxSettlement}
						/>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
