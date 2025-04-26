<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
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
		maxTransactionId
	} = $props<{
		marketData: MarketData;
		showChart: boolean;
		displayTransactionIdBindable: number[];
		maxTransactionId: number;
	}>();

	let marketDefinition = $derived(marketData.definition);
	let id = $derived(marketDefinition.id);

	const { isStarred, toggleStarred } = useStarredMarkets();
	const { isPinned, togglePinned } = usePinnedMarkets();
</script>

<div class="md:flex md:justify-between">
	<div class="mb-4">
		<p class="mt-2 text-sm">{marketDefinition.description}</p>
		<div class="md:flex md:gap-4">
			<p class="mt-2 text-sm italic">
				Created by {accountName(marketDefinition.ownerId)}
			</p>
		</div>
	</div>
	<div class="flex items-start gap-4">
		{#if marketDefinition.open}
			<p class="text-sm text-muted-foreground mt-2">
				Settles {marketDefinition.minSettlement} - {marketDefinition.maxSettlement}
			</p>
		{/if}
		<div class="flex items-start gap-2">
			{#if serverState.isAdmin || isPinned(id)}
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground h-10 w-10 hover:bg-transparent focus:bg-transparent"
					onclick={() => togglePinned(id)}
					disabled={!serverState.isAdmin}
				>
					<Pin
						class={cn(
							'h-5 w-5',
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
				class="text-muted-foreground h-10 w-10 hover:bg-transparent focus:bg-transparent"
				onclick={() => toggleStarred(id)}
			>
				<Star
					class={cn(
						'h-5 w-5',
						isStarred(id)
							? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-300 hover:text-yellow-300'
							: 'hover:text-primary hover:fill-yellow-100'
					)}
				/>
				<span class="sr-only">Star Market</span>
			</Button>
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
</div>

{#if marketDefinition.closed}
	<p class="text-sm italic">Market settled to {marketDefinition.closed.settlePrice}</p>
{/if}
