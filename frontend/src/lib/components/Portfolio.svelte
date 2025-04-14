<script lang="ts">
	import type { websocket_api } from 'schema-js';
	import * as Table from '$lib/components/ui/table';
	import MarketName from '../../routes/marketName.svelte';
	import { serverState } from '$lib/api.svelte';
	import { accountName } from '$lib/api.svelte';

	export let portfolio: websocket_api.IPortfolio;
</script>

<div class="flex flex-col gap-4 rounded-lg border p-4">
	<h2 class="text-lg font-semibold">{accountName(portfolio.accountId)}</h2>
	<p>
		Total Balance: 📎 {new Intl.NumberFormat(undefined, {
			maximumFractionDigits: 4
		}).format(portfolio.totalBalance ?? 0)}
	</p>
	<p>
		Available Balance: 📎 {new Intl.NumberFormat(undefined, {
			maximumFractionDigits: 4
		}).format(portfolio.availableBalance ?? 0)}
	</p>
	{#if portfolio.marketExposures?.length}
		<p class="text-lg">Exposures:</p>
		<Table.Root class="hidden text-center md:block">
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-center">Market</Table.Head>
					<Table.Head class="text-center">Position</Table.Head>
					<Table.Head class="text-center">Total Bid Size</Table.Head>
					<Table.Head class="text-center">Total Offer Size</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each portfolio.marketExposures as { marketId, position, totalBidSize, totalOfferSize } (marketId)}
					<Table.Row>
						<Table.Cell>
							<MarketName market={serverState.markets.get(marketId)?.definition} />
						</Table.Cell>
						<Table.Cell>
							{new Intl.NumberFormat(undefined, {
								maximumFractionDigits: 2
							}).format(position ?? 0)}
						</Table.Cell>
						<Table.Cell>
							{new Intl.NumberFormat(undefined, {
								maximumFractionDigits: 2
							}).format(totalBidSize ?? 0)}
						</Table.Cell>
						<Table.Cell>
							{new Intl.NumberFormat(undefined, {
								maximumFractionDigits: 2
							}).format(totalOfferSize ?? 0)}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</div>
