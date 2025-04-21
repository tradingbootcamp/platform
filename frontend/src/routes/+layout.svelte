<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import AppSideBar from '$lib/components/appSideBar.svelte';
	import Theme from '$lib/components/theme.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import { cn } from '$lib/utils';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

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
		<div class="bg-background sticky top-0 z-40 w-full border-b-2">
			<header
				class={cn(
					'w-full',
					serverState.actingAs && serverState.actingAs !== serverState.userId
						? 'bg-green-700/30'
						: 'bg-primary/30'
				)}
			>
				<nav class="flex items-center justify-between gap-4 px-8 py-4 align-bottom">
					<ul class="flex items-center pr-4">
						<li>
							<Sidebar.Trigger />
						</li>
					</ul>
					<ul class="flex flex-col items-center gap-4 md:flex-row md:gap-8">
						<li class="text-lg">
							{#if serverState.portfolio}
								<span>
									<span class="hidden md:inline">Available Balance:{' '}</span>📎 {new Intl.NumberFormat(
										undefined,
										{
											maximumFractionDigits: 4
										}
									).format(serverState.portfolio.availableBalance ?? 0)}
								</span>
							{/if}
						</li>
					</ul>
					<ul>
						<li>
							<Theme />
						</li>
					</ul>
				</nav>
			</header>
		</div>
		<main class="flex w-full flex-grow overflow-x-auto">
			<div class="flex min-w-full flex-grow gap-8 px-8">
				{@render children()}
			</div>
		</main>
	</div>
</Sidebar.Provider>
