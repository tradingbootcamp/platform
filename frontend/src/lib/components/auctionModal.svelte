<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import logo from '$lib/assets/logo.svg';
	import BuyAuction from '$lib/components/forms/buyAuction.svelte';
	import DeleteAuction from '$lib/components/forms/deleteAuction.svelte';
	import SettleAuction from '$lib/components/forms/settleAuction.svelte';
	import { websocket_api } from 'schema-js';
	import X from '@lucide/svelte/icons/x';
	import { PUBLIC_SERVER_URL } from '$env/static/public';

	interface Props {
		auction: websocket_api.IAuction;
		close: () => void;
	}

	let { auction, close }: Props = $props();

	let canDelete = $derived(serverState.isAdmin || auction.ownerId === serverState.userId);
	let canBuy = $derived(
		auction.binPrice !== null &&
			auction.binPrice !== undefined &&
			auction.status === 'open' &&
			auction.ownerId !== serverState.actingAs
	);
	let isSettled = $derived(auction.status === 'closed');
	let isBuyer = $derived(auction.buyerId === serverState.actingAs);
	let buyerId = $derived(auction.buyerId);
	let isOwner = $derived(auction.ownerId === serverState.actingAs);

	// Parse description to separate main content from contact info
	let { mainDescription, contactInfo } = $derived.by(() => {
		const description = auction.description || '';
		const contactMatch = description.match(/^(.*?)\n\n(Contact:|Pickup:)(.*)$/s);

		if (contactMatch) {
			return {
				mainDescription: contactMatch[1].trim(),
				contactInfo: `${contactMatch[2]}${contactMatch[3]}`
			};
		}

		return {
			mainDescription: description,
			contactInfo: null
		};
	});
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
>
	<div
		class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border bg-card p-6 shadow-lg"
	>
		<button
			class="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
			on:click={close}
		>
			<X class="size-6" />
			<span class="sr-only">Close</span>
		</button>
		<h2 class="mb-1 text-xl font-bold text-card-foreground">
			{auction.name?.replace('[AUCTION] ', '')}
		</h2>
		<p class="mb-2 text-sm text-muted-foreground">{accountName(auction.ownerId) ?? 'Unknown'}</p>

		{#if isSettled}
			<p class="mb-2 text-lg font-semibold text-blue-600">
				Sold for: {auction?.closed?.settlePrice} clips
			</p>
			{#if buyerId}
				<p class="mb-2 text-sm text-muted-foreground">
					Buyer: {accountName(buyerId) ?? 'Unknown'}
				</p>
			{/if}
		{:else if auction.binPrice !== null && auction.binPrice !== undefined}
			<p class="mb-2 text-lg font-semibold text-green-600">Buy It Now: {auction.binPrice} clips</p>
		{/if}

		<img
			src={auction.imageUrl == '/images/'
				? logo
				: PUBLIC_SERVER_URL.replace('wss', 'https').replace('ws', 'http') + auction.imageUrl}
			alt="Auction"
			class="mb-4 max-h-[50vh] w-full rounded object-contain"
		/>

		<p class="whitespace-pre-wrap text-sm text-card-foreground">{mainDescription}</p>

		{#if contactInfo && (isBuyer || isOwner)}
			<p class="mt-4 whitespace-pre-wrap text-sm text-card-foreground">{contactInfo}</p>
		{/if}

		{#if canBuy}
			<hr class="mx-4 my-6 border-t border-border" />
			<BuyAuction
				auctionId={auction.id}
				auctionName={auction.name}
				binPrice={auction.binPrice}
				{close}
			/>
		{/if}

		{#if canDelete && !isSettled}
			<hr class="mx-4 my-6 border-t border-border" />
			<DeleteAuction id={auction.id} name={auction.name} {close} />
		{/if}

		{#if serverState.isAdmin && !isSettled}
			<hr class="mx-4 my-6 border-t-4 border-border" />
			<SettleAuction id={auction.id} name={auction.name} {close} />
		{/if}
	</div>
</div>
