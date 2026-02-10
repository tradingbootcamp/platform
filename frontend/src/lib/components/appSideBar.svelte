<script lang="ts">
	import { serverState, setSudo, reconnect } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import LogIn from '@lucide/svelte/icons/log-in';
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

	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import User from '@lucide/svelte/icons/user';
	import Gavel from '@lucide/svelte/icons/gavel';
	import Shield from '@lucide/svelte/icons/shield';
	import ShieldOff from '@lucide/svelte/icons/shield-off';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Settings from '@lucide/svelte/icons/settings';
	import Ban from '@lucide/svelte/icons/ban';
	import Copy from '@lucide/svelte/icons/copy';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

	import MakeTransfer from './forms/makeTransfer.svelte';
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

	const canDisableSudo = () => {
		if (!serverState.sudoEnabled) {
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

	function handleSudoToggle() {
		if (serverState.sudoEnabled) {
			if (!canDisableSudo()) {
				toast.error('Sudo required to keep acting as this account', {
					description: 'Switch accounts first, or keep sudo on.'
				});
				return;
			}
			setSudo(false);
		} else {
			setSudo(true);
		}
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
					<Sidebar.MenuButton class="!h-8 !w-8 !p-2" onclick={() => sidebarState.toggle()}>
						<PanelLeft />
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
			<Sidebar.Menu
				class={cn(
					'absolute !w-8',
					sidebarState.state === 'expanded'
						? '!w-[calc(100%-2.5rem)] animate-home-expand'
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
										sidebarState.state === 'collapsed' && 'w-0 overflow-hidden opacity-0'
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
													<span
														>{formatMarketName(
															serverState.markets.get(marketId)?.definition.name
														)}</span
													>
												</a>
											{/snippet}
										</Sidebar.MenuButton>
									</Sidebar.MenuSubItem>
								{/each}
							</Sidebar.MenuSub>
						{/if}
					</Sidebar.MenuItem>
					{#if !serverState.isAnonymous}
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
						{#if serverState.isAdmin}
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props: tooltipProps })}
									<Sidebar.MenuAction
										class="bg-primary text-primary-foreground opacity-50 hover:bg-primary/90 hover:text-white hover:opacity-100"
										{...tooltipProps}
									>
										{#snippet child({ props })}
											<MakeTransfer {...props}><ArrowLeftRight /></MakeTransfer>
										{/snippet}
									</Sidebar.MenuAction>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content side="right">New Transaction</Tooltip.Content>
						</Tooltip.Root>
						{/if}
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
					{/if}
					{#if serverState.isAdmin && serverState.sudoEnabled}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href="/auction" {...props} onclick={handleClick}>
										<Gavel />
										<span class="ml-3">Auction</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/if}
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
				<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet tooltipContent()}Showcase{/snippet}
								{#snippet child({ props })}
									<a href="/showcase" {...props} onclick={handleClick}>
										<Settings />
										<span class="ml-3">Showcase</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet tooltipContent()}Internal Docs{/snippet}
								{#snippet child({ props })}
									<a href="/docs" {...props} onclick={handleClick}>
										<BookOpen />
										<span class="ml-3">Internal Docs</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								onclick={handleSudoToggle}
								class={serverState.sudoEnabled
									? 'bg-green-500/15 text-green-600 hover:bg-green-500/25 dark:text-green-400'
									: 'bg-red-500/25 text-red-600 hover:bg-red-500/40 dark:text-red-400'}
							>
								{#snippet tooltipContent()}{serverState.sudoEnabled
										? 'Disable Sudo'
										: 'Enable Sudo'}{/snippet}
								{#if serverState.sudoEnabled}
									<ShieldOff />
									<span class="ml-3">Disable Sudo</span>
								{:else}
									<Shield />
									<span class="ml-3">Enable Sudo</span>
								{/if}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
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
		{#if (serverState.portfolios.size > 1 || (serverState.isAdmin && serverState.sudoEnabled)) && sidebarState.state === 'expanded'}
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
					{#if !serverState.isAnonymous}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							onclick={handleClearAllOrders}
							class="bg-red-500/15 text-red-600 hover:bg-red-500/25 dark:text-red-400"
						>
							{#snippet tooltipContent()}Clear All Orders{/snippet}
							<Ban />
							<span class="ml-3">Clear All Orders</span>
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					{/if}
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
			{#if serverState.isAnonymous}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					onclick={() => {
						handleClick();
						kinde.login();
					}}
					class="h-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
				>
					<LogIn />
					<span class="ml-3">Sign In</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			{:else}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					onclick={() => {
						handleClick();
						kinde.logout();
					}}
					class="h-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
				>
					<LogOut />
					<span class="ml-3">Log Out</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			{/if}
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
