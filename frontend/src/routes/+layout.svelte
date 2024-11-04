<script lang="ts">
	import { actingAs, markets, portfolio, users } from '$lib/api';
	import logo from '$lib/assets/logo.svg';
	import { kinde, user } from '$lib/auth';
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
		class={cn('sticky border-b-2', $actingAs !== $user?.id ? 'bg-green-700/30' : 'bg-primary/30')}
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
				<NavLink href="/payments">Payments</NavLink>
				<NavLink href="/accounts">Accounts</NavLink>
				{#if $actingAs}
					<li class="text-lg">
						Hi <em>{$users.get($actingAs)?.name}</em>
					</li>
				{/if}
				{#if $portfolio?.availableBalance}
					<li class="flex flex-col text-lg">
						<div>Available Balance:</div>
						<div>
							📎 {new Intl.NumberFormat(undefined, {
								maximumFractionDigits: 4
							}).format($portfolio.availableBalance)}
						</div>
					</li>
				{/if}
			</ul>
			<ul class="flex justify-center gap-4">
				{#await kinde.isAuthenticated() then isAuthenticated}
					{#if isAuthenticated}
						<li>
							<Button onclick={kinde.logout}>Log Out</Button>
						</li>
					{/if}
				{/await}
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
					{#each Object.values($markets) as market}
						<MarketLink {market} />
					{/each}
				</ul>
			</nav>
		</aside>
		{@render children()}
	</main>
</div>
