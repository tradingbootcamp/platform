<script lang="ts">
	import { page } from '$app/stores';
	import { markets } from '$lib/api';
	import Market from '$lib/components/market.svelte';

	let id = $derived(Number($page.params.id));
	let market = $derived(Number.isNaN(id) ? undefined : $markets[id]);
</script>

<div class="flex-grow py-8">
	{#if $market}
		<Market market={$market} />
	{:else}
		<p>Market not found</p>
	{/if}
</div>
