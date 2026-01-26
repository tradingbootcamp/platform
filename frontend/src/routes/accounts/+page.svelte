<script lang="ts">
	import {
		accountName,
		hasArborPixieTransfer,
		sendClientMessage,
		serverState
	} from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import CreateAccount from '$lib/components/forms/createAccount.svelte';
	import CreateUniverse from '$lib/components/forms/createUniverse.svelte';
	import ShareOwnership from '$lib/components/forms/shareOwnership.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Copy } from '@lucide/svelte/icons';
	import { toast } from 'svelte-sonner';
	import { universeMode } from '$lib/universeMode.svelte';

	let token = $state<string | undefined>(undefined);
	kinde.getToken().then((t) => (token = t));

	const copyJwt = () => {
		navigator.clipboard.writeText(token || '');
		toast.success('JWT copied to clipboard');
	};

	const copyActAs = () => {
		navigator.clipboard.writeText(String(serverState.actingAs || ''));
		toast.success('ACT_AS copied to clipboard');
	};

	let coOwners = $derived(
		serverState.portfolio?.ownerCredits
			?.filter((ownerCredit) => ownerCredit.ownerId !== serverState.userId)
			.map((ownerCredit) => ownerCredit.ownerId) || []
	);

	// Universes the user owns
	let ownedUniverses = $derived(
		[...serverState.universes.values()].filter((u) => u.ownerId === serverState.userId)
	);

	// Get current universe name
	let currentUniverseName = $derived(
		serverState.universes.get(serverState.currentUniverseId)?.name || 'Main'
	);

	// Get accounts owned by the user in each universe
	function getAccountsInUniverse(universeId: number): number[] {
		const ownedAccountIds = [...serverState.portfolios.keys()];
		return ownedAccountIds.filter((id) => {
			const account = serverState.accounts.get(id);
			return account?.universeId === universeId;
		});
	}

	// Accounts in main universe (id 0)
	let mainUniverseAccounts = $derived(getAccountsInUniverse(0));

	// Whether currently in main universe
	let isInMainUniverse = $derived(serverState.currentUniverseId === 0);

	// Switch to an account
	function switchToAccount(accountId: number) {
		sendClientMessage({ actAs: { accountId } });
	}

	// Pre-fill create account form for a universe
	let prefillUniverseId = $state<number | null>(null);

	function prefillCreateAccount(universeId: number) {
		prefillUniverseId = universeId;
		// Scroll to create account form
		document.getElementById('create-account-section')?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<svelte:window onkeydown={universeMode.handleKeydown} />

<div class="flex flex-col gap-4 py-8">
	{#if universeMode.enabled && serverState.currentUniverseId !== 0}
		<div class="rounded-lg border border-amber-500 bg-amber-500/10 p-4">
			<p class="font-bold text-amber-500">Currently in universe: {currentUniverseName}</p>
		</div>
	{/if}

	<div>
		<h1 class="text-xl font-bold">Accounts</h1>
		{#if serverState.actingAs && serverState.accounts.get(serverState.actingAs)}
			<p>
				Currently acting as {accountName(serverState.actingAs)}
			</p>
			{#if coOwners.length > 0}
				<p>
					Co-owned by {coOwners.map((owner) => accountName(owner)).join(', ')}
				</p>
			{/if}
			<div class="mt-4 flex flex-col gap-2 md:flex-row">
				<div>
					<Button variant="outline" onclick={copyJwt}>
						<Copy class="mr-2 size-4" /> Copy JWT
					</Button>
				</div>
				<div>
					<Button variant="outline" onclick={copyActAs}>
						<Copy class="mr-2 size-4" /> Copy ACT_AS
					</Button>
				</div>
			</div>
			<p>
				Initialized by Arbor Pixie: {hasArborPixieTransfer() ? 'yes' : 'no'}
			</p>
		{/if}
	</div>
	<h2 id="create-account-section" class="text-lg font-bold">Create Account</h2>
	<CreateAccount
		{prefillUniverseId}
		onPrefillUsed={() => {
			prefillUniverseId = null;
		}}
	/>
	<h2 class="text-lg font-bold">Share Ownership</h2>
	<div class="flex">
		<ShareOwnership />
		<div class="flex-grow"></div>
	</div>

	{#if universeMode.enabled}
		<div class="mt-8 border-t pt-8">
			<h2 class="text-lg font-bold">Universes</h2>
			<p class="mb-4 text-sm text-muted-foreground">
				Universes are isolated trading environments. Press Ctrl+Shift+U to toggle this section.
			</p>

			<div
				class="mt-4 rounded-lg border p-3 {isInMainUniverse
					? 'border-l-4 border-l-primary bg-primary/5'
					: ''}"
			>
				<div class="flex items-center justify-between">
					<div>
						<p class="font-medium">Main</p>
					</div>
					<div class="ml-4">
						{#if mainUniverseAccounts.length === 0}
							<p class="text-sm text-muted-foreground">No accounts</p>
						{:else if isInMainUniverse}
							<p class="text-sm text-muted-foreground">
								{accountName(serverState.actingAs)}
							</p>
						{:else if mainUniverseAccounts.length === 1}
							{@const accountId = mainUniverseAccounts[0]}
							<Button variant="outline" size="sm" onclick={() => switchToAccount(accountId)}>
								Enter as {accountName(accountId)}
							</Button>
						{:else}
							<Select.Root
								type="single"
								onValueChange={(v) => {
									if (v) switchToAccount(Number(v));
								}}
							>
								<Select.Trigger class="w-48">Enter as...</Select.Trigger>
								<Select.Content>
									{#each mainUniverseAccounts as acctId (acctId)}
										<Select.Item value={String(acctId)} label={accountName(acctId)}>
											{accountName(acctId)}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/if}
					</div>
				</div>
			</div>

			<h3 class="mt-6 font-medium">Your Universes</h3>
			{#if ownedUniverses.length === 0}
				<p class="text-sm text-muted-foreground">You don't own any universes yet.</p>
			{:else}
				<ul class="mt-2 space-y-2">
					{#each ownedUniverses as universe (universe.id)}
						{@const accountsInUniverse = getAccountsInUniverse(universe.id)}
						{@const isInThisUniverse = serverState.currentUniverseId === universe.id}
						<li
							class="rounded-lg border p-3 {isInThisUniverse
								? 'border-l-4 border-l-primary bg-primary/5'
								: ''}"
						>
							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">{universe.name}</p>
									{#if universe.description}
										<p class="text-sm text-muted-foreground">{universe.description}</p>
									{/if}
								</div>
								<div class="ml-4">
									{#if accountsInUniverse.length === 0}
										<Button
											variant="outline"
											size="sm"
											onclick={() => prefillCreateAccount(universe.id)}
										>
											Create account to enter
										</Button>
									{:else if isInThisUniverse}
										<p class="text-sm text-muted-foreground">
											{accountName(serverState.actingAs)}
										</p>
									{:else if accountsInUniverse.length === 1}
										{@const accountId = accountsInUniverse[0]}
										<Button variant="outline" size="sm" onclick={() => switchToAccount(accountId)}>
											Enter as {accountName(accountId)}
										</Button>
									{:else}
										<Select.Root
											type="single"
											onValueChange={(v) => {
												if (v) switchToAccount(Number(v));
											}}
										>
											<Select.Trigger class="w-48">Enter as...</Select.Trigger>
											<Select.Content>
												{#each accountsInUniverse as acctId (acctId)}
													<Select.Item value={String(acctId)} label={accountName(acctId)}>
														{accountName(acctId)}
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{/if}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}

			<h3 class="mt-6 font-medium">Create New Universe</h3>
			<div class="mt-2 max-w-md">
				<CreateUniverse />
			</div>
		</div>
	{/if}
</div>
