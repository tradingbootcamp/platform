<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { websocket_api } from 'schema-js';
	import type { Readable } from 'svelte/store';

	export let market: Readable<websocket_api.IMarket>;
	$: marketIdParam = Number($page.params.id);
	$: closed = $market.closed;
</script>

<li class:order-2={!closed} class:order-4={closed}>
	{#if marketIdParam === $market.id}
		<Button class="text-lg" variant="link" disabled>
			{$market.name}
		</Button>
	{:else}
		<a href="/market/{$market.id}">
			<Button class="text-lg" variant="link">
				{$market.name}
			</Button>
		</a>
	{/if}
</li>
