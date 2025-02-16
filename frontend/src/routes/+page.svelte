<script>
	import { serverState, accountName } from '$lib/api.svelte';
	import * as Table from '$lib/components/ui/table';
	import MarketName from './marketName.svelte';
</script>

<div class="mx-auto max-w-7xl pt-8">
	<h1 class="mb-8 text-xl font-bold">Welcome to Tools day!</h1>

	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Account</Table.Head>
				<Table.Head class="text-right">Total Balance</Table.Head>
				<Table.Head class="text-right">Available Balance</Table.Head>
				<Table.Head class="text-right">Position</Table.Head>
				<Table.Head class="text-right">Total Bid</Table.Head>
				<Table.Head class="text-right">Total Offer</Table.Head>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			{#each [...serverState.portfolios.values()] as portfolio}
				{#if portfolio.marketExposures?.length}
					{#each portfolio.marketExposures as { marketId, position, totalBidSize, totalOfferSize }}
						<Table.Row>
							<!-- Show account name only for first row of each portfolio -->
							<Table.Cell>
								{#if portfolio.marketExposures[0] === portfolio.marketExposures.find((e) => e.marketId === marketId)}
									{accountName(portfolio.accountId)}
								{:else}
									<span class="text-muted-foreground"
										>└ <MarketName market={serverState.markets.get(marketId)?.definition} /></span
									>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								{#if portfolio.marketExposures[0] === portfolio.marketExposures.find((e) => e.marketId === marketId)}
									📎 {new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
										portfolio.totalBalance ?? 0
									)}
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								{#if portfolio.marketExposures[0] === portfolio.marketExposures.find((e) => e.marketId === marketId)}
									📎 {new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
										portfolio.availableBalance ?? 0
									)}
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
									position ?? 0
								)}
							</Table.Cell>
							<Table.Cell class="text-right">
								{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
									totalBidSize ?? 0
								)}
							</Table.Cell>
							<Table.Cell class="text-right">
								{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
									totalOfferSize ?? 0
								)}
							</Table.Cell>
						</Table.Row>
					{/each}
				{:else}
					<!-- Portfolio with no exposures -->
					<Table.Row>
						<Table.Cell>{accountName(portfolio.accountId)}</Table.Cell>
						<Table.Cell class="text-right">
							📎 {new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
								portfolio.totalBalance ?? 0
							)}
						</Table.Cell>
						<Table.Cell class="text-right">
							📎 {new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(
								portfolio.availableBalance ?? 0
							)}
						</Table.Cell>
						<Table.Cell class="text-right">0</Table.Cell>
						<Table.Cell class="text-right">0</Table.Cell>
						<Table.Cell class="text-right">0</Table.Cell>
					</Table.Row>
				{/if}
			{/each}
		</Table.Body>
	</Table.Root>
</div>
