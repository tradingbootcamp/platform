<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';

	let sortedMarkets = $derived.by(() => {
		return [...serverState.markets.entries()]
			.map(([id, market]) => ({
				id,
				market,
				name: market.definition.name || `Market ${id}`,
				isOpen: market.definition.open ? true : false,
				transactionId: Number(market.definition.transactionId || 0)
			}))
			.sort((a, b) => {
				if (a.isOpen !== b.isOpen) {
					return a.isOpen ? -1 : 1;
				}
				return b.transactionId - a.transactionId;
			});
	});
</script>

<div class="w-full py-4">
	<div class="mb-4">
		<CreateMarket>Create Market</CreateMarket>
	</div>
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each sortedMarkets as { id, market } (id)}
			<a
				href={`/market/${id}`}
				class="border-border hover:border-primary hover:bg-accent block rounded-lg border p-4 transition-colors"
			>
				<h3 class="text-lg font-medium">
					{market.definition.name || `Market ${id}`}
				</h3>
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
