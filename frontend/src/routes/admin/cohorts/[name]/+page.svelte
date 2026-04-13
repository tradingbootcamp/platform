<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import {
		fetchAdminOverview,
		updateCohort,
		fetchMembers,
		batchAddMembers,
		removeMember,
		updateMemberInitialBalance,
		type CohortInfo,
		type CohortMember,
		type GlobalUser
	} from '$lib/adminApi';
	import { onMount, tick } from 'svelte';
	import { cn } from '$lib/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Pencil from '@lucide/svelte/icons/pencil';
	import X from '@lucide/svelte/icons/x';

	let cohortName = $derived($page.params.name);

	let loading = $state(true);
	let cohort = $state<CohortInfo | null>(null);
	let members = $state<CohortMember[]>([]);
	let loadingMembers = $state(false);

	// Add by email
	let newEmails = $state('');
	let emailInitialBalance = $state('');

	// Add existing user
	let globalUsers = $state<GlobalUser[]>([]);
	let selectedUserId = $state<number | null>(null);
	let userInitialBalance = $state('');
	let userPopoverOpen = $state(false);
	let userTriggerRef = $state<HTMLButtonElement>(null!);

	// Editing initial balance
	let editingMemberId = $state<number | null>(null);
	let editingBalance = $state('');

	let availableUsers = $derived.by(() => {
		const memberUserIds = new Set(
			members.filter((m) => m.global_user_id).map((m) => m.global_user_id)
		);
		return globalUsers.filter((u) => !memberUserIds.has(u.id));
	});

	let selectedUserName = $derived(
		selectedUserId ? (globalUsers.find((u) => u.id === selectedUserId)?.display_name ?? '') : ''
	);

	function closePopoverAndFocusTrigger() {
		userPopoverOpen = false;
		tick().then(() => {
			userTriggerRef?.focus();
		});
	}

	function formatBalance(balance: number | null): string {
		if (balance == null) return '-';
		return balance.toLocaleString(undefined, { maximumFractionDigits: 0 });
	}

	onMount(async () => {
		try {
			const overview = await fetchAdminOverview();
			cohort = overview.cohorts.find((c) => c.name === cohortName) ?? null;
			globalUsers = overview.users;
			if (!cohort) {
				toast.error('Cohort not found');
				goto('/admin');
				return;
			}
			await loadMembers();
		} catch {
			goto('/');
			return;
		}
		loading = false;
	});

	async function loadMembers() {
		loadingMembers = true;
		try {
			members = await fetchMembers(cohortName);
		} catch (e) {
			toast.error('Failed to load members: ' + (e instanceof Error ? e.message : String(e)));
		} finally {
			loadingMembers = false;
		}
	}

	async function handleToggleReadOnly() {
		if (!cohort) return;
		try {
			await updateCohort(cohort.name, undefined, !cohort.is_read_only);
			cohort.is_read_only = !cohort.is_read_only;
			toast.success(`Cohort ${cohort.name} updated`);
		} catch (e) {
			toast.error('Failed to update cohort: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleAddUser() {
		if (!selectedUserId) return;
		try {
			const opts: { user_ids: number[]; initial_balance?: string } = {
				user_ids: [selectedUserId]
			};
			if (userInitialBalance.trim()) {
				opts.initial_balance = userInitialBalance.trim();
			}
			const result = await batchAddMembers(cohortName, opts);
			toast.success(`Added ${result.added} member`);
			selectedUserId = null;
			userInitialBalance = '';
			await loadMembers();
		} catch (e) {
			toast.error('Failed to add member: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleAddEmails() {
		if (!newEmails.trim()) return;
		const emails = newEmails
			.split(/[\n,]+/)
			.map((e) => e.trim())
			.filter(Boolean);
		if (emails.length === 0) return;
		try {
			const opts: { emails: string[]; initial_balance?: string } = { emails };
			if (emailInitialBalance.trim()) {
				opts.initial_balance = emailInitialBalance.trim();
			}
			const result = await batchAddMembers(cohortName, opts);
			toast.success(`Added ${result.added} members`);
			newEmails = '';
			emailInitialBalance = '';
			await loadMembers();
		} catch (e) {
			toast.error('Failed to add members: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	async function handleRemoveMember(member: CohortMember) {
		try {
			await removeMember(cohortName, member.id);
			members = members.filter((m) => m.id !== member.id);
			toast.success('Member removed');
		} catch (e) {
			toast.error('Failed to remove member: ' + (e instanceof Error ? e.message : String(e)));
		}
	}

	function startEditingBalance(member: CohortMember) {
		editingMemberId = member.id;
		editingBalance = member.initial_balance ?? '';
	}

	async function saveEditingBalance() {
		if (editingMemberId == null) return;
		const value = editingBalance.trim() || null;
		try {
			await updateMemberInitialBalance(cohortName, editingMemberId, value);
			const member = members.find((m) => m.id === editingMemberId);
			if (member) member.initial_balance = value;
			members = [...members];
			toast.success('Initial balance updated');
		} catch (e) {
			toast.error('Failed to update: ' + (e instanceof Error ? e.message : String(e)));
		}
		editingMemberId = null;
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else if !cohort}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">Cohort not found.</p>
	</div>
{:else}
	<div class="mx-auto max-w-4xl p-8">
		<div class="mb-6">
			<a
				href="/admin"
				class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Back to Admin
			</a>
		</div>

		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold">{cohort.display_name}</h1>
				<p class="text-sm text-muted-foreground">{cohort.name}</p>
			</div>
			<div class="flex items-center gap-3">
				{#if cohort.is_read_only}
					<span
						class="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
					>
						Read-only
					</span>
				{/if}
				<button
					class="rounded-md border px-3 py-1 text-sm hover:bg-muted"
					onclick={handleToggleReadOnly}
				>
					{cohort.is_read_only ? 'Make writable' : 'Make read-only'}
				</button>
			</div>
		</div>

		<!-- Add Existing User -->
		<section class="mb-6 rounded-lg border p-4">
			<h3 class="mb-3 font-medium">Add Existing User</h3>
			<div class="flex items-center gap-2">
				<Popover.Root bind:open={userPopoverOpen}>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-64 justify-between',
							!selectedUserId && 'text-muted-foreground'
						)}
						role="combobox"
						bind:ref={userTriggerRef}
					>
						{selectedUserId ? selectedUserName : 'Search users...'}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<Popover.Content class="w-64 p-0">
						<Command.Root>
							<Command.Input autofocus placeholder="Search users..." class="h-9" />
							<Command.List>
								<Command.Empty>No users found</Command.Empty>
								<Command.Group>
									{#each availableUsers as user (user.id)}
										<Command.Item
											value={user.display_name}
											onSelect={() => {
												selectedUserId = user.id;
												closePopoverAndFocusTrigger();
											}}
										>
											{user.display_name}
											<Check
												class={cn(
													'ml-auto h-4 w-4',
													user.id !== selectedUserId && 'text-transparent'
												)}
											/>
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<input
					class="w-40 rounded-md border bg-background px-3 py-2 text-sm"
					placeholder="Initial balance"
					bind:value={userInitialBalance}
				/>
				<button
					class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					onclick={handleAddUser}
					disabled={!selectedUserId}
				>
					Add
				</button>
			</div>
		</section>

		<!-- Add by Email -->
		<section class="mb-6 rounded-lg border p-4">
			<h3 class="mb-3 font-medium">Add by Email</h3>
			<textarea
				class="w-full rounded-md border bg-background px-3 py-2 text-sm"
				placeholder="Enter emails (one per line or comma-separated)"
				rows="3"
				bind:value={newEmails}
			></textarea>
			<div class="mt-2 flex items-center gap-2">
				<input
					class="w-40 rounded-md border bg-background px-3 py-2 text-sm"
					placeholder="Initial balance"
					bind:value={emailInitialBalance}
				/>
				<button
					class="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
					onclick={handleAddEmails}
				>
					Add Members
				</button>
			</div>
		</section>

		<!-- Members List -->
		<section>
			<h2 class="mb-4 text-xl font-semibold">
				Members ({members.length})
			</h2>
			{#if loadingMembers}
				<p class="text-muted-foreground">Loading members...</p>
			{:else if members.length === 0}
				<p class="text-muted-foreground">No members yet.</p>
			{:else}
				<div class="space-y-1">
					{#each members as member}
						<div class="flex items-center justify-between rounded-lg border p-2 px-3">
							<div class="flex items-center gap-3">
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
								{#if member.balance != null}
									<span
										class="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
									>
										{formatBalance(member.balance)}
									</span>
								{/if}
								{#if member.balance == null}
									<!-- Not instantiated yet - editable initial balance -->
									{#if editingMemberId === member.id}
										<div class="flex items-center gap-1">
											<input
												class="w-28 rounded-md border bg-background px-2 py-0.5 font-mono text-xs"
												bind:value={editingBalance}
												placeholder="initial bal"
												onkeydown={(e) => {
													if (e.key === 'Enter') saveEditingBalance();
													if (e.key === 'Escape') editingMemberId = null;
												}}
											/>
											<button
												class="rounded p-0.5 hover:bg-muted"
												onclick={saveEditingBalance}
												title="Save"
											>
												<Check class="h-3.5 w-3.5 text-green-600" />
											</button>
											<button
												class="rounded p-0.5 hover:bg-muted"
												onclick={() => (editingMemberId = null)}
												title="Cancel"
											>
												<X class="h-3.5 w-3.5 text-muted-foreground" />
											</button>
										</div>
									{:else}
										<button
											class="flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
											onclick={() => startEditingBalance(member)}
											title="Edit initial balance"
										>
											initial: {member.initial_balance ?? 'not set'}
											<Pencil class="h-3 w-3" />
										</button>
									{/if}
								{:else if member.initial_balance}
									<span
										class="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs text-blue-600 dark:text-blue-400"
									>
										initial: {member.initial_balance}
									</span>
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
	</div>
{/if}
