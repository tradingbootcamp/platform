<script lang="ts">
	import { goto } from '$app/navigation';
	import { kinde } from '$lib/auth.svelte';
	import { toast } from 'svelte-sonner';
	import {
		fetchAllCohorts,
		createCohort,
		updateCohort,
		fetchMembers,
		batchAddMembers,
		removeMember,
		fetchConfig,
		updateConfig,
		type CohortInfo,
		type CohortMember,
		type GlobalConfig
	} from '$lib/adminApi';
	import { onMount } from 'svelte';

	// Auth check
	let isAdmin = $state(false);
	let loading = $state(true);

	// Cohorts
	let cohorts = $state<CohortInfo[]>([]);
	let newCohortName = $state('');
	let newCohortDisplayName = $state('');
	let newCohortDbPath = $state('');

	// Members
	let selectedCohort = $state<CohortInfo | null>(null);
	let members = $state<CohortMember[]>([]);
	let newEmails = $state('');
	let loadingMembers = $state(false);

	// Config
	let config = $state<GlobalConfig>({ active_auction_cohort_id: null, public_auction_enabled: false });

	onMount(async () => {
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
			const [c, cfg] = await Promise.all([fetchAllCohorts(), fetchConfig()]);
			cohorts = c;
			config = cfg;
		} catch (e) {
			toast.error('Failed to load data: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleCreateCohort() {
		if (!newCohortName || !newCohortDisplayName || !newCohortDbPath) {
			toast.error('All fields are required');
			return;
		}
		try {
			const cohort = await createCohort(newCohortName, newCohortDisplayName, newCohortDbPath);
			cohorts = [...cohorts, cohort];
			newCohortName = '';
			newCohortDisplayName = '';
			newCohortDbPath = '';
			toast.success('Cohort created');
		} catch (e) {
			toast.error('Failed to create cohort: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleToggleReadOnly(cohort: CohortInfo) {
		try {
			await updateCohort(cohort.name, undefined, !cohort.is_read_only);
			cohort.is_read_only = !cohort.is_read_only;
			cohorts = [...cohorts];
			toast.success(`Cohort ${cohort.name} updated`);
		} catch (e) {
			toast.error('Failed to update cohort: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleSelectCohort(cohort: CohortInfo) {
		selectedCohort = cohort;
		loadingMembers = true;
		try {
			members = await fetchMembers(cohort.name);
		} catch (e) {
			toast.error('Failed to load members: ' + (e instanceof Error ? e.message : String(e)));
		} finally {
			loadingMembers = false;
		}
	}

	async function handleAddMembers() {
		if (!selectedCohort || !newEmails.trim()) return;
		const emails = newEmails
			.split(/[\n,]+/)
			.map((e) => e.trim())
			.filter(Boolean);
		if (emails.length === 0) return;
		try {
			const result = await batchAddMembers(selectedCohort.name, emails);
			toast.success(`Added ${result.added} members (${result.already_existing} already existed)`);
			newEmails = '';
			members = await fetchMembers(selectedCohort.name);
		} catch (e) {
			toast.error('Failed to add members: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleRemoveMember(member: CohortMember) {
		if (!selectedCohort) return;
		try {
			await removeMember(selectedCohort.name, member.id);
			members = members.filter((m) => m.id !== member.id);
			toast.success('Member removed');
		} catch (e) {
			toast.error('Failed to remove member: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleUpdateConfig() {
		try {
			await updateConfig({
				active_auction_cohort_id: config.active_auction_cohort_id ?? undefined,
				public_auction_enabled: config.public_auction_enabled
			});
			toast.success('Config updated');
		} catch (e) {
			toast.error('Failed to update config: ' + (e instanceof Error ? e.message : String(e)));
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
			<a href="/" class="text-sm text-muted-foreground hover:text-foreground">Back to cohorts</a>
		</div>

		<!-- Cohorts -->
		<section class="mb-12">
			<h2 class="mb-4 text-xl font-semibold">Cohorts</h2>
			<div class="mb-6 rounded-lg border p-4">
				<h3 class="mb-3 font-medium">Create New Cohort</h3>
				<div class="grid gap-3 md:grid-cols-3">
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
					<input
						class="rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="DB path"
						bind:value={newCohortDbPath}
					/>
				</div>
				<button
					class="mt-3 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
					onclick={handleCreateCohort}
				>
					Create
				</button>
			</div>
			<div class="space-y-2">
				{#each cohorts as cohort}
					<div class="flex items-center justify-between rounded-lg border p-3">
						<div>
							<span class="font-medium">{cohort.display_name}</span>
							<span class="ml-2 text-sm text-muted-foreground">({cohort.name})</span>
							{#if cohort.is_read_only}
								<span
									class="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
								>
									Read-only
								</span>
							{/if}
						</div>
						<div class="flex gap-2">
							<button
								class="rounded-md border px-3 py-1 text-sm hover:bg-muted"
								onclick={() => handleToggleReadOnly(cohort)}
							>
								{cohort.is_read_only ? 'Make writable' : 'Make read-only'}
							</button>
							<button
								class="rounded-md border px-3 py-1 text-sm hover:bg-muted {selectedCohort?.id === cohort.id ? 'border-primary bg-primary/10' : ''}"
								onclick={() => handleSelectCohort(cohort)}
							>
								Members
							</button>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Members -->
		{#if selectedCohort}
			<section class="mb-12">
				<h2 class="mb-4 text-xl font-semibold">
					Members: {selectedCohort.display_name}
				</h2>
				<div class="mb-4 rounded-lg border p-4">
					<h3 class="mb-2 font-medium">Add Members</h3>
					<textarea
						class="w-full rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="Enter emails (one per line or comma-separated)"
						rows="3"
						bind:value={newEmails}
					></textarea>
					<button
						class="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
						onclick={handleAddMembers}
					>
						Add Members
					</button>
				</div>
				{#if loadingMembers}
					<p class="text-muted-foreground">Loading members...</p>
				{:else if members.length === 0}
					<p class="text-muted-foreground">No members yet.</p>
				{:else}
					<div class="space-y-1">
						{#each members as member}
							<div class="flex items-center justify-between rounded-lg border p-2 px-3">
								<div>
									{#if member.display_name}
										<span class="font-medium">{member.display_name}</span>
									{/if}
									{#if member.email}
										<span class="text-sm text-muted-foreground">{member.email}</span>
									{:else if !member.display_name}
										<span class="text-sm text-muted-foreground">User #{member.global_user_id}</span>
									{/if}
								</div>
								<button
									class="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
									onclick={() => handleRemoveMember(member)}
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		{/if}

		<!-- Config -->
		<section class="mb-12">
			<h2 class="mb-4 text-xl font-semibold">Global Config</h2>
			<div class="rounded-lg border p-4">
				<div class="mb-4">
					<label class="mb-1 block text-sm font-medium">Active Auction Cohort</label>
					<select
						class="rounded-md border bg-background px-3 py-2 text-sm"
						bind:value={config.active_auction_cohort_id}
					>
						<option value={null}>None</option>
						{#each cohorts as cohort}
							<option value={cohort.id}>{cohort.display_name}</option>
						{/each}
					</select>
				</div>
				<div class="mb-4">
					<label class="flex items-center gap-2 text-sm">
						<input type="checkbox" bind:checked={config.public_auction_enabled} />
						Public Auction Enabled
					</label>
				</div>
				<button
					class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
					onclick={handleUpdateConfig}
				>
					Save Config
				</button>
			</div>
		</section>
	</div>
{/if}
