<script>
	import { markets, portfolio } from '$lib/api';
	import { kinde } from '$lib/auth';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import Theme from '$lib/components/theme.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import '../app.css';
	import MarketLink from './marketLink.svelte';

	onMount(async () => {
		if (!(await kinde.isAuthenticated())) {
			kinde.login();
		}
	});
</script>

<ModeWatcher />
<header class="sticky border-b-2 bg-primary/10">
	<nav class="flex items-center justify-between p-4 align-bottom">
		<ul class="flex items-center gap-8">
			<li>
				<a href="/" class="text-xl font-bold uppercase">Sparc Market</a>
			</li>
			<li>
				<a href="/payments">
					<Button class="text-lg" variant="link">Payments</Button>
				</a>
			</li>
		</ul>
		{#if $portfolio?.availableBalance}
			<ul>
				<li class="text-lg">
					Available Balance: {$portfolio.availableBalance}
				</li>
			</ul>
		{/if}
		<ul class="flex justify-center gap-4">
			<li>
				{#await kinde.isAuthenticated() then isAuthenticated}
					{#if isAuthenticated}
						<Button on:click={kinde.logout}>Log Out</Button>
					{/if}
				{/await}
			</li>
			<li>
				<Theme />
			</li>
		</ul>
	</nav>
</header>
<main class="flex">
	<aside class="ms-12 mt-8 min-w-40">
		<nav>
			<ul class="flex min-h-full flex-col gap-4">
				<li class="order-1 text-lg">
					<CreateMarket />
				</li>
				<li class="order-1 text-lg">Open markets:</li>
				<div class="order-3 flex-grow"></div>
				<li class="order-3 text-lg">Closed markets:</li>
				{#each Object.values($markets) as market}
					<MarketLink {market} />
				{/each}
			</ul>
		</nav>
	</aside>
	<div class="container mt-8">
		<slot></slot>
	</div>
</main>
