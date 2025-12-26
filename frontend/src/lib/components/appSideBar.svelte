<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import { toast } from 'svelte-sonner';
	import ActAs from '$lib/components/forms/actAs.svelte';
	import { shouldShowPuzzleHuntBorder } from '$lib/components/marketDataUtils';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { useStarredMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn, formatMarketName } from '$lib/utils';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Home from '@lucide/svelte/icons/home';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Plus from '@lucide/svelte/icons/plus';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import User from '@lucide/svelte/icons/user';
	import Gavel from '@lucide/svelte/icons/gavel';
	import Ban from '@lucide/svelte/icons/ban';
	import Copy from '@lucide/svelte/icons/copy';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import CreateMarket from './forms/createMarket.svelte';
	import { toggleMode, mode } from 'mode-watcher';
	let sidebarState = useSidebar();
	const { allStarredMarkets, cleanupStarredMarkets } = useStarredMarkets();

	// Clean up non-existent starred markets when the markets list changes
	$effect(() => {
		if (serverState.actingAs) {
			cleanupStarredMarkets();
		}
	});

	function handleClick() {
		if (sidebarState.isMobile) {
			sidebarState.setOpenMobile(false);
		}
	}

	async function handleScenariosClick(e: MouseEvent) {
		e.preventDefault();
		const token = await kinde.getToken();
		if (token) {
			await navigator.clipboard.writeText(token);
		}
		handleClick();
		window.open('https://scenarios-nu.vercel.app', '_blank', 'noopener,noreferrer');
	}

	async function handleCopyJwt() {
		const token = await kinde.getToken();
		if (token) {
			await navigator.clipboard.writeText(token);
			toast.success('JWT copied to clipboard');
		}
		handleClick();
	}

	async function handleClearAllOrders() {
		const { sendClientMessage } = await import('$lib/api.svelte');
		sendClientMessage({ out: {} });
		handleClick();
	}
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="py-4">
		<div
			class={cn(
				'relative transition-all duration-200',
				sidebarState.state === 'collapsed' ? 'h-[4.5rem]' : 'h-8'
			)}
		>
			<Sidebar.Menu class="!w-auto">
				<Sidebar.MenuItem>
					<Sidebar.MenuButton
						class="!w-8 !h-8 !p-2"
						onclick={() => sidebarState.toggle()}
					>
						<PanelLeft />
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
			<Sidebar.Menu
				class={cn(
					'absolute !w-8',
					sidebarState.state === 'expanded'
						? 'animate-home-expand !w-[calc(100%-2.5rem)]'
						: 'animate-home-collapse'
				)}
			>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton class="!h-8 !p-2">
						{#snippet tooltipContent()}Home{/snippet}
						{#snippet child({ props })}
							<a href="/home" {...props} onclick={handleClick}>
								<Home />
								<span
									class={cn(
										'ml-3 whitespace-nowrap transition-opacity duration-200',
										sidebarState.state === 'collapsed' && 'opacity-0 w-0 overflow-hidden'
									)}
								>
									Home
								</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Pages</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet tooltipContent()}Markets{/snippet}
							{#snippet child({ props })}
								<a href="/market" {...props} onclick={handleClick}>
									<TrendingUp />
									<span class="ml-3">Markets</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						<Sidebar.MenuAction
							class="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
						>
							{#snippet child({ props })}
								<CreateMarket {...props} onclick={handleClick}><Plus /></CreateMarket>
							{/snippet}
						</Sidebar.MenuAction>
						{#if allStarredMarkets().length > 0}
							<Sidebar.MenuSub>
								{#each allStarredMarkets() as marketId}
									<Sidebar.MenuSubItem
										class={cn(
											shouldShowPuzzleHuntBorder(serverState.markets.get(marketId)?.definition) &&
												'py-4 puzzle-hunt-frame'
										)}
									>
										<Sidebar.MenuButton>
											{#snippet child({ props })}
												<a
													href={`/market/${marketId}`}
													{...props}
													onclick={handleClick}
													class="ml-4"
												>
													<span>{formatMarketName(serverState.markets.get(marketId)?.definition.name)}</span>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						{/if}
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet tooltipContent()}Transactions{/snippet}
							{#snippet child({ props })}
								<a href="/transfers" {...props} onclick={handleClick}>
									<ArrowLeftRight />
									<span class="ml-3">Transactions</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet tooltipContent()}Accounts{/snippet}
							{#snippet child({ props })}
								<a href="/accounts" {...props} onclick={handleClick}>
									<User />
									<span class="ml-3">Accounts</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<!-- TEMPORARY: Shop link disabled -->
					<!-- <Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/shop" {...props} onclick={handleClick}>
									<Gavel />
									<span class="ml-3">Shop</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem> -->
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet tooltipContent()}Docs{/snippet}
							{#snippet child({ props })}
								<a
									href="https://arbor-2.gitbook.io/arbor"
									target="_blank"
									rel="noopener noreferrer"
									{...props}
									onclick={handleClick}
								>
									<ExternalLink />
									<span class="ml-3">Docs</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		{#if serverState.isAdmin}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Admin Links</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton onclick={handleCopyJwt}>
								{#snippet tooltipContent()}Copy JWT{/snippet}
								<Copy />
								<span class="ml-3">Copy JWT</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Tooltip.Root>
								<Tooltip.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuButton {...props}>
											{#snippet child({ props: btnProps })}
												<a
													href="https://scenarios-nu.vercel.app"
													target="_blank"
													rel="noopener noreferrer"
													{...btnProps}
													onclick={handleScenariosClick}
												>
													<ExternalLink />
													<span class="ml-3">Scenarios</span>
													<Copy class="size-3" />
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									{/snippet}
								</Tooltip.Trigger>
								<Tooltip.Content side="right">Scenarios (copies JWT)</Tooltip.Content>
							</Tooltip.Root>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet tooltipContent()}
									Exchange Github
								{/snippet}
								{#snippet child({ props })}
									<a
										href="https://github.com/tradingbootcamp/platform"
										target="_blank"
										rel="noopener noreferrer"
										{...props}
										onclick={handleClick}
									>
										<ExternalLink />
										<span class="ml-3">Exchange Github</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet tooltipContent()}
									Scenarios Github
								{/snippet}
								{#snippet child({ props })}
									<a
										href="https://github.com/tradingbootcamp/scenarios"
										target="_blank"
										rel="noopener noreferrer"
										{...props}
										onclick={handleClick}
									>
										<ExternalLink />
										<span class="ml-3">Scenarios Github</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
		{#if (serverState.portfolios.size > 1 || serverState.isAdmin) && sidebarState.state === 'expanded'}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Act As:</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<ActAs />
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							onclick={handleClearAllOrders}
							class="bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400"
						>
							{#snippet tooltipContent()}Clear All Orders{/snippet}
							<Ban />
							<span class="ml-3">Clear All Orders</span>
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton onclick={toggleMode}>
							{#snippet tooltipContent()}Theme{/snippet}
							{#if $mode === 'dark'}
								<Moon />
								<span class="ml-3">Theme: Dark</span>
							{:else}
								<Sun />
								<span class="ml-3">Theme: Light</span>
							{/if}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer class="py-4">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					onclick={(e) => {
						handleClick();
						kinde.logout();
					}}
					class="h-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
				>
					<LogOut />
					<span class="ml-3">Log Out</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
