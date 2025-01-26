<script>
	import { serverState } from '$lib/api.svelte';
	import * as Table from '$lib/components/ui/table';
	import MarketName from './marketName.svelte';
</script>

<div class="pt-8">
	<h1 class="mb-8 text-xl font-bold">Welcome to Trading Bootcamp!</h1>
	{#each [...serverState.portfolios] as [id, portfolio]}
		{#if portfolio}
			<div class="flex flex-col gap-4">
				<br />
				<h1 class="text-2xl text-blue-600">
					Account Name: {serverState.accounts.get(id)?.name ?? 'Unknown'}
				</h1>
				<p class="text-lg">
					Total Balance: 📎 {new Intl.NumberFormat(undefined, {
						maximumFractionDigits: 4
					}).format(portfolio.totalBalance ?? 0)}
				</p>
				<p class="text-lg">
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
					<div class="md:hidden">
						{#each portfolio.marketExposures as { marketId, position, totalBidSize, totalOfferSize } (marketId)}
							<div class="flex flex-col gap-4 border-b-2">
								<div>
									<span class="font-bold">Market:</span>
									<span><MarketName market={serverState.markets.get(marketId)?.definition} /></span>
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
	{/each}
</div>
