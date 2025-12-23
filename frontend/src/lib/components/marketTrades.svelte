<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import * as Table from '$lib/components/ui/table';
	import { createVirtualizer, type VirtualItem } from '@tanstack/svelte-virtual';
	import type { websocket_api } from 'schema-js';
	import { cn } from '$lib/utils';

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

<Table.Root class="border-collapse border-spacing-0">
	<Table.Header>
		<Table.Row class="market-trades-cols trades-header grid h-full justify-center hover:bg-transparent border-0">
			<Table.Head class="flex items-center justify-center px-0 py-0.5 text-center">Buyer</Table.Head>
			<Table.Head class="flex items-center justify-center px-0 py-0.5 text-center">Seller</Table.Head>
			<Table.Head class="flex items-center justify-center px-0 py-0.5 text-center">Price</Table.Head>
			<Table.Head class="flex items-center justify-center px-0 py-0.5 text-center">Size</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body class="trades-scroll block h-[20rem] w-full overflow-y-scroll overflow-x-hidden md:h-[28rem]" bind:ref={virtualTradesEl}>
		<div class="relative w-full" style="height: {totalSize}px;">
			{#each virtualItems as row (trades.length - 1 - row.index)}
				{@const index = trades.length - 1 - row.index}
				{#if index >= 0}
					<div
						class="absolute left-0 top-0 table-row w-full border-b border-border/60"
						style="height: {row.size}px; transform: translateY({row.start}px);"
					>
						<Table.Row
							class={cn(
								"market-trades-cols grid h-full w-full justify-center",
								index % 2 === 0 && 'bg-accent/35'
							)}
						>
							<Table.Cell class={cn(
								"flex items-center justify-center truncate px-1 py-0 text-center",
								trades[index].buyerId === serverState.actingAs && 'ring-primary ring-2 ring-inset'
							)}>
								{getShortUserName(trades[index].buyerId)}
							</Table.Cell>
							<Table.Cell class={cn(
								"flex items-center justify-center truncate px-1 py-0 text-center",
								trades[index].sellerId === serverState.actingAs && 'ring-primary ring-2 ring-inset'
							)}>
								{getShortUserName(trades[index].sellerId)}
							</Table.Cell>
							<Table.Cell class="flex items-center justify-center truncate px-1 py-0 text-center">
								<FlexNumber value={(trades[index].price ?? 0).toString()} />
							</Table.Cell>
							<Table.Cell class="flex items-center justify-center truncate px-1 py-0 text-center">
								<FlexNumber value={(trades[index].size ?? 0).toString()} />
							</Table.Cell>
						</Table.Row>
					</div>
				{/if}
			{/each}
		</div>
	</Table.Body>
</Table.Root>

<style>
	:global(.market-trades-cols) {
		grid-template-columns: minmax(4rem, 7rem) minmax(4rem, 7rem) minmax(3rem, 3.5rem) minmax(
				3rem,
				3.5rem
			);
	}

	/* Only apply scrollbar offset for webkit browsers (Chrome/Safari/Edge) */
	@supports selector(::-webkit-scrollbar) {
		:global(.trades-header) {
			margin-right: 6px;
		}
	}

	:global(.trades-scroll)::-webkit-scrollbar {
		width: 6px;
	}

	:global(.trades-scroll)::-webkit-scrollbar-track {
		background: transparent;
	}

	:global(.trades-scroll)::-webkit-scrollbar-thumb {
		background: hsl(var(--border));
		border-radius: 3px;
	}

	:global(.trades-scroll)::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground));
	}
</style>
