<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { websocket_api } from 'schema-js';
	import type { Readable } from 'svelte/store';
	import { Star } from 'lucide-svelte';

	export let market: Readable<websocket_api.IMarket>;
	$: marketIdParam = Number($page.params.id);
	$: closed = $market.closed;

	let starred = localStorage.getItem(`is_starred_${Number($market.id)}`) === 'true';

	function handleStarClick() {
		localStorage.setItem(`is_starred_${Number($market.id)}`, !starred ? 'true' : 'false');
		starred = !starred;
	}

	let isHovering = false;
</script>

<li
	class:order-2={!closed && starred}
	class:order-3={!closed && !starred}
	class:order-5={closed && starred}
	class:order-6={closed && !starred}
	class="flex items-center gap-2"
>
	<button
		on:click={handleStarClick}
		on:mouseenter={() => (isHovering = true)}
		on:mouseleave={() => (isHovering = false)}
		class="mt-1 inline rounded-full p-1 focus:outline-none"
		aria-label={starred ? 'Unstar market' : 'Star market'}
	>
		<Star
			color={starred || isHovering ? 'gold' : 'slategray'}
			fill={starred ? (isHovering ? 'none' : 'gold') : 'none'}
			size="20"
		/>
	</button>

	{#if marketIdParam === $market.id}
		<span>
			<Button
				class="inline w-full whitespace-normal px-0 text-start text-lg"
				variant="link"
				disabled
			>
				{$market.name}
			</Button>
		</span>
	{:else}
		<a href="/market/{$market.id}">
			<Button class="inline whitespace-normal px-0 text-start text-lg" variant="link">
				{$market.name}
			</Button>
		</a>
	{/if}
</li>
