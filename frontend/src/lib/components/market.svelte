<script lang="ts">
	import { sendClientMessage, serverState, type MarketData } from '$lib/api.svelte';
	import { user } from '$lib/auth.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import CreateOrder from '$lib/components/forms/createOrder.svelte';
	import Redeem from '$lib/components/forms/redeem.svelte';
	import SettleMarket from '$lib/components/forms/settleMarket.svelte';
	import PriceChart from '$lib/components/priceChart.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import * as Table from '$lib/components/ui/table';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import { cn } from '$lib/utils';
	import { createVirtualizer, type VirtualItem } from '@tanstack/svelte-virtual';
	import { HistoryIcon, LineChartIcon } from 'lucide-svelte';
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
			: Math.max(
					...marketData.orders.map((o) => o.transactionId),
					...marketData.orders.flatMap((o) => o.sizes || []).map((s) => s.transactionId),
					...marketData.trades.map((t) => t.transactionId),
					marketDefinition.transaction?.id ?? 0
				)
	);

	const orders = $derived(
		!marketData.hasFullOrderHistory
			? marketData.orders
			: displayTransactionId === undefined
				? marketData.orders.filter((o) => o.size !== 0)
				: marketData.orders
						.map((o) => {
							const size = o.sizes?.findLast((s) => s.transactionId <= displayTransactionId);
							return { ...o, size: size?.size ?? 0 };
						})
						.filter((o) => o.size !== 0)
	);

	const trades = $derived(
		displayTransactionId === undefined
			? marketData.trades || []
			: marketData.trades?.filter((t) => t.transactionId <= displayTransactionId) || []
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
		serverState.portfolio?.marketExposures?.find((me) => me.marketId === id)?.position ?? 0
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
	const isRedeemable = $derived(marketDefinition.redeemableFor?.length);

	let virtualTradesEl = $state<HTMLElement | null>(null);

	let tradesVirtualizer = createVirtualizer({
		count: 0,
		getScrollElement: () => virtualTradesEl,
		estimateSize: () => 32,
		overscan: 10
	});

	let totalSize = $state(0);
	let virtualItems = $state<VirtualItem[]>([]);

	$effect(() => {
		$tradesVirtualizer.setOptions({ count: trades.length });
		totalSize = $tradesVirtualizer.getTotalSize();
		virtualItems = $tradesVirtualizer.getVirtualItems();
	});

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};

	const getMaybeHiddenUserId = (id: string | null | undefined) => {
		return id === 'hidden' ? 'Hidden' : serverState.users[id || '']?.name?.split(' ')[0];
	};
</script>

<div class="flex-grow py-8">
	<div class="mb-4 flex justify-between">
		<div class="mb-4">
			<h1 class="text-2xl font-bold">{marketDefinition.name}</h1>
			<p class="mt-2 text-xl">{marketDefinition.description}</p>
			<p class="mt-2 text-sm italic">
				Created by {marketDefinition.ownerId
					? serverState.users[marketDefinition.ownerId]?.name
					: ''}
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
										if (!marketData.hasFullOrderHistory) {
											sendClientMessage({ getFullOrderHistory: { marketId: id } });
										}
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
						<Table.Cell class="p-2">{marketDefinition.minSettlement}</Table.Cell>
						<Table.Cell class="p-2">{marketDefinition.maxSettlement}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	{#if marketDefinition.closed}
		<p>Market settled to <em>{marketDefinition.closed.settlePrice}</em></p>
	{/if}
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
						min={marketDefinition.transaction?.id ?? 0}
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
				<div>
					<h2 class="text-center text-lg font-bold">Trades</h2>
					<Table.Root>
						<Table.Header>
							<Table.Row class="grid h-full grid-cols-[7rem_7rem_3.5rem_3.5rem]">
								<Table.Head class="flex items-center justify-center text-center">Buyer</Table.Head>
								<Table.Head class="flex items-center justify-center text-center">Seller</Table.Head>
								<Table.Head class="flex items-center justify-center text-center">Price</Table.Head>
								<Table.Head class="flex items-center justify-center text-center">Size</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body class="block h-[80vh] w-full overflow-auto" bind:ref={virtualTradesEl}>
							<div class="relative w-full" style="height: {totalSize}px;">
								{#each virtualItems as row (trades.length - 1 - row.index)}
									{@const index = trades.length - 1 - row.index}
									{#if index >= 0}
										<div
											class="absolute left-0 top-0 table-row w-full even:bg-accent/35"
											style="height: {row.size}px; transform: translateY({row.start}px);"
										>
											<Table.Row class="grid h-full w-full grid-cols-[7rem_7rem_3.5rem_3.5rem]">
												<Table.Cell class="flex items-center  truncate px-1 py-0 text-center">
													{getMaybeHiddenUserId(trades[index].buyerId)}
												</Table.Cell>
												<Table.Cell class="flex items-center  truncate px-1 py-0 text-center">
													{getMaybeHiddenUserId(trades[index].sellerId)}
												</Table.Cell>
												<Table.Cell class="flex items-center  truncate px-1 py-0 text-center">
													<FlexNumber value={(trades[index].price ?? 0).toString()} />
												</Table.Cell>
												<Table.Cell class="flex items-center  truncate px-1 py-0 text-center">
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
								<Table.Row class="grid grid-cols-[2rem_7rem_3.5rem_3.5rem]">
									<Table.Head class="flex items-center justify-center truncate"></Table.Head>
									<Table.Head class="flex items-center justify-center truncate text-center"
										>Owner</Table.Head
									>
									<Table.Head class="flex items-center justify-center truncate text-center"
										>Size</Table.Head
									>
									<Table.Head class="flex items-center justify-center truncate text-center"
										>Bid</Table.Head
									>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each bids as order (order.id)}
									<Table.Row
										class={cn(
											'grid h-8 grid-cols-[2rem_7rem_3.5rem_3.5rem] even:bg-accent/35',
											order.ownerId === serverState.actingAs && 'outline outline-2 outline-primary'
										)}
									>
										<Table.Cell class="flex items-center truncate px-1 py-0">
											{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
												<Button
													variant="inverted"
													class="h-6 w-6 rounded-2xl px-2"
													onclick={() => cancelOrder(order.id)}>X</Button
												>
											{/if}
										</Table.Cell>
										<Table.Cell class="flex items-center truncate px-1 py-0">
											{getMaybeHiddenUserId(order.ownerId)}
										</Table.Cell>
										<Table.Cell class="flex items-center truncate px-1 py-0">
											<FlexNumber value={(order.size ?? 0).toString()} />
										</Table.Cell>
										<Table.Cell class="flex items-center truncate px-1 py-0">
											<FlexNumber value={(order.price ?? 0).toString()} />
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
						<Table.Root>
							<Table.Header>
								<Table.Row class="grid grid-cols-[3.5rem_3.5rem_7rem_1rem]">
									<Table.Head class="flex items-center justify-center truncate text-center"
										>Offer</Table.Head
									>
									<Table.Head class="flex items-center justify-center truncate text-center"
										>Size</Table.Head
									>
									<Table.Head class="flex items-center justify-center truncate text-center"
										>Owner</Table.Head
									>
									<Table.Head class="flex items-center justify-center truncate"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each offers as order (order.id)}
									<Table.Row
										class={cn(
											'grid h-8 grid-cols-[3.5rem_3.5rem_7rem_2rem] even:bg-accent/35',
											order.ownerId === serverState.actingAs && 'outline outline-2 outline-primary'
										)}
									>
										<Table.Cell class="flex items-center truncate px-1 py-0">
											<FlexNumber value={(order.price ?? 0).toString()} />
										</Table.Cell>
										<Table.Cell class="flex items-center truncate px-1 py-0">
											<FlexNumber value={(order.size ?? 0).toString()} />
										</Table.Cell>
										<Table.Cell class="flex items-center truncate px-1 py-0">
											{getMaybeHiddenUserId(order.ownerId)}
										</Table.Cell>
										<Table.Cell class="flex items-center truncate px-1 py-0">
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

				{#if marketDefinition.ownerId === user()?.id}
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
