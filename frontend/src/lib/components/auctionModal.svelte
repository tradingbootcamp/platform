<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import logo from '$lib/assets/logo.svg';
	import BuyAuction from '$lib/components/forms/buyAuction.svelte';
	import DeleteAuction from '$lib/components/forms/deleteAuction.svelte';
	import EditAuction from '$lib/components/forms/editAuction.svelte';
	import SettleAuction from '$lib/components/forms/settleAuction.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { websocket_api } from 'schema-js';
	import { PUBLIC_SERVER_URL } from '$env/static/public';

	interface Props {
		auction: websocket_api.IAuction | null;
		close: () => void;
	}

	let { auction, close }: Props = $props();

	let open = $derived(auction !== null);

	let canDelete = $derived(
		auction &&
			((serverState.isAdmin && serverState.sudoEnabled) || auction.ownerId === serverState.userId)
	);
	let canEdit = $derived(
		auction &&
			((serverState.isAdmin && serverState.sudoEnabled) ||
				auction.ownerId === serverState.actingAs) &&
			(!auction.closed || (serverState.isAdmin && serverState.sudoEnabled))
	);
	let canBuy = $derived(
		auction &&
			auction.binPrice !== null &&
			auction.binPrice !== undefined &&
			!auction.closed &&
			auction.ownerId !== serverState.actingAs
	);
	let isSettled = $derived(auction && Boolean(auction.closed));
	let isBuyer = $derived(auction && auction.buyerId === serverState.actingAs);
	let buyerId = $derived(auction?.buyerId);
	let isOwner = $derived(auction && auction.ownerId === serverState.actingAs);

	// Parse description to separate main content from contact info
	let { mainDescription, contactInfo } = $derived.by(() => {
		const description = auction?.description || '';
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

	function handleOpenChange(open: boolean) {
		if (!open) {
			close();
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-h-[90vh] max-w-lg overflow-y-auto">
		{#if auction}
			<Dialog.Header>
				<Dialog.Title>{auction.name?.replace('[AUCTION] ', '')}</Dialog.Title>
				<Dialog.Description>{accountName(auction.ownerId) ?? 'Unknown'}</Dialog.Description>
			</Dialog.Header>

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
				<p class="mb-2 text-lg font-semibold text-green-600">
					Buy It Now: {auction.binPrice} clips
				</p>
			{/if}

			<img
				src={auction.imageUrl == '/images/'
					? logo
					: PUBLIC_SERVER_URL.replace('wss', 'https').replace('ws', 'http') + auction.imageUrl}
				alt="Listing"
				class="mb-4 max-h-[50vh] w-full rounded object-contain"
			/>

			<p class="whitespace-pre-wrap text-sm text-card-foreground">{mainDescription}</p>

			{#if contactInfo && (isBuyer || isOwner)}
				<p class="mt-4 whitespace-pre-wrap text-sm text-card-foreground">{contactInfo}</p>
			{/if}

			{#if canEdit}
				<hr class="mx-4 my-6 border-t border-border" />
				<EditAuction {auction} {close} />
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

			{#if canDelete && ((serverState.isAdmin && serverState.sudoEnabled) || !isSettled)}
				<hr class="mx-4 my-6 border-t border-border" />
				<DeleteAuction id={auction.id} name={auction.name} {close} />
			{/if}

			{#if serverState.isAdmin && serverState.sudoEnabled && !isSettled}
				<hr class="mx-4 my-6 border-t-4 border-border" />
				<SettleAuction id={auction.id} name={auction.name} {close} />
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
