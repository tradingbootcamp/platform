<script lang="ts">
	import CreateAuction from '$lib/components/forms/createAuction.svelte';
	import AuctionLink from '$lib/components/auctionLink.svelte';
	import { serverState } from '$lib/api.svelte';
</script>

<div class="mr-auto flex flex-col gap-8 pt-8">
	<h1 class="text-xl font-bold">Auction</h1>
	<CreateAuction />
	<!-- .sort((a, b) => (a.definition?.transactionTimestamp ?? 0) - (b.definition?.transactionTimestamp ?? 0)) -->
	{#each Array.from(serverState.auctions.values()) as auction}
		<AuctionLink market={auction} />
	{/each}
</div>
