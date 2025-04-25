<script lang="ts">
	import type { websocket_api } from 'schema-js';
	import ShopItemLink from '$lib/components/shopItemLink.svelte';
	import ShopItemModal from '$lib/components/shopItemModal.svelte';

	// Placeholder shop items data
	const shopItems = [
		{
			id: '1',
			name: 'Premium Account',
			description: 'Unlock premium features',
			price: 1000,
			imageUrl: '/placeholder.png'
		},
		{
			id: '2',
			name: 'Special Badge',
			description: 'Show off your status',
			price: 500,
			imageUrl: '/placeholder.png'
		},
		{
			id: '3',
			name: 'Custom Theme',
			description: 'Personalize your experience',
			price: 750,
			imageUrl: '/placeholder.png'
		}
	];

	let selectedItem: typeof shopItems[0] | null = null;
</script>

<div class="mr-auto flex flex-col gap-8 pt-8">
	<h1 class="text-xl font-bold">Shop</h1>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each shopItems as item}
			<ShopItemLink {item} on:open={(e) => (selectedItem = e.detail.item)} />
		{/each}
	</div>

	{#if selectedItem}
		<ShopItemModal item={selectedItem} close={() => (selectedItem = null)} />
	{/if}
</div>