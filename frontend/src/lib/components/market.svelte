<script lang="ts">
	import { redeemables, sendClientMessage, serverState } from '$lib/api.svelte';
	import { user } from '$lib/auth.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { cn } from '$lib/utils';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { HistoryIcon, LineChartIcon } from 'lucide-svelte';
	import { websocket_api } from 'schema-js';
	import FlexNumber from './flexNumber.svelte';
	import CreateOrder from './forms/createOrder.svelte';
	import Redeem from './forms/redeem.svelte';
	import SettleMarket from './forms/settleMarket.svelte';
	import PriceChart from './priceChart.svelte';
	import Button from './ui/button/button.svelte';
	import * as Table from './ui/table';
	import Toggle from './ui/toggle/toggle.svelte';

	interface Props {
		market: websocket_api.IMarket;
	}

	const { market }: Props = $props();
	let showChart = $state(true);
	let displayTransactionIdBindable: number[] = $state([]);

	const displayTransactionId = $derived(
		market.hasFullHistory ? displayTransactionIdBindable[0] : undefined
	);

	const maxTransactionId = $derived(
		Math.max(
			...(market.orders?.map((o) => o.transactionId) || []),
			...(market.trades?.map((t) => t.transactionId) || []),
			market.transactionId
		)
	);

	const orders = $derived(
		displayTransactionId === undefined
			? (market.orders || []).filter((o) => o.size !== 0)
			: (market.orders || [])
					.filter((o) => o.transactionId <= displayTransactionId)
					.map((o) => {
						const size = o.sizes?.length
							? o.sizes.findLast((s) => s.transactionId <= displayTransactionId)!.size
							: o.size;
						return { ...o, size };
					})
					.filter((o) => o.size !== 0)
	);

	const trades = $derived(
		displayTransactionId === undefined
			? market.trades || []
			: market.trades?.filter((t) => t.transactionId <= displayTransactionId) || []
	);
	const bids = $derived(
		orders
			.filter((order) => order.side === websocket_api.Side.BID)
			.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
	);
	const offers = $derived(
		orders
			.filter((order) => order.side === websocket_api.Side.OFFER)
			.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
	);
	const position = $derived(
		serverState.portfolio?.marketExposures?.find((me) => me.marketId === market.id)?.position ?? 0
	);
	const lastPrice = $derived(trades[trades.length - 1]?.price || '');
	const midPrice = $derived(
		bids[0]
			? offers[0]
				? (((bids[0].price ?? 0) + (offers[0].price ?? 0)) / 2).toFixed(2)
				: bids[0].price
			: offers[0]
				? offers[0].price
				: ''
	);
	const isRedeemable = $derived(redeemables.some(([first]) => first === market.id));

	let virtualTradesEl = $state<HTMLElement | null>(null);

	let tradesVirtualizer = createVirtualizer({
		count: 0,
		getScrollElement: () => virtualTradesEl,
		estimateSize: () => 32,
		overscan: 10
	});

	let totalSize = $state(0);

	$effect(() => {
		$tradesVirtualizer.setOptions({ count: trades.length });
		totalSize = $tradesVirtualizer.getTotalSize();
	});

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};

	const getMaybeHiddenUserId = (id: string | null | undefined) => {
		return id === 'hidden' ? 'Hidden' : serverState.users[id || '']?.name?.split(' ')[0];
	};
</script>

<div class="mb-4 flex justify-between">
	<div class="mb-4">
		<h1 class="text-2xl font-bold">{market.name}</h1>
		<p class="mt-2 text-xl">{market.description}</p>
		<p class="mt-2 text-sm italic">
			Created by {market.ownerId ? serverState.users[market.ownerId]?.name : ''}
		</p>
	</div>
	<div>
		<Table.Root class="w-auto text-center font-bold">
			<Table.Header>
				<Table.Row>
					<Table.Head>
						<Toggle
							onclick={() => {
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
						<Table.Row class="grid grid-cols-4" style="grid-template-columns: 8rem 8rem 4rem 4rem;">
							<Table.Head class="text-center">Buyer</Table.Head>
							<Table.Head class="text-center">Seller</Table.Head>
							<Table.Head class="text-center">Price</Table.Head>
							<Table.Head class="text-center">Size</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body class="block h-[80vh] w-full overflow-auto" bind:ref={virtualTradesEl}>
						<div class="relative w-full" style="height: {totalSize}px;">
							{#each $tradesVirtualizer.getVirtualItems() as row (trades.length - 1 - row.index)}
								{@const index = trades.length - 1 - row.index}
								{#if index >= 0}
									<div
										class="absolute left-0 top-0 table-row w-full even:bg-accent/35"
										style="height: {row.size}px; transform: translateY({row.start}px);"
									>
										<Table.Row
											class="grid h-full w-full grid-cols-4"
											style="grid-template-columns: 8rem 8rem 4rem 4rem;"
										>
											<Table.Cell class="truncate px-1 py-0">
												{getMaybeHiddenUserId(trades[index].buyerId)}
											</Table.Cell>
											<Table.Cell class="truncate px-1 py-0">
												{getMaybeHiddenUserId(trades[index].sellerId)}
											</Table.Cell>
											<Table.Cell class="truncate px-1 py-0">
												<FlexNumber value={(trades[index].price ?? 0).toString()} />
											</Table.Cell>
											<Table.Cell class="truncate px-1 py-0">
												<FlexNumber value={(trades[index].size ?? 0).toString()} />
											</Table.Cell>
										</Table.Row>
									</div>
								{/if}
							{/each}
						</div>
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
										order.ownerId === serverState.actingAs && 'outline outline-2 outline-primary'
									)}
								>
									<Table.Cell class="px-1 py-0">
										{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
											<Button
												variant="inverted"
												class="h-6 w-6 rounded-2xl px-2"
												onclick={() => cancelOrder(order.id)}>X</Button
											>
										{/if}
									</Table.Cell>
									<Table.Cell class="px-1 py-0">
										{getMaybeHiddenUserId(order.ownerId)}
									</Table.Cell>
									<Table.Cell class="px-1 py-0">
										<FlexNumber value={(order.size ?? 0).toString()} />
									</Table.Cell>
									<Table.Cell class="px-1 py-0">
										<FlexNumber value={(order.price ?? 0).toString()} />
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
										order.ownerId === serverState.actingAs && 'outline outline-2 outline-primary'
									)}
								>
									<Table.Cell class="px-1 py-0">
										<FlexNumber value={(order.price ?? 0).toString()} />
									</Table.Cell>
									<Table.Cell class="px-1 py-0">
										<FlexNumber value={(order.size ?? 0).toString()} />
									</Table.Cell>
									<Table.Cell class="px-1 py-0">
										{getMaybeHiddenUserId(order.ownerId)}
									</Table.Cell>
									<Table.Cell class="px-1 py-0">
										{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
											<Button
												variant="inverted"
												class="h-6 w-6 rounded-2xl px-2"
												onclick={() => cancelOrder(order.id)}>X</Button
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
					onclick={() => sendClientMessage({ out: { marketId: market.id } })}>Clear Orders</Button
				>
			</div>
			{#if isRedeemable}
				<div class="pt-8">
					<Redeem marketId={market.id} />
				</div>
			{/if}

			{#if market.ownerId === user()?.id}
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
