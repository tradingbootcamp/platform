<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import {
		formatPrice,
		shouldShowPuzzleHuntBorder,
		sortedBids,
		sortedOffers
	} from '$lib/components/marketDataUtils';
	import { Button } from '$lib/components/ui/button';
	import { usePinnedMarkets, useStarredMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn } from '$lib/utils';
	import Pin from '@lucide/svelte/icons/pin';
	import Star from '@lucide/svelte/icons/star';

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
					'relative block rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:border-primary hover:bg-accent',
					shouldShowPuzzleHuntBorder(market.definition) && 'puzzle-hunt-frame',
					market.definition.closed && 'bg-gray-100 opacity-70 dark:bg-gray-800'
				)}
			>
				<div class="flex items-start justify-between">
					<div class="flex flex-col gap-1">
						<h3 class="text-lg font-medium">
							{market.definition.name || `Market ${id}`}
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
												: 'fill-gray-400 text-gray-400' // Greyed out for non-admins
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
				<div class="mt-2 flex items-end justify-between gap-2">
					<span
						class={cn(
							'rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground',
							market.definition.closed && 'bg-red-500/20 text-red-700 dark:text-red-400'
						)}
					>
						{market.definition.closed ? 'Closed' : 'Open'}
					</span>
					{#if !market.definition.closed}
						<span class="text-right text-sm">
							<span class="text-muted-foreground">Bid: </span>
							<span class="text-green-500">{formatPrice(bestBid)}</span>
							<span class="text-muted-foreground"> Ask: </span>
							<span class="text-red-500">{formatPrice(bestAsk)}</span>
						</span>
					{:else}
						<span class="text-right text-sm font-semibold text-muted-foreground">
							Settled: {formatPrice(market.definition.closed.settlePrice)}
						</span>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
</style>
