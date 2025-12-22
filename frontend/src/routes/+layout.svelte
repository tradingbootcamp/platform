<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import AppSideBar from '$lib/components/appSideBar.svelte';
	import Theme from '$lib/components/theme.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import { cn } from '$lib/utils';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import '../app.css';

	let { children } = $props();

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
		<div class="bg-background w-full border-b-2">
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
				<nav class="flex items-center justify-between gap-4 py-4 px-4">
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
