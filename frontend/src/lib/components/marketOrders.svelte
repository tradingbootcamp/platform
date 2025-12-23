<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import CreateOrder from '$lib/components/forms/createOrder.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import { getShortUserName } from '$lib/components/marketDataUtils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import { cn } from '$lib/utils';
	import { Grab, X } from '@lucide/svelte/icons';
	import { websocket_api } from 'schema-js';

	let {
		bids,
		offers,
		displayTransactionId,
		marketId,
		minSettlement,
		maxSettlement,
		canPlaceOrders = false
	} = $props<{
		bids: websocket_api.IOrder[];
		offers: websocket_api.IOrder[];
		displayTransactionId: number | undefined;
		marketId?: number;
		minSettlement?: number | null | undefined;
		maxSettlement?: number | null | undefined;
		canPlaceOrders?: boolean;
	}>();

	const bidRowClass =
		'grid grid-cols-[4.25rem_minmax(0,1fr)_minmax(0,1fr)] justify-center md:grid-cols-[2rem_7rem_3.5rem_3.5rem]';
	const offerRowClass =
		'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_4.25rem] justify-center md:grid-cols-[3.5rem_3.5rem_7rem_2rem]';
	const bidFormClass = cn(bidRowClass, 'items-center gap-2 md:gap-1');
	const offerFormClass = cn(offerRowClass, 'items-center gap-2 md:gap-1');
	const canShowOrderEntry = canPlaceOrders && marketId !== undefined;

	let takingOrderId = $state<number | null>(null);

	// Reset taking state when that specific order is gone
	$effect(() => {
		if (takingOrderId === null) return;
		const orderStillExists = bids.some(o => o.id === takingOrderId) || offers.some(o => o.id === takingOrderId);
		if (!orderStillExists) {
			takingOrderId = null;
		}
	});

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};

	const takeOrder = (order: websocket_api.IOrder, side: 'BID' | 'OFFER') => {
		if (marketId === undefined) return;
		takingOrderId = order.id ?? null;
		sendClientMessage({
			createOrder: {
				marketId,
				price: order.price ?? 0,
				size: order.size ?? 0,
				side: side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER
			}
		});
	};
</script>

<div class="scrollbar-offset pl-0.5 pr-0.5">
	<div class="flex gap-4">
		<div class="flex-1">
			<Table.Root class="border-collapse border-spacing-0">
				<Table.Header class="[&_tr]:border-0">
					<Table.Row class={cn(bidRowClass, 'hover:bg-transparent')}>
						<Table.Head class="flex items-center justify-center truncate px-1 py-0.5 text-base md:px-4"></Table.Head>
						<Table.Head class="hidden items-center justify-center truncate text-center py-0.5 md:flex"
							>Owner</Table.Head
						>
						<Table.Head
							class="flex items-center justify-center truncate px-1 py-0.5 text-base text-center md:px-4"
							>Size</Table.Head
						>
						<Table.Head
							class="flex items-center justify-center truncate px-1 py-0.5 text-base text-center md:px-4"
							>Bid</Table.Head
						>
					</Table.Row>
				</Table.Header>
			</Table.Root>
		</div>
		<div class="flex-1">
			<Table.Root class="border-collapse border-spacing-0">
				<Table.Header class="[&_tr]:border-0">
					<Table.Row class={cn(offerRowClass, 'hover:bg-transparent')}>
						<Table.Head
							class="flex items-center justify-center truncate px-1 py-0.5 text-base text-center md:px-4"
							>Offer</Table.Head
						>
						<Table.Head
							class="flex items-center justify-center truncate px-1 py-0.5 text-base text-center md:px-4"
							>Size</Table.Head
						>
						<Table.Head class="hidden items-center justify-center truncate text-center py-0.5 md:flex"
							>Owner</Table.Head
						>
						<Table.Head class="flex items-center justify-center truncate px-1 py-0.5 text-base md:px-4"></Table.Head>
					</Table.Row>
				</Table.Header>
			</Table.Root>
		</div>
	</div>
</div>
{#if canShowOrderEntry}
	<div class="scrollbar-offset pl-0.5 pr-0.5">
		<div class="flex h-8 gap-4">
			<div class="flex-1">
				<CreateOrder
					layout="inline"
					sideLocked="BID"
					formId={`create-order-bid-${marketId}`}
					gridClass={bidFormClass}
					{marketId}
					{minSettlement}
					{maxSettlement}
				/>
			</div>
			<div class="flex-1">
				<CreateOrder
					layout="inline"
					sideLocked="OFFER"
					formId={`create-order-offer-${marketId}`}
					gridClass={offerFormClass}
					{marketId}
					{minSettlement}
					{maxSettlement}
				/>
			</div>
		</div>
	</div>
{/if}
<div class="orders-scroll h-[20rem] px-0.5 md:h-[28rem] overflow-y-scroll overflow-x-hidden">
	{#if canShowOrderEntry}
		<div class="sticky top-0 z-10 flex gap-4 bg-background">
			<div class="flex-1 h-px bg-border"></div>
			<div class="flex-1 h-px bg-border"></div>
		</div>
	{/if}
	<div class="flex gap-4">
		<div class="flex-1">
			<Table.Root class="border-collapse border-spacing-0">
				<Table.Body>
					{#each bids as order (order.id)}
						<Table.Row
							class={cn(
								`h-8 ${bidRowClass} bg-green-50 even:bg-green-100 dark:bg-green-700/35 dark:even:bg-green-900/35 border-b border-border/60`,
								order.ownerId === serverState.actingAs && 'ring-primary ring-2 ring-inset'
							)}
						>
							<Table.Cell class="flex items-center justify-center truncate px-1 py-0">
								{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
									<Button
										variant="inverted"
										class="h-6 w-6 rounded-2xl p-0"
										onclick={() => cancelOrder(order.id)}
									>
										<X class="h-4 w-4" />
									</Button>
								{:else if canPlaceOrders && bids[0] === order && displayTransactionId === undefined && takingOrderId !== order.id}
									<Button
										variant="green"
										class="h-6 w-6 rounded-2xl p-0"
										onclick={() => takeOrder(order, 'OFFER')}
									>
										<Grab class="h-4 w-4" />
									</Button>
								{/if}
							</Table.Cell>
							<Table.Cell class="hidden items-center truncate px-1 py-0 md:flex">
								{getShortUserName(order.ownerId)}
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
		</div>
		<div class="flex-1">
			<Table.Root class="border-collapse border-spacing-0">
				<Table.Body>
					{#each offers as order (order.id)}
						<Table.Row
							class={cn(
								`h-8 ${offerRowClass} bg-red-50 even:bg-red-100 dark:bg-red-700/35 dark:even:bg-red-900/35 border-b border-border/60`,
								order.ownerId === serverState.actingAs && 'ring-primary ring-2 ring-inset'
							)}
						>
							<Table.Cell class="flex items-center truncate px-1 py-0">
								<FlexNumber value={(order.price ?? 0).toString()} />
							</Table.Cell>
							<Table.Cell class="flex items-center truncate px-1 py-0">
								<FlexNumber value={(order.size ?? 0).toString()} />
							</Table.Cell>
							<Table.Cell class="hidden items-center truncate px-1 py-0 md:flex">
								{getShortUserName(order.ownerId)}
							</Table.Cell>
							<Table.Cell class="flex items-center justify-center truncate px-1 py-0">
								{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
									<Button
										variant="inverted"
										class="h-6 w-6 rounded-2xl p-0"
										onclick={() => cancelOrder(order.id)}
									>
										<X class="h-4 w-4" />
									</Button>
								{:else if canPlaceOrders && offers[0] === order && displayTransactionId === undefined && takingOrderId !== order.id}
									<Button
										variant="red"
										class="h-6 w-6 rounded-2xl p-0"
										onclick={() => takeOrder(order, 'BID')}
									>
										<Grab class="h-4 w-4" />
									</Button>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>
</div>

<style>
	/* Only apply scrollbar offset for webkit browsers (Chrome/Safari/Edge) */
	@supports selector(::-webkit-scrollbar) {
		.scrollbar-offset {
			padding-right: 8px !important;
		}
	}

	:global(.orders-scroll)::-webkit-scrollbar {
		width: 6px;
	}

	:global(.orders-scroll)::-webkit-scrollbar-track {
		background: transparent;
	}

	:global(.orders-scroll)::-webkit-scrollbar-thumb {
		background: hsl(var(--border));
		border-radius: 3px;
	}

	:global(.orders-scroll)::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground));
	}
</style>
