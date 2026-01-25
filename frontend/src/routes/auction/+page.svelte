<script lang="ts">
	import { goto } from '$app/navigation';
	import CreateAuction from '$lib/components/forms/createAuction.svelte';
	import AuctionLink from '$lib/components/auctionLink.svelte';
	import AuctionModal from '$lib/components/auctionModal.svelte';
	import { serverState } from '$lib/api.svelte';
	import type { websocket_api } from 'schema-js';

	let selectedAuction: websocket_api.IAuction | null = $state(null);

	// Redirect non-admins to /market
	$effect(() => {
		if (serverState.actingAs !== undefined && !serverState.isAdmin) {
			goto('/market');
		}
	});

	// Close the modal if the selected auction is deleted
	$effect(() => {
		if (selectedAuction && !serverState.auctions.has(selectedAuction.id!)) {
			selectedAuction = null;
		}
	});
</script>

<div class="mr-auto flex flex-col gap-8 pt-8">
	<h1 class="text-xl font-bold">Auction</h1>
	<CreateAuction />

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each Array.from(serverState.auctions.values()).sort((a, b) => (a.transactionTimestamp?.seconds ?? 0) - (b.transactionTimestamp?.seconds ?? 0)) as auction}
			<AuctionLink {auction} on:open={(e) => (selectedAuction = e.detail.auction)} />
		{/each}
	</div>

	{#if selectedAuction}
		<AuctionModal auction={selectedAuction} close={() => (selectedAuction = null)} />
	{/if}
</div>
