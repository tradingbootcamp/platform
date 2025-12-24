<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import { getShortUserName } from '$lib/components/marketDataUtils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import { cn } from '$lib/utils';
	import type { websocket_api } from 'schema-js';

	let { bids, offers, displayTransactionId, canCancelOrders = true } = $props<{
		bids: websocket_api.IOrder[];
		offers: websocket_api.IOrder[];
		displayTransactionId: number | undefined;
		canCancelOrders?: boolean;
	}>();

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};
</script>

<div class="flex h-[20rem] gap-4 overflow-auto px-0.5 md:h-[28rem]">
	<Table.Root>
		<Table.Header>
			<Table.Row
				class="grid grid-cols-[2rem_3.5rem_3.5rem] justify-center md:grid-cols-[2rem_7rem_3.5rem_3.5rem]"
			>
				<Table.Head class="flex items-center justify-center truncate"></Table.Head>
				<Table.Head class="hidden items-center justify-center truncate text-center md:flex"
					>Owner</Table.Head
				>
				<Table.Head class="flex items-center justify-center truncate text-center">Size</Table.Head>
				<Table.Head class="flex items-center justify-center truncate text-center">Bid</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each bids as order (order.id)}
				<Table.Row
					class={cn(
						'grid h-8 grid-cols-[2rem_3.5rem_3.5rem] justify-center bg-green-50 even:bg-green-100 md:grid-cols-[2rem_7rem_3.5rem_3.5rem] dark:bg-green-700/35 dark:even:bg-green-900/35',
						order.ownerId === serverState.actingAs && 'outline-primary outline outline-2'
					)}
				>
					<Table.Cell class="flex items-center truncate px-1 py-0">
						{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
							<Button
								variant="inverted"
								class={cn(
									"h-6 w-6 rounded-2xl px-2",
									!canCancelOrders && "opacity-50 pointer-events-none"
								)}
								disabled={!canCancelOrders}
								aria-disabled={!canCancelOrders}
								onclick={() => {
									if (!canCancelOrders) return;
									cancelOrder(order.id);
								}}>X</Button
							>
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
	<Table.Root>
		<Table.Header>
			<Table.Row
				class="grid grid-cols-[3.5rem_3.5rem_2rem] justify-center md:grid-cols-[3.5rem_3.5rem_7rem_2rem]"
			>
				<Table.Head class="flex items-center justify-center truncate text-center">Offer</Table.Head>
				<Table.Head class="flex items-center justify-center truncate text-center">Size</Table.Head>
				<Table.Head class="hidden items-center justify-center truncate text-center md:flex"
					>Owner</Table.Head
				>
				<Table.Head class="flex items-center justify-center truncate"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each offers as order (order.id)}
				<Table.Row
					class={cn(
						'grid h-8 grid-cols-[3.5rem_3.5rem_2rem] justify-center bg-red-50 even:bg-red-100 md:grid-cols-[3.5rem_3.5rem_7rem_2rem] dark:bg-red-700/35 dark:even:bg-red-900/35',
						order.ownerId === serverState.actingAs && 'outline-primary outline outline-2'
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
					<Table.Cell class="flex items-center truncate px-1 py-0">
						{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
							<Button
								variant="inverted"
								class={cn(
									"h-6 w-6 rounded-2xl px-2",
									!canCancelOrders && "opacity-50 pointer-events-none"
								)}
								disabled={!canCancelOrders}
								aria-disabled={!canCancelOrders}
								onclick={() => {
									if (!canCancelOrders) return;
									cancelOrder(order.id);
								}}>X</Button
							>
						{/if}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
