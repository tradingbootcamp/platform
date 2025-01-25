<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { accountName, sendClientMessage } from '$lib/api.svelte';
	import * as Table from '$lib/components/ui/table';
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

<div class="mb-4 flex justify-between">
	<div class="mb-4">
		<h1 class="text-2xl font-bold">{marketDefinition.name}</h1>
		<p class="mt-2 text-xl">{marketDefinition.description}</p>
		<p class="mt-2 text-sm italic">
			Created by {accountName(marketDefinition.ownerId)}
		</p>
	</div>
	<div>
		<Table.Root class="w-auto text-center font-bold">
			<Table.Header>
				<Table.Row>
					<Table.Head>
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
					</Table.Head>
					<Table.Head>
						<Toggle bind:pressed={showChart} variant="outline">
							<LineChartIcon />
						</Toggle>
					</Table.Head>
					<Table.Head class="text-center">Min Settlement</Table.Head>
					<Table.Head class="text-center">Max Settlement</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell class="p-2"></Table.Cell>
					<Table.Cell class="p-2"></Table.Cell>
					<Table.Cell class="p-2">{marketDefinition.minSettlement}</Table.Cell>
					<Table.Cell class="p-2">{marketDefinition.maxSettlement}</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
</div>

{#if marketDefinition.closed}
	<p>Market settled to <em>{marketDefinition.closed.settlePrice}</em></p>
{/if}
