<script lang="ts">
	import { accountName, isAltAccount, serverState } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { createVirtualizer, type VirtualItem } from '@tanstack/svelte-virtual';
	import type { websocket_api } from 'schema-js';
	import { cn, formatUsername } from '$lib/utils';
	import { Zap, ArrowUpDown, ArrowUp, ArrowDown, X } from '@lucide/svelte/icons';
	import { Button } from '$lib/components/ui/button';

	let { trades, highlightedTradeId = null } = $props<{
		trades: websocket_api.ITrade[];
		highlightedTradeId?: number | null;
	}>();

	// Filter state
	let userFilter = $state<number | null>(null);

	// Sort state: 'none' | 'price-asc' | 'price-desc' | 'size-asc' | 'size-desc'
	let sortBy = $state<string>('none');

	// Get unique users from trades for the filter dropdown, plus current user
	let tradeUsers = $derived(() => {
		const userIds = new Set<number>();
		// Always include current user
		if (serverState.actingAs) userIds.add(serverState.actingAs);
		trades.forEach((t: websocket_api.ITrade) => {
			if (t.buyerId) userIds.add(t.buyerId);
			if (t.sellerId) userIds.add(t.sellerId);
		});
		return [...userIds]
			.map((id) => ({
				id,
				name: accountName(id, undefined, { raw: true }),
				isMe: id === serverState.actingAs
			}))
			.sort((a, b) => {
				// Current user always first
				if (a.isMe) return -1;
				if (b.isMe) return 1;
				return a.name.localeCompare(b.name);
			});
	});

	// Apply filters and sorting
	let filteredTrades = $derived(() => {
		let result = trades;

		// Filter by specific user
		if (userFilter !== null) {
			result = result.filter(
				(t: websocket_api.ITrade) => t.buyerId === userFilter || t.sellerId === userFilter
			);
		}

		// Apply sorting (stable sort preserves existing order for ties)
		if (sortBy !== 'none') {
			result = [...result].sort((a, b) => {
				if (sortBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0);
				if (sortBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
				if (sortBy === 'size-asc') return (a.size ?? 0) - (b.size ?? 0);
				if (sortBy === 'size-desc') return (b.size ?? 0) - (a.size ?? 0);
				return 0;
			});
		}

		return result;
	});

	let virtualTradesEl = $state<HTMLElement | null>(null);

	let tradesVirtualizer = createVirtualizer({
		count: 0,
		getScrollElement: () => virtualTradesEl,
		estimateSize: () => 32,
		overscan: 10,
		scrollToFn: (offset, { behavior }) => {
			virtualTradesEl?.scrollTo({ top: offset, behavior });
		}
	});

	let totalSize = $state(0);
	let virtualItems = $state<VirtualItem[]>([]);

	$effect(() => {
		const displayTrades = filteredTrades();
		$tradesVirtualizer.setOptions({ count: displayTrades.length });
		totalSize = $tradesVirtualizer.getTotalSize();
		virtualItems = $tradesVirtualizer.getVirtualItems();
	});

	// Scroll to highlighted trade when it changes
	$effect(() => {
		if (highlightedTradeId != null) {
			const tradeIndex = trades.findIndex((t: websocket_api.ITrade) => t.id === highlightedTradeId);
			if (tradeIndex !== -1) {
				// trades are displayed in reverse order (newest first)
				const virtualIndex = trades.length - 1 - tradeIndex;
				$tradesVirtualizer.scrollToIndex(virtualIndex, { align: 'center', behavior: 'smooth' });
			}
		}
	});

	const getShortUserName = (id: number | null | undefined) => {
		const name = accountName(id, undefined, { raw: true });
		return formatUsername(name, 'compact').split(' ')[0];
	};

	const toggleSort = (field: 'price' | 'size') => {
		if (sortBy === `${field}-asc`) {
			sortBy = `${field}-desc`;
		} else if (sortBy === `${field}-desc`) {
			sortBy = 'none';
		} else {
			sortBy = `${field}-asc`;
		}
	};

	const clearFilters = () => {
		userFilter = null;
		sortBy = 'none';
	};

	let hasActiveFilters = $derived(userFilter !== null || sortBy !== 'none');
</script>

<!-- Filter controls -->
<div class="mb-2 flex items-center gap-1.5">
	<Select.Root
		type="single"
		value={userFilter !== null ? String(userFilter) : ''}
		onValueChange={(v) => {
			userFilter = v ? Number(v) : null;
		}}
	>
		<Select.Trigger class="h-7 min-w-0 max-w-[100px] flex-1 text-xs">
			<span class="truncate">
				{userFilter === null
					? 'All users'
					: userFilter === serverState.actingAs
						? 'Yourself'
						: getShortUserName(userFilter)}
			</span>
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="" label="All users">All users</Select.Item>
			{#each tradeUsers() as user (user.id)}
				<Select.Item value={String(user.id)} label={user.isMe ? 'Yourself' : user.name}>
					{user.isMe ? 'Yourself' : formatUsername(user.name, 'compact').split(' ')[0]}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	{#if hasActiveFilters}
		<Button
			variant="ghost"
			size="icon"
			class="h-7 w-7"
			onclick={clearFilters}
			title="Clear filters"
		>
			<X class="h-3.5 w-3.5" />
		</Button>
	{/if}

	<span class="ml-auto shrink-0 whitespace-nowrap text-xs text-muted-foreground">
		{filteredTrades().length} trades
	</span>
</div>

<div class="trades-container" id="trade-log">
	<Table.Root class="border-collapse border-spacing-0">
		<Table.Header>
			<Table.Row
				class="market-trades-cols trades-header grid h-full justify-center border-0 hover:bg-transparent"
			>
				<Table.Head class="flex items-center justify-center px-0 py-0 text-center">Buyer</Table.Head
				>
				<Table.Head class="flex items-center justify-center px-0 py-0 text-center"
					>Seller</Table.Head
				>
				<Table.Head class="flex items-center justify-center px-0 py-0 text-center">
					<button
						class="flex items-center gap-0.5 hover:text-foreground"
						onclick={() => toggleSort('price')}
					>
						Price
						{#if sortBy === 'price-asc'}
							<ArrowUp class={cn('h-3 w-3', 'text-primary')} />
						{:else if sortBy === 'price-desc'}
							<ArrowDown class={cn('h-3 w-3', 'text-primary')} />
						{:else}
							<ArrowUpDown class="h-3 w-3 opacity-50" />
						{/if}
					</button>
				</Table.Head>
				<Table.Head class="flex items-center justify-center px-0 py-0 text-center">
					<button
						class="flex items-center gap-0.5 hover:text-foreground"
						onclick={() => toggleSort('size')}
					>
						Size
						{#if sortBy === 'size-asc'}
							<ArrowUp class={cn('h-3 w-3', 'text-primary')} />
						{:else if sortBy === 'size-desc'}
							<ArrowDown class={cn('h-3 w-3', 'text-primary')} />
						{:else}
							<ArrowUpDown class="h-3 w-3 opacity-50" />
						{/if}
					</button>
				</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body
			class="trades-scroll block h-[20rem] w-full overflow-y-scroll md:h-[28rem]"
			bind:ref={virtualTradesEl}
		>
			{@const displayTrades = filteredTrades()}
			<div class="relative w-full" style="height: {totalSize}px;">
				{#each virtualItems as row (sortBy === 'none' ? displayTrades.length - 1 - row.index : row.index)}
					{@const index = sortBy === 'none' ? displayTrades.length - 1 - row.index : row.index}
					{#if index >= 0 && index < displayTrades.length}
						{@const trade = displayTrades[index]}
						<div
							class="absolute left-0 top-0 table-row w-full border-b border-border/60"
							style="height: {row.size}px; transform: translateY({row.start}px);"
						>
							<Table.Row
								class={cn(
									'market-trades-cols grid h-full w-full justify-center',
									row.index % 2 === 0 && 'bg-accent/35',
									trade.id === highlightedTradeId &&
										'bg-yellow-500/20 ring-2 ring-inset ring-yellow-500'
								)}
							>
								<Table.Cell
									class={cn(
										'flex items-center justify-center gap-0.5 truncate px-1 py-0 text-center',
										trade.buyerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
									)}
								>
									{#if trade.buyerIsTaker}<Zap
											class="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400"
										/>{/if}<span class:italic={isAltAccount(trade.buyerId)}
										>{getShortUserName(trade.buyerId)}</span
									>
								</Table.Cell>
								<Table.Cell
									class={cn(
										'flex items-center justify-center gap-0.5 truncate px-1 py-0 text-center',
										trade.sellerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
									)}
								>
									<span class:italic={isAltAccount(trade.sellerId)}
										>{getShortUserName(trade.sellerId)}</span
									>{#if !trade.buyerIsTaker}<Zap
											class="h-3 w-3 shrink-0 fill-yellow-400 text-yellow-400"
										/>{/if}
								</Table.Cell>
								<Table.Cell class="flex items-center justify-center truncate px-1 py-0 text-center">
									<FlexNumber value={(trade.price ?? 0).toString()} />
								</Table.Cell>
								<Table.Cell class="flex items-center justify-center truncate px-1 py-0 text-center">
									<FlexNumber value={(trade.size ?? 0).toString()} />
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
