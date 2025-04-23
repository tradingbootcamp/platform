<script lang="ts">
	export let auction;
	export let close: () => void;
	import { accountName, serverState } from '$lib/api.svelte';
	import logo from '$lib/assets/logo.svg';
	import SettleAuction from '$lib/components/forms/settleAuction.svelte';
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
	<div class="relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
		<button class="absolute right-2 top-2 text-muted-foreground hover:text-foreground" on:click={close}
			>✖</button
		>
		<h2 class="mb-1 text-xl font-bold text-card-foreground">{auction.name?.replace('[AUCTION] ', '')}</h2>
		<p class="mb-2 text-sm text-muted-foreground">{accountName(auction.ownerId) ?? 'Unknown'}</p>

		<img
			src={auction.imageUrl ?? logo}
			alt="Auction image"
			class="mb-4 max-h-[400px] w-full rounded border object-contain"
		/>

		<p class="text-sm text-card-foreground">{auction.description}</p>

		{#if serverState.isAdmin}
			<hr class="mx-4 my-6 border-t-4 border-border" />
			<SettleAuction id={auction.id} name={auction.name} {close} />
		{/if}
	</div>
</div>
