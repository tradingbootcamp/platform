<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { websocket_api } from 'schema-js';
	import type { Readable } from 'svelte/store';
	import { writable } from 'svelte/store';
	import { Star } from 'lucide-svelte';

	export let market: Readable<websocket_api.IMarket>;
	$: marketIdParam = Number($page.params.id);
	$: closed = $market.closed;

	const starredStore = writable(
		localStorage.getItem(`is_starred_${Number($market.id)}`) === 'true'
	);
	$: starred = $starredStore;

	function handleStarClick() {
		starredStore.update((currentValue) => {
			const newValue = !currentValue;
			localStorage.setItem(`is_starred_${Number($market.id)}`, newValue ? 'true' : 'false');
			return newValue;
		});
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
	{#if marketIdParam === $market.id}
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
		<Button class="inline w-full whitespace-normal px-0 text-start text-lg" variant="link" disabled>
			{$market.name}
		</Button>
	{:else}
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
		<a href="/market/{$market.id}">
			<Button class="inline whitespace-normal px-0 text-start text-lg" variant="link">
				{$market.name}
			</Button>
		</a>
	{/if}
</li>
