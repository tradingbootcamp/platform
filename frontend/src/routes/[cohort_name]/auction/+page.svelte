<script lang="ts">
	import CreateAuction from '$lib/components/forms/createAuction.svelte';
	import AuctionLink from '$lib/components/auctionLink.svelte';
	import AuctionModal from '$lib/components/auctionModal.svelte';
	import { serverState } from '$lib/api.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { onMount } from 'svelte';
	import type { websocket_api } from 'schema-js';

	let selectedAuction: websocket_api.IAuction | null = $state(null);
	let myListingsOnly = $state(false);
	let view: 'all' | 'won' = $state('all');

	// Collapse sidebar on this page, restore previous state on leave
	const sidebar = useSidebar();
	onMount(() => {
		const wasOpen = sidebar.open;
		sidebar.setOpen(false);
		return () => {
			sidebar.setOpen(wasOpen);
		};
	});

	// Close the modal if the selected auction is deleted
	$effect(() => {
		if (selectedAuction && !serverState.auctions.has(selectedAuction.id!)) {
			selectedAuction = null;
		}
	});

	let wonAuctions = $derived(
		Array.from(serverState.auctions.values()).filter(
			(a) =>
				a.buyerId === serverState.actingAs ||
				(a.buyers ?? []).some((b) => b.accountId === serverState.actingAs)
		)
	);

	// Drop out of won view if there are no longer any won items (e.g. after switching account)
	$effect(() => {
		if (view === 'won' && wonAuctions.length === 0) {
			view = 'all';
		}
	});

	let listingsAuctions = $derived.by(() => {
		const auctions = myListingsOnly
			? Array.from(serverState.auctions.values()).filter((a) => a.ownerId === serverState.actingAs)
			: Array.from(serverState.auctions.values());
		return auctions.sort(
			(a, b) => (a.transactionTimestamp?.seconds ?? 0) - (b.transactionTimestamp?.seconds ?? 0)
		);
	});

	let sortedWonAuctions = $derived(
		[...wonAuctions].sort(
			(a, b) => (a.transactionTimestamp?.seconds ?? 0) - (b.transactionTimestamp?.seconds ?? 0)
		)
	);
</script>

<div class="mr-auto flex flex-col gap-6 pt-8">
	<div class="flex items-center justify-between gap-4">
		<h1 class="text-xl font-bold">Auction</h1>
		{#if serverState.auctionEnabled}
			<CreateAuction />
		{/if}
	</div>

	{#if !serverState.auctionEnabled}
		<p class="text-sm text-muted-foreground">
			Auctions aren't enabled for this cohort.
		</p>
	{:else}
		<Tabs.Root value={view} onValueChange={(v) => (view = v as 'all' | 'won')}>
		<Tabs.List class={wonAuctions.length > 0 ? 'grid w-fit grid-cols-2' : 'w-fit'}>
			<Tabs.Trigger value="all">Listings</Tabs.Trigger>
			{#if wonAuctions.length > 0}
				<Tabs.Trigger value="won">Won Items ({wonAuctions.length})</Tabs.Trigger>
			{/if}
		</Tabs.List>

		<Tabs.Content value="all" class="flex flex-col gap-4">
			<div class="flex items-center gap-2">
				<Checkbox id="show-my-listings" bind:checked={myListingsOnly} />
				<Label for="show-my-listings" class="cursor-pointer text-sm font-normal">
					Show My Listings
				</Label>
			</div>
			{#if listingsAuctions.length === 0}
				<p class="text-sm text-muted-foreground">
					{myListingsOnly ? "You haven't posted any auctions." : 'No auctions yet.'}
				</p>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{#each listingsAuctions as auction (auction.id)}
						<AuctionLink {auction} on:open={(e) => (selectedAuction = e.detail.auction)} />
					{/each}
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="won">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each sortedWonAuctions as auction (auction.id)}
					<AuctionLink
						{auction}
						splitIndicator
						on:open={(e) => (selectedAuction = e.detail.auction)}
					/>
				{/each}
			</div>
		</Tabs.Content>
		</Tabs.Root>
	{/if}

	<AuctionModal auction={selectedAuction} close={() => (selectedAuction = null)} />
</div>
