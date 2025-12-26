<script lang="ts">
	import { accountName, isAltAccount, serverState } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import * as Table from '$lib/components/ui/table';
	import { createVirtualizer, type VirtualItem } from '@tanstack/svelte-virtual';
	import type { websocket_api } from 'schema-js';
	import { cn, formatUsername } from '$lib/utils';

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
		const name = accountName(id, undefined, { raw: true });
		return formatUsername(name, 'compact').split(' ')[0];
	};
</script>

<div class="trades-container">
<Table.Root class="border-collapse border-spacing-0">
	<Table.Header>
		<Table.Row
			class="market-trades-cols trades-header grid h-full justify-center border-0 hover:bg-transparent"
		>
			<Table.Head class="flex items-center justify-center px-0 py-0 text-center">Buyer</Table.Head>
			<Table.Head class="flex items-center justify-center px-0 py-0 text-center">Seller</Table.Head>
			<Table.Head class="flex items-center justify-center px-0 py-0 text-center">Price</Table.Head>
			<Table.Head class="flex items-center justify-center px-0 py-0 text-center">Size</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body
		class="trades-scroll block h-[20rem] w-full overflow-y-scroll md:h-[28rem]"
		bind:ref={virtualTradesEl}
	>
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
								'market-trades-cols grid h-full w-full justify-center',
								index % 2 === 0 && 'bg-accent/35'
							)}
						>
							<Table.Cell
								class={cn(
									'flex items-center justify-center truncate px-1 py-0 text-center',
									trades[index].buyerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
								)}
							>
								<span class:italic={isAltAccount(trades[index].buyerId)}>{getShortUserName(trades[index].buyerId)}</span>
							</Table.Cell>
							<Table.Cell
								class={cn(
									'flex items-center justify-center truncate px-1 py-0 text-center',
									trades[index].sellerId === serverState.actingAs &&
										'ring-2 ring-inset ring-primary'
								)}
							>
								<span class:italic={isAltAccount(trades[index].sellerId)}>{getShortUserName(trades[index].sellerId)}</span>
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
</div>

<style>
	/* Container for responsive column sizing */
	:global(.trades-container) {
		container-type: inline-size;
		width: 100%;
		min-width: 0; /* Allow flex item to shrink below content size */
	}

	/* Smooth interpolation: columns scale with container width */
	/* Minimum total: 3 + 3 + 2.5 + 2.5 = 11rem (100cqi at minimum) */
	/* Buyer/Seller: 3rem / 11rem = 27.273cqi, max 6rem */
	/* Price/Size: 2.5rem / 11rem = 22.727cqi, max 3.5rem */
	:global(.market-trades-cols) {
		grid-template-columns:
			clamp(3rem, 27.273cqi, 6rem)
			clamp(3rem, 27.273cqi, 6rem)
			clamp(2.5rem, 22.727cqi, 3.5rem)
			clamp(2.5rem, 22.727cqi, 3.5rem);
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
