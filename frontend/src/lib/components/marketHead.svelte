<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { accountName, sendClientMessage } from '$lib/api.svelte';
	import { Button } from '$lib/components/ui/button';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import { useStarredMarkets } from '$lib/starredMarkets.svelte';
	import { cn } from '$lib/utils';
	import { History, LineChart } from '@lucide/svelte/icons';
	import Star from '@lucide/svelte/icons/star';

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
</script>

<div class="md:flex md:justify-between">
	<div class="mb-4">
		<p class="mt-2 text-xl">{marketDefinition.description}</p>
		<div class="md:flex md:gap-4">
			<p class="mt-2 text-sm italic">
				Created by {accountName(marketDefinition.ownerId)}{#if marketDefinition.open}<span>
						, Settles {marketDefinition.minSettlement} - {marketDefinition.maxSettlement}
					</span>
				{/if}
			</p>
		</div>
	</div>
	<div class="flex items-start gap-2">
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

{#if marketDefinition.closed}
	<p>Market settled to <em>{marketDefinition.closed.settlePrice}</em></p>
{/if}
