<script>
	import { page } from '$app/stores';
	import { markets, portfolio } from '$lib/api';
	import { kinde } from '$lib/auth';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import Theme from '$lib/components/theme.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { ModeWatcher } from 'mode-watcher';
	import { get } from 'svelte/store';
	import '../app.css';

	$: marketId = Number($page.params.id);
</script>

<ModeWatcher />
<header class="sticky border-b-2 bg-primary/10">
	<nav class="flex items-center justify-between p-4 align-bottom">
		<ul class="flex items-center gap-8">
			<li>
				<a href="/" class="text-xl font-bold uppercase">Trading Bootcamp</a>
			</li>
			<li>
				<a href="/payments">Payments</a>
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
					{:else}
						<Button on:click={kinde.login}>Log In</Button>
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
	<aside class="mt-8 min-w-48 px-12">
		<nav>
			<ul class="flex flex-col gap-4 text-lg">
				<li>
					<CreateMarket />
				</li>
				{#each Object.values($markets).map(get) as market}
					<li>
						{#if marketId === market.id}
							{market.name}
						{:else}
							<a href="/market/{market.id}">{market.name}</a>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>
	</aside>
	<div class="container mt-8">
		<slot></slot>
	</div>
</main>
