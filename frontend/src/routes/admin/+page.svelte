<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import {
		fetchAdminOverview,
		createCohort,
		updateConfig,
		toggleAdmin,
		updateDisplayName,
		type RenameConflict,
		deleteUser,
		type CohortInfo,
		type GlobalConfig,
		type UserWithCohorts
	} from '$lib/adminApi';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

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
		default_cohort_id: null
	});
	let configLoaded = $state(false);

	async function autoSaveConfig() {
		if (!configLoaded) return;
		try {
			await updateConfig({
				default_cohort_id: config.default_cohort_id
			});
		} catch (e) {
			toast.error('Failed to save config: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	// All users view
	let allUsers = $state<UserWithCohorts[]>([]);
	let userSearch = $state('');

	// Editing state
	let editingUserId = $state<number | null>(null);
	let editingName = $state('');
	let renameConflict = $state<{
		userId: number;
		name: string;
		conflicts: RenameConflict[];
	} | null>(null);

	// Confirm modal state
	let confirmModal = $state<{
		open: boolean;
		title: string;
		message: string;
		action: () => Promise<void>;
		variant: 'default' | 'destructive';
	}>({ open: false, title: '', message: '', action: async () => {}, variant: 'default' });

	let filteredUsers = $derived.by(() => {
		if (!userSearch.trim()) return allUsers;
		const q = userSearch.toLowerCase();
		return allUsers.filter(
			(u) =>
				u.display_name.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q))
		);
	});

	let lastCohortName = $state<string | null>(null);
	let lastCohortDisplay = $derived.by(() => {
		if (!lastCohortName) return null;
		return cohorts.find((c) => c.name === lastCohortName)?.display_name ?? lastCohortName;
	});

	onMount(async () => {
		if (browser) {
			lastCohortName = localStorage.getItem('lastCohort');
		}
		try {
			const overview = await fetchAdminOverview();
			cohorts = overview.cohorts;
			config = overview.config;
			availableDbs = overview.available_dbs;
			allUsers = overview.users;
			configLoaded = true;
			isAdmin = true;
		} catch {
			goto('/');
			return;
		}
		loading = false;
	});

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

	function startEditingName(user: UserWithCohorts) {
		editingUserId = user.id;
		editingName = user.display_name;
	}

	async function submitAdminRename(
		userId: number,
		name: string,
		overrides: Record<string, string>
	) {
		try {
			const result = await updateDisplayName(userId, name, overrides);
			if (result.status === 'ok') {
				const user = allUsers.find((u) => u.id === userId);
				if (user) user.display_name = result.display_name;
				allUsers = [...allUsers];
				toast.success('Display name updated');
				renameConflict = null;
				editingUserId = null;
			} else {
				renameConflict = {
					userId,
					name,
					conflicts: result.conflicts
				};
			}
		} catch (e) {
			toast.error('Failed to update: ' + (e instanceof Error ? e.message : String(e)));
			renameConflict = null;
			editingUserId = null;
		}
	}

	async function saveEditingName() {
		if (editingUserId == null) return;
		const trimmed = editingName.trim();
		if (!trimmed) {
			toast.error('Display name cannot be empty');
			return;
		}
		await submitAdminRename(editingUserId, trimmed, {});
	}

	async function confirmAdminRename() {
		if (!renameConflict) return;
		const overrides: Record<string, string> = {};
		for (const c of renameConflict.conflicts) {
			overrides[c.cohort_name] = c.suggested_name;
		}
		await submitAdminRename(renameConflict.userId, renameConflict.name, overrides);
	}

	function confirmToggleAdmin(user: UserWithCohorts) {
		if (user.is_kinde_admin) {
			toast.error(
				'This user has the Kinde admin role. Revoke it in Kinde to change their admin status.'
			);
			return;
		}
		const newGrant = !user.admin_grant;
		confirmModal = {
			open: true,
			title: newGrant ? 'Grant Admin' : 'Revoke Admin',
			message: newGrant
				? `Make "${user.display_name}" an admin? They will have full access to all cohorts and admin features.`
				: `Remove admin privileges from "${user.display_name}"?`,
			variant: newGrant ? 'default' : 'destructive',
			action: async () => {
				await toggleAdmin(user.id, newGrant);
				user.admin_grant = newGrant;
				user.is_admin = user.is_kinde_admin || newGrant;
				allUsers = [...allUsers];
				toast.success(newGrant ? 'Admin granted' : 'Admin revoked');
			}
		};
	}

	function confirmDeleteUser(user: UserWithCohorts) {
		confirmModal = {
			open: true,
			title: 'Delete User',
			message: `Permanently delete "${user.display_name}"? This will remove them from all cohorts. This cannot be undone.`,
			variant: 'destructive',
			action: async () => {
				await deleteUser(user.id);
				allUsers = allUsers.filter((u) => u.id !== user.id);
				toast.success('User deleted');
			}
		};
	}

	async function handleConfirmAction() {
		try {
			await confirmModal.action();
		} catch (e) {
			toast.error('Failed: ' + (e instanceof Error ? e.message : String(e)));
		}
		confirmModal.open = false;
	}
</script>

<!-- Confirm Modal -->
{#if confirmModal.open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={() => (confirmModal.open = false)}
		onkeydown={(e) => e.key === 'Escape' && (confirmModal.open = false)}
		role="dialog"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
		<div
			class="mx-4 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg"
			onclick={(e) => e.stopPropagation()}
			role="document"
		>
			<h3 class="text-lg font-semibold">{confirmModal.title}</h3>
			<p class="mt-2 text-sm text-muted-foreground">{confirmModal.message}</p>
			<div class="mt-4 flex justify-end gap-2">
				<button
					class="rounded-md border px-4 py-2 text-sm hover:bg-muted"
					onclick={() => (confirmModal.open = false)}
				>
					Cancel
				</button>
				<button
					class="rounded-md px-4 py-2 text-sm text-white {confirmModal.variant === 'destructive'
						? 'bg-red-600 hover:bg-red-700'
						: 'bg-primary hover:bg-primary/90'}"
					onclick={handleConfirmAction}
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}

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

		<!-- Balances -->
		<section class="mb-12">
			<h2 class="mb-4 text-xl font-semibold">Balances</h2>
			<a
				href="/admin/balances"
				class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
			>
				<div>
					<p class="font-medium">View all balances</p>
					<p class="text-sm text-muted-foreground">
						Clip balances per user across cohorts, including public-auction guests.
					</p>
				</div>
				<ChevronRight class="h-4 w-4 text-muted-foreground" />
			</a>
		</section>

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
						<ChevronRight class="h-4 w-4 text-muted-foreground" />
					</a>
				{/each}
			</div>
		</section>

		<!-- All Users -->
		<section class="mb-12">
			<h2 class="mb-4 text-xl font-semibold">All Users</h2>
			<input
				class="mb-3 w-full rounded-md border bg-background px-3 py-2 text-sm"
				placeholder="Search users..."
				bind:value={userSearch}
			/>
			<div class="space-y-1">
				{#each filteredUsers as user (user.id)}
					<div class="rounded-lg border p-2 px-3">
						<div class="flex items-center justify-between">
							<div class="flex flex-col gap-1">
								<div class="flex items-center gap-2">
									{#if editingUserId === user.id}
										<input
											class="w-48 rounded-md border bg-background px-2 py-0.5 text-sm"
											bind:value={editingName}
											onkeydown={(e) => {
												if (e.key === 'Enter') saveEditingName();
												if (e.key === 'Escape') editingUserId = null;
											}}
										/>
										<button
											class="rounded p-0.5 hover:bg-muted"
											onclick={saveEditingName}
											title="Save"
										>
											<Check class="h-4 w-4 text-green-600" />
										</button>
										<button
											class="rounded p-0.5 hover:bg-muted"
											onclick={() => (editingUserId = null)}
											title="Cancel"
										>
											<X class="h-4 w-4 text-muted-foreground" />
										</button>
									{:else}
										<span class="font-medium">{user.display_name}</span>
										<button
											class="rounded p-0.5 opacity-40 hover:bg-muted hover:opacity-100"
											onclick={() => startEditingName(user)}
											title="Edit display name"
										>
											<Pencil class="h-3.5 w-3.5" />
										</button>
									{/if}
								</div>
								{#if user.email}
									<span class="text-sm text-muted-foreground">{user.email}</span>
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<button
									class="rounded-md border px-2 py-0.5 text-xs {user.is_admin
										? 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
										: ''} {user.is_kinde_admin
										? 'cursor-not-allowed opacity-80'
										: 'hover:bg-muted'}"
									onclick={() => confirmToggleAdmin(user)}
									disabled={user.is_kinde_admin}
									title={user.is_kinde_admin
										? 'Admin via Kinde role — revoke in Kinde to change.'
										: undefined}
								>
									{user.is_kinde_admin ? 'Kinde Admin' : user.is_admin ? 'Admin' : 'User'}
								</button>
								<button
									class="rounded p-1 text-red-600 opacity-40 hover:bg-red-500/10 hover:opacity-100 dark:text-red-400"
									onclick={() => confirmDeleteUser(user)}
									title="Delete user"
								>
									<Trash2 class="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
						{#if user.cohorts.length > 0}
							<div class="mt-1 flex flex-wrap gap-2">
								{#each user.cohorts as uc}
									<span class="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
										{uc.cohort_display_name}
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
		</section>
	</div>
{/if}

<AlertDialog.Root
	open={renameConflict !== null}
	onOpenChange={(open) => {
		if (!open) {
			renameConflict = null;
			editingUserId = null;
		}
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Name already taken in some cohorts</AlertDialog.Title>
			<AlertDialog.Description>
				The new name <span class="font-semibold">"{renameConflict?.name}"</span> is already taken in
				some cohorts this user is a member of. They'll be known as:
			</AlertDialog.Description>
		</AlertDialog.Header>
		{#if renameConflict}
			<ul class="my-2 space-y-1 text-sm">
				{#each renameConflict.conflicts as conflict (conflict.cohort_name)}
					<li>
						<span class="font-medium">{conflict.cohort_display_name}</span>:
						<span class="font-mono">{conflict.suggested_name}</span>
					</li>
				{/each}
			</ul>
		{/if}
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					renameConflict = null;
					editingUserId = null;
				}}
			>
				Cancel
			</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmAdminRename}>Confirm</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
