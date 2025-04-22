<script lang="ts">
	import { accountName, sendClientMessage, serverState, type MarketData } from '$lib/api.svelte';
	import { websocket_api } from 'schema-js';
	import { Star } from 'lucide-svelte';
	import logo from '$lib/assets/logo.svg';

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
	const imageUrl = logo ?? '/placeholder.png'; // replace with `market.imageUrl` if available
</script>

<div
	class:order-2={!closed && starred}
	class:order-3={!closed && !starred}
	class:order-5={closed && starred}
	class:order-6={closed && !starred}
	class="flex flex-col items-center gap-2 rounded-lg border p-4 text-center shadow transition hover:shadow-md"
>
	<!-- Star button -->
	<div class="-mr-2 -mt-2 self-end">
		<button
			on:click={handleStarClick}
			on:mouseenter={() => (isHovering = true)}
			on:mouseleave={() => (isHovering = false)}
			class="rounded-full p-1 focus:outline-none"
			aria-label={starred ? 'Unstar market' : 'Star market'}
		>
			<Star
				color={starred || isHovering ? 'gold' : 'slategray'}
				fill={starred ? (isHovering ? 'none' : 'gold') : 'none'}
				size="20"
			/>
		</button>
	</div>

	<!-- Title and Creator -->
	<h2 class="text-lg font-bold">{market.name?.replace('[AUCTION] ', '')}</h2>
	<p class="text-sm text-gray-600">{accountName(market.ownerId) ?? 'Unknown'}</p>

	<!-- Image -->
	<img src={market.imageUrl ?? logo} alt="Market image2" class="h-60 w-60 rounded object-cover" />

	<!-- Description -->
	<p class="text-sm text-gray-700">{market.description}</p>
</div>
