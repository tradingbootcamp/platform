<script lang="ts">
	import SelectMarket from '$lib/components/selectMarket.svelte';

	let { children } = $props();
</script>

<div class="w-full py-8">
	<SelectMarket />

	{@render children()}
</div>
