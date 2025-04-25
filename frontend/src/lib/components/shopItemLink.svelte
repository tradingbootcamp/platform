<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import * as Card from '$lib/components/ui/card';

	let { item } = $props<{
		item: {
			id: string;
			name: string;
			description: string;
			price: number;
			imageUrl: string;
		};
	}>();

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('open', { item });
	}
</script>

<button
	class="w-full transition-transform hover:scale-105 focus:outline-none"
	onclick={handleClick}
>
	<Card.Root class="overflow-hidden">
		<div class="aspect-square w-full bg-muted">
			<img
				src={item.imageUrl}
				alt={item.name}
				class="h-full w-full object-cover"
				onerror={() => event.currentTarget.src = 'https://placehold.co/400x400'}
			/>
		</div>
		<Card.Content class="p-4">
			<h3 class="text-lg font-semibold">{item.name}</h3>
			<p class="text-sm text-muted-foreground">{item.description}</p>
			<p class="mt-2 text-right font-bold">📎 {item.price}</p>
		</Card.Content>
	</Card.Root>
</button>