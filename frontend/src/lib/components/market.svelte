<script lang="ts">
	import { sendClientMessage } from '$lib/api';
	import { user } from '$lib/auth';
	import { websocket_api } from 'schema-js';
	import CreateOrder from './forms/createOrder.svelte';
	import SettleMarket from './forms/settleMarket.svelte';
	import Button from './ui/button/button.svelte';

	export let market: websocket_api.IMarket;
	$: console.log(market.id);
	$: bids = (market.orders || []).filter((order) => order.side === websocket_api.Side.BID);
	$: bids.sort((a, b) => Number(b.price) - Number(a.price));
	$: offers = (market.orders || []).filter((order) => order.side === websocket_api.Side.OFFER);
	$: offers.sort((a, b) => Number(a.price) - Number(b.price));

	const cancelOrder = (id: number) => {
		sendClientMessage({ cancelOrder: { id } });
	};
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-2xl font-bold">{market.name}</h2>
	<p>{market.description}</p>
	{#if market.closed}
		<p>Market settled to: {market.closed.settlePrice}</p>
	{:else}
		<p>Min settlement: {market.minSettlement}</p>
		<p>Max settlement: {market.maxSettlement}</p>
	{/if}
	<CreateOrder marketId={market.id} />
	<div>
		<h3>Bids:</h3>
		{#each bids as order (order.id)}
			<div class="my-2 flex items-center gap-4">
				{#if order.ownerId === $user?.id}
					<Button
						variant="destructive"
						class="h-8 rounded-xl px-2"
						on:click={() => cancelOrder(order.id)}>X</Button
					>
				{/if}
				<p>price: {order.price}</p>
				<p>size: {order.size}</p>
			</div>
		{/each}
	</div>
	<div>
		<h3>Offers:</h3>
		{#each offers as order (order.id)}
			<div class="my-2 flex items-center gap-4">
				{#if order.ownerId === $user?.id}
					<Button
						variant="destructive"
						class="h-8 rounded-xl px-2"
						on:click={() => cancelOrder(order.id)}>X</Button
					>
				{/if}
				<p>price: {order.price}</p>
				<p>size: {order.size}</p>
			</div>
		{/each}
	</div>
	<div>
		<h3>Trades:</h3>
		{#each market.trades || [] as trade (trade.id)}
			<div class="my-2 flex items-center gap-4">
				<p>price: {trade.price}</p>
				<p>size: {trade.size}</p>
			</div>
		{/each}
	</div>
	{#if market.ownerId === $user?.id}
		<div class="max-w-36">
			<SettleMarket id={market.id} />
		</div>
	{/if}
</div>
