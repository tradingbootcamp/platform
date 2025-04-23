<script lang="ts">
	export let auction;
	export let close;
	import { accountName } from '$lib/api.svelte';
	import logo from '$lib/assets/logo.svg';
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
	<div class="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
		<button class="absolute right-2 top-2 text-gray-500 hover:text-black" on:click={close}
			>✖</button
		>
		<h2 class="mb-1 text-xl font-bold">{auction.name?.replace('[AUCTION] ', '')}</h2>
		<p class="mb-2 text-sm text-gray-600">{accountName(auction.ownerId) ?? 'Unknown'}</p>

		<img
			src={auction.imageUrl ?? logo}
			alt="Auction image"
			class="mb-4 max-h-[400px] w-full rounded border object-contain"
		/>

		<p class="text-sm text-gray-800">{auction.description}</p>
	</div>
</div>
