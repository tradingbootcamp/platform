<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import AppSideBar from '$lib/components/appSideBar.svelte';
	import { formatBalance } from '$lib/components/marketDataUtils';
	import Theme from '$lib/components/theme.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import { computePortfolioMetrics } from '$lib/portfolioMetrics';
	import { cn } from '$lib/utils';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
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

	const canDisableSudo = () => {
		if (!serverState.confirmAdmin) {
			return true;
		}
		if (!serverState.actingAs) {
			return true;
		}
		const currentUserId = serverState.userId;
		if (!currentUserId || serverState.actingAs === currentUserId) {
			return true;
		}
		const isOwnedByUser = (accountId: number) => {
			const portfolio = serverState.portfolios.get(accountId);
			if (!portfolio?.ownerCredits?.length) {
				return false;
			}
			if (portfolio.ownerCredits.some(({ ownerId }) => ownerId === currentUserId)) {
				return true;
			}
			for (const { ownerId } of portfolio.ownerCredits) {
				const parentPortfolio = serverState.portfolios.get(ownerId);
				if (parentPortfolio?.ownerCredits?.some(({ ownerId }) => ownerId === currentUserId)) {
					return true;
				}
			}
			return false;
		};
		return isOwnedByUser(serverState.actingAs);
	};
</script>

<ModeWatcher />
<Toaster closeButton duration={8000} richColors />
<Sidebar.Provider>
	<AppSideBar />
	<div class="flex min-h-screen w-full flex-col overflow-x-hidden">
		<div class="w-full border-b-2 bg-background">
			<header
				class={cn(
					'w-full',
					serverState.isAdmin && serverState.confirmAdmin
						? 'bg-red-700/40'
						: serverState.actingAs && serverState.actingAs !== serverState.userId
							? 'bg-green-700/30'
							: 'bg-primary/30'
				)}
			>
				<nav class="flex items-center justify-between gap-4 px-4 py-4">
					<ul class="flex items-center pr-4">
						<li>
							<Sidebar.Trigger />
						</li>
					</ul>
					{#if serverState.portfolio}
						<ul class="flex flex-col items-center gap-2 md:flex-row md:gap-8">
							<li class="text-lg">
								<span>
									<span class="hidden md:inline">Available Balance:{' '}</span>📎 {formatBalance(
										serverState.portfolio.availableBalance
									)}
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
					<ul class="flex items-center gap-2">
						{#if serverState.isAdmin}
							<li>
								<Button
									size="default"
									variant={serverState.confirmAdmin ? 'default' : 'red'}
									onclick={() => {
										if (!canDisableSudo()) {
											toast.error('Sudo required to keep acting as this account', {
												description: 'Switch accounts first, or keep sudo on.'
											});
											return;
										}
										serverState.confirmAdmin = !serverState.confirmAdmin;
									}}
								>
									{serverState.confirmAdmin ? 'disable sudo' : 'enable sudo'}
								</Button>
							</li>
						{/if}
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
