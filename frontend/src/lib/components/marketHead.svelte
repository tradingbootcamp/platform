<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { accountName, sendClientMessage } from '$lib/api.svelte';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import { HistoryIcon, LineChartIcon } from 'lucide-svelte';

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
			<HistoryIcon />
		</Toggle>
		<Toggle bind:pressed={showChart} variant="outline" class="hidden md:block">
			<LineChartIcon />
		</Toggle>
	</div>
</div>

{#if marketDefinition.closed}
	<p>Market settled to <em>{marketDefinition.closed.settlePrice}</em></p>
{/if}
