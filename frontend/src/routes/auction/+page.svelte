<script lang="ts">
	import CreateAuction from '$lib/components/forms/createAuction.svelte';
	import AuctionLink from '$lib/components/auctionLink.svelte';
	import { serverState } from '$lib/api.svelte';
</script>

<div class="mr-auto flex flex-col gap-8 pt-8">
	<h1 class="text-xl font-bold">Auction</h1>
	<CreateAuction />

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each Array.from(serverState.markets.values())
			.filter((a) => a.definition?.name.startsWith('[AUCTION] '))
			.sort((a, b) => (a.definition?.transactionTimestamp ?? 0) - (b.definition?.transactionTimestamp ?? 0)) as market}
			<AuctionLink market={market.definition} />
		{/each}
	</div>
</div>
