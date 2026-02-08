<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { kinde } from '$lib/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { testAuthState, generateKindeId, type TestUser } from '$lib/testAuth.svelte';
	import { reconnect } from '$lib/api.svelte';
	import { onMount } from 'svelte';

	let name = $state('');
	let isAdmin = $state(false);
	let mounted = $state(false);

	onMount(async () => {
		mounted = true;
		// If not in test mode, redirect to Kinde login
		if (!env.PUBLIC_TEST_AUTH) {
			kinde.login();
			return;
		}

		// If already authenticated in test mode, redirect to home
		if (await kinde.isAuthenticated()) {
			goto('/');
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!name.trim()) return;

		const kindeId = generateKindeId(name.trim());
		const user: TestUser = {
			name: name.trim(),
			kindeId,
			isAdmin
		};
		testAuthState.login(user);
		reconnect(); // Re-authenticate WebSocket with new credentials
		goto('/');
	}
</script>

{#if !mounted}
	<!-- Show nothing during SSR, wait for client hydration -->
{:else if env.PUBLIC_TEST_AUTH}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-background">
		<div class="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 shadow-lg">
			<div class="space-y-2 text-center">
				<h1 class="text-2xl font-bold">Test Login</h1>
				<p class="text-sm text-muted-foreground">
					Enter a name to create or log into a test account
				</p>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input
						id="name"
						type="text"
						placeholder="Enter your name"
						bind:value={name}
						autocomplete="off"
					/>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="admin" bind:checked={isAdmin} />
					<Label for="admin" class="cursor-pointer text-sm font-normal">
						Admin account
						<span class="text-muted-foreground">(starts with 100M clips)</span>
					</Label>
				</div>

				<Button type="submit" class="w-full" disabled={!name.trim()}>Login</Button>
			</form>

			<p class="text-center text-xs text-muted-foreground">
				Same name = same account. Names are case-insensitive.
			</p>
		</div>
	</div>
{:else}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-background">
		<p class="text-muted-foreground">Redirecting to login...</p>
	</div>
{/if}
