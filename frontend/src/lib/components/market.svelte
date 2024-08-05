<script lang="ts">
	import { actingAs, portfolio, sendClientMessage } from '$lib/api';
	import * as Table from '$lib/components/ui/table/index.js';
	import { CategoryScale, Chart, Colors, LinearScale, LineElement, PointElement } from 'chart.js';
	import { websocket_api } from 'schema-js';
	import { Line } from 'svelte-chartjs';
	import CreateOrder from './forms/createOrder.svelte';
	import Button from './ui/button/button.svelte';

	Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Colors);

	export let market: websocket_api.IMarket;
	$: bids = (market.orders || []).filter((order) => order.side === websocket_api.Side.BID);
	$: bids.sort((a, b) => Number(b.price) - Number(a.price));
	$: offers = (market.orders || []).filter((order) => order.side === websocket_api.Side.OFFER);
	$: offers.sort((a, b) => Number(a.price) - Number(b.price));
	$: trades = market.trades || [];
	$: position =
		$portfolio?.marketExposures?.find((exposure) => exposure.marketId === market.id)?.position || 0;

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-2xl font-bold">{market.name}</h2>
	<p class="text-xl">{market.description}</p>
	{#if market.closed}
		<p>Market settled to <em>{market.closed.settlePrice}</em></p>
	{:else}
		<Table.Root class="text-center">
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-center">Position</Table.Head>
					<Table.Head class="text-center">Min settlement</Table.Head>
					<Table.Head class="text-center">Max settlement</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell>{position}</Table.Cell>
					<Table.Cell>{market.minSettlement}</Table.Cell>
					<Table.Cell>{market.maxSettlement}</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	{/if}
	<Line
		data={{
			labels: Array.from({ length: trades.length }, (_, i) => i),
			datasets: [{ label: 'Price', data: trades.map((t) => Number(t.price)) }]
		}}
		options={{
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					enabled: false
				}
			},
			responsive: true,
			scales: {
				x: { ticks: { display: false } },
				y: { min: Number(market.minSettlement), max: Number(market.maxSettlement) }
			}
		}}
	/>
	{#if market.open}
		<div class="flex justify-evenly gap-4 text-center">
			<div class="flex gap-4">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-center"></Table.Head>
							<Table.Head class="text-center">Size</Table.Head>
							<Table.Head class="text-center">Bid</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each bids as order (order.id)}
							<Table.Row class="h-12 even:bg-accent">
								<Table.Cell class="py-0 pr-0">
									{#if order.ownerId === $actingAs}
										<Button
											variant="destructive"
											class="h-8 w-8 rounded-2xl px-2"
											on:click={() => cancelOrder(order.id)}>X</Button
										>
									{/if}
								</Table.Cell>
								<Table.Cell class="py-0">{order.size}</Table.Cell>
								<Table.Cell class="py-0">{order.price}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-center">Offer</Table.Head>
							<Table.Head class="text-center">Size</Table.Head>
							<Table.Head class="text-center"></Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each offers as order (order.id)}
							<Table.Row class="h-12 even:bg-accent">
								<Table.Cell class="py-0">{order.price}</Table.Cell>
								<Table.Cell class="py-0">{order.size}</Table.Cell>
								<Table.Cell class="py-0 pl-0">
									{#if order.ownerId === $actingAs}
										<Button
											variant="destructive"
											class="h-8 w-8 rounded-2xl px-2"
											on:click={() => cancelOrder(order.id)}>X</Button
										>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="pt-4">
				<CreateOrder marketId={market.id} />
			</div>
		</div>
	{/if}
</div>
