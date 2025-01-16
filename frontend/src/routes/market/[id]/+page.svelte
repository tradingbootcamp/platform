<script lang="ts">
	import { page } from '$app/stores';
	import { initialLoadDone, serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
</script>

<div class="flex-grow py-8">
	{#await initialLoadDone then}
		{#if marketData}
			<Market {marketData} />
		{:else}
			<p>Market not found</p>
		{/if}
	{/await}
</div>
