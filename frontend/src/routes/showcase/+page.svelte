<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	// Derive the REST API base URL from the WebSocket URL
	const apiBase = PUBLIC_SERVER_URL.replace('wss://', 'https://')
		.replace('ws://', 'http://')
		.replace('/api', '');

	interface BootcampConfig {
		db_path: string;
		display_name: string;
		anonymize_names: boolean;
		showcase_market_ids: number[];
		hidden_category_ids: number[];
		non_anonymous_account_ids: number[];
	}

	interface ShowcaseConfig {
		active_bootcamp: string | null;
		bootcamps: Record<string, BootcampConfig>;
	}

	interface MarketInfo {
		id: number;
		name: string;
	}

	interface AccountInfo {
		id: number;
		name: string;
	}

	let config: ShowcaseConfig | null = $state(null);
	let markets: MarketInfo[] = $state([]);
	let accounts: AccountInfo[] = $state([]);
	let selectedBootcamp: string | null = $state(null);
	let selectedMarketIds: Set<number> = $state(new Set());
	let selectedNonAnonIds: Set<number> = $state(new Set());
	let accountSearchQuery = $state('');
	let loading = $state(false);

	// Add bootcamp form state
	let newKey = $state('');
	let newDbPath = $state('');
	let newDisplayName = $state('');

	async function getAuthHeaders(): Promise<Record<string, string>> {
		const token = await kinde.getToken();
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchConfig() {
		loading = true;
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/config`, { headers });
			if (!res.ok) throw new Error(`Failed to fetch config: ${res.status}`);
			config = await res.json();
			if (config?.active_bootcamp) {
				selectedBootcamp = config.active_bootcamp;
				const activeConfig = config.bootcamps[config.active_bootcamp];
				if (activeConfig) {
					selectedMarketIds = new Set(activeConfig.showcase_market_ids);
					selectedNonAnonIds = new Set(activeConfig.non_anonymous_account_ids ?? []);
				}
			}
		} catch (e) {
			toast.error(`Failed to load config: ${e}`);
		} finally {
			loading = false;
		}
	}

	async function fetchAccounts() {
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/accounts`, { headers });
			if (!res.ok) throw new Error(`Failed to fetch accounts: ${res.status}`);
			accounts = await res.json();
		} catch (e) {
			toast.error(`Failed to load accounts: ${e}`);
			accounts = [];
		}
	}

	async function fetchMarkets(bootcampKey: string) {
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/bootcamps/${bootcampKey}/markets`, {
				headers
			});
			if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
			markets = await res.json();
		} catch (e) {
			toast.error(`Failed to load markets: ${e}`);
			markets = [];
		}
	}

	async function setActiveBootcamp(key: string) {
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/active`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ bootcamp: key })
			});
			if (!res.ok) throw new Error(`Failed to set active: ${res.status}`);
			toast.success(`Switched to ${key}`);
			selectedBootcamp = key;
			await fetchConfig();
			await fetchMarkets(key);
		} catch (e) {
			toast.error(`Failed to switch bootcamp: ${e}`);
		}
	}

	async function saveMarketSelection() {
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/markets`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ market_ids: [...selectedMarketIds] })
			});
			if (!res.ok) throw new Error(`Failed to save markets: ${res.status}`);
			toast.success('Market selection saved');
			await fetchConfig();
		} catch (e) {
			toast.error(`Failed to save markets: ${e}`);
		}
	}

	async function toggleAnonymize() {
		if (!config || !config.active_bootcamp) return;
		const current = config.bootcamps[config.active_bootcamp]?.anonymize_names ?? false;
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/anonymize`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ anonymize: !current })
			});
			if (!res.ok) throw new Error(`Failed to toggle anonymize: ${res.status}`);
			toast.success(`Anonymization ${!current ? 'enabled' : 'disabled'}`);
			await fetchConfig();
		} catch (e) {
			toast.error(`Failed to toggle anonymize: ${e}`);
		}
	}

	async function addBootcamp() {
		if (!newKey || !newDbPath || !newDisplayName) {
			toast.error('All fields are required');
			return;
		}
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/bootcamps`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({
					key: newKey,
					db_path: newDbPath,
					display_name: newDisplayName,
					anonymize_names: false,
					showcase_market_ids: []
				})
			});
			if (!res.ok) throw new Error(`Failed to add bootcamp: ${res.status}`);
			toast.success(`Added bootcamp: ${newDisplayName}`);
			newKey = '';
			newDbPath = '';
			newDisplayName = '';
			await fetchConfig();
		} catch (e) {
			toast.error(`Failed to add bootcamp: ${e}`);
		}
	}

	async function saveNonAnonymousAccounts() {
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/non-anonymous-accounts`, {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({ account_ids: [...selectedNonAnonIds] })
			});
			if (!res.ok) throw new Error(`Failed to save non-anonymous accounts: ${res.status}`);
			toast.success('Non-anonymous accounts saved');
			await fetchConfig();
		} catch (e) {
			toast.error(`Failed to save non-anonymous accounts: ${e}`);
		}
	}

	function toggleNonAnon(id: number) {
		if (selectedNonAnonIds.has(id)) {
			selectedNonAnonIds.delete(id);
		} else {
			selectedNonAnonIds.add(id);
		}
		selectedNonAnonIds = new Set(selectedNonAnonIds);
	}

	function toggleMarket(id: number) {
		if (selectedMarketIds.has(id)) {
			selectedMarketIds.delete(id);
		} else {
			selectedMarketIds.add(id);
		}
		selectedMarketIds = new Set(selectedMarketIds);
	}

	// Load config on mount
	$effect(() => {
		if (serverState.isAdmin) {
			fetchConfig();
		}
	});

	// Load markets and accounts when bootcamp changes
	$effect(() => {
		if (selectedBootcamp && config?.bootcamps[selectedBootcamp]) {
			fetchMarkets(selectedBootcamp);
			fetchAccounts();
			const bc = config.bootcamps[selectedBootcamp];
			selectedMarketIds = new Set(bc.showcase_market_ids);
			selectedNonAnonIds = new Set(bc.non_anonymous_account_ids ?? []);
		}
	});
</script>

{#if !serverState.isAdmin}
	<div class="flex min-h-[50vh] items-center justify-center">
		<p class="text-muted-foreground">Admin access required</p>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-6 py-6">
		<h1 class="text-2xl font-bold">Showcase Management</h1>

		{#if loading}
			<div class="flex items-center justify-center py-8">
				<div
					class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
				></div>
			</div>
		{:else if config}
			<!-- Current Status -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Current Status</Card.Title>
				</Card.Header>
				<Card.Content>
					<p>
						Active bootcamp: <strong
							>{config.active_bootcamp
								? (config.bootcamps[config.active_bootcamp]?.display_name ?? config.active_bootcamp)
								: 'None'}</strong
						>
					</p>
					{#if config.active_bootcamp && config.bootcamps[config.active_bootcamp]}
						{@const bc = config.bootcamps[config.active_bootcamp]}
						<p class="mt-1 text-sm text-muted-foreground">
							Showcasing {bc.showcase_market_ids.length} markets | Anonymization: {bc.anonymize_names
								? 'On'
								: 'Off'}
						</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Bootcamp Selector -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Bootcamps</Card.Title>
					<Card.Description>Select which bootcamp to showcase</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-3">
					{#each Object.entries(config.bootcamps) as [key, bc]}
						<div
							class="flex items-center justify-between rounded-lg border p-3 {key ===
							config.active_bootcamp
								? 'border-primary bg-primary/5'
								: ''}"
						>
							<div>
								<p class="font-medium">{bc.display_name}</p>
								<p class="text-sm text-muted-foreground">{bc.db_path}</p>
							</div>
							<div class="flex items-center gap-2">
								{#if key === config.active_bootcamp}
									<span class="text-sm text-primary">Active</span>
								{:else}
									<Button size="sm" variant="outline" onclick={() => setActiveBootcamp(key)}
										>Activate</Button
									>
								{/if}
							</div>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<!-- Add Bootcamp -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Add Bootcamp</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-3">
					<input
						bind:value={newKey}
						placeholder="Key (e.g. dag-feb8)"
						class="rounded-md border bg-background px-3 py-2"
					/>
					<input
						bind:value={newDbPath}
						placeholder="Database path (e.g. /data/dag-feb8.sqlite)"
						class="rounded-md border bg-background px-3 py-2"
					/>
					<input
						bind:value={newDisplayName}
						placeholder="Display name (e.g. DAG - February 2025)"
						class="rounded-md border bg-background px-3 py-2"
					/>
					<Button onclick={addBootcamp}>Add Bootcamp</Button>
				</Card.Content>
			</Card.Root>

			<!-- Market Selection -->
			{#if selectedBootcamp && markets.length > 0}
				<Card.Root>
					<Card.Header>
						<Card.Title>Market Selection</Card.Title>
						<Card.Description
							>Choose which markets to showcase ({selectedMarketIds.size} selected)</Card.Description
						>
					</Card.Header>
					<Card.Content>
						<div class="flex max-h-96 flex-col gap-1 overflow-y-auto">
							{#each markets as market}
								<label
									class="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-accent"
								>
									<input
										type="checkbox"
										checked={selectedMarketIds.has(market.id)}
										onchange={() => toggleMarket(market.id)}
										class="h-4 w-4"
									/>
									<span class="text-sm"
										><span class="text-muted-foreground">#{market.id}</span>
										{market.name}</span
									>
								</label>
							{/each}
						</div>
						<div class="mt-4">
							<Button onclick={saveMarketSelection}>Save Market Selection</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Anonymization -->
			{#if config.active_bootcamp}
				<Card.Root>
					<Card.Header>
						<Card.Title>Anonymization</Card.Title>
					</Card.Header>
					<Card.Content>
						<label class="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								checked={config.bootcamps[config.active_bootcamp]?.anonymize_names ?? false}
								onchange={toggleAnonymize}
								class="h-4 w-4"
							/>
							<span>Anonymize account names (show as "Trader 1", "Trader 2", etc.)</span>
						</label>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Non-Anonymous Accounts -->
			{#if config.active_bootcamp && config.bootcamps[config.active_bootcamp]?.anonymize_names}
				<Card.Root>
					<Card.Header>
						<Card.Title>Non-Anonymous Accounts</Card.Title>
						<Card.Description
							>These accounts keep their real names when anonymization is enabled</Card.Description
						>
					</Card.Header>
					<Card.Content>
						{#if selectedNonAnonIds.size > 0}
							<div class="mb-3 flex flex-wrap gap-2">
								{#each [...selectedNonAnonIds] as id}
									{@const account = accounts.find((a) => a.id === id)}
									<button
										class="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary hover:bg-primary/20"
										onclick={() => toggleNonAnon(id)}
									>
										{account?.name ?? `#${id}`}
										<span class="ml-1 text-xs">&times;</span>
									</button>
								{/each}
							</div>
						{/if}
						<input
							bind:value={accountSearchQuery}
							placeholder="Search accounts..."
							class="mb-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
						/>
						<div class="flex max-h-60 flex-col gap-1 overflow-y-auto">
							{#each accounts.filter((a) => a.name
										.toLowerCase()
										.includes(accountSearchQuery.toLowerCase())) as account}
								<label
									class="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-accent"
								>
									<input
										type="checkbox"
										checked={selectedNonAnonIds.has(account.id)}
										onchange={() => toggleNonAnon(account.id)}
										class="h-4 w-4"
									/>
									<span class="text-sm">
										<span class="text-muted-foreground">#{account.id}</span>
										{account.name}
									</span>
								</label>
							{/each}
						</div>
						<div class="mt-4">
							<Button onclick={saveNonAnonymousAccounts}>Save Non-Anonymous Accounts</Button>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		{/if}
	</div>
{/if}
