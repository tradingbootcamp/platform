<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import ActAs from '$lib/components/forms/actAs.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import Home from '@lucide/svelte/icons/home';
	import LogOut from 'lucide-svelte/icons/log-out';
	import User from 'lucide-svelte/icons/user';

	let sidebarState = useSidebar();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header class="py-4">
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
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href="/" {...props}>
									<Home />
									<span class="ml-3">Home</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
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
</Sidebar.Root>

<!-- <aside class="hidden min-h-full min-w-48 max-w-64 border-r-2 pr-8 pt-8 md:block">
  <nav>
    <ul class="flex min-h-full flex-col gap-4">
      <li class="order-1 text-lg">
        <CreateMarket />
      </li>
      <li class="order-1 text-lg">Open markets:</li>
      <div class="order-4 flex-grow"></div>
      <li class="order-4 text-lg">Closed markets:</li>
      {#each Array.from(serverState.markets.values()).sort((a, b) => b.definition?.transactionId - a.definition?.transactionId) as market}
        <MarketLink market={market.definition} />
      {/each}
    </ul>
  </nav>
</aside> -->
