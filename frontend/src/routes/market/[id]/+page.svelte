<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
</script>

<div class="flex-grow py-8">
	{#if serverState.actingAs}
		{#if marketData}
			<Market {marketData} />
		{:else}
			<p>Market not found</p>
		{/if}
	{/if}
</div>
