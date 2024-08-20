<script lang="ts">
	import { actingAs, users } from '$lib/api';
	import { user } from '$lib/auth';
	import ActAs from '$lib/components/forms/actAs.svelte';
	import CreateBot from '$lib/components/forms/createBot.svelte';
	import GiveOwnership from '$lib/components/forms/giveOwnership.svelte';
</script>

<div class="mr-auto flex flex-col gap-8 pt-8">
	<div>
		<h1 class="text-xl font-bold">Accounts</h1>
		{#if $actingAs && $users.get($actingAs)}
			<h2 class="text-lg">
				Currently acting as <em
					>{$actingAs === $user?.id ? 'Yourself' : $users.get($actingAs)?.name}</em
				>
			</h2>
		{/if}
	</div>
	<ActAs />
	<CreateBot />
	<div class="flex">
		<GiveOwnership />
		<div class="flex-grow"></div>
	</div>
</div>
