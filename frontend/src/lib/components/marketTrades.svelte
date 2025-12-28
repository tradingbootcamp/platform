<script lang="ts">
	import { accountName, isAltAccount, serverState } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import * as Table from '$lib/components/ui/table';
	import { createVirtualizer, type VirtualItem } from '@tanstack/svelte-virtual';
	import type { websocket_api } from 'schema-js';
	import { cn, formatUsername } from '$lib/utils';
	import { Zap, Filter, X } from '@lucide/svelte/icons';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let { trades } = $props<{ trades: websocket_api.ITrade[] }>();

	let virtualTradesEl = $state<HTMLElement | null>(null);

	// Filter state
	let selectedAccountIds = $state<Set<number>>(new Set());
	let filterOpen = $state(false);

	let tradesVirtualizer = createVirtualizer({
		count: 0,
		getScrollElement: () => virtualTradesEl,
		estimateSize: () => 32,
		overscan: 10
	});

	let totalSize = $state(0);
	let virtualItems = $state<VirtualItem[]>([]);

	$effect(() => {
		$tradesVirtualizer.setOptions({ count: filteredTrades.length });
		totalSize = $tradesVirtualizer.getTotalSize();
		virtualItems = $tradesVirtualizer.getVirtualItems();
	});

	const getShortUserName = (id: number | null | undefined) => {
		const name = accountName(id, undefined, { raw: true });
		return formatUsername(name, 'compact').split(' ')[0];
	};

	// Get unique account IDs from trades
	const uniqueAccounts = $derived.by(() => {
		const accountIds = new Set<number>();
		for (const trade of trades) {
			if (trade.buyerId != null) accountIds.add(Number(trade.buyerId));
			if (trade.sellerId != null) accountIds.add(Number(trade.sellerId));
		}
		return Array.from(accountIds).sort((a, b) => {
			const nameA = getShortUserName(a);
			const nameB = getShortUserName(b);
			return nameA.localeCompare(nameB);
		});
	});

	// Filter trades based on selected accounts
	const filteredTrades = $derived.by(() => {
		if (selectedAccountIds.size === 0) return trades;
		return trades.filter(
			(trade) =>
				(trade.buyerId != null && selectedAccountIds.has(Number(trade.buyerId))) ||
				(trade.sellerId != null && selectedAccountIds.has(Number(trade.sellerId)))
		);
	});

	function toggleAccount(accountId: number) {
		const newSet = new Set(selectedAccountIds);
		if (newSet.has(accountId)) {
			newSet.delete(accountId);
		} else {
			newSet.add(accountId);
		}
		selectedAccountIds = newSet;
	}

	function clearFilter() {
		selectedAccountIds = new Set();
	}
</script>

<div class="trades-container">
	<!-- Filter controls -->
	<div class="mb-2 flex items-center justify-between gap-2">
		<Popover.Root bind:open={filterOpen}>
			<Popover.Trigger>
				<Button variant="outline" size="sm" class="h-8 gap-1.5">
					<Filter class="h-3.5 w-3.5" />
					Filter
					{#if selectedAccountIds.size > 0}
						<span class="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
							{selectedAccountIds.size}
						</span>
					{/if}
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-56 p-3">
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h4 class="text-sm font-semibold">Filter by Team</h4>
						{#if selectedAccountIds.size > 0}
							<Button variant="ghost" size="sm" class="h-6 px-2 text-xs" onclick={clearFilter}>
								Clear
							</Button>
						{/if}
					</div>
					<div class="max-h-60 space-y-2 overflow-y-auto">
						{#each uniqueAccounts as accountId (accountId)}
							<label class="flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded px-2 py-1.5" onclick={() => toggleAccount(accountId)}>
								<Checkbox
									checked={selectedAccountIds.has(accountId)}
								/>
								<span class="text-sm" class:italic={isAltAccount(accountId)}>
									{getShortUserName(accountId)}
								</span>
							</label>
						{/each}
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
		<span class="text-xs text-muted-foreground">
			{filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'}
		</span>
	</div>

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
			{#each virtualItems as row (filteredTrades.length - 1 - row.index)}
				{@const index = filteredTrades.length - 1 - row.index}
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
									'flex items-center justify-center gap-0.5 truncate px-1 py-0 text-center',
									filteredTrades[index].buyerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
								)}
							>
								{#if filteredTrades[index].buyerIsTaker}<Zap class="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />{/if}<span class:italic={isAltAccount(filteredTrades[index].buyerId)}>{getShortUserName(filteredTrades[index].buyerId)}</span>
							</Table.Cell>
							<Table.Cell
								class={cn(
									'flex items-center justify-center gap-0.5 truncate px-1 py-0 text-center',
									filteredTrades[index].sellerId === serverState.actingAs &&
										'ring-2 ring-inset ring-primary'
								)}
							>
								<span class:italic={isAltAccount(filteredTrades[index].sellerId)}>{getShortUserName(filteredTrades[index].sellerId)}</span>{#if !filteredTrades[index].buyerIsTaker}<Zap class="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400" />{/if}
							</Table.Cell>
							<Table.Cell class="flex items-center justify-center truncate px-1 py-0 text-center">
								<FlexNumber value={(filteredTrades[index].price ?? 0).toString()} />
							</Table.Cell>
							<Table.Cell class="flex items-center justify-center truncate px-1 py-0 text-center">
								<FlexNumber value={(filteredTrades[index].size ?? 0).toString()} />
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
