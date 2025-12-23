<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import Redeem from '$lib/components/forms/redeem.svelte';
	import SettleMarket from '$lib/components/forms/settleMarket.svelte';
	import SelectMarket from '$lib/components/selectMarket.svelte';
	import { Button } from '$lib/components/ui/button';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import { useStarredMarkets, usePinnedMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn } from '$lib/utils';
	import { History, LineChart, Pi } from '@lucide/svelte/icons';
	import Star from '@lucide/svelte/icons/star';
	import Pin from '@lucide/svelte/icons/pin';
	import { kinde } from '$lib/auth.svelte';

	let {
		marketData,
		showChart = $bindable(),
		displayTransactionIdBindable = $bindable(),
		maxTransactionId,
		canPlaceOrders = false,
		isRedeemable = false
	} = $props<{
		marketData: MarketData;
		showChart: boolean;
		displayTransactionIdBindable: number[];
		maxTransactionId: number;
		canPlaceOrders?: boolean;
		isRedeemable?: boolean;
	}>();

	let marketDefinition = $derived(marketData.definition);
	let id = $derived(marketDefinition.id);

	const { isStarred, toggleStarred } = useStarredMarkets();
	const { isPinned, togglePinned } = usePinnedMarkets();
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
		<div class="flex items-center gap-2 whitespace-nowrap">
			<SelectMarket />
			{#if serverState.isAdmin || isPinned(id)}
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground h-9 w-9 hover:bg-transparent focus:bg-transparent"
					onclick={() => togglePinned(id)}
					disabled={!serverState.isAdmin}
				>
					<Pin
						class={cn(
							'h-4 w-4',
							isPinned(id)
								? serverState.isAdmin
									? 'fill-blue-400 text-blue-400 hover:fill-blue-300 hover:text-blue-300'
									: 'fill-gray-400 text-gray-400'  // Greyed out for non-admins
								: 'hover:text-primary hover:fill-yellow-100'
						)}
					/>
					<span class="sr-only">Pin Market</span>
				</Button>
			{/if}
			<Button
				variant="ghost"
				size="icon"
				class="text-muted-foreground h-9 w-9 hover:bg-transparent focus:bg-transparent"
				onclick={() => toggleStarred(id)}
			>
				<Star
					class={cn(
						'h-4 w-4',
						isStarred(id)
							? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-300 hover:text-yellow-300'
							: 'hover:text-primary hover:fill-yellow-100'
					)}
				/>
				<span class="sr-only">Star Market</span>
			</Button>
		</div>
		<div class="flex flex-wrap items-center gap-2 md:justify-end">
			{#if marketDefinition.closed}
				<p class="text-sm text-muted-foreground">
					Settle Price: {marketDefinition.closed.settlePrice}
				</p>
			{/if}
			{#if canPlaceOrders && isRedeemable}
				<div class="mr-4">
					<Redeem marketId={id} />
				</div>
			{/if}
			{#if canPlaceOrders && marketDefinition.ownerId === serverState.userId}
				<div class="mr-4">
					<SettleMarket
						{id}
						name={marketDefinition.name}
						minSettlement={marketDefinition.minSettlement}
						maxSettlement={marketDefinition.maxSettlement}
					/>
				</div>
			{/if}
			<Toggle
				onclick={() => {
					if (displayTransactionIdBindable.length) {
						displayTransactionIdBindable = [];
					} else {
						displayTransactionIdBindable = [maxTransactionId];
						if (!marketData.hasFullOrderHistory) {
							sendClientMessage({ getFullOrderHistory: { marketId: id } });
						}
					}
				}}
				variant="outline"
			>
				<History />
			</Toggle>
			<Toggle bind:pressed={showChart} variant="outline" class="hidden md:block">
				<LineChart />
			</Toggle>
		</div>
	</div>
	<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
		<p class="text-sm">
			Created by {accountName(marketDefinition.ownerId)}
			{#if marketDefinition.description}
				<span class="text-muted-foreground"> — {marketDefinition.description}</span>
			{/if}
		</p>
		<p class="text-sm text-muted-foreground">
			Settles {marketDefinition.minSettlement} - {marketDefinition.maxSettlement}
		</p>
	</div>
</div>
