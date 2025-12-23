<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import ActAs from '$lib/components/forms/actAs.svelte';
	import { shouldShowPuzzleHuntBorder } from '$lib/components/marketDataUtils';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { useStarredMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn } from '$lib/utils';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Home from '@lucide/svelte/icons/home';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Plus from '@lucide/svelte/icons/plus';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import User from '@lucide/svelte/icons/user';
	import Gavel from '@lucide/svelte/icons/gavel';
	import CreateMarket from './forms/createMarket.svelte';
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
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="py-4">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="h-10">
					{#snippet child({ props })}
						<a href="/home" {...props} onclick={handleClick}>
							<Home />
							<span class="ml-3">Home</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Pages</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/market" {...props} onclick={handleClick}>
									<TrendingUp />
									<span class="ml-3">Markets</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						<Sidebar.MenuAction
							class="bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
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
												'puzzle-hunt-frame py-4'
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
													<span>{serverState.markets.get(marketId)?.definition.name}</span>
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
							{#snippet child({ props })}
								<a href="/accounts" {...props} onclick={handleClick}>
									<User />
									<span class="ml-3">Accounts</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/shop" {...props} onclick={handleClick}>
									<Gavel />
									<span class="ml-3">Shop</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
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
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a
										href="https://trading-bootcamp-frontend.fly.dev/"
										target="_blank"
										rel="noopener noreferrer"
										{...props}
										onclick={handleClick}
									>
										<ExternalLink />
										<span class="ml-3">Scenarios</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a
										href="https://team-allocation.trading.camp/"
										target="_blank"
										rel="noopener noreferrer"
										{...props}
										onclick={handleClick}
									>
										<ExternalLink />
										<span class="ml-3">Team allocation</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
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
	</Sidebar.Content>
	<Sidebar.Footer class="py-4">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					onclick={(e) => {
						handleClick();
						kinde.logout();
					}}
					class="bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 h-10"
				>
					<LogOut />
					<span class="ml-3">Log Out</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
