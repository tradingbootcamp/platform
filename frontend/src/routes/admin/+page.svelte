<script lang="ts">
	import { goto } from '$app/navigation';
	import { kinde } from '$lib/auth.svelte';
	import { toast } from 'svelte-sonner';
	import {
		fetchAllCohorts,
		createCohort,
		updateCohort,
		fetchConfig,
		updateConfig,
		fetchUsersDetailed,
		fetchAvailableDbs,
		type CohortInfo,
		type GlobalConfig,
		type UserWithCohorts
	} from '$lib/adminApi';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	// Auth check
	let isAdmin = $state(false);
	let loading = $state(true);

	// Cohorts
	let cohorts = $state<CohortInfo[]>([]);
	let newCohortName = $state('');
	let newCohortDisplayName = $state('');
	let newCohortExistingDb = $state(false);
	let availableDbs = $state<string[]>([]);

	// Config (auto-save)
	let config = $state<GlobalConfig>({
		active_auction_cohort_id: null,
		default_cohort_id: null,
		public_auction_enabled: false
	});
	let configLoaded = $state(false);

	async function autoSaveConfig() {
		if (!configLoaded) return;
		try {
			await updateConfig({
				active_auction_cohort_id: config.active_auction_cohort_id,
				default_cohort_id: config.default_cohort_id,
				public_auction_enabled: config.public_auction_enabled
			});
		} catch (e) {
			toast.error('Failed to save config: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	// All users view
	let allUsers = $state<UserWithCohorts[]>([]);
	let userSearch = $state('');
	let loadingAllUsers = $state(false);

	let filteredUsers = $derived.by(() => {
		if (!userSearch.trim()) return allUsers;
		const q = userSearch.toLowerCase();
		return allUsers.filter(
			(u) =>
				u.display_name.toLowerCase().includes(q) ||
				(u.email && u.email.toLowerCase().includes(q))
		);
	});

	let lastCohortName = $state<string | null>(null);
	let lastCohortDisplay = $derived.by(() => {
		if (!lastCohortName) return null;
		return cohorts.find((c) => c.name === lastCohortName)?.display_name ?? lastCohortName;
	});

	function formatBalance(balance: number | null): string {
		if (balance == null) return '-';
		return balance.toLocaleString(undefined, { maximumFractionDigits: 0 });
	}

	onMount(async () => {
		if (browser) {
			lastCohortName = localStorage.getItem('lastCohort');
		}
		const adminStatus = await kinde.isAdmin();
		if (!adminStatus) {
			goto('/');
			return;
		}
		isAdmin = true;
		loading = false;
		await loadData();
	});

	async function loadData() {
		try {
			const [c, cfg, dbs] = await Promise.all([fetchAllCohorts(), fetchConfig(), fetchAvailableDbs()]);
			cohorts = c;
			config = cfg;
			availableDbs = dbs;
			configLoaded = true;
		} catch (e) {
			toast.error('Failed to load data: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleCreateCohort() {
		if (!newCohortName || !newCohortDisplayName) {
			toast.error('Name and display name are required');
			return;
		}
		try {
			const cohort = await createCohort(newCohortName, newCohortDisplayName, newCohortExistingDb);
			cohorts = [...cohorts, cohort];
			newCohortName = '';
			newCohortDisplayName = '';
			newCohortExistingDb = false;
			availableDbs = availableDbs.filter((db) => db !== cohort.name);
			toast.success('Cohort created');
		} catch (e) {
			toast.error('Failed to create cohort: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleToggleReadOnly(e: Event, cohort: CohortInfo) {
		e.preventDefault();
		e.stopPropagation();
		try {
			await updateCohort(cohort.name, undefined, !cohort.is_read_only);
			cohort.is_read_only = !cohort.is_read_only;
			cohorts = [...cohorts];
			toast.success(`Cohort ${cohort.name} updated`);
		} catch (err) {
			toast.error('Failed to update cohort: ' + (err instanceof Error ? err.message : String(err)));
		}
	}

	async function loadAllUsers() {
		loadingAllUsers = true;
		try {
			allUsers = await fetchUsersDetailed();
		} catch (e) {
			toast.error('Failed to load users: ' + (e instanceof Error ? e.message : String(e)));
		} finally {
			loadingAllUsers = false;
		}
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else if !isAdmin}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">Admin access required.</p>
	</div>
{:else}
	<div class="mx-auto max-w-4xl p-8">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Admin</h1>
			{#if lastCohortName}
				<a
					href="/{lastCohortName}/market"
					class="text-sm text-muted-foreground hover:text-foreground"
				>
					Back to {lastCohortDisplay}
				</a>
			{:else}
				<a href="/" class="text-sm text-muted-foreground hover:text-foreground">
					Back to cohorts
				</a>
			{/if}
		</div>

		<!-- General Config -->
		<section class="mb-12">
			<h2 class="mb-4 text-xl font-semibold">General Config</h2>
			<div class="flex flex-wrap items-center gap-6 rounded-lg border p-4">
				<div class="flex flex-col gap-1">
					<div class="flex items-center gap-2">
						<label class="text-sm font-medium" for="default-cohort">Default Cohort</label>
						<select
							id="default-cohort"
							class="rounded-md border bg-background px-3 py-2 text-sm"
							bind:value={config.default_cohort_id}
							onchange={autoSaveConfig}
						>
							<option value={null}>None</option>
							{#each cohorts as cohort}
								<option value={cohort.id}>{cohort.display_name}</option>
							{/each}
						</select>
					</div>
					<p class="text-xs text-muted-foreground">
						This only affects the default cohort that the python client and scenarios server uses
					</p>
				</div>
			</div>
		</section>

		<!-- Auction Config -->
		<section class="mb-12">
			<h2 class="mb-4 text-xl font-semibold">Auction Config</h2>
			<div class="flex flex-wrap items-center gap-6 rounded-lg border p-4">
				<div class="flex items-center gap-2">
					<label class="text-sm font-medium" for="auction-cohort">Active Cohort</label>
					<select
						id="auction-cohort"
						class="rounded-md border bg-background px-3 py-2 text-sm"
						bind:value={config.active_auction_cohort_id}
						onchange={autoSaveConfig}
					>
						<option value={null}>None</option>
						{#each cohorts as cohort}
							<option value={cohort.id}>{cohort.display_name}</option>
						{/each}
					</select>
				</div>
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						bind:checked={config.public_auction_enabled}
						onchange={autoSaveConfig}
					/>
					Public Auction Enabled
				</label>
			</div>
		</section>

		<!-- Cohorts -->
		<section class="mb-12">
			<h2 class="mb-4 text-xl font-semibold">Cohorts</h2>
			<div class="mb-6 rounded-lg border p-4">
				<h3 class="mb-3 font-medium">Create New Cohort</h3>
				<div class="grid gap-3 md:grid-cols-2">
					<input
						class="rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="URL slug (e.g., spring-2026)"
						bind:value={newCohortName}
					/>
					<input
						class="rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="Display name"
						bind:value={newCohortDisplayName}
					/>
				</div>
				<label class="mt-3 flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={newCohortExistingDb} />
					Use existing database
				</label>
				<button
					class="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
					onclick={handleCreateCohort}
				>
					Create
				</button>
			</div>
			{#if availableDbs.length > 0}
				<div class="mb-6 rounded-lg border p-4">
					<h3 class="mb-3 font-medium">Available Databases</h3>
					<div class="flex flex-wrap gap-2">
						{#each availableDbs as db}
							<button
								class="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
								onclick={() => {
									newCohortName = db;
									newCohortDisplayName = '';
									newCohortExistingDb = true;
								}}
							>
								{db}
							</button>
						{/each}
					</div>
				</div>
			{/if}
			<div class="space-y-2">
				{#each cohorts as cohort}
					<a
						href="/admin/cohorts/{cohort.name}"
						class="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
					>
						<div class="flex items-center gap-2">
							<span class="font-medium">{cohort.display_name}</span>
							<span class="text-sm text-muted-foreground">({cohort.name})</span>
							{#if cohort.is_read_only}
								<span
									class="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
								>
									Read-only
								</span>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<button
								class="rounded-md border px-3 py-1 text-sm hover:bg-muted"
								onclick={(e) => handleToggleReadOnly(e, cohort)}
							>
								{cohort.is_read_only ? 'Make writable' : 'Make read-only'}
							</button>
							<ChevronRight class="h-4 w-4 text-muted-foreground" />
						</div>
					</a>
				{/each}
			</div>
		</section>

		<!-- All Users -->
		<section class="mb-12">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">All Users</h2>
				<button
					class="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
					onclick={loadAllUsers}
					disabled={loadingAllUsers}
				>
					{loadingAllUsers ? 'Loading...' : allUsers.length ? 'Refresh' : 'Load Users'}
				</button>
			</div>
			{#if allUsers.length > 0}
				<input
					class="mb-3 w-full rounded-md border bg-background px-3 py-2 text-sm"
					placeholder="Search users..."
					bind:value={userSearch}
				/>
				<div class="space-y-1">
					{#each filteredUsers as user (user.id)}
						<div class="rounded-lg border p-2 px-3">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<span class="font-medium">{user.display_name}</span>
									{#if user.email}
										<span class="text-sm text-muted-foreground">{user.email}</span>
									{/if}
								</div>
								{#if user.is_admin}
									<span
										class="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400"
									>
										Admin
									</span>
								{/if}
							</div>
							{#if user.cohorts.length > 0}
								<div class="mt-1 flex flex-wrap gap-2">
									{#each user.cohorts as uc}
										<span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
											{uc.cohort_display_name}
											{#if uc.balance != null}
												<span class="font-mono">({formatBalance(uc.balance)})</span>
											{/if}
										</span>
									{/each}
								</div>
							{:else}
								<p class="mt-1 text-xs text-muted-foreground">No cohorts</p>
							{/if}
						</div>
					{/each}
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					{filteredUsers.length} of {allUsers.length} users
				</p>
			{:else if !loadingAllUsers}
				<p class="text-muted-foreground">Click "Load Users" to view all users.</p>
			{/if}
		</section>
	</div>
{/if}
