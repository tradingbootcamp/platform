<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';
	import { PuzzleHuntFrame } from '$lib/components/ui/puzzle-hunt-frame';
	import { shouldShowPuzzleHuntBorder } from '../utils';

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
	let showBorder = $derived(shouldShowPuzzleHuntBorder(marketData?.definition));
</script>

{#if showBorder}
	<PuzzleHuntFrame class="my-8">
		{#if serverState.actingAs}
			{#if marketData}
				<Market {marketData} />
			{:else}
				<div class="flex items-center justify-center">
					<p class="text-muted-foreground text-lg">Market not found</p>
				</div>
			{/if}
		{/if}
	</PuzzleHuntFrame>
{:else if serverState.actingAs}
	{#if serverState.actingAs}
		{#if marketData}
			<Market {marketData} />
		{:else}
			<div class="flex items-center justify-center">
				<p class="text-muted-foreground text-lg">Market not found</p>
			</div>
		{/if}
	{/if}
{/if}
