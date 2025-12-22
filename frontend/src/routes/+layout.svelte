<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import AppSideBar from '$lib/components/appSideBar.svelte';
	import Theme from '$lib/components/theme.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import { computePortfolioMetrics } from '$lib/portfolioMetrics';
	import { cn } from '$lib/utils';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();
	const marketsVersion = $derived(
		[...serverState.markets.values()]
			.map(
				(m) =>
					`${m.definition.id}:${m.orders.length}:${m.trades.length}:${m.hasFullTradeHistory}:${m.hasFullOrderHistory}:${
						m.trades.at(-1)?.transactionId ?? 0
					}`
			)
			.join('|')
	);
	let portfolioMetrics = $derived(
		computePortfolioMetrics(
			serverState.portfolio,
			serverState.markets,
			serverState.actingAs,
			marketsVersion
		)
	);

	onMount(async () => {
		if (!(await kinde.isAuthenticated())) {
			kinde.login();
		}
	});
</script>

<ModeWatcher />
<Toaster closeButton duration={8000} richColors />
<Sidebar.Provider>
	<AppSideBar />
	<div class="flex min-h-screen w-full flex-col overflow-x-hidden">
		<div class="bg-background w-full border-b-2">
			<header
				class={cn(
					'w-full',
					serverState.actingAs && serverState.actingAs !== serverState.userId
						? 'bg-green-700/30'
						: 'bg-primary/30'
				)}
			>
				<nav class="flex items-center justify-between gap-4 py-4 px-4">
					<ul class="flex items-center pr-4">
						<li>
							<Sidebar.Trigger />
						</li>
					</ul>
					{#if serverState.portfolio}
						<ul class="flex flex-col items-center gap-2 md:flex-row md:gap-8">
							<li class="text-lg">
								<span>
									<span class="hidden md:inline">Available Balance:{' '}</span>📎 {new Intl.NumberFormat(
										undefined,
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										}
									).format(serverState.portfolio.availableBalance ?? 0)}
								</span>
							</li>
							<li class="text-lg">
								<span>
									<span class="hidden md:inline">Mark to Market:{' '}</span>📎
									{new Intl.NumberFormat(undefined, {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									}).format(portfolioMetrics.totals.markToMarket)}
								</span>
							</li>
						</ul>
					{/if}
					<ul>
						<li>
							<Theme />
						</li>
					</ul>
				</nav>
			</header>
		</div>
		<main class="flex w-full flex-grow overflow-x-auto">
			<div class="flex flex-grow gap-8 px-4">
				{@render children()}
			</div>
		</main>
	</div>
</Sidebar.Provider>
