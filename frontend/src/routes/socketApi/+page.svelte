<script lang="ts">
	import { marked } from 'marked';
	import apiReferenceMd from '../../../../apiDemo/API_REFERENCE.md?raw';

	const renderer = new marked.Renderer();
	renderer.link = ({ href, text }) => {
		if (href && href.endsWith('.md')) {
			return text;
		}
		return `<a href="${href}">${text}</a>`;
	};
	marked.use({ renderer, async: false });

	const renderedContent = marked(apiReferenceMd) as string;
</script>

<svelte:head>
	<title>Socket API Reference</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-10">
	<article class="prose prose-neutral dark:prose-invert max-w-none">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Rendering trusted markdown bundled at build time -->
		{@html renderedContent}
	</article>
</div>

<style>
	:global(.prose) {
		@apply text-foreground;
	}
	:global(.prose h1) {
		@apply mb-4 mt-0 text-3xl font-bold;
	}
	:global(.prose h2) {
		@apply mb-3 mt-8 border-b border-border pb-2 text-2xl font-semibold;
	}
	:global(.prose h3) {
		@apply mb-2 mt-6 text-xl font-semibold;
	}
	:global(.prose h4) {
		@apply mb-2 mt-4 text-base font-semibold;
	}
	:global(.prose p) {
		@apply mb-4 leading-relaxed;
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
		@apply rounded bg-muted px-1.5 py-0.5 font-mono text-sm;
	}
	:global(.prose pre) {
		@apply mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed;
	}
	:global(.prose pre code) {
		@apply bg-transparent p-0;
	}
	:global(.prose a) {
		@apply text-primary hover:underline;
	}
	:global(.prose table) {
		@apply mb-4 w-full border-collapse text-sm;
	}
	:global(.prose th) {
		@apply border border-border bg-muted px-3 py-2 text-left font-semibold;
	}
	:global(.prose td) {
		@apply border border-border px-3 py-2 align-top;
	}
	:global(.prose blockquote) {
		@apply mb-4 border-l-4 border-border pl-4 italic text-muted-foreground;
	}
	:global(.prose hr) {
		@apply my-8 border-border;
	}
	:global(.prose strong) {
		@apply font-semibold;
	}
</style>
