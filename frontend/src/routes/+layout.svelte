<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import logo from '$lib/assets/logo.svg';
	import { kinde } from '$lib/auth.svelte';
	import ActAs from '$lib/components/forms/actAs.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import Theme from '$lib/components/theme.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { Toaster } from '$lib/components/ui/sonner';
	import { cn } from '$lib/utils';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import '../app.css';
	import MarketLink from './marketLink.svelte';
	import NavLink from './navLink.svelte';

	let { children } = $props();

	onMount(async () => {
		if (!(await kinde.isAuthenticated())) {
			kinde.login();
		}
	});
</script>

<ModeWatcher />
<Toaster closeButton duration={8000} richColors />
<div class="flex min-h-screen flex-col">
	<header
		class={cn(
			'sticky border-b-2',
			serverState.actingAs && serverState.actingAs !== serverState.userId
				? 'bg-green-700/30'
				: 'bg-primary/30'
		)}
	>
		<nav
			class="container flex flex-col items-center justify-between gap-4 py-4 align-bottom md:flex-row"
		>
			<ul class="pr-4">
				<NavLink href="/" class="flex px-0">
					<img width="50" height="50" src={logo} alt="logo" /> Home
				</NavLink>
			</ul>
			<ul class="flex flex-col items-center gap-4 md:flex-row md:gap-8">
				<NavLink href="/transfers">Transfers</NavLink>
				<NavLink href="/accounts">Accounts</NavLink>
				<li>
					{#if serverState.actingAs}
						<ActAs />
					{/if}
				</li>
				<li class="text-lg">
					{#if serverState.portfolio}
						<span>
							Available Balance: 📎 {new Intl.NumberFormat(undefined, {
								maximumFractionDigits: 4
							}).format(serverState.portfolio.availableBalance ?? 0)}
						</span>
					{/if}
				</li>
			</ul>
			<ul class="flex justify-center gap-4">
				<li>
					<Button onclick={kinde.logout}>Log Out</Button>
				</li>
				<li>
					<Theme />
				</li>
			</ul>
		</nav>
	</header>
	<main class="container flex min-h-full flex-grow gap-8">
		<aside class="hidden min-h-full min-w-44 max-w-64 flex-grow border-r-2 pr-8 pt-8 md:block">
			<nav>
				<ul class="flex min-h-full flex-col gap-4">
					<li class="order-1 text-lg">
						<CreateMarket />
					</li>
					<li class="order-1 text-lg">Open markets:</li>
					<div class="order-4 flex-grow"></div>
					<li class="order-4 text-lg">Closed markets:</li>
					{#each serverState.markets.values() as market}
						<MarketLink market={market.definition} />
					{/each}
				</ul>
			</nav>
		</aside>
		{@render children()}
	</main>
</div>
