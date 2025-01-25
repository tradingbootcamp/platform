<script lang="ts">
	import { accountName } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import * as Table from '$lib/components/ui/table';
	import { createVirtualizer, type VirtualItem } from '@tanstack/svelte-virtual';
	import type { websocket_api } from 'schema-js';

	let { trades } = $props<{ trades: websocket_api.ITrade[] }>();

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

	const getShortUserName = (id: number | null | undefined) => {
		return accountName(id).split(' ')[0];
	};
</script>

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
								<Table.Cell class="flex items-center truncate px-1 py-0 text-center">
									{getShortUserName(trades[index].buyerId)}
								</Table.Cell>
								<Table.Cell class="flex items-center truncate px-1 py-0 text-center">
									{getShortUserName(trades[index].sellerId)}
								</Table.Cell>
								<Table.Cell class="flex items-center truncate px-1 py-0 text-center">
									<FlexNumber value={(trades[index].price ?? 0).toString()} />
								</Table.Cell>
								<Table.Cell class="flex items-center truncate px-1 py-0 text-center">
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
