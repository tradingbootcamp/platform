<script lang="ts">
	import CreateAuction from '$lib/components/forms/createAuction.svelte';
	import AuctionLink from '$lib/components/auctionLink.svelte';
	import AuctionModal from '$lib/components/auctionModal.svelte';
	import { serverState } from '$lib/api.svelte';
	import type { websocket_api } from 'schema-js';

	const auctions = Array.from(serverState.markets.values())
		.map((m) => m.definition)
		.filter((m) => m.name?.startsWith('[AUCTION]'));

	let selectedAuction: websocket_api.IAuction | null = null;
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
