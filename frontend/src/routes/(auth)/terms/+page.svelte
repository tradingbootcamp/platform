<script lang="ts">
	import { goto } from '$app/navigation';
	import { kinde } from '$lib/auth.svelte';
	import { connect, checkTcStatus, acceptTc } from '$lib/api.svelte';
	import { TC_VERSION, TC_CONTENT } from '$lib/terms';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { onMount } from 'svelte';

	let checked = $state(false);
	let scrolledToBottom = $state(false);
	let submitting = $state(false);
	let mounted = $state(false);

	function handleScroll(e: Event) {
		const el = e.target as HTMLElement;
		// Consider "scrolled to bottom" when within 20px of the bottom
		scrolledToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
	}

	onMount(async () => {
		mounted = true;

		// Must be authenticated
		const authed = await kinde.isAuthenticated();
		if (!authed) {
			goto('/login');
			return;
		}

		// Ensure WS is connected (creates account if needed)
		connect();

		// If already accepted, go home
		const accepted = await checkTcStatus();
		if (accepted) {
			goto('/');
		}
	});

	async function handleAccept() {
		submitting = true;
		const success = await acceptTc(TC_VERSION);
		if (success) {
			goto('/');
		}
		submitting = false;
	}
</script>

{#if !mounted}
	<!-- Wait for mount -->
{:else}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-background">
		<div
			class="flex w-full max-w-2xl flex-col gap-4 rounded-lg border bg-card p-8 shadow-lg"
			style="max-height: 90vh;"
		>
			<h1 class="text-2xl font-bold">Terms & Conditions</h1>
			<p class="text-sm text-muted-foreground">
				Please read and accept the terms and conditions to continue.
			</p>

			<div
				class="tc-content overflow-y-auto rounded border p-4 text-sm"
				style="max-height: 50vh;"
				onscroll={handleScroll}
			>
				{@html TC_CONTENT}
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox id="accept-tc" bind:checked disabled={!scrolledToBottom} />
				<Label
					for="accept-tc"
					class="cursor-pointer text-sm font-normal {!scrolledToBottom
						? 'text-muted-foreground'
						: ''}"
				>
					I have read and agree to the Terms & Conditions
					{#if !scrolledToBottom}
						<span class="text-xs italic">(scroll to bottom to enable)</span>
					{/if}
				</Label>
			</div>

			<Button class="w-full" disabled={!checked || submitting} onclick={handleAccept}>
				{submitting ? 'Accepting...' : 'Accept & Continue'}
			</Button>
		</div>
	</div>
{/if}

<style>
	.tc-content :global(h2) {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
	}

	.tc-content :global(h3) {
		font-size: 1rem;
		font-weight: 600;
		margin-top: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.tc-content :global(p) {
		margin-bottom: 0.75rem;
		line-height: 1.6;
	}

	.tc-content :global(ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin-bottom: 0.75rem;
	}

	.tc-content :global(li) {
		margin-bottom: 0.375rem;
		line-height: 1.5;
	}
</style>
