<script>
	import { serverState } from '$lib/api.svelte';
	import * as Table from '$lib/components/ui/table';
</script>

<div class="pt-8">
	<h1 class="mb-8 text-xl font-bold">Welcome to Trading Bootcamp!</h1>
	{#if serverState.portfolio}
		<div class="flex flex-col gap-4">
			<p class="text-lg">
				Total Balance: 📎 {new Intl.NumberFormat(undefined, {
					maximumFractionDigits: 4
				}).format(serverState.portfolio.totalBalance ?? 0)}
			</p>
			<p class="text-lg">
				Available Balance: 📎 {new Intl.NumberFormat(undefined, {
					maximumFractionDigits: 4
				}).format(serverState.portfolio.availableBalance ?? 0)}
			</p>
			{#if serverState.portfolio.marketExposures?.length}
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
						{#each serverState.portfolio.marketExposures as { marketId, position, totalBidSize, totalOfferSize } (marketId)}
							<Table.Row>
								<Table.Cell>
									{serverState.markets.get(marketId)?.definition.name || 'Unnamed Market'}
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
				<div class="md:hidden">
					{#each serverState.portfolio.marketExposures as { marketId, position, totalBidSize, totalOfferSize } (marketId)}
						<div class="flex flex-col gap-4 border-b-2">
							<div>
								<span class="font-bold">Market:</span>
								<span>{serverState.markets.get(marketId)?.definition.name || 'Unnamed Market'}</span
								>
							</div>
							<div>
								<span class="font-bold">Position:</span>
								<span
									>{new Intl.NumberFormat(undefined, {
										maximumFractionDigits: 2
									}).format(position ?? 0)}</span
								>
							</div>
							<div>
								<span class="font-bold">Total Bid Size:</span>
								<span
									>{new Intl.NumberFormat(undefined, {
										maximumFractionDigits: 2
									}).format(totalBidSize ?? 0)}</span
								>
							</div>
							<div>
								<span class="font-bold">Total Offer Size:</span>
								<span
									>{new Intl.NumberFormat(undefined, {
										maximumFractionDigits: 2
									}).format(totalOfferSize ?? 0)}</span
								>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
