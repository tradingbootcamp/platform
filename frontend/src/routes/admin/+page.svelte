<script lang="ts">
	import { goto } from '$app/navigation';
	import { serverState } from '$lib/api.svelte';
	import { kinde } from '$lib/auth.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Button from '$lib/components/ui/button/button.svelte';

	let emails = $state('');
	let initialBalance = $state(0);
	let submitting = $state(false);
	let results = $state<{ email: string; created: boolean }[]>([]);

	onMount(() => {
		if (!serverState.isAdmin) {
			goto('/market');
		}
	});

	async function handleSubmit() {
		const emailList = emails
			.split(/[\n,]/)
			.map((e) => e.trim())
			.filter((e) => e.length > 0);

		if (emailList.length === 0) {
			toast.error('Please enter at least one email');
			return;
		}

		submitting = true;
		try {
			const token = await kinde.getToken();
			const res = await fetch('/api/admin/preregister', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					emails: emailList,
					initial_balance: initialBalance
				})
			});

			if (!res.ok) {
				const text = await res.text();
				toast.error(`Failed: ${text}`);
				return;
			}

			results = await res.json();
			const created = results.filter((r) => r.created).length;
			const skipped = results.filter((r) => !r.created).length;
			toast.success(
				`Pre-registered ${created} user${created !== 1 ? 's' : ''}${skipped > 0 ? ` (${skipped} already existed)` : ''}`
			);
			emails = '';
		} catch (e) {
			toast.error(`Error: ${e instanceof Error ? e.message : String(e)}`);
		} finally {
			submitting = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-2xl space-y-6 py-6">
	<h1 class="text-2xl font-bold">Admin: Pre-register Users</h1>
	<p class="text-sm text-muted-foreground">
		Add users by email before they sign up. Accounts will be created with the specified initial
		balance and linked automatically when they log in via Kinde.
	</p>

	<div class="space-y-4 rounded-lg border p-4">
		<div>
			<label for="emails" class="mb-1 block text-sm font-medium">
				Emails (one per line, or comma-separated)
			</label>
			<textarea
				id="emails"
				bind:value={emails}
				rows={8}
				class="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				placeholder={'alice@example.com\nbob@example.com\ncharlie@example.com'}
			></textarea>
		</div>

		<div>
			<label for="balance" class="mb-1 block text-sm font-medium">Initial Balance (clips)</label>
			<input
				id="balance"
				type="number"
				bind:value={initialBalance}
				class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
				min="0"
				step="1"
			/>
		</div>

		<Button onclick={handleSubmit} disabled={submitting}>
			{submitting ? 'Submitting...' : 'Pre-register Users'}
		</Button>
	</div>

	{#if results.length > 0}
		<div class="rounded-lg border p-4">
			<h2 class="mb-2 text-lg font-semibold">Results</h2>
			<ul class="space-y-1 text-sm">
				{#each results as result}
					<li class="flex items-center gap-2">
						<span
							class="inline-block h-2 w-2 rounded-full {result.created
								? 'bg-green-500'
								: 'bg-yellow-500'}"
						></span>
						<span>{result.email}</span>
						<span class="text-muted-foreground">
							{result.created ? 'created' : 'already exists'}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
