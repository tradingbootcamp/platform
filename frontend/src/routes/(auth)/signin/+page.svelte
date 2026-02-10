<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { kinde } from '$lib/auth.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		if (await kinde.isAuthenticated()) {
			goto('/');
			return;
		}
		if (env.PUBLIC_TEST_AUTH) {
			goto('/login');
		} else {
			kinde.login();
		}
	});
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-background">
	<p class="text-muted-foreground">Redirecting to sign in...</p>
</div>
