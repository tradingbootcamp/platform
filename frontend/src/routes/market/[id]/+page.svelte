<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';
	import { formatMarketName } from '$lib/utils';

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
	let marketName = $derived(formatMarketName(marketData?.definition?.name) || 'Market');
</script>

<svelte:head>
	<title>{marketName} - Trading Bootcamp</title>
</svelte:head>

{#if serverState.actingAs !== undefined}
	{#if marketData}
		<Market {marketData} />
	{:else}
		<div class="flex items-center justify-center">
			<p class="text-lg text-muted-foreground">Market not found</p>
		</div>
	{/if}
{/if}
