<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { clearPublicShowcaseConfigCache } from '$lib/showcaseRouting';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
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
		has_password: boolean;
	}

	interface MarketInfo {
		id: number;
		name: string;
		type_id: number;
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
	let databasesExpanded = $state(false);

	let selectedShowcaseKey = $derived.by(() => {
		const key = $page.url.searchParams.get('showcase');
		if (!key) return null;
		const trimmed = key.trim();
		return trimmed.length > 0 ? trimmed : null;
	});
	let isEditMode = $derived(Boolean(selectedShowcaseKey));
	let markets: MarketInfo[] = $state([]);
	let marketTypes: MarketTypeInfo[] = $state([]);
	let accounts: AccountInfo[] = $state([]);

	let selectedMarketIds: Set<number> = $state(new Set());
	let selectedNonAnonIds: Set<number> = $state(new Set());
	let hiddenCategoryIds: Set<number> = $state(new Set());
	let marketSearchQuery = $state('');
	let accountSearchQuery = $state('');

	let newPasswordValue = $state('');

	let newDatabaseKey = $state('');
	let newDatabasePath = $state('');
	let newDatabaseDisplayName = $state('');

	let newShowcaseDisplayName = $state('');
	let newShowcaseDatabaseKey = $state('');

	function generateShowcaseKey(displayName: string): string {
		return displayName
			.trim()
			.toLowerCase()
			.replace(/['"]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	let newShowcaseKey = $derived(generateShowcaseKey(newShowcaseDisplayName));

	const showcaseOrigin = browser ? window.location.origin : '';

	function shareUrlFor(key: string): string {
		return `${showcaseOrigin}/${encodeURIComponent(key)}`;
	}

	function editUrlFor(key: string): string {
		return `/showcase?showcase=${encodeURIComponent(key)}`;
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
			const showcase = selectedShowcase();
			if (showcase) {
				await fetchEditorData(showcase.key);
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
				await goto('/showcase', { replaceState: true });
			}
			await refreshAll();
			clearPublicShowcaseConfigCache();
			toast.success('Showcase deleted');
		} catch (error) {
			toast.error(`Failed to delete showcase: ${error}`);
		}
	}

	async function setDefault(key: string) {
		try {
			await postJson('/api/showcase/default', { showcase: key });
			defaultShowcase = key;
			clearPublicShowcaseConfigCache();
			toast.success('Default showcase updated');
		} catch (error) {
			toast.error(`Failed to update default showcase: ${error}`);
		}
	}

	async function unsetDefault() {
		try {
			await postJson('/api/showcase/default', { showcase: null });
			defaultShowcase = null;
			clearPublicShowcaseConfigCache();
			toast.success('Default showcase cleared');
		} catch (error) {
			toast.error(`Failed to clear default showcase: ${error}`);
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

	async function saveNonAnonymousAccountIds(ids: Set<number>) {
		if (!selectedShowcaseKey) return;
		try {
			const accountIds = [...ids].sort((a, b) => a - b);
			await postJson(
				`/api/showcase/showcases/${encodeURIComponent(selectedShowcaseKey)}/non-anonymous-accounts`,
				{ account_ids: accountIds }
			);
			updateShowcaseInList(selectedShowcaseKey, (showcase) => ({
				...showcase,
				non_anonymous_account_ids: accountIds
			}));
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

	async function setShowcasePassword(pw: string | null) {
		if (!selectedShowcaseKey) return;
		try {
			await postJson(
				`/api/showcase/showcases/${encodeURIComponent(selectedShowcaseKey)}/password`,
				{ password: pw }
			);
			updateShowcaseInList(selectedShowcaseKey, (showcase) => ({
				...showcase,
				has_password: pw != null && pw.trim().length > 0
			}));
			newPasswordValue = '';
			toast.success(pw ? 'Password set' : 'Password removed');
		} catch (error) {
			toast.error(`Failed to update password: ${error}`);
		}
	}

	async function toggleMarket(id: number) {
		const next = new Set(selectedMarketIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedMarketIds = next;
		if (!selectedShowcaseKey) return;
		try {
			const marketIds = [...next].sort((a, b) => a - b);
			await postJson(`/api/showcase/showcases/${encodeURIComponent(selectedShowcaseKey)}/markets`, {
				market_ids: marketIds
			});
			updateShowcaseInList(selectedShowcaseKey, (showcase) => ({
				...showcase,
				showcase_market_ids: marketIds
			}));
		} catch (error) {
			toast.error(`Failed to update shown markets: ${error}`);
		}
	}

	function toggleNonAnonymousAccount(id: number) {
		const next = new Set(selectedNonAnonIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedNonAnonIds = next;
		void saveNonAnonymousAccountIds(next);
	}

	const marketTypeNameMap = $derived.by(() => {
		const map = new Map<number, string>();
		for (const mt of marketTypes) {
			map.set(mt.id, mt.name);
		}
		return map;
	});

	const filteredMarkets = $derived.by(() => {
		const query = marketSearchQuery.trim().toLowerCase();
		if (!query) return markets;
		return markets.filter((market) => {
			return market.name.toLowerCase().includes(query) || String(market.id).includes(query);
		});
	});

	const filteredAccounts = $derived.by(() => {
		const query = accountSearchQuery.trim().toLowerCase();
		if (!query) return accounts;
		return accounts.filter((account) => {
			return account.name.toLowerCase().includes(query) || String(account.id).includes(query);
		});
	});

	const canSelectAllFilteredAccounts = $derived.by(() => {
		if (filteredAccounts.length === 0) return false;
		return filteredAccounts.some((account) => !selectedNonAnonIds.has(account.id));
	});

	function selectAllFilteredNonAnonymousAccounts() {
		if (filteredAccounts.length === 0) return;
		const nextSelected = new Set(selectedNonAnonIds);
		for (const account of filteredAccounts) {
			nextSelected.add(account.id);
		}
		selectedNonAnonIds = nextSelected;
		void saveNonAnonymousAccountIds(nextSelected);
	}

	$effect(() => {
		if (!serverState.isAdmin || initialized) return;
		initialized = true;
		void refreshAll();
	});

	$effect(() => {
		const showcaseKey = selectedShowcaseKey;
		const showcase = selectedShowcase();
		applySelectedShowcaseState(showcase);
		marketSearchQuery = '';
		accountSearchQuery = '';
		if (!showcaseKey || !showcase) {
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
		{:else if !isEditMode}
			<Card.Root>
				<Card.Header>
					<Card.Title>Showcases</Card.Title>
					<Card.Description>Create showcases and choose the default for `/`</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
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
												{#if showcase.has_password}
													<span
														class="ml-1 inline-block rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200"
														>password protected</span
													>
												{/if}
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
											{#if defaultShowcase === showcase.key}
												<Button size="sm" variant="outline" onclick={() => unsetDefault()}>
													Unset Default
												</Button>
											{:else}
												<Button
													size="sm"
													variant="outline"
													onclick={() => setDefault(showcase.key)}
												>
													Set Default
												</Button>
											{/if}
											<Button size="sm" variant="outline" href={editUrlFor(showcase.key)}>
												Edit
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

					<div class="grid gap-2 md:grid-cols-2">
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
					{#if newShowcaseKey}
						<p class="text-xs text-muted-foreground">
							Key: <code>{newShowcaseKey}</code>
						</p>
					{/if}
					<div>
						<Button onclick={addShowcase}>Add Showcase</Button>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class={databasesExpanded ? '' : 'pb-6'}>
					<button
						class="flex w-full cursor-pointer items-center gap-2 text-left"
						onclick={() => (databasesExpanded = !databasesExpanded)}
					>
						{#if databasesExpanded}
							<ChevronDown class="h-4 w-4" />
						{:else}
							<ChevronRight class="h-4 w-4" />
						{/if}
						<div>
							<Card.Title>Databases</Card.Title>
							<Card.Description>Shared database registry for showcases</Card.Description>
						</div>
					</button>
				</Card.Header>
				{#if databasesExpanded}
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
				{/if}
			</Card.Root>
		{:else if selectedShowcaseKey && selectedShowcase()}
			{@const showcase = selectedShowcase()!}
			<div>
				<Button variant="outline" href="/showcase">Back to Showcases</Button>
			</div>
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
						<h3 class="mb-2 font-medium">Password Protection</h3>
						{#if showcase.has_password}
							<p class="mb-2 text-sm text-muted-foreground">
								This showcase is password protected.
							</p>
							<div class="flex gap-2">
								<Button
									size="sm"
									variant="outline"
									class="text-destructive hover:text-destructive"
									onclick={() => setShowcasePassword(null)}
								>
									Remove Password
								</Button>
							</div>
						{:else}
							<p class="mb-2 text-sm text-muted-foreground">
								No password set. Anyone with the link can view this showcase.
							</p>
						{/if}
						<div class="mt-2 flex gap-2">
							<input
								type="text"
								bind:value={newPasswordValue}
								placeholder={showcase.has_password
									? 'New password (replaces existing)'
									: 'Set a password'}
								class="w-full rounded-md border bg-background px-3 py-2 text-sm"
							/>
							<Button
								size="sm"
								disabled={!newPasswordValue.trim()}
								onclick={() => setShowcasePassword(newPasswordValue.trim())}
							>
								{showcase.has_password ? 'Update' : 'Set'}
							</Button>
						</div>
					</div>

					<div class="rounded border p-3">
						<h3 class="mb-2 font-medium">Shown Markets</h3>
						{#if markets.length === 0}
							<p class="text-sm text-muted-foreground">No markets found in this database.</p>
						{:else}
							<input
								bind:value={marketSearchQuery}
								placeholder="Search markets..."
								class="mb-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
							/>
							{#if filteredMarkets.length === 0}
								<p class="text-sm text-muted-foreground">No markets found.</p>
							{:else}
								<div class="grid max-h-80 gap-1 overflow-y-auto">
									{#each filteredMarkets as market}
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
												{#if marketTypeNameMap.get(market.type_id)}
													<span class="text-muted-foreground">({marketTypeNameMap.get(market.type_id)})</span>
												{/if}
											</span>
										</label>
									{/each}
								</div>
							{/if}
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
						<h3 class="mb-2 font-medium">Non-Anonymous Accounts</h3>
						{#if showcase.anonymize_names}
							<input
								bind:value={accountSearchQuery}
								placeholder="Search accounts..."
								class="mb-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
							/>
							{#if accountSearchQuery.trim().length > 0}
								<div class="mb-2">
									<Button
										variant="outline"
										size="sm"
										disabled={!canSelectAllFilteredAccounts}
										onclick={selectAllFilteredNonAnonymousAccounts}
									>
										Select all matching "{accountSearchQuery.trim()}"
									</Button>
								</div>
							{/if}
							<div class="grid max-h-80 gap-1 overflow-y-auto">
								{#each filteredAccounts as account}
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
								{#if filteredAccounts.length === 0}
									<p class="text-sm text-muted-foreground">No accounts found.</p>
								{/if}
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">
								Anonymization is off. This list is only used when anonymization is enabled.
							</p>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Header>
					<Card.Title>Showcase Not Found</Card.Title>
					<Card.Description>
						No showcase matches key: <code>{selectedShowcaseKey}</code>
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button variant="outline" href="/showcase">Back to Showcases</Button>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
{/if}
