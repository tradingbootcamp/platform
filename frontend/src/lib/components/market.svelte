<script lang="ts">
	import { sendClientMessage, serverState, accountName, type MarketData } from '$lib/api.svelte';
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
	import { websocket_api } from 'schema-js';

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

	// Add new function to calculate participant positions from trades
	function calculatePositions(trades: websocket_api.ITrade[]) {
		const positions = new Map<number, number>();

		for (const trade of trades) {
			const buyerId = Number(trade.buyerId);
			const sellerId = Number(trade.sellerId);
			const size = trade.size || 0;

			positions.set(buyerId, (positions.get(buyerId) || 0) + size);
			positions.set(sellerId, (positions.get(sellerId) || 0) - size);
		}

		return Array.from(positions.entries())
			.map(([accountId, position]) => ({
				accountId,
				position: Number(position.toFixed(2))
			}))
			.sort((a, b) => Math.abs(b.position) - Math.abs(a.position));
	}

	// Calculate the average position among qualifying participants
	function calculateAveragePosition(positions: { accountId: number; position: number }[]) {
		const filteredPositions = positions.filter(({ accountId }) => {
			if (accountId === serverState.userId) return false;
			const name = accountName(accountId).toLowerCase();
			return !name.includes('alice') && !name.includes('mark') && !name.includes('bob');
		});

		if (filteredPositions.length === 0) return 0;

		const sum = filteredPositions.reduce((acc, { position }) => acc + position, 0);
		return Number((sum / filteredPositions.length).toFixed(2));
	}

	const participantPositions = $derived(calculatePositions(trades));
	const averagePosition = $derived(calculateAveragePosition(participantPositions));

	// Move getShortUserName helper into this component
	const getShortUserName = (id: number | null | undefined) => {
		return accountName(id).split(' ')[0];
	};
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
					'flex justify-between gap-8 text-center',
					displayTransactionId !== undefined && 'min-h-screen'
				)}
			>
				<MarketTrades {trades} />
				<MarketOrders {bids} {offers} {displayTransactionId} />
			</div>
		</div>
		<!-- Add participant positions table -->
		<div class="min-w-[300px]">
			{#if marketDefinition.open && displayTransactionId === undefined}
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
			{/if}

			<div class="mt-8">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-center">Participant</Table.Head>
							<Table.Head class="text-center">Position</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						<Table.Row class="bg-muted/50">
							<Table.Cell class="text-center font-bold">Average Position*</Table.Cell>
							<Table.Cell class="text-center font-bold">{averagePosition}</Table.Cell>
						</Table.Row>
						{#each participantPositions as { accountId, position }}
							<Table.Row>
								<Table.Cell class="text-center">
									{accountId === serverState.userId ? 'You' : getShortUserName(accountId)}
								</Table.Cell>
								<Table.Cell class="text-center">
									{position}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				<div class="mt-2 text-xs text-muted-foreground">
					* Average excludes bot accounts and your position
				</div>
			</div>
		</div>
	</div>
</div>
