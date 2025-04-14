<script>
	import { serverState } from '$lib/api.svelte';
	import Portfolio from '$lib/components/Portfolio.svelte';
</script>

<div class="pt-8">
	<h1 class="mb-8 text-xl font-bold">Welcome to Tools Day!</h1>
	<div class="grid gap-6 md:grid-cols-2">
		{#each [...serverState.portfolios.values()] as portfolio (portfolio.accountId)}
			<Portfolio {portfolio} />
		{/each}
	</div>
</div>
