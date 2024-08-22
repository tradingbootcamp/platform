<script lang="ts">
	import { actingAs, portfolio, sendClientMessage, users } from '$lib/api';
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
	let showChart = true;
	let displayTransactionIdBindable: number[] = [];

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
		Number($portfolio?.marketExposures?.find((me) => me.marketId === market.id)?.position) || 0;
	$: lastPrice = trades[trades.length - 1]?.price || '';
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

	const getMaybeHiddenUserId = (id: string | null | undefined) => {
		return id === 'hidden' ? 'Hidden' : $users.get(id || '')?.name?.split(' ')[0];
	};
</script>

<div class="mb-4 flex justify-between">
	<div class="mb-4">
		<h1 class="text-2xl font-bold">{market.name}</h1>
		<p class="mt-2 text-xl">{market.description}</p>
		<p class="mt-2 text-sm italic">
			Created by {market.ownerId ? $users?.get(market.ownerId)?.name : ''}
		</p>
	</div>
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
</div>

{#if market.closed}
	<p>Market settled to <em>{market.closed.settlePrice}</em></p>
{/if}
<div class="flex justify-between gap-8">
	<div class="flex flex-col gap-4">
		{#if showChart}
			<PriceChart
				{trades}
				minSettlement={market.minSettlement}
				maxSettlement={market.maxSettlement}
			/>
		{/if}
		{#if displayTransactionId !== undefined}
			<div class="mx-4">
				<h2 class="mb-4 ml-2 text-lg">Time Slider</h2>
				<Slider
					class="mx-4"
					bind:value={displayTransactionIdBindable}
					max={maxTransactionId}
					min={market.transactionId}
					step={1}
				/>
			</div>
		{/if}
		{#if market.open || displayTransactionId !== undefined}
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
			<div>
				<h2 class="text-center text-lg font-bold">Trades</h2>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-center">Buyer</Table.Head>
							<Table.Head class="text-center">Seller</Table.Head>
							<Table.Head class="text-center">Price</Table.Head>
							<Table.Head class="text-center">Size</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each trades.toReversed() as trade (trade.id)}
							<Table.Row class="h-8 even:bg-accent/35">
								<Table.Cell class="px-1 py-0">
									{getMaybeHiddenUserId(trade.buyerId)}
								</Table.Cell>
								<Table.Cell class="px-1 py-0">
									{getMaybeHiddenUserId(trade.sellerId)}
								</Table.Cell>
								<Table.Cell class="px-1 py-0">
									<FlexNumber value={trade.price || ''} />
								</Table.Cell>
								<Table.Cell class="px-1 py-0">
									<FlexNumber value={trade.size || ''} />
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div>
				<h2 class="text-center text-lg font-bold">Orders</h2>
				<div class="flex gap-4">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head></Table.Head>
								<Table.Head class="text-center">Owner</Table.Head>
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
									<Table.Cell class="px-1 py-0">
										{getMaybeHiddenUserId(order.ownerId)}
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
								<Table.Head class="text-center">Owner</Table.Head>
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
									<Table.Cell class="px-1 py-0">
										{getMaybeHiddenUserId(order.ownerId)}
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
		</div>
	</div>
	{#if market.open && displayTransactionId === undefined}
		<div>
			<CreateOrder
				marketId={market.id}
				minSettlement={market.minSettlement}
				maxSettlement={market.maxSettlement}
			/>
			<div class="pt-8">
				<Button
					variant="inverted"
					class="w-full"
					on:click={() => sendClientMessage({ out: { marketId: market.id } })}>Clear Orders</Button
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
