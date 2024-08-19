<script>
	import { markets, portfolio, users, actingAs } from '$lib/api';
	import { kinde, user } from '$lib/auth';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import Theme from '$lib/components/theme.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import '../app.css';
	import MarketLink from './marketLink.svelte';
	import { cn } from '$lib/utils';

	onMount(async () => {
		if (!(await kinde.isAuthenticated())) {
			kinde.login();
			console.log('HI');
		}
	});
</script>

<ModeWatcher />
<Toaster closeButton />
<header
	class={cn('sticky border-b-2', $actingAs !== $user?.id ? 'bg-purple-700/20' : 'bg-primary/10')}
>
	<nav class="container flex items-center justify-between py-4 align-bottom">
		<ul>
			<li>
				<a href="/" class="text-xl font-bold uppercase">Sparc Markets</a>
			</li>
		</ul>
		<ul class="flex items-center gap-8">
			<li>
				<a href="/payments">
					<Button class="px-2 text-lg" variant="link">Payments</Button>
				</a>
			</li>
			<li>
				<a href="/accounts">
					<Button class="px-2 text-lg" variant="link">Accounts</Button>
				</a>
			</li>
			{#if $portfolio?.availableBalance}
				<li class="text-lg">
					Available Balance: {new Intl.NumberFormat().format(Number($portfolio.availableBalance))}
				</li>
			{/if}
			{#if $actingAs}
				<li class="text-lg">
					Acting as: <em>{$actingAs === $user?.id ? 'Yourself' : $users.get($actingAs)?.name}</em>
				</li>
			{/if}
		</ul>
		<ul class="flex justify-center gap-4">
			{#await kinde.isAuthenticated() then isAuthenticated}
				{#if isAuthenticated}
					<li>
						<Button on:click={kinde.logout}>Log Out</Button>
					</li>
				{/if}
			{/await}
			<li>
				<Theme />
			</li>
		</ul>
	</nav>
</header>
<main class="container mt-8 flex gap-8">
	<aside class="min-w-44 max-w-64 flex-grow">
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
	<div class="max-w-[60%] flex-grow">
		<slot></slot>
	</div>
</main>
