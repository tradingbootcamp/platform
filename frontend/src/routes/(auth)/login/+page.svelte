<script lang="ts">
	import { goto } from '$app/navigation';
	import { PUBLIC_TEST_AUTH } from '$env/static/public';
	import { kinde } from '$lib/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { testAuthState, generateKindeId, type TestUser } from '$lib/testAuth.svelte';
	import { onMount } from 'svelte';

	let name = $state('');
	let isAdmin = $state(false);

	onMount(async () => {
		// If not in test mode, redirect to Kinde login
		if (PUBLIC_TEST_AUTH !== 'true') {
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
		goto('/');
	}

	function handleQuickLogin(user: TestUser) {
		testAuthState.login(user);
		goto('/');
	}

	function handleRemoveRecent(e: MouseEvent, kindeId: string) {
		e.stopPropagation();
		testAuthState.removeRecent(kindeId);
	}
</script>

{#if PUBLIC_TEST_AUTH === 'true'}
	<div class="flex min-h-screen items-center justify-center bg-background">
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

			{#if testAuthState.recentUsers.length > 0}
				<div class="space-y-3">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<span class="w-full border-t"></span>
						</div>
						<div class="relative flex justify-center text-xs uppercase">
							<span class="bg-card px-2 text-muted-foreground">Recent accounts</span>
						</div>
					</div>

					<div class="space-y-2">
						{#each testAuthState.recentUsers as user (user.kindeId)}
							<div
								class="group flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors hover:bg-accent"
							>
								<button
									type="button"
									onclick={() => handleQuickLogin(user)}
									class="flex flex-grow items-center gap-2"
								>
									<span class="font-medium">{user.name}</span>
									{#if user.isAdmin}
										<span
											class="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
										>
											Admin
										</span>
									{/if}
								</button>
								<button
									type="button"
									onclick={(e) => handleRemoveRecent(e, user.kindeId)}
									class="rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
									title="Remove from recent"
									aria-label="Remove from recent accounts"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M18 6 6 18" />
										<path d="m6 6 12 12" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">Redirecting to login...</p>
	</div>
{/if}
