<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { verifyShowcasePassword, setShowcasePasswordVerified } from '$lib/showcaseRouting';

	interface Props {
		showcaseKey: string;
		showcaseName: string;
		onSuccess: () => void;
	}

	let { showcaseKey, showcaseName, onSuccess }: Props = $props();

	let password = $state('');
	let error = $state('');
	let submitting = $state(false);

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!password.trim()) return;
		error = '';
		submitting = true;
		try {
			const valid = await verifyShowcasePassword(showcaseKey, password.trim());
			if (valid) {
				setShowcasePasswordVerified(showcaseKey);
				onSuccess();
			} else {
				error = 'Incorrect password';
			}
		} catch {
			error = 'Failed to verify password';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
	<div class="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
		<h2 class="mb-1 text-lg font-semibold">Password Required</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Enter the password to view <span class="font-medium">{showcaseName}</span>.
		</p>
		<form onsubmit={handleSubmit} class="flex flex-col gap-3">
			<input
				type="password"
				bind:value={password}
				placeholder="Password"
				class="rounded-md border bg-background px-3 py-2"
				use:focusOnMount
				disabled={submitting}
			/>
			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
			<Button type="submit" disabled={submitting || !password.trim()}>
				{submitting ? 'Verifying...' : 'Submit'}
			</Button>
		</form>
	</div>
</div>
