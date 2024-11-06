<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';

	let id = $derived(Number($page.params.id));
	let market = $derived(Number.isNaN(id) ? undefined : serverState.markets[id]);
</script>

<div class="flex-grow py-8">
	{#if market}
		<Market {market} />
	{:else}
		<p>Market not found</p>
	{/if}
</div>
