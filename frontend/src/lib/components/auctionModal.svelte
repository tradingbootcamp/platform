<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import logo from '$lib/assets/logo.svg';
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
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
	<div class="relative w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
		<button class="absolute right-2 top-2 text-muted-foreground hover:text-foreground" on:click={close}>
			<X class="size-6" />
			<span class="sr-only">Close</span>
		</button>
		<h2 class="mb-1 text-xl font-bold text-card-foreground">{auction.name?.replace('[AUCTION] ', '')}</h2>
		<p class="mb-2 text-sm text-muted-foreground">{accountName(auction.ownerId) ?? 'Unknown'}</p>

		<img
			src={auction.imageUrl == PUBLIC_SERVER_URL.replace("wss", "https").replace("ws", "http")+"/api/images/" ? logo : auction.imageUrl}
			alt="Auction"
			class="mb-4 w-full rounded object-contain max-h-[50vh]"
		/>

		<p class="text-sm text-card-foreground">{auction.description}</p>

		{#if canDelete}
			<hr class="mx-4 my-6 border-t border-border" />
			<DeleteAuction id={auction.id} name={auction.name} {close} />
		{/if}

		{#if serverState.isAdmin}
			<hr class="mx-4 my-6 border-t-4 border-border" />
			<SettleAuction id={auction.id} name={auction.name} {close} />
		{/if}
	</div>
</div>
