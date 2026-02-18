<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { clearPublicShowcaseConfigCache } from '$lib/showcaseRouting';
	import { toast } from 'svelte-sonner';

	const apiBase = PUBLIC_SERVER_URL.replace('wss://', 'https://')
		.replace('ws://', 'http://')
		.replace('/api', '');

	interface DatabaseItem {
		key: string;
		db_path: string;
		display_name: string;
	}

	interface ShowcaseItem {
		key: string;
		display_name: string;
		database_key: string;
		anonymize_names: boolean;
		showcase_market_ids: number[];
		hidden_category_ids: number[];
		non_anonymous_account_ids: number[];
	}

	interface MarketInfo {
		id: number;
		name: string;
	}

	interface MarketTypeInfo {
		id: number;
		name: string;
	}

	interface AccountInfo {
		id: number;
		name: string;
	}

	interface ConfigResponse {
		default_showcase: string | null;
	}

	let loading = $state(false);
	let initialized = $state(false);

	let databases: DatabaseItem[] = $state([]);
	let showcases: ShowcaseItem[] = $state([]);
	let defaultShowcase = $state<string | null>(null);
	let pendingDefault = $state('');

	let selectedShowcaseKey = $state<string | null>(null);
	let markets: MarketInfo[] = $state([]);
	let marketTypes: MarketTypeInfo[] = $state([]);
	let accounts: AccountInfo[] = $state([]);

	let selectedMarketIds: Set<number> = $state(new Set());
	let selectedNonAnonIds: Set<number> = $state(new Set());
	let hiddenCategoryIds: Set<number> = $state(new Set());
	let accountSearchQuery = $state('');

	let newDatabaseKey = $state('');
	let newDatabasePath = $state('');
	let newDatabaseDisplayName = $state('');

	let newShowcaseKey = $state('');
	let newShowcaseDisplayName = $state('');
	let newShowcaseDatabaseKey = $state('');

	const showcaseOrigin = browser ? window.location.origin : '';

	function shareUrlFor(key: string): string {
		return `${showcaseOrigin}/${encodeURIComponent(key)}`;
	}

	function selectedShowcase(): ShowcaseItem | undefined {
		if (!selectedShowcaseKey) return undefined;
		return showcases.find((showcase) => showcase.key === selectedShowcaseKey);
	}

	function applySelectedShowcaseState(showcase: ShowcaseItem | undefined) {
		if (!showcase) {
			selectedMarketIds = new Set();
			selectedNonAnonIds = new Set();
			hiddenCategoryIds = new Set();
			return;
		}
		selectedMarketIds = new Set(showcase.showcase_market_ids ?? []);
		selectedNonAnonIds = new Set(showcase.non_anonymous_account_ids ?? []);
		hiddenCategoryIds = new Set(showcase.hidden_category_ids ?? []);
	}

	function updateShowcaseInList(key: string, updater: (showcase: ShowcaseItem) => ShowcaseItem) {
		showcases = showcases.map((showcase) => {
			if (showcase.key !== key) return showcase;
			return updater(showcase);
		});
	}

	async function getAuthHeaders(): Promise<Record<string, string>> {
		const token = await kinde.getToken();
		return token ? { Authorization: `Bearer ${token}` } : {};
	}

	async function fetchJson<T>(path: string): Promise<T> {
		const headers = await getAuthHeaders();
		const res = await fetch(`${apiBase}${path}`, { headers });
		if (!res.ok) {
			throw new Error(`Request failed: ${res.status}`);
		}
		return (await res.json()) as T;
	}

	async function postJson(path: string, body: unknown): Promise<unknown> {
		const headers = await getAuthHeaders();
		const res = await fetch(`${apiBase}${path}`, {
			method: 'POST',
			headers: {
				...headers,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		if (!res.ok) {
			throw new Error(`Request failed: ${res.status}`);
		}
		try {
			return await res.json();
		} catch {
			return null;
		}
	}

	async function fetchCoreConfig() {
		const config = await fetchJson<ConfigResponse>('/api/showcase/config');
		defaultShowcase = config.default_showcase;
		pendingDefault = config.default_showcase ?? '';
	}

	async function fetchDatabases() {
		databases = await fetchJson<DatabaseItem[]>('/api/showcase/databases');
		databases.sort((a, b) => a.key.localeCompare(b.key));
		if (!newShowcaseDatabaseKey && databases.length > 0) {
			newShowcaseDatabaseKey = databases[0].key;
		}
	}

	async function fetchShowcases() {
		showcases = await fetchJson<ShowcaseItem[]>('/api/showcase/showcases');
		showcases.sort((a, b) => a.key.localeCompare(b.key));

		if (
			!selectedShowcaseKey ||
			!showcases.some((showcase) => showcase.key === selectedShowcaseKey)
		) {
			selectedShowcaseKey = defaultShowcase ?? showcases[0]?.key ?? null;
		}

		applySelectedShowcaseState(selectedShowcase());
	}

	async function fetchEditorData(showcaseKey: string) {
		const [marketList, marketTypeList, accountList] = await Promise.all([
			fetchJson<MarketInfo[]>(`/api/showcase/showcases/${encodeURIComponent(showcaseKey)}/markets`),
			fetchJson<MarketTypeInfo[]>(
				`/api/showcase/showcases/${encodeURIComponent(showcaseKey)}/market-types`
			),
			fetchJson<AccountInfo[]>(
				`/api/showcase/showcases/${encodeURIComponent(showcaseKey)}/accounts`
			)
		]);

		marketList.sort((a, b) => a.id - b.id);
		marketTypeList.sort((a, b) => a.id - b.id);
		accountList.sort((a, b) => a.id - b.id);

		markets = marketList;
		marketTypes = marketTypeList;
		accounts = accountList;
	}

	async function refreshAll() {
		loading = true;
		try {
			await fetchCoreConfig();
			await fetchDatabases();
			await fetchShowcases();
			if (selectedShowcaseKey) {
				await fetchEditorData(selectedShowcaseKey);
			} else {
				markets = [];
				marketTypes = [];
				accounts = [];
			}
		} catch (error) {
			toast.error(`Failed to load showcase config: ${error}`);
		} finally {
			loading = false;
		}
	}

	async function addDatabase() {
		if (!newDatabaseKey || !newDatabasePath || !newDatabaseDisplayName) {
			toast.error('Database key, path, and display name are required');
			return;
		}
		try {
			await postJson('/api/showcase/databases', {
				key: newDatabaseKey,
				db_path: newDatabasePath,
				display_name: newDatabaseDisplayName
			});
			newDatabaseKey = '';
			newDatabasePath = '';
			newDatabaseDisplayName = '';
			await fetchDatabases();
			toast.success('Database added');
		} catch (error) {
			toast.error(`Failed to add database: ${error}`);
		}
	}

	async function addShowcase() {
		if (!newShowcaseKey || !newShowcaseDisplayName || !newShowcaseDatabaseKey) {
			toast.error('Showcase key, display name, and database are required');
			return;
		}
		try {
			await postJson('/api/showcase/showcases', {
				key: newShowcaseKey,
				display_name: newShowcaseDisplayName,
				database_key: newShowcaseDatabaseKey
			});
			newShowcaseKey = '';
			newShowcaseDisplayName = '';
			await fetchShowcases();
			clearPublicShowcaseConfigCache();
			toast.success('Showcase added');
		} catch (error) {
			toast.error(`Failed to add showcase: ${error}`);
		}
	}

	async function deleteShowcase(key: string) {
		if (!confirm(`Delete showcase "${key}"?`)) {
			return;
		}
		try {
			const headers = await getAuthHeaders();
			const res = await fetch(`${apiBase}/api/showcase/showcases/${encodeURIComponent(key)}`, {
				method: 'DELETE',
				headers
			});
			if (!res.ok) {
				throw new Error(`Request failed: ${res.status}`);
			}
			if (selectedShowcaseKey === key) {
				selectedShowcaseKey = null;
			}
			await refreshAll();
			clearPublicShowcaseConfigCache();
			toast.success('Showcase deleted');
		} catch (error) {
			toast.error(`Failed to delete showcase: ${error}`);
		}
	}

	async function saveDefaultShowcase() {
		try {
			await postJson('/api/showcase/default', {
				showcase: pendingDefault || null
			});
			defaultShowcase = pendingDefault || null;
			clearPublicShowcaseConfigCache();
			toast.success('Default showcase updated');
		} catch (error) {
			toast.error(`Failed to update default showcase: ${error}`);
		}
	}

	async function saveMarkets() {
		if (!selectedShowcaseKey) return;
		try {
			const marketIds = [...selectedMarketIds].sort((a, b) => a - b);
			await postJson(`/api/showcase/showcases/${encodeURIComponent(selectedShowcaseKey)}/markets`, {
				market_ids: marketIds
			});
			updateShowcaseInList(selectedShowcaseKey, (showcase) => ({
				...showcase,
				showcase_market_ids: marketIds
			}));
			toast.success('Shown markets updated');
		} catch (error) {
			toast.error(`Failed to update shown markets: ${error}`);
		}
	}

	async function toggleAnonymize() {
		if (!selectedShowcaseKey) return;
		const showcase = selectedShowcase();
		if (!showcase) return;
		const next = !showcase.anonymize_names;
		try {
			await postJson(
				`/api/showcase/showcases/${encodeURIComponent(selectedShowcaseKey)}/anonymize`,
				{
					anonymize: next
				}
			);
			updateShowcaseInList(selectedShowcaseKey, (current) => ({
				...current,
				anonymize_names: next
			}));
			toast.success(`Anonymization ${next ? 'enabled' : 'disabled'}`);
		} catch (error) {
			toast.error(`Failed to update anonymization: ${error}`);
		}
	}

	async function saveNonAnonymousAccounts() {
		if (!selectedShowcaseKey) return;
		try {
			const accountIds = [...selectedNonAnonIds].sort((a, b) => a - b);
			await postJson(
				`/api/showcase/showcases/${encodeURIComponent(selectedShowcaseKey)}/non-anonymous-accounts`,
				{ account_ids: accountIds }
			);
			updateShowcaseInList(selectedShowcaseKey, (showcase) => ({
				...showcase,
				non_anonymous_account_ids: accountIds
			}));
			toast.success('Non-anonymous accounts updated');
		} catch (error) {
			toast.error(`Failed to update non-anonymous accounts: ${error}`);
		}
	}

	async function toggleHiddenCategory(categoryId: number) {
		if (!selectedShowcaseKey) return;
		try {
			const data = (await postJson(
				`/api/showcase/showcases/${encodeURIComponent(selectedShowcaseKey)}/hidden-categories`,
				{ category_id: categoryId }
			)) as { hidden?: boolean } | null;

			const next = new Set(hiddenCategoryIds);
			const hidden = data?.hidden ?? !next.has(categoryId);
			if (hidden) {
				next.add(categoryId);
			} else {
				next.delete(categoryId);
			}
			hiddenCategoryIds = next;

			updateShowcaseInList(selectedShowcaseKey, (showcase) => ({
				...showcase,
				hidden_category_ids: [...next].sort((a, b) => a - b)
			}));
		} catch (error) {
			toast.error(`Failed to update hidden categories: ${error}`);
		}
	}

	function toggleMarket(id: number) {
		const next = new Set(selectedMarketIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedMarketIds = next;
	}

	function toggleNonAnonymousAccount(id: number) {
		const next = new Set(selectedNonAnonIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedNonAnonIds = next;
	}

	$effect(() => {
		if (!serverState.isAdmin || initialized) return;
		initialized = true;
		void refreshAll();
	});

	$effect(() => {
		const showcaseKey = selectedShowcaseKey;
		applySelectedShowcaseState(selectedShowcase());
		accountSearchQuery = '';
		if (!showcaseKey) {
			markets = [];
			marketTypes = [];
			accounts = [];
			return;
		}
		void fetchEditorData(showcaseKey);
	});
</script>

{#if !serverState.isAdmin}
	<div class="flex min-h-[50vh] items-center justify-center">
		<p class="text-muted-foreground">Admin access required</p>
	</div>
{:else}
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6 py-6">
		<h1 class="text-2xl font-bold">Showcase Management</h1>

		{#if loading}
			<div class="flex items-center justify-center py-8">
				<div
					class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
				></div>
			</div>
		{:else}
			<Card.Root>
				<Card.Header>
					<Card.Title>Databases</Card.Title>
					<Card.Description>Shared database registry for showcases</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					{#if databases.length === 0}
						<p class="text-sm text-muted-foreground">No databases configured.</p>
					{:else}
						<div class="flex flex-col gap-2">
							{#each databases as database}
								<div class="rounded border p-3 text-sm">
									<p class="font-medium">{database.display_name}</p>
									<p class="text-muted-foreground">Key: {database.key}</p>
									<p class="text-muted-foreground">Path: {database.db_path}</p>
								</div>
							{/each}
						</div>
					{/if}

					<div class="grid gap-2 md:grid-cols-3">
						<input
							bind:value={newDatabaseKey}
							placeholder="database key (e.g. dag-feb8)"
							class="rounded-md border bg-background px-3 py-2"
						/>
						<input
							bind:value={newDatabasePath}
							placeholder="database path (e.g. /data/dag-feb8.sqlite)"
							class="rounded-md border bg-background px-3 py-2"
						/>
						<input
							bind:value={newDatabaseDisplayName}
							placeholder="display name"
							class="rounded-md border bg-background px-3 py-2"
						/>
					</div>
					<div>
						<Button onclick={addDatabase}>Add Database</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Showcases</Card.Title>
					<Card.Description>Create showcases and choose the default for `/`</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="flex flex-col gap-2">
						<label for="default-showcase" class="text-sm font-medium">Default showcase</label>
						<select
							id="default-showcase"
							bind:value={pendingDefault}
							class="rounded-md border bg-background px-3 py-2"
						>
							<option value="">No default</option>
							{#each showcases as showcase}
								<option value={showcase.key}>
									{showcase.display_name} ({showcase.key})
								</option>
							{/each}
						</select>
						<div>
							<Button variant="outline" onclick={saveDefaultShowcase}>Save Default</Button>
						</div>
						{#if defaultShowcase}
							<p class="text-sm text-muted-foreground">Current default: {defaultShowcase}</p>
						{:else}
							<p class="text-sm text-muted-foreground">No default showcase configured.</p>
						{/if}
					</div>

					{#if showcases.length === 0}
						<p class="text-sm text-muted-foreground">No showcases configured.</p>
					{:else}
						<div class="flex flex-col gap-2">
							{#each showcases as showcase}
								<div class="rounded border p-3 text-sm">
									<div class="flex flex-wrap items-center justify-between gap-2">
										<div>
											<p class="font-medium">{showcase.display_name}</p>
											<p class="text-muted-foreground">
												Key: {showcase.key} | Database: {showcase.database_key}
											</p>
											<p class="text-muted-foreground">
												Share URL:
												<a
													href={shareUrlFor(showcase.key)}
													target="_blank"
													rel="noopener noreferrer"
													class="underline">{shareUrlFor(showcase.key)}</a
												>
											</p>
										</div>
										<div class="flex items-center gap-2">
											<Button
												size="sm"
												variant={selectedShowcaseKey === showcase.key ? 'default' : 'outline'}
												onclick={() => (selectedShowcaseKey = showcase.key)}
											>
												{selectedShowcaseKey === showcase.key ? 'Editing' : 'Edit'}
											</Button>
											<Button
												size="sm"
												variant="outline"
												class="text-destructive hover:text-destructive"
												onclick={() => deleteShowcase(showcase.key)}
											>
												Delete
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<div class="grid gap-2 md:grid-cols-3">
						<input
							bind:value={newShowcaseKey}
							placeholder="showcase key (e.g. client)"
							class="rounded-md border bg-background px-3 py-2"
						/>
						<input
							bind:value={newShowcaseDisplayName}
							placeholder="showcase display name"
							class="rounded-md border bg-background px-3 py-2"
						/>
						<select
							bind:value={newShowcaseDatabaseKey}
							class="rounded-md border bg-background px-3 py-2"
						>
							<option value="">Select database</option>
							{#each databases as database}
								<option value={database.key}>{database.display_name} ({database.key})</option>
							{/each}
						</select>
					</div>
					<div>
						<Button onclick={addShowcase}>Add Showcase</Button>
					</div>
				</Card.Content>
			</Card.Root>

			{#if selectedShowcaseKey && selectedShowcase()}
				{@const showcase = selectedShowcase()!}
				<Card.Root>
					<Card.Header>
						<Card.Title>Showcase Editor: {showcase.display_name}</Card.Title>
						<Card.Description>
							Key: {showcase.key} | Database: {showcase.database_key}
						</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-6">
						<div class="rounded border p-3">
							<label class="flex cursor-pointer items-center gap-3">
								<input
									type="checkbox"
									checked={showcase.anonymize_names}
									onchange={toggleAnonymize}
									class="h-4 w-4"
								/>
								<span>Anonymize account names for this showcase</span>
							</label>
						</div>

						<div class="rounded border p-3">
							<div class="mb-2 flex items-center justify-between gap-2">
								<h3 class="font-medium">Shown Markets</h3>
								<Button size="sm" variant="outline" onclick={saveMarkets}>Save Markets</Button>
							</div>
							{#if markets.length === 0}
								<p class="text-sm text-muted-foreground">No markets found in this database.</p>
							{:else}
								<div class="grid max-h-80 gap-1 overflow-y-auto">
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
											<span class="text-sm">
												<span class="text-muted-foreground">#{market.id}</span>
												{market.name}
											</span>
										</label>
									{/each}
								</div>
							{/if}
						</div>

						<div class="rounded border p-3">
							<h3 class="mb-2 font-medium">Hidden Categories</h3>
							{#if marketTypes.length === 0}
								<p class="text-sm text-muted-foreground">No categories found in this database.</p>
							{:else}
								<div class="grid gap-1">
									{#each marketTypes as marketType}
										<label
											class="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-accent"
										>
											<input
												type="checkbox"
												checked={hiddenCategoryIds.has(marketType.id)}
												onchange={() => toggleHiddenCategory(marketType.id)}
												class="h-4 w-4"
											/>
											<span class="text-sm">
												<span class="text-muted-foreground">#{marketType.id}</span>
												{marketType.name}
											</span>
										</label>
									{/each}
								</div>
							{/if}
						</div>

						<div class="rounded border p-3">
							<div class="mb-2 flex items-center justify-between gap-2">
								<h3 class="font-medium">Non-Anonymous Accounts</h3>
								<Button size="sm" variant="outline" onclick={saveNonAnonymousAccounts}>
									Save Accounts
								</Button>
							</div>
							{#if showcase.anonymize_names}
								<input
									bind:value={accountSearchQuery}
									placeholder="Search accounts..."
									class="mb-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
								/>
								<div class="grid max-h-80 gap-1 overflow-y-auto">
									{#each accounts.filter((account) => account.name
											.toLowerCase()
											.includes(accountSearchQuery.toLowerCase())) as account}
										<label
											class="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-accent"
										>
											<input
												type="checkbox"
												checked={selectedNonAnonIds.has(account.id)}
												onchange={() => toggleNonAnonymousAccount(account.id)}
												class="h-4 w-4"
											/>
											<span class="text-sm">
												<span class="text-muted-foreground">#{account.id}</span>
												{account.name}
											</span>
										</label>
									{/each}
								</div>
							{:else}
								<p class="text-sm text-muted-foreground">
									Anonymization is off. This list is only used when anonymization is enabled.
								</p>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		{/if}
	</div>
{/if}
