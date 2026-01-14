<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import FormattedName from '$lib/components/formattedName.svelte';
	import {
		formatPrice,
		shouldShowPuzzleHuntBorder,
		sortedBids,
		sortedOffers
	} from '$lib/components/marketDataUtils';
	import CreateMarketType from '$lib/components/forms/createMarketType.svelte';
	import CreateMarketGroup from '$lib/components/forms/createMarketGroup.svelte';
	import { Button } from '$lib/components/ui/button';
	import { usePinnedMarkets, useStarredMarkets } from '$lib/starPinnedMarkets.svelte';
	import { localStore } from '$lib/localStore.svelte';
	import { cn } from '$lib/utils';
	import Pin from '@lucide/svelte/icons/pin';
	import Star from '@lucide/svelte/icons/star';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	const { isStarred, toggleStarred } = useStarredMarkets();
	const { isPinned, togglePinned } = usePinnedMarkets();
	let isAdmin = $derived(serverState.isAdmin && serverState.sudoEnabled);

	// Persisted state for collapsed sections and section order
	const collapsedSections = localStore<number[]>('collapsedMarketSections', []);
	const sectionOrder = localStore<number[]>('marketSectionOrder', []);

	// Get all market types sorted
	let allTypes = $derived(
		[...serverState.marketTypes.values()].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
	);

	// Get ordered types based on user's custom order
	let orderedTypes = $derived.by(() => {
		const order = sectionOrder.value;
		return [...allTypes].sort((a, b) => {
			const aIndex = order.indexOf(a.id ?? 0);
			const bIndex = order.indexOf(b.id ?? 0);
			if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
			if (aIndex !== -1) return -1;
			if (bIndex !== -1) return 1;
			return (a.id ?? 0) - (b.id ?? 0);
		});
	});

	// Get sorted markets
	let sortedMarkets = $derived.by(() => {
		return [...serverState.markets.entries()]
			.map(([id, market]) => ({
				id,
				market,
				typeId: market.definition.typeId ?? 1,
				groupId: market.definition.groupId ?? 0,
				isOpen: market.definition.open ? true : false,
				transactionId: Number(market.definition.transactionId || 0),
				starred: isStarred(Number(id)),
				pinned: isPinned(Number(id))
			}))
			.sort((a, b) => {
				if (a.pinned !== b.pinned) {
					return a.pinned ? -1 : 1;
				}
				if (a.starred !== b.starred) {
					return a.starred ? -1 : 1;
				}
				if (a.isOpen !== b.isOpen) {
					return a.isOpen ? -1 : 1;
				}
				return b.transactionId - a.transactionId;
			});
	});

	// Group markets by type
	let marketsByType = $derived.by(() => {
		const grouped = new Map<number, typeof sortedMarkets>();
		for (const market of sortedMarkets) {
			const typeId = market.typeId;
			if (!grouped.has(typeId)) {
				grouped.set(typeId, []);
			}
			grouped.get(typeId)!.push(market);
		}
		return grouped;
	});

	// Helper to organize markets within a category into groups
	type MarketEntry = (typeof sortedMarkets)[0];
	type RenderItem =
		| { type: 'marketBatch'; markets: MarketEntry[]; key: string }
		| { type: 'group'; groupId: number; groupName: string; markets: MarketEntry[] };

	function organizeByGroups(markets: MarketEntry[]): RenderItem[] {
		const ungrouped: MarketEntry[] = [];
		const groupsMap = new Map<number, MarketEntry[]>();

		for (const market of markets) {
			if (market.groupId && market.groupId > 0) {
				if (!groupsMap.has(market.groupId)) {
					groupsMap.set(market.groupId, []);
				}
				groupsMap.get(market.groupId)!.push(market);
			} else {
				ungrouped.push(market);
			}
		}

		// Build group metadata with aggregated properties
		const groups = [...groupsMap.entries()].map(([groupId, groupMarkets]) => ({
			groupId,
			groupName: serverState.marketGroups.get(groupId)?.name ?? `Group ${groupId}`,
			markets: groupMarkets,
			maxTransactionId: Math.max(...groupMarkets.map((m) => m.transactionId)),
			allSettled: groupMarkets.every((m) => !m.isOpen),
			anyPinned: groupMarkets.some((m) => m.pinned),
			anyStarred: groupMarkets.some((m) => m.starred)
		}));

		// Create sortable items for both ungrouped markets and groups
		type SortableItem =
			| {
					isGroup: false;
					market: MarketEntry;
					pinned: boolean;
					starred: boolean;
					isOpen: boolean;
					transactionId: number;
			  }
			| {
					isGroup: true;
					group: (typeof groups)[0];
					pinned: boolean;
					starred: boolean;
					isOpen: boolean;
					transactionId: number;
			  };

		const allItems: SortableItem[] = [
			...ungrouped.map((m) => ({
				isGroup: false as const,
				market: m,
				pinned: Boolean(m.pinned),
				starred: Boolean(m.starred),
				isOpen: m.isOpen,
				transactionId: m.transactionId
			})),
			...groups.map((g) => ({
				isGroup: true as const,
				group: g,
				pinned: g.anyPinned,
				starred: g.anyStarred,
				isOpen: !g.allSettled,
				transactionId: g.maxTransactionId
			}))
		];

		// Sort all items by: pinned > starred > open > transactionId
		allItems.sort((a, b) => {
			if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
			if (a.starred !== b.starred) return a.starred ? -1 : 1;
			if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
			return b.transactionId - a.transactionId;
		});

		// Build intermediate result, ensuring first 3 ungrouped markets appear before any groups
		type IntermediateItem =
			| { type: 'market'; market: MarketEntry }
			| { type: 'group'; groupId: number; groupName: string; markets: MarketEntry[] };
		const intermediate: IntermediateItem[] = [];

		let ungroupedCount = 0;
		const deferredGroups: SortableItem[] = [];

		for (const item of allItems) {
			if (item.isGroup) {
				// If we haven't shown 3 ungrouped markets yet, defer this group
				if (ungroupedCount < 3) {
					deferredGroups.push(item);
				} else {
					// Insert any deferred groups that should come before this one
					while (deferredGroups.length > 0) {
						const deferred = deferredGroups.shift()!;
						if (deferred.isGroup) {
							const g = deferred.group;
							intermediate.push({
								type: 'group',
								groupId: g.groupId,
								groupName: g.groupName,
								markets: g.markets
							});
						}
					}
					const g = item.group;
					intermediate.push({
						type: 'group',
						groupId: g.groupId,
						groupName: g.groupName,
						markets: g.markets
					});
				}
			} else {
				// It's an ungrouped market
				intermediate.push({ type: 'market', market: item.market });
				ungroupedCount++;

				// After showing 3 ungrouped markets, flush any deferred groups
				if (ungroupedCount === 3) {
					for (const deferred of deferredGroups) {
						if (deferred.isGroup) {
							const g = deferred.group;
							intermediate.push({
								type: 'group',
								groupId: g.groupId,
								groupName: g.groupName,
								markets: g.markets
							});
						}
					}
					deferredGroups.length = 0;
				}
			}
		}

		// Flush any remaining deferred groups (if fewer than 3 ungrouped markets total)
		for (const deferred of deferredGroups) {
			if (deferred.isGroup) {
				const g = deferred.group;
				intermediate.push({
					type: 'group',
					groupId: g.groupId,
					groupName: g.groupName,
					markets: g.markets
				});
			}
		}

		// Batch consecutive individual markets together for grid rendering
		const result: RenderItem[] = [];
		let currentBatch: MarketEntry[] = [];

		for (const item of intermediate) {
			if (item.type === 'market') {
				currentBatch.push(item.market);
			} else {
				// Flush current batch before adding group
				if (currentBatch.length > 0) {
					result.push({
						type: 'marketBatch',
						markets: currentBatch,
						key: `batch-${currentBatch.map((m) => m.id).join('-')}`
					});
					currentBatch = [];
				}
				result.push(item);
			}
		}

		// Flush remaining batch
		if (currentBatch.length > 0) {
			result.push({
				type: 'marketBatch',
				markets: currentBatch,
				key: `batch-${currentBatch.map((m) => m.id).join('-')}`
			});
		}

		return result;
	}

	function isCollapsed(typeId: number): boolean {
		return collapsedSections.value.includes(typeId);
	}

	function toggleSection(typeId: number) {
		if (collapsedSections.value.includes(typeId)) {
			collapsedSections.value = collapsedSections.value.filter((id) => id !== typeId);
		} else {
			collapsedSections.value = [...collapsedSections.value, typeId];
		}
	}

	function moveSectionUp(typeId: number) {
		const types = orderedTypes;
		const index = types.findIndex((t) => t.id === typeId);
		if (index <= 0) return;

		const newOrder = types.map((t) => t.id ?? 0);
		[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
		sectionOrder.value = newOrder;
	}

	function moveSectionDown(typeId: number) {
		const types = orderedTypes;
		const index = types.findIndex((t) => t.id === typeId);
		if (index === -1 || index >= types.length - 1) return;

		const newOrder = types.map((t) => t.id ?? 0);
		[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
		sectionOrder.value = newOrder;
	}

	function handleStarClick(event: MouseEvent, marketId: number) {
		event.preventDefault();
		event.stopPropagation();
		toggleStarred(marketId);
	}

	function handlePinned(event: MouseEvent, marketId: number) {
		event.preventDefault();
		event.stopPropagation();
		togglePinned(marketId);
	}

	function deleteCategory(marketTypeId: number) {
		if (confirm('Are you sure you want to delete this category?')) {
			sendClientMessage({ deleteMarketType: { marketTypeId } });
		}
	}
</script>

<div class="w-full py-4">
	<div class="mb-4 flex gap-2">
		<CreateMarket>Create Market</CreateMarket>
		<CreateMarketType>Create Category</CreateMarketType>
		<CreateMarketGroup>Create Group</CreateMarketGroup>
	</div>
	{#each orderedTypes as marketType, index (marketType.id)}
		{@const typeId = marketType.id ?? 0}
		{@const markets = marketsByType.get(typeId) ?? []}
		{@const collapsed = isCollapsed(typeId)}

		<div class="mb-6">
			<div class="mb-2 flex items-center gap-2">
				<button
					class="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-primary"
					onclick={() => toggleSection(typeId)}
				>
					{#if collapsed}
						<ChevronRight class="h-5 w-5" />
					{:else}
						<ChevronDown class="h-5 w-5" />
					{/if}
					{marketType.name}
					<span class="text-sm font-normal text-muted-foreground">({markets.length})</span>
				</button>

				<div class="ml-auto flex gap-1">
					{#if isAdmin && marketType.name !== 'Fun'}
						<Button
							variant="ghost"
							size="icon"
							class="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
							onclick={() => deleteCategory(typeId)}
							title="Delete category"
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					{/if}
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6"
						disabled={index === 0}
						onclick={() => moveSectionUp(typeId)}
					>
						<ArrowUp class="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6"
						disabled={index === orderedTypes.length - 1}
						onclick={() => moveSectionDown(typeId)}
					>
						<ArrowDown class="h-4 w-4" />
					</Button>
				</div>
			</div>

			{#if !collapsed && markets.length > 0}
				{@const organized = organizeByGroups(markets)}

				{#each organized as item (item.type === 'group' ? `group-${item.groupId}` : item.key)}
					{#if item.type === 'group'}
						<div class="mb-4 rounded-lg border-2 border-primary/30 bg-muted/10 p-3">
							<h3 class="mb-3 text-xl font-semibold">{item.groupName}</h3>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{#each item.markets as { id, market, starred, pinned } (id)}
									{@const bestBid = sortedBids(market.orders)[0]?.price}
									{@const bestAsk = sortedOffers(market.orders)[0]?.price}
									<a
										href={`/market/${id}`}
										class={cn(
											'relative block rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:border-primary hover:bg-accent',
											shouldShowPuzzleHuntBorder(market.definition) && 'puzzle-hunt-frame',
											market.definition.closed && 'bg-gray-100 opacity-70 dark:bg-gray-800'
										)}
									>
										<div class="flex items-start justify-between">
											<div class="flex flex-col gap-1">
												<h3 class="text-lg font-medium">
													<FormattedName
														name={market.definition.name}
														fallback={`Market ${id}`}
														inGroup={true}
													/>
												</h3>
											</div>
											<div class="flex items-center gap-2">
												{#if isAdmin || pinned}
													<Button
														variant="ghost"
														size="icon"
														class="h-8 w-8 text-muted-foreground"
														onclick={(e) => handlePinned(e, Number(id))}
														disabled={!isAdmin}
													>
														<Pin
															class={cn(
																'h-5 w-5',
																pinned
																	? isAdmin
																		? 'fill-blue-400 text-blue-400 hover:fill-blue-300 hover:text-blue-300'
																		: 'fill-gray-400 text-gray-400'
																	: 'hover:fill-yellow-100 hover:text-primary'
															)}
														/>
														<span class="sr-only">Pin Market</span>
													</Button>
												{/if}
												<Button
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-muted-foreground"
													onclick={(e) => handleStarClick(e, Number(id))}
												>
													<Star
														class={cn(
															'h-5 w-5',
															starred
																? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-300 hover:text-yellow-300'
																: 'hover:fill-yellow-100 hover:text-primary'
														)}
													/>
													<span class="sr-only">Star Market</span>
												</Button>
											</div>
										</div>
										{#if market.definition.description}
											<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
												{market.definition.description}
											</p>
										{/if}
										<div class="mt-2 flex items-center justify-between">
											<span
												class={cn(
													'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground',
													market.definition.closed && 'bg-red-500/20 text-red-700 dark:text-red-400'
												)}
											>
												{market.definition.closed ? 'Closed' : 'Open'}
											</span>
											{#if !market.definition.closed}
												<span class="text-sm">
													<span class="text-muted-foreground">Bid: </span>
													<span class="text-green-500">{formatPrice(bestBid)}</span>
													<span class="text-muted-foreground"> Ask: </span>
													<span class="text-red-500">{formatPrice(bestAsk)}</span>
												</span>
											{:else}
												<span class="text-sm font-semibold text-muted-foreground"
													>Settled: {formatPrice(market.definition.closed.settlePrice)}</span
												>
											{/if}
										</div>
									</a>
								{/each}
							</div>
						</div>
					{:else}
						<div class="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{#each item.markets as { id, market, starred, pinned } (id)}
								{@const bestBid = sortedBids(market.orders)[0]?.price}
								{@const bestAsk = sortedOffers(market.orders)[0]?.price}
								<a
									href={`/market/${id}`}
									class={cn(
										'relative block rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:border-primary hover:bg-accent',
										shouldShowPuzzleHuntBorder(market.definition) && 'puzzle-hunt-frame',
										market.definition.closed && 'bg-gray-100 opacity-70 dark:bg-gray-800'
									)}
								>
									<div class="flex items-start justify-between">
										<div class="flex flex-col gap-1">
											<h3 class="text-lg font-medium">
												<FormattedName
													name={market.definition.name}
													fallback={`Market ${id}`}
													inGroup={Boolean(market.definition.groupId)}
												/>
											</h3>
										</div>
										<div class="flex items-center gap-2">
											{#if isAdmin || pinned}
												<Button
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-muted-foreground"
													onclick={(e) => handlePinned(e, Number(id))}
													disabled={!isAdmin}
												>
													<Pin
														class={cn(
															'h-5 w-5',
															pinned
																? isAdmin
																	? 'fill-blue-400 text-blue-400 hover:fill-blue-300 hover:text-blue-300'
																	: 'fill-gray-400 text-gray-400'
																: 'hover:fill-yellow-100 hover:text-primary'
														)}
													/>
													<span class="sr-only">Pin Market</span>
												</Button>
											{/if}
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 text-muted-foreground"
												onclick={(e) => handleStarClick(e, Number(id))}
											>
												<Star
													class={cn(
														'h-5 w-5',
														starred
															? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-300 hover:text-yellow-300'
															: 'hover:fill-yellow-100 hover:text-primary'
													)}
												/>
												<span class="sr-only">Star Market</span>
											</Button>
										</div>
									</div>
									{#if market.definition.description}
										<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
											{market.definition.description}
										</p>
									{/if}
									<div class="mt-2 flex items-center justify-between">
										<span
											class={cn(
												'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground',
												market.definition.closed && 'bg-red-500/20 text-red-700 dark:text-red-400'
											)}
										>
											{market.definition.closed ? 'Closed' : 'Open'}
										</span>
										{#if !market.definition.closed}
											<span class="text-sm">
												<span class="text-muted-foreground">Bid: </span>
												<span class="text-green-500">{formatPrice(bestBid)}</span>
												<span class="text-muted-foreground"> Ask: </span>
												<span class="text-red-500">{formatPrice(bestAsk)}</span>
											</span>
										{:else}
											<span class="text-sm font-semibold text-muted-foreground"
												>Settled: {formatPrice(market.definition.closed.settlePrice)}</span
											>
										{/if}
									</div>
								</a>
							{/each}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	{/each}
</div>

<style>
</style>
