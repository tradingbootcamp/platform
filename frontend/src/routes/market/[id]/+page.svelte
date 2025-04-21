<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';
	import { WavyFrame } from '$lib/components/ui/wavy-frame';
	import { shouldShowWavyBorder } from '../utils';

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
	let showBorder = $derived(shouldShowWavyBorder(marketData?.definition));
</script>

{#if showBorder}
	<WavyFrame class="my-8">
		<div class="relative flex-grow px-8 py-0">
			{#if serverState.actingAs}
				{#if marketData}
					<Market {marketData} />
				{:else}
					<p>Market not found</p>
				{/if}
			{/if}
		</div>
	</WavyFrame>
{:else}
	<div class="relative my-8 flex-grow px-8 py-0">
		{#if serverState.actingAs}
			{#if marketData}
				<Market {marketData} />
			{:else}
				<p>Market not found</p>
			{/if}
		{/if}
	</div>
{/if}

<style>
</style>
