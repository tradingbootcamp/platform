<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';

	let id = $derived(Number($page.params.id));
	// let marketData0 = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
	let marketData2 = $derived(serverState.markets.get(69)); // Hardcoded ID 3
	let marketData3 = $derived(serverState.markets.get(70)); // Hardcoded ID 3
	let marketData0 = $derived(serverState.markets.get(67)); // Hardcoded ID 1
	let marketData1 = $derived(serverState.markets.get(68)); // Hardcoded ID 2
</script>

<div class="flex-grow py-8">
	{#if serverState.actingAs}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#if marketData2}
				<Market marketData={marketData2} />
			{/if}
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#if marketData3}
				<Market marketData={marketData3} />
			{/if}
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#if marketData0}
				<Market marketData={marketData0} />
			{/if}
		</div>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#if marketData1}
				<Market marketData={marketData1} />
			{/if}
		</div>
	{/if}
</div>
