<script lang="ts">
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import CreateAccount from '$lib/components/forms/createAccount.svelte';
	import ShareOwnership from '$lib/components/forms/shareOwnership.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Copy } from 'lucide-svelte/icons';
	import { toast } from 'svelte-sonner';

	let token = $state<string | undefined>(undefined);
	kinde.getToken().then((t) => (token = t));

	let envString = $derived(`API_URL=${PUBLIC_SERVER_URL}
JWT=${token}
ACT_AS=${serverState.actingAs}
`);

	const copyEnv = () => {
		navigator.clipboard.writeText(envString);
		toast.success('Environment variables copied to clipboard');
	};
</script>

<div class="mr-auto flex flex-col gap-8 pt-8">
	<div>
		<h1 class="text-xl font-bold">Accounts</h1>
		{#if serverState.actingAs && serverState.accounts.get(serverState.actingAs)}
			<h3 class="mt-4">
				<Button variant="outline" onclick={copyEnv}>
					<Copy class="mr-2 size-4" /> Copy environment variables
				</Button>
			</h3>
		{/if}
	</div>
	<CreateAccount />
	<div class="flex">
		<ShareOwnership />
		<div class="flex-grow"></div>
	</div>
</div>
