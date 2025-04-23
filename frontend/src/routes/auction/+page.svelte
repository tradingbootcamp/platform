<script lang="ts">
	import CreateAuction from '$lib/components/forms/createAuction.svelte';
	import AuctionLink from '$lib/components/auctionLink.svelte';
	import { serverState } from '$lib/api.svelte';
</script>

<div class="mr-auto flex flex-col gap-8 pt-8">
	<h1 class="text-xl font-bold">Auction</h1>
	<CreateAuction />

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each Array.from(serverState.auctions.values()).sort((a, b) => (a.transactionTimestamp.seconds ?? 0) - (b.transactionTimestamp.seconds ?? 0)) as auction}
			<AuctionLink {auction} />
		{/each}
	</div>
</div>
