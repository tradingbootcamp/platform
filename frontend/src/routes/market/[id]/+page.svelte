<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import Market from '$lib/components/market.svelte';
	import { cn } from '$lib/utils';

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));

	// Determine if border should be shown based on market details
	let showBorder = $derived(marketData?.definition?.name === 'LOG');
</script>

<div class={cn('relative my-8 flex-grow px-8 py-0', showBorder && 'wavy-frame')}>
	{#if serverState.actingAs}
		{#if marketData}
			<Market {marketData} />
		{:else}
			<p>Market not found</p>
		{/if}
	{/if}
</div>

<style>
	@keyframes wave {
		0%,
		100% {
			border-radius: 15% 12% 10% 17% / 17% 10% 17% 12%;
		}
		25% {
			border-radius: 10% 15% 17% 12% / 15% 17% 10% 15%;
		}
		50% {
			border-radius: 12% 17% 10% 15% / 12% 10% 17% 15%;
		}
		75% {
			border-radius: 17% 10% 15% 12% / 10% 15% 12% 17%;
		}
	}

	.wavy-frame {
		position: relative;
		z-index: 0;
	}

	.wavy-frame::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: -30px;
		background: linear-gradient(45deg, #4a148c, #7b1fa2, #9c27b0);
		border-radius: 15% 12% 10% 17% / 17% 10% 17% 12%;
		animation: wave 8s ease-in-out infinite;
	}
</style>
