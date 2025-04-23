<script lang="ts">
	import { accountName, sendClientMessage, serverState, type MarketData } from '$lib/api.svelte';
	import { websocket_api } from 'schema-js';
	import { Star } from 'lucide-svelte';
	import logo from '$lib/assets/logo.svg';

	interface Props {
		auction: websocket_api.IAuction;
	}
	let { auction }: Props = $props();
	let closed = $derived(auction.closed);
	let starred = $state(false);

	$effect(() => {
		if (auction?.id) {
			starred = localStorage.getItem(`is_auction_starred_${auction.id}`) === 'true';
		}
	});

	function handleStarClick() {
		localStorage.setItem(`is_starred_${auction.id}`, !starred ? 'true' : 'false');
		starred = !starred;
	}

	let isHovering = $state(false);
</script>

<div
	class:order-2={!closed && starred}
	class:order-3={!closed && !starred}
	class:order-5={closed && starred}
	class:order-6={closed && !starred}
	class:opacity-50={closed}
	class:pointer-events-none={closed}
	class:grayscale={closed}
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
	<h2 class="text-lg font-bold">{auction.name?.replace('[AUCTION] ', '')}</h2>
	<p class="text-sm text-gray-600">{accountName(auction.ownerId) ?? 'Unknown'}</p>

	<!-- Image -->
	<img src={auction.imageUrl ?? logo} alt="Market image2" class="h-60 w-60 rounded object-cover" />

	<!-- Description -->
	<p class="text-sm text-gray-700">{auction.description}</p>
</div>
