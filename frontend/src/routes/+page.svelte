<script lang="ts">
	import { serverState, accountName } from '$lib/api.svelte';
	import * as Table from '$lib/components/ui/table';
	import MarketName from './marketName.svelte';

	// Add helper function for portfolio display
	function formatBalance(value: number | undefined | null) {
		return new Intl.NumberFormat(undefined, {
			maximumFractionDigits: 4
		}).format(value ?? 0);
	}
</script>

<div class="pt-8">
	<h1 class="mb-8 text-xl font-bold">Welcome to Trading Tools Day!</h1>

	<!-- Current Portfolio Section -->
	{#if serverState.portfolio}
		<div class="mb-12">
			<h2 class="mb-4 text-lg font-semibold">Current Portfolio</h2>
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
						{#each serverState.portfolio.marketExposures as { marketId, position, totalBidSize, totalOfferSize } (marketId)}
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
		</div>
	{/if}

	<!-- All Portfolios Section -->
	{#if serverState.portfolios.size > 0}
		<div class="mb-12">
			<h2 class="mb-4 text-lg font-semibold">All Portfolios</h2>
			<Table.Root class="w-full">
				<Table.Header>
					<Table.Row>
						<Table.Head>Account</Table.Head>
						<Table.Head class="text-right">Total Balance</Table.Head>
						<Table.Head class="text-right">Available Balance</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each Array.from(serverState.portfolios.entries()) as [accountId, portfolio]}
						<Table.Row>
							<Table.Cell>{accountName(accountId)}</Table.Cell>
							<Table.Cell class="text-right">📎 {formatBalance(portfolio.totalBalance)}</Table.Cell>
							<Table.Cell class="text-right"
								>📎 {formatBalance(portfolio.availableBalance)}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}

	<!-- All Accounts Section -->
	{#if serverState.accounts.size > 0}
		<div class="mb-12">
			<h2 class="mb-4 text-lg font-semibold">All Accounts</h2>
			<Table.Root class="w-full">
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Type</Table.Head>
						<Table.Head>ID</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each Array.from(serverState.accounts.entries()) as [id, account]}
						<Table.Row>
							<Table.Cell>{account.name}</Table.Cell>
							<Table.Cell>{account.isUser ? 'User' : 'Alt'}</Table.Cell>
							<Table.Cell>{id}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
