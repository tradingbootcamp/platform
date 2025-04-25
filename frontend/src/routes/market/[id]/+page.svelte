<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
</script>

{#if serverState.actingAs}
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
