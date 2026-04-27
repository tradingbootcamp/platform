<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import Copy from '@lucide/svelte/icons/copy';

	let open = $state(false);
	let amount = $state<number | undefined>(undefined);
	let pending = $state(false);

	let created = $derived(serverState.lastCreatedRedeemCode);

	$effect(() => {
		if (pending && serverState.lastCreatedRedeemCode) {
			pending = false;
		}
	});

	function reset() {
		amount = undefined;
		pending = false;
		serverState.lastCreatedRedeemCode = null;
	}

	function handleOpenChange(next: boolean) {
		open = next;
		if (next) reset();
	}

	function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!amount || amount <= 0) return;
		pending = true;
		serverState.lastCreatedRedeemCode = null;
		sendClientMessage({ createRedeemCode: { amount } });
	}

	async function copyCode() {
		if (!created?.code) return;
		await navigator.clipboard.writeText(created.code);
		toast.success('Code copied to clipboard');
	}

	function expiryLabel(seconds: number | undefined) {
		if (!seconds) return '';
		const d = new Date(seconds * 1000);
		return d.toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
		Generate redeem code
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Generate redeem code</Dialog.Title>
			<Dialog.Description>
				A single-use code that any user can redeem for clips. The amount is transferred from your
				account when redeemed. Codes expire after 24 hours.
			</Dialog.Description>
		</Dialog.Header>

		{#if !created}
			<form onsubmit={submit} class="space-y-4">
				<div class="space-y-2">
					<Label for="redeem-amount">Amount (clips)</Label>
					<Input
						id="redeem-amount"
						type="number"
						min="0.0001"
						step="0.0001"
						bind:value={amount}
						placeholder="e.g. 100"
						autocomplete="off"
						required
					/>
				</div>
				<Dialog.Footer>
					<Button type="submit" disabled={pending || !amount || amount <= 0}>
						{pending ? 'Generating…' : 'Generate'}
					</Button>
				</Dialog.Footer>
			</form>
		{:else}
			<div class="space-y-4">
				<div class="space-y-1 rounded-md border bg-muted/30 p-4 text-center">
					<p class="text-sm text-muted-foreground">Code (worth 📎 {created.amount})</p>
					<p class="font-mono text-3xl font-semibold tracking-widest">{created.code}</p>
					{#if created.expiresAt}
						<p class="text-xs text-muted-foreground">
							Expires {expiryLabel(created.expiresAt)}
						</p>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button class="flex-1" variant="outline" onclick={copyCode}>
						<Copy class="mr-2 h-4 w-4" /> Copy
					</Button>
					<Button class="flex-1" onclick={() => handleOpenChange(false)}>Done</Button>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
