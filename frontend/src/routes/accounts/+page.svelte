<script lang="ts">
	import { PUBLIC_SERVER_URL } from '$env/static/public';
	import { serverState } from '$lib/api.svelte';
	import { kinde, user } from '$lib/auth.svelte';
	import ActAs from '$lib/components/forms/actAs.svelte';
	import CreateBot from '$lib/components/forms/createBot.svelte';
	import GiveOwnership from '$lib/components/forms/giveOwnership.svelte';
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
		{#if serverState.actingAs && serverState.users[serverState.actingAs]}
			<h2 class="text-lg">
				Currently acting as <em
					>{serverState.actingAs === user()?.id
						? 'Yourself'
						: serverState.users[serverState.actingAs]?.name}</em
				>
			</h2>
			<h3 class="mt-4">
				<Button variant="outline" onclick={copyEnv}>
					<Copy class="mr-2 size-4" /> Copy environment variables
				</Button>
			</h3>
		{/if}
	</div>
	<ActAs />
	<CreateBot />
	<div class="flex">
		<GiveOwnership />
		<div class="flex-grow"></div>
	</div>
</div>
