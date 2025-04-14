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

<div class="flex-grow py-8">
	<MarketHead {marketData} bind:showChart bind:displayTransactionIdBindable {maxTransactionId} />
	<div class="flex justify-between gap-8">
		<div class="flex flex-col gap-4">
			{#if showChart}
				<PriceChart
					{trades}
					minSettlement={marketDefinition.minSettlement}
					maxSettlement={marketDefinition.maxSettlement}
				/>
			{/if}
			{#if displayTransactionId !== undefined}
				<div class="mx-4">
					<h2 class="mb-4 ml-2 text-lg">Time Slider</h2>
					<Slider
						class="mx-4"
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
							<Table.Head class="text-center">Last price</Table.Head>
							<Table.Head class="text-center">Mid price</Table.Head>
							<Table.Head class="text-center">Your Position</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="text-center">
						<Table.Row>
							<Table.Cell class="pt-2">{lastPrice}</Table.Cell>
							<Table.Cell class="pt-2">{midPrice}</Table.Cell>
							<Table.Cell class="pt-2">{Number(position.toFixed(2))}</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
			{/if}
			<div
				class={cn(
					'flex h-[200px] justify-between gap-8 text-center', // Added fixed height
					displayTransactionId !== undefined && 'min-h-screen'
				)}
			>
				<div class="w-1/2 overflow-y-auto">
					<MarketTrades {trades} />
				</div>
				<div class="w-1/2 overflow-y-auto">
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
