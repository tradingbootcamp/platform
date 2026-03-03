<script lang="ts">
	import { page } from '$app/stores';
	import { connectToCohort, disconnectFromCohort, serverState } from '$lib/api.svelte';
	import { universeMode } from '$lib/universeMode.svelte';
	import AppSideBar from '$lib/components/appSideBar.svelte';
	import { formatBalance } from '$lib/components/marketDataUtils';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { computePortfolioMetrics } from '$lib/portfolioMetrics';
	import { cn, formatMarketName } from '$lib/utils';
	import { onMount, onDestroy } from 'svelte';

	let cohortName = $derived($page.params.cohort_name);

	// Connect to cohort WebSocket when cohort changes
	$effect(() => {
		if (cohortName) {
			connectToCohort(cohortName);
		}
	});

	onDestroy(() => {
		disconnectFromCohort();
	});

	// Get market name if we're on a market page
	let marketId = $derived($page.params.id ? Number($page.params.id) : undefined);
	let currentMarketName = $derived(
		marketId !== undefined && !Number.isNaN(marketId)
			? serverState.markets.get(marketId)?.definition?.name
			: undefined
	);

	let { children } = $props();
	let scrolled = $state(false);

	// Banner responsive mode: 'full' | 'short' | 'minimal'
	let bannerMode = $state<'full' | 'short' | 'minimal'>('full');
	let navEl: HTMLElement | undefined = $state();
	let sidebarTriggerEl: HTMLElement | undefined = $state();
	let marketNameEl: HTMLElement | undefined = $state();
	let rightEl: HTMLElement | undefined = $state();
	let measureFullEl: HTMLElement | undefined = $state();
	let measureShortEl: HTMLElement | undefined = $state();
	let measureMinimalEl: HTMLElement | undefined = $state();

	onMount(() => {
		const handleScroll = () => {
			if (scrolled) {
				if (window.scrollY < 20) scrolled = false;
			} else {
				if (window.scrollY > 50) scrolled = true;
			}
		};
		window.addEventListener('scroll', handleScroll);

		// Listen for scroll events from iframes (e.g., /options page)
		const handleMessage = (event: MessageEvent) => {
			if (event.data?.type === 'iframe-scroll') {
				const iframeScrollY = event.data.scrollY;
				const maxScroll = event.data.maxScroll ?? 0;
				const nearBottom = maxScroll > 100 && iframeScrollY > maxScroll - 50;
				if (scrolled) {
					if (iframeScrollY < 20 && !nearBottom) scrolled = false;
				} else {
					if (iframeScrollY > 50) scrolled = true;
				}
			}
		};
		window.addEventListener('message', handleMessage);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('message', handleMessage);
		};
	});

	// Measure and determine banner mode based on actual overflow
	function updateBannerMode() {
		if (!navEl || !rightEl || !measureFullEl || !measureShortEl || !measureMinimalEl) return;

		const navWidth = navEl.clientWidth;
		const navPadding = 32;
		const rightWidth = scrolled ? 0 : rightEl.offsetWidth;
		const sidebarTriggerWidth = sidebarTriggerEl?.offsetWidth ?? 0;
		const marketNameWidth = marketNameEl?.offsetWidth ?? 0;
		const gap = 16;
		let gapCount = 0;
		if (rightWidth > 0) gapCount++;
		if (sidebarTriggerWidth > 0) gapCount++;
		if (marketNameWidth > 0) gapCount++;
		const gaps = gapCount * gap;
		const availableWidth =
			navWidth - navPadding - rightWidth - sidebarTriggerWidth - marketNameWidth - gaps;

		const fullWidth = measureFullEl.offsetWidth;
		const shortWidth = measureShortEl.offsetWidth;

		if (fullWidth <= availableWidth) {
			bannerMode = 'full';
		} else if (shortWidth <= availableWidth) {
			bannerMode = 'short';
		} else {
			bannerMode = 'minimal';
		}
	}

	onMount(() => {
		if (!navEl) return;

		const resizeObserver = new ResizeObserver(() => {
			updateBannerMode();
		});

		resizeObserver.observe(navEl);
		updateBannerMode();

		return () => resizeObserver.disconnect();
	});

	$effect(() => {
		void scrolled;
		void currentMarketName;
		requestAnimationFrame(() => updateBannerMode());
	});
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
</script>

<Sidebar.Provider>
	<AppSideBar {cohortName} />
	<div
		class={cn(
			'fixed left-0 right-0 top-0 z-[5] bg-background transition-all duration-200 peer-data-[collapsible=icon]:md:left-[--sidebar-width-icon] peer-data-[state=expanded]:md:left-[--sidebar-width]',
			scrolled ? 'shadow-md' : 'border-b-2'
		)}
	>
		<header
			class={cn(
				'w-full transition-all duration-200',
				serverState.isAdmin && serverState.sudoEnabled
					? 'bg-red-700/40'
					: universeMode.enabled && serverState.currentUniverseId !== 0
						? 'bg-amber-500/30'
						: serverState.actingAs && serverState.actingAs !== serverState.userId
							? 'bg-green-700/30'
							: 'bg-primary/30'
			)}
		>
			<nav
				bind:this={navEl}
				class={cn(
					'flex items-center justify-between gap-4 px-4 transition-all duration-200',
					scrolled ? 'py-2' : 'py-4'
				)}
			>
				<span bind:this={sidebarTriggerEl} class="shrink-0 md:hidden">
					<Sidebar.Trigger size="icon-sm" />
				</span>
				{#if scrolled && currentMarketName}
					<span bind:this={marketNameEl} class="max-w-48 truncate text-base font-medium"
						>{formatMarketName(currentMarketName)}</span
					>
				{/if}
				{#if serverState.portfolio}
					{@const availableBalance = formatBalance(serverState.portfolio.availableBalance)}
					{@const mtmValue = new Intl.NumberFormat(undefined, {
						maximumFractionDigits: 0
					}).format(portfolioMetrics.totals.markToMarket)}
					<div class="pointer-events-none invisible absolute" aria-hidden="true">
						<ul bind:this={measureFullEl} class="flex w-fit items-center gap-2 md:gap-8">
							<li class={cn('whitespace-nowrap', scrolled ? 'text-base' : 'text-lg')}>
								Available Balance: {availableBalance}
							</li>
							<li class={cn('whitespace-nowrap', scrolled ? 'text-base' : 'text-lg')}>
								Mark to Market: {mtmValue}
							</li>
						</ul>
						<ul bind:this={measureShortEl} class="flex w-fit items-center gap-2 md:gap-8">
							<li class={cn('whitespace-nowrap', scrolled ? 'text-base' : 'text-lg')}>
								Available: {availableBalance}
							</li>
							<li class={cn('whitespace-nowrap', scrolled ? 'text-base' : 'text-lg')}>
								MtM: {mtmValue}
							</li>
						</ul>
						<ul bind:this={measureMinimalEl} class="flex w-fit items-center gap-2 md:gap-8">
							<li class={cn('whitespace-nowrap', scrolled ? 'text-base' : 'text-lg')}>
								Available: {availableBalance}
							</li>
						</ul>
					</div>
					<ul class="flex min-w-0 items-center gap-2 md:gap-8">
						<li class={cn('shrink-0 whitespace-nowrap', scrolled ? 'text-base' : 'text-lg')}>
							{bannerMode === 'full' ? 'Available Balance' : 'Available'}: {availableBalance}
						</li>
						{#if bannerMode !== 'minimal'}
							<li class={cn('shrink-0 whitespace-nowrap', scrolled ? 'text-base' : 'text-lg')}>
								{bannerMode === 'full' ? 'Mark to Market' : 'MtM'}: {mtmValue}
							</li>
						{/if}
					</ul>
				{/if}
				<ul
					bind:this={rightEl}
					class={cn('flex shrink-0 items-center gap-2', scrolled && 'hidden')}
				></ul>
			</nav>
		</header>
	</div>
	<div class="flex min-h-screen flex-1 flex-col overflow-x-clip">
		<div class={cn('w-full transition-all duration-200', scrolled ? 'h-12' : 'h-16')}></div>
		<main class="flex w-full flex-grow overflow-visible px-4">
			<div class="flex min-w-0 flex-grow gap-8 overflow-visible">
				{@render children()}
			</div>
		</main>
	</div>
</Sidebar.Provider>
