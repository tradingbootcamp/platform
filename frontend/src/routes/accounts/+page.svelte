<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import CreateAccount from '$lib/components/forms/createAccount.svelte';
	import ShareOwnership from '$lib/components/forms/shareOwnership.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Copy } from 'lucide-svelte/icons';
	import { toast } from 'svelte-sonner';

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
</script>

<div class="mr-auto flex flex-col gap-4 py-8">
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
		{/if}
	</div>
	<h2 class="text-lg font-bold">Create Account</h2>
	<CreateAccount />
	<h2 class="text-lg font-bold">Share Ownership</h2>
	<div class="flex">
		<ShareOwnership />
		<div class="flex-grow"></div>
	</div>
</div>
