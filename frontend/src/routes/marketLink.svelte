<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Star } from 'lucide-svelte';
	import { websocket_api } from 'schema-js';
	import type { MarketData } from '$lib/api.svelte';
	import { serverState } from '$lib/api.svelte';
	import {
		midPrice,
		sortedBids,
		sortedOffers,
		ordersAtTransaction
	} from '$lib/components/marketDataUtils';

	interface Props {
		market: websocket_api.IMarket;
	}

	let { market }: Props = $props();
	let marketIdParam = $derived(Number($page.params.id));
	let closed = $derived(market.closed);

	let starred = $state(localStorage.getItem(`is_starred_${market.id}`) === 'true');

	function handleStarClick() {
		localStorage.setItem(`is_starred_${market.id}`, !starred ? 'true' : 'false');
		starred = !starred;
	}

	let isHovering = $state(false);

	let marketData = $derived(serverState.markets.get(market.id!)!);
	let orders = $derived(ordersAtTransaction(marketData, undefined));
	let bids = $derived(sortedBids(orders));
	let offers = $derived(sortedOffers(orders));
	let mid = $derived(midPrice(bids, offers));
	let highestBid = $derived(bids.length > 0 ? bids[0].price : undefined);
	let lowestOffer = $derived(offers.length > 0 ? offers[0].price : undefined);
	let priceDisplay = $derived(
		highestBid || mid || lowestOffer
			? `${highestBid ?? '-'}|${mid ?? '-'}|${lowestOffer ?? '-'}`
			: undefined
	);
</script>

<li
	class:order-2={!closed && starred}
	class:order-3={!closed && !starred}
	class:order-5={closed && starred}
	class:order-6={closed && !starred}
	class="flex items-start gap-2"
>
	<button
		onclick={handleStarClick}
		onmouseenter={() => (isHovering = true)}
		onmouseleave={() => (isHovering = false)}
		class="mt-1 inline rounded-full p-1 focus:outline-none"
		aria-label={starred ? 'Unstar market' : 'Star market'}
	>
		<Star
			color={starred || isHovering ? 'gold' : 'slategray'}
			fill={starred ? (isHovering ? 'none' : 'gold') : 'none'}
			size="20"
		/>
	</button>

	<div class="flex flex-col">
		{#if priceDisplay}
			<span class="font-mono text-sm text-muted-foreground">{priceDisplay}</span>
		{/if}

		{#if marketIdParam === market.id}
			<Button
				class="inline w-full whitespace-normal px-0 text-start text-lg"
				variant="link"
				disabled
			>
				{market.name}
			</Button>
		{:else}
			<a href="/market/{market.id}">
				<Button class="inline whitespace-normal px-0 text-start text-lg" variant="link">
					{market.name}
				</Button>
			</a>
		{/if}
	</div>
</li>
