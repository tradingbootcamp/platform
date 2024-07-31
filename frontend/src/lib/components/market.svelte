<script lang="ts">
	import { portfolio, sendClientMessage } from '$lib/api';
	import { user } from '$lib/auth';
	import { websocket_api } from 'schema-js';
	import CreateOrder from './forms/createOrder.svelte';
	import SettleMarket from './forms/settleMarket.svelte';
	import Button from './ui/button/button.svelte';

	export let market: websocket_api.IMarket;
	$: bids = (market.orders || []).filter((order) => order.side === websocket_api.Side.BID);
	$: bids.sort((a, b) => Number(b.price) - Number(a.price));
	$: offers = (market.orders || []).filter((order) => order.side === websocket_api.Side.OFFER);
	$: offers.sort((a, b) => Number(a.price) - Number(b.price));
	$: trades = market.trades?.toReversed() || [];
	$: position =
		$portfolio?.marketExposures?.find((exposure) => exposure.marketId === market.id)?.position || 0;

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
		<p>Position: {position}</p>
		<p>Min settlement: {market.minSettlement}</p>
		<p>Max settlement: {market.maxSettlement}</p>
		<CreateOrder marketId={market.id} />
		<div class="flex gap-12">
			<div>
				<h3>Bids:</h3>
				{#each bids as order (order.id)}
					<div class="my-2 flex items-center gap-4">
						{#if order.ownerId === $user?.id}
							<Button
								variant="destructive"
								class="h-8 w-8 rounded-2xl px-2"
								on:click={() => cancelOrder(order.id)}>X</Button
							>
						{:else}
							<div class="h-8 w-8 px-2"></div>
						{/if}
						<p class="min-w-20">price: {order.price}</p>
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
								class="h-8 w-8 rounded-2xl px-2"
								on:click={() => cancelOrder(order.id)}>X</Button
							>
						{:else}
							<div class="h-8 w-8 px-2"></div>
						{/if}
						<p class="min-w-20">price: {order.price}</p>
						<p>size: {order.size}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	<div>
		<h3>Trades:</h3>
		{#each trades as trade (trade.id)}
			<div class="my-2 flex items-center gap-4">
				<p class="min-w-20">price: {trade.price}</p>
				<p>size: {trade.size}</p>
			</div>
		{/each}
	</div>
	{#if market.ownerId === $user?.id && !market.closed}
		<div class="max-w-36">
			<SettleMarket marketId={market.id} />
		</div>
	{/if}
</div>
