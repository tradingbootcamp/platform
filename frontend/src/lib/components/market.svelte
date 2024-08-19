<script lang="ts">
	import { actingAs, sendClientMessage, users } from '$lib/api';
	import { user } from '$lib/auth';
	import { Slider } from '$lib/components/ui/slider';
	import { cn } from '$lib/utils';
	import { HistoryIcon, LineChartIcon } from 'lucide-svelte';
	import { websocket_api } from 'schema-js';
	import FlexNumber from './flexNumber.svelte';
	import CreateOrder from './forms/createOrder.svelte';
	import SettleMarket from './forms/settleMarket.svelte';
	import PriceChart from './priceChart.svelte';
	import Button from './ui/button/button.svelte';
	import * as Table from './ui/table';
	import Toggle from './ui/toggle/toggle.svelte';

	export let market: websocket_api.IMarket;
	let displayTransactionIdBindable: number[] = [];
	let showChart = true;

	$: displayTransactionId = market.hasFullHistory ? displayTransactionIdBindable[0] : undefined;

	$: maxTransactionId = Math.max(
		...(market.orders?.map((o) => o.transactionId) || []),
		...(market.trades?.map((t) => t.transactionId) || []),
		market.transactionId
	);

	$: orders =
		displayTransactionId === undefined
			? (market.orders || []).filter((o) => Number(o.size) !== 0)
			: (market.orders || [])
					.filter((o) => o.transactionId <= displayTransactionId)
					.map((o) => {
						let size = o.sizes?.length
							? o.sizes.findLast((s) => s.transactionId <= displayTransactionId)!.size
							: o.size;
						return { ...o, size };
					})
					.filter((o) => Number(o.size) !== 0);
	$: trades =
		displayTransactionId === undefined
			? market.trades || []
			: market.trades?.filter((t) => t.transactionId <= displayTransactionId) || [];
	$: bids = orders.filter((order) => order.side === websocket_api.Side.BID);
	$: bids.sort((a, b) => Number(b.price) - Number(a.price));
	$: offers = orders.filter((order) => order.side === websocket_api.Side.OFFER);
	$: offers.sort((a, b) => Number(a.price) - Number(b.price));
	$: position =
		trades.filter((t) => t.buyerId === $actingAs).reduce((acc, t) => acc + Number(t.size), 0) -
		trades.filter((t) => t.sellerId === $actingAs).reduce((acc, t) => acc + Number(t.size), 0);
	$: lastPrice = trades[0]?.price || '';
	$: midPrice = bids[0]
		? offers[0]
			? ((Number(bids[0].price) + Number(offers[0].price)) / 2).toFixed(2)
			: bids[0].price
		: offers[0]
			? offers[0].price
			: '';

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};
</script>

<div class="mb-4 flex justify-between">
	<div>
		<h1 class="text-2xl font-bold">{market.name}</h1>
		<p class="mt-4 text-xl">{market.description}</p>
	</div>
	{#if market.open}
		<div>
			<Table.Root class="w-auto text-center font-bold">
				<Table.Header>
					<Table.Row>
						<Table.Head>
							<Toggle
								on:click={() => {
									if (displayTransactionIdBindable.length) {
										displayTransactionIdBindable = [];
									} else {
										displayTransactionIdBindable = [maxTransactionId];
										sendClientMessage({ upgradeMarketData: { marketId: market.id } });
									}
								}}
								variant="outline"
							>
								<HistoryIcon />
							</Toggle>
						</Table.Head>
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
	<PriceChart {trades} minSettlement={market.minSettlement} maxSettlement={market.maxSettlement} />
{/if}
{#if displayTransactionId !== undefined}
	<div class="my-8 px-16">
		<h2 class="mb-4 text-lg">Time Slider</h2>
		<Slider bind:value={displayTransactionIdBindable} max={maxTransactionId} step={1} />
	</div>
{/if}
{#if market.open || displayTransactionId !== undefined}
	<div
		class={cn(
			'flex gap-8 text-center',
			displayTransactionId === undefined ? 'justify-between' : 'justify-center'
		)}
	>
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
						<Table.Cell class="pt-2">{Number(position.toFixed(4))}</Table.Cell>
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
									order.ownerId === $actingAs && 'outline outline-2 outline-primary'
								)}
							>
								<Table.Cell class="px-1 py-0">
									{#if order.ownerId === $actingAs && displayTransactionId === undefined}
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
									order.ownerId === $actingAs && 'outline outline-2 outline-primary'
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
									{#if order.ownerId === $actingAs && displayTransactionId === undefined}
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
		{#if displayTransactionId === undefined}
			<div class="pt-4">
				<CreateOrder
					marketId={market.id}
					minSettlement={market.minSettlement}
					maxSettlement={market.maxSettlement}
				/>
				<div class="pt-8">
					<Button
						variant="inverted"
						class="w-full"
						on:click={() => sendClientMessage({ out: { marketId: market.id } })}
						>Clear Orders</Button
					>
				</div>
				{#if market.ownerId === $user?.id}
					<div class="pt-8">
						<SettleMarket
							id={market.id}
							name={market.name}
							minSettlement={market.minSettlement}
							maxSettlement={market.maxSettlement}
						/>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}
