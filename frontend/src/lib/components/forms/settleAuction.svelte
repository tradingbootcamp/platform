<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { roundToTenth } from '$lib/components/marketDataUtils';
	import { cn } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import { tick } from 'svelte';

	interface Props {
		id: number | null | undefined;
		name: string | null | undefined;
		close: () => void;
	}

	let { id, name, close }: Props = $props();

	let formEl: HTMLFormElement = $state(null!);
	let showDialog = $state(false);
	let confirmed = $state(false);
	let isSubmitting = $state(false); // Add submitting state

	let popoverOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger(triggerRef: HTMLButtonElement) {
		popoverOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	// Memoize the user list to prevent unnecessary recalculations
	let isUser = $derived.by(() => {
		if (isSubmitting) return []; // Don't recalculate during submission
		return [...serverState.accounts.values()].filter((a) => a.isUser).map((a) => a.id);
	});

	const initialData = {
		settlePrice: 0,
		buyerId: 0
	};

	const form = protoSuperForm(
		'settle-auction',
		(v) =>
			websocket_api.SettleAuction.fromObject({
				...v,
				auctionId: id,
				confirmAdmin: serverState.confirmAdmin
			}),
		async (settleAuction) => {
			try {
				isSubmitting = true;
				showDialog = false;

				// Use requestAnimationFrame to ensure UI updates before sending message
				await new Promise((resolve) => requestAnimationFrame(resolve));

				sendClientMessage({ settleAuction });

				// Small delay to ensure message is sent before closing
				await new Promise((resolve) => setTimeout(resolve, 100));

				close();
			} catch (error) {
				console.error('Error settling auction:', error);
				isSubmitting = false;
			}
		},
		initialData,
		{
			cancelPred() {
				if (confirmed) {
					confirmed = false;
					return false;
				} else {
					showDialog = true;
					return true;
				}
			}
		}
	);

	const { form: formData, enhance } = form;

	// Clean up function to reset states
	function resetForm() {
		confirmed = false;
		isSubmitting = false;
		showDialog = false;
		if (formEl) {
			formEl.reset();
		}
	}
</script>

Settle auction:

<form use:enhance bind:this={formEl} class="flex flex-col gap-2">
	<Form.Field {form} name="toUserId" class="col-start-2">
		<Popover.Root bind:open={popoverOpen}>
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Buyer</Form.Label>
					<br />
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-56 justify-between',
							!$formData.buyerId && 'text-muted-foreground'
						)}
						role="combobox"
						disabled={isSubmitting}
						{...props}
						bind:ref={triggerRef}
					>
						{$formData.buyerId ? accountName($formData.buyerId, 'Yourself') : 'Select buyer'}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<input hidden value={$formData.buyerId} name={props.name} />
				{/snippet}
			</Form.Control>
			<Popover.Content class="w-56 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search users..." class="h-9" />
					<Command.Empty>No users found</Command.Empty>
					<Command.Group>
						{#each isUser as userId (userId)}
							<Command.Item
								value={accountName(userId, 'Yourself')}
								onSelect={() => {
									$formData.buyerId = userId;
									closePopoverAndFocusTrigger(triggerRef);
								}}
							>
								{accountName(userId, 'Yourself')}
								<Check
									class={cn('ml-auto h-4 w-4', userId !== $formData.buyerId && 'text-transparent')}
								/>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="settlePrice">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Settle Price</Form.Label>
				<Input
					{...props}
					type="number"
					step="0.1"
					bind:value={$formData.settlePrice}
					disabled={isSubmitting}
					on:blur={() => {
						$formData.settlePrice = roundToTenth($formData.settlePrice);
					}}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full" disabled={isSubmitting}>
		{isSubmitting ? 'Settling...' : 'Settle Auction'}
	</Form.Button>
</form>

<AlertDialog.Root bind:open={showDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				{name} will be sold to {accountName($formData.buyerId, 'Yourself')} for {$formData.settlePrice}
				clips.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={resetForm} disabled={isSubmitting}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					confirmed = true;
					formEl.requestSubmit();
				}}
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Processing...' : 'Continue'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
