<script lang="ts">
	import { kinde } from '$lib/auth';
	import CancelOrder from '$lib/components/forms/cancelOrder.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import CreateOrder from '$lib/components/forms/createOrder.svelte';
	import SettleMarket from '$lib/components/forms/settleMarket.svelte';
	import Market from '$lib/components/market.svelte';
	import Payments from '$lib/components/payments.svelte';
	import Portfolio from '$lib/components/portfolio.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { markets, sendClientMessage } from '$lib/server';

	const authenticate = async () => {
		const accessToken = await kinde.getToken();
		if (!accessToken) {
			console.log('no access token');
			return;
		}
		sendClientMessage({
			authenticate: {
				jwt: accessToken
			}
		});
	};
</script>

<main class="container">
	<Button class="my-8" on:click={authenticate}>Authenticate</Button>
	<div class="grid grid-cols-2 gap-12">
		<CreateMarket />
		<CreateOrder />
		<SettleMarket />
		<CancelOrder />
	</div>

	<Portfolio />

	<Payments />

	{#each Object.values($markets) as market}
		<Market {market} />
	{/each}
</main>
