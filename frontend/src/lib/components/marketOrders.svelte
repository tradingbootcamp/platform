<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import { getShortUserName } from '$lib/components/marketDataUtils';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Table from '$lib/components/ui/table';
	import { cn } from '$lib/utils';
	import type { websocket_api } from 'schema-js';

	let { bids, offers, displayTransactionId } = $props<{
		bids: websocket_api.IOrder[];
		offers: websocket_api.IOrder[];
		displayTransactionId: number | undefined;
	}>();

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};
</script>

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
					<Table.Head class="flex items-center justify-center truncate text-center">Size</Table.Head
					>
					<Table.Head class="flex items-center justify-center truncate text-center">Bid</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each bids as order (order.id)}
					<Table.Row
						class={cn(
							'grid h-8 grid-cols-[2rem_7rem_3.5rem_3.5rem] bg-green-50 even:bg-green-100 dark:bg-green-700/35 dark:even:bg-green-900/35',
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
				<Table.Row class="grid grid-cols-[3.5rem_3.5rem_7rem_1rem]">
					<Table.Head class="flex items-center justify-center truncate text-center"
						>Offer</Table.Head
					>
					<Table.Head class="flex items-center justify-center truncate text-center">Size</Table.Head
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
							'grid h-8 grid-cols-[3.5rem_3.5rem_7rem_2rem] bg-red-50 even:bg-red-100 dark:bg-red-700/35 dark:even:bg-red-900/35',
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
							{getShortUserName(order.ownerId)}
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
