<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { goto } from '$app/navigation';
	import FileText from '@lucide/svelte/icons/file-text';

	// Redirect non-admins away
	$effect(() => {
		if (serverState.actingAs && !serverState.isAdmin) {
			goto('/home');
		}
	});

	const docs = [
		{
			slug: 'accounts',
			title: 'Account System',
			description: 'User accounts, alt accounts, ownership/sharing, portfolios, and transfers'
		},
		{
			slug: 'architecture',
			title: 'Architecture',
			description: 'System architecture and component overview'
		},
		{
			slug: 'auctions',
			title: 'Auctions',
			description: 'Auction system, buy-it-now, and auction settlement'
		},
		{
			slug: 'order-matching',
			title: 'Order Matching',
			description: 'Orders, order book, trade execution, fills, and price-time priority'
		},
		{
			slug: 'sudo',
			title: 'Sudo & Admin',
			description: 'Admin permissions, sudo mode, rate limits, and admin-only operations'
		},
		{
			slug: 'visibility',
			title: 'Visibility',
			description: 'Market visibility restrictions and account ID hiding'
		},
		{
			slug: 'websocket-protocol',
			title: 'WebSocket Protocol',
			description: 'Client-server communication, message types, and request/response patterns'
		}
	];
</script>

{#if serverState.isAdmin}
	<div class="flex flex-col gap-6 py-8">
		<div>
			<h1 class="text-2xl font-bold">Documentation</h1>
			<p class="text-muted-foreground">Internal documentation for the trading platform</p>
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			{#each docs as doc}
				<a
					href="/docs/{doc.slug}"
					class="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
				>
					<FileText class="mt-1 size-5 shrink-0 text-muted-foreground" />
					<div>
						<h2 class="font-semibold">{doc.title}</h2>
						<p class="text-sm text-muted-foreground">{doc.description}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center gap-4 py-16">
		<p class="text-muted-foreground">Admin access required to view documentation.</p>
	</div>
{/if}
