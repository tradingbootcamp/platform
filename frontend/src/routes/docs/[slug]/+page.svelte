<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import { goto } from '$app/navigation';
	import { marked } from 'marked';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	// Configure marked: run synchronously and strip internal .md links (render as plain text)
	const renderer = new marked.Renderer();
	renderer.link = ({ href, text }) => {
		if (href && href.endsWith('.md')) {
			return text; // Just return the text, no link
		}
		return `<a href="${href}">${text}</a>`;
	};
	marked.use({ renderer, async: false });

	// Import all markdown files at build time
	import accountsMd from '../../../../../docs/accounts.md?raw';
	import architectureMd from '../../../../../docs/architecture.md?raw';
	import auctionsMd from '../../../../../docs/auctions.md?raw';
	import orderMatchingMd from '../../../../../docs/order-matching.md?raw';
	import sudoMd from '../../../../../docs/sudo.md?raw';
	import visibilityMd from '../../../../../docs/visibility.md?raw';
	import websocketProtocolMd from '../../../../../docs/websocket-protocol.md?raw';

	const docsMap: Record<string, { content: string; title: string }> = {
		accounts: { content: accountsMd, title: 'Account System' },
		architecture: { content: architectureMd, title: 'Architecture' },
		auctions: { content: auctionsMd, title: 'Auctions' },
		'order-matching': { content: orderMatchingMd, title: 'Order Matching' },
		sudo: { content: sudoMd, title: 'Sudo & Admin' },
		visibility: { content: visibilityMd, title: 'Visibility' },
		'websocket-protocol': { content: websocketProtocolMd, title: 'WebSocket Protocol' }
	};

	// Redirect non-admins away
	$effect(() => {
		if (serverState.actingAs && !serverState.isAdmin) {
			goto('/home');
		}
	});

	let slug = $derived($page.params.slug);
	let doc = $derived(docsMap[slug]);
	let renderedContent = $derived(doc ? (marked(doc.content) as string) : '');
</script>

{#if serverState.isAdmin}
	<div class="flex flex-col gap-6 py-8">
		<div>
			<a
				href="/docs"
				class="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="size-4" />
				Back to Documentation
			</a>
		</div>

		{#if doc}
			<article class="prose prose-neutral dark:prose-invert max-w-none">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- Rendering trusted markdown from bundled docs -->
				{@html renderedContent}
			</article>
		{:else}
			<div class="flex flex-col items-center justify-center gap-4 py-16">
				<p class="text-muted-foreground">Document not found.</p>
				<a href="/docs" class="text-primary hover:underline">Back to Documentation</a>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex flex-col items-center justify-center gap-4 py-16">
		<p class="text-muted-foreground">Admin access required to view documentation.</p>
	</div>
{/if}

<style>
	:global(.prose) {
		@apply text-foreground;
	}
	:global(.prose h1) {
		@apply mb-4 mt-0 text-2xl font-bold;
	}
	:global(.prose h2) {
		@apply mb-3 mt-6 text-xl font-semibold;
	}
	:global(.prose h3) {
		@apply mb-2 mt-4 text-lg font-semibold;
	}
	:global(.prose p) {
		@apply mb-4;
	}
	:global(.prose ul) {
		@apply mb-4 list-disc pl-6;
	}
	:global(.prose ol) {
		@apply mb-4 list-decimal pl-6;
	}
	:global(.prose li) {
		@apply mb-1;
	}
	:global(.prose code) {
		@apply rounded bg-muted px-1.5 py-0.5 text-sm;
	}
	:global(.prose pre) {
		@apply mb-4 overflow-x-auto rounded-lg bg-muted p-4;
	}
	:global(.prose pre code) {
		@apply bg-transparent p-0;
	}
	:global(.prose a) {
		@apply text-primary hover:underline;
	}
	:global(.prose table) {
		@apply mb-4 w-full border-collapse;
	}
	:global(.prose th) {
		@apply border border-border bg-muted px-3 py-2 text-left font-semibold;
	}
	:global(.prose td) {
		@apply border border-border px-3 py-2;
	}
	:global(.prose blockquote) {
		@apply mb-4 border-l-4 border-border pl-4 italic text-muted-foreground;
	}
	:global(.prose hr) {
		@apply my-6 border-border;
	}
	:global(.prose strong) {
		@apply font-semibold;
	}
</style>
