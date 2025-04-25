<!-- AuctionLink.svelte -->
<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import Star from '@lucide/svelte/icons/star';
	import logo from '$lib/assets/logo.svg';
	import { websocket_api } from 'schema-js';
	import { createEventDispatcher } from 'svelte';

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
	const dispatch = createEventDispatcher();
</script>

<div
	on:click={() => dispatch('open', { auction })}
	class:order-2={!closed && starred}
	class:order-3={!closed && !starred}
	class:order-5={closed && starred}
	class:order-6={closed && !starred}
	class:opacity-50={closed}
	class:pointer-events-none={closed}
	class:grayscale={closed}
	class="flex cursor-pointer flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center shadow transition hover:shadow-md"
>
	<!-- Star button -->
	<div class="z-10 -mr-2 -mt-2 self-end" on:click|stopPropagation={handleStarClick}>
		<button
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
	<h2 class="text-lg font-bold text-card-foreground">{auction.name?.replace('[AUCTION] ', '')}</h2>
	<p class="text-sm text-muted-foreground">{accountName(auction.ownerId) ?? 'Unknown'}</p>

	<!-- Image -->
	<img src={auction.imageUrl ?? logo} alt="Market image" class="h-60 w-60 rounded object-cover" />
</div>
