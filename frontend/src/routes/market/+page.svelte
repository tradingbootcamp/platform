<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import { shouldShowPuzzleHuntBorder, sortedBids, sortedOffers } from '$lib/components/marketDataUtils';
	import { Button } from '$lib/components/ui/button';
	import { useStarredMarkets, usePinnedMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn } from '$lib/utils';
	import Star from '@lucide/svelte/icons/star';
	import Pin from '@lucide/svelte/icons/pin';

	const { isStarred, toggleStarred } = useStarredMarkets();
	const { isPinned, togglePinned } = usePinnedMarkets();
	let isAdmin = $derived(serverState.isAdmin);

	let sortedMarkets = $derived.by(() => {
		return [...serverState.markets.entries()]
			.map(([id, market]) => ({
				id,
				market,
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

	function formatPrice(price: number | null | undefined): string {
		if (price === null || price === undefined) return '--';
		return price.toFixed(2);
	}
</script>

<div class="w-full py-4">
	<div class="mb-4">
		<CreateMarket>Create Market</CreateMarket>
	</div>
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each sortedMarkets as { id, market, starred, pinned } (id)}
			{@const bestBid = sortedBids(market.orders)[0]?.price}
			{@const bestAsk = sortedOffers(market.orders)[0]?.price}
			<a
				href={`/market/${id}`}
				class={cn(
					'border-border hover:border-primary hover:bg-accent relative block rounded-lg border p-4 transition-colors',
					shouldShowPuzzleHuntBorder(market.definition) && 'puzzle-hunt-frame'
				)}
			>
				<div class="flex items-start justify-between">
					<div class="flex flex-col gap-1">
						<h3 class="text-lg font-medium">
							{market.definition.name || `Market ${id}`}
						</h3>
						<div class="text-sm">
							{#if market.definition.closed}
								<span class="text-muted-foreground">Settled: {formatPrice(market.definition.closed.settlePrice)}</span>
							{:else}
								<span class="text-muted-foreground">Bid: {formatPrice(bestBid)} / Ask: {formatPrice(bestAsk)}</span>
							{/if}
						</div>
					</div>
					<div class="flex gap-1">
						{#if isAdmin || pinned}
							<Button
								variant="ghost"
								size="icon"
								class="text-muted-foreground h-8 w-8"
								onclick={(e) => handlePinned(e, Number(id))}
								disabled={!isAdmin}
							>
								<Pin
									class={cn(
										'h-5 w-5',
										pinned
											? isAdmin
												? 'fill-blue-400 text-blue-400 hover:fill-blue-300 hover:text-blue-300'
												: 'fill-gray-400 text-gray-400'  // Greyed out for non-admins
											: 'hover:text-primary hover:fill-yellow-100'
									)}
								/>
								<span class="sr-only">Pin Market</span>
							</Button>
						{/if}
						<Button
							variant="ghost"
							size="icon"
							class="text-muted-foreground h-8 w-8"
							onclick={(e) => handleStarClick(e, Number(id))}
						>
							<Star
								class={cn(
									'h-5 w-5',
									starred
										? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-300 hover:text-yellow-300'
										: 'hover:text-primary hover:fill-yellow-100'
								)}
							/>
							<span class="sr-only">Star Market</span>
						</Button>
					</div>
				</div>
				{#if market.definition.description}
					<p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
						{market.definition.description}
					</p>
				{/if}
				<div class="mt-2">
					<span class="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
						{market.definition.closed ? 'Closed' : 'Open'}
					</span>
				</div>
			</a>
		{/each}
	</div>
</div>
