<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import { shouldShowPuzzleHuntBorder } from '$lib/components/marketDataUtils';
	import { Button } from '$lib/components/ui/button';
	import { useStarredMarkets } from '$lib/starredMarkets.svelte';
	import { cn } from '$lib/utils';
	import Star from '@lucide/svelte/icons/star';

	const { isStarred, toggleStarred } = useStarredMarkets();

	let sortedMarkets = $derived.by(() => {
		return [...serverState.markets.entries()]
			.map(([id, market]) => ({
				id,
				market,
				isOpen: market.definition.open ? true : false,
				transactionId: Number(market.definition.transactionId || 0),
				starred: isStarred(Number(id))
			}))
			.sort((a, b) => {
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
</script>

<div class="w-full py-4">
	<div class="mb-4">
		<CreateMarket>Create Market</CreateMarket>
	</div>
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each sortedMarkets as { id, market, starred } (id)}
			<a
				href={`/market/${id}`}
				class={cn(
					'border-border hover:border-primary hover:bg-accent relative block rounded-lg border p-4 transition-colors',
					shouldShowPuzzleHuntBorder(market.definition) && 'puzzle-hunt-frame'
				)}
			>
				<div class="flex items-start justify-between">
					<h3 class="text-lg font-medium">
						{market.definition.name || `Market ${id}`}
					</h3>
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
				{#if market.definition.description}
					<p class="text-muted-foreground mt-1 line-clamp-2 text-sm">
						{market.definition.description}
					</p>
				{/if}
				<div class="mt-2 flex items-center gap-2">
					<span class="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
						{market.definition.closed ? 'Closed' : 'Open'}
					</span>
				</div>
			</a>
		{/each}
	</div>
</div>
