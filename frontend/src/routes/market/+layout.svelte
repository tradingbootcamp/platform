<script lang="ts">
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import SelectMarket from '$lib/components/selectMarket.svelte';

	let { children } = $props();

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
	let title = $derived(marketData?.definition.name || 'Markets');
</script>

<div class="container mx-auto py-8">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-3xl font-bold">{title}</h1>
		<div class="mt-4 sm:mt-0">
			<SelectMarket />
		</div>
	</div>

	{@render children()}
</div>
