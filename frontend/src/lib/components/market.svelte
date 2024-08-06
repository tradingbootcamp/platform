<script lang="ts">
	import { actingAs, portfolio, sendClientMessage, users } from '$lib/api';
	import { cn } from '$lib/utils';
	import { LineChartIcon } from 'lucide-svelte';
	import { websocket_api } from 'schema-js';
	import FlexNumber from './flexNumber.svelte';
	import CreateOrder from './forms/createOrder.svelte';
	import PriceChart from './priceChart.svelte';
	import Button from './ui/button/button.svelte';
	import * as Table from './ui/table/index.js';
	import Toggle from './ui/toggle/toggle.svelte';

	export let market: websocket_api.IMarket;
	$: bids = (market.orders || []).filter((order) => order.side === websocket_api.Side.BID);
	$: bids.sort((a, b) => Number(b.price) - Number(a.price));
	$: offers = (market.orders || []).filter((order) => order.side === websocket_api.Side.OFFER);
	$: offers.sort((a, b) => Number(a.price) - Number(b.price));
	$: position =
		$portfolio?.marketExposures?.find((exposure) => exposure.marketId === market.id)?.position || 0;
	$: lastPrice = market.trades?.[0]?.price || '';
	$: midPrice = bids[0]
		? offers[0]
			? ((Number(bids[0].price) + Number(offers[0].price)) / 2).toFixed(2)
			: bids[0].price
		: offers[0]
			? offers[0].price
			: '';

	let showChart = true;

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};
</script>

<div class="mb-4 flex justify-between">
	<div>
		<h2 class="text-2xl font-bold">{market.name}</h2>
		<p class="mt-4 text-xl">{market.description}</p>
	</div>
	{#if market.open}
		<div>
			<Table.Root class="w-auto text-center font-bold">
				<Table.Header>
					<Table.Row>
						<Table.Head>
							<Toggle bind:pressed={showChart} variant="outline">
								<LineChartIcon />
							</Toggle>
						</Table.Head>
						<Table.Head class="text-center">Min Settlement</Table.Head>
						<Table.Head class="text-center">Max Settlement</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.Cell class="p-2"></Table.Cell>
						<Table.Cell class="p-2">{market.minSettlement}</Table.Cell>
						<Table.Cell class="p-2">{market.maxSettlement}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>

{#if market.closed}
	<p>Market settled to <em>{market.closed.settlePrice}</em></p>
{/if}
{#if showChart}
	<PriceChart
		trades={market.trades || []}
		minSettlement={market.minSettlement}
		maxSettlement={market.maxSettlement}
	/>
{/if}
{#if market.open}
	<div class="flex justify-between gap-8 text-center">
		<div>
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
						<Table.Cell class="pt-2">{position}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
			<div class="flex gap-4">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head></Table.Head>
							<Table.Head class="text-center">Trader</Table.Head>
							<Table.Head class="text-center">Size</Table.Head>
							<Table.Head class="text-center">Bid</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each bids as order (order.id)}
							<Table.Row
								class={cn(
									'h-8 even:bg-accent/35',
									order.ownerId === $actingAs && 'border-2 border-primary'
								)}
							>
								<Table.Cell class="px-1 py-0">
									{#if order.ownerId === $actingAs}
										<Button
											variant="inverted"
											class="h-6 w-6 rounded-2xl px-2"
											on:click={() => cancelOrder(order.id)}>X</Button
										>
									{/if}
								</Table.Cell>
								<Table.Cell class="px-1 py-0 text-left">
									{$users.get(order.ownerId || '')?.name?.split(' ')[0]}
								</Table.Cell>
								<Table.Cell class="px-1 py-0">
									<FlexNumber value={order.size || ''} />
								</Table.Cell>
								<Table.Cell class="px-1 py-0">
									<FlexNumber value={order.price || ''} />
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-center">Offer</Table.Head>
							<Table.Head class="text-center">Size</Table.Head>
							<Table.Head class="text-center">Trader</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each offers as order (order.id)}
							<Table.Row
								class={cn(
									'h-8 even:bg-accent/35',
									order.ownerId === $actingAs && 'border-2 border-primary'
								)}
							>
								<Table.Cell class="px-1 py-0">
									<FlexNumber value={order.price || ''} />
								</Table.Cell>
								<Table.Cell class="px-1 py-0">
									<FlexNumber value={order.size || ''} />
								</Table.Cell>
								<Table.Cell class="px-1 py-0 text-right">
									{$users.get(order.ownerId || '')?.name?.split(' ')[0]}
								</Table.Cell>
								<Table.Cell class="px-1 py-0">
									{#if order.ownerId === $actingAs}
										<Button
											variant="inverted"
											class="h-6 w-6 rounded-2xl px-2"
											on:click={() => cancelOrder(order.id)}>X</Button
										>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
		<div class="pt-4">
			<CreateOrder
				marketId={market.id}
				minSettlement={market.minSettlement}
				maxSettlement={market.maxSettlement}
			/>
		</div>
	</div>
{/if}
