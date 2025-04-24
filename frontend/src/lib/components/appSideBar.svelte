<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import ActAs from '$lib/components/forms/actAs.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import Home from '@lucide/svelte/icons/home';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Plus from '@lucide/svelte/icons/plus';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import User from '@lucide/svelte/icons/user';
	import CreateMarket from './forms/createMarket.svelte';

	let sidebarState = useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="py-4">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="h-10">
					{#snippet child({ props })}
						<a href="/" {...props}>
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
								<a href="/market" {...props}>
									<TrendingUp />
									<span class="ml-3">Markets</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
						<Sidebar.MenuAction
							class="bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90"
						>
							{#snippet child({ props })}
								<CreateMarket {...props}><Plus /></CreateMarket>
							{/snippet}
						</Sidebar.MenuAction>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/transfers" {...props}>
									<ArrowLeftRight />
									<span class="ml-3">Transactions</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/accounts" {...props}>
									<User />
									<span class="ml-3">Accounts</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		{#if serverState.portfolios.size > 1 && sidebarState.state === 'expanded'}
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
					onclick={kinde.logout}
					class="bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 h-10"
				>
					<LogOut />
					<span class="ml-3">Log Out</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
