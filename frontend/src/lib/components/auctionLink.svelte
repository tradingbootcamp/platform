<script lang="ts">
	import { sendClientMessage, serverState, type MarketData } from '$lib/api.svelte';
	import { websocket_api } from 'schema-js';
	import { Star } from 'lucide-svelte';

	interface Props {
		market: websocket_api.IMarket;
	}
	let { market }: Props = $props();
	let closed = $derived(market.closed);
	let starred = $state(localStorage.getItem(`is_auction_starred_${market.id}`) === 'true');
	function handleStarClick() {
		localStorage.setItem(`is_starred_${market.id}`, !starred ? 'true' : 'false');
		starred = !starred;
	}
	let isHovering = $state(false);
</script>

<li
	class:order-2={!closed && starred}
	class:order-3={!closed && !starred}
	class:order-5={closed && starred}
	class:order-6={closed && !starred}
	class="flex items-center gap-2"
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
	<h2 class="text-lg font-bold">{market.name?.replace('[AUCTION] ', '')}</h2>
	<p class="text-sm">{market.description}</p>
</li>
