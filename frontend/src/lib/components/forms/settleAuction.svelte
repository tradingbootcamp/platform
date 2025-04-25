<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
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

	let isUser = $derived.by(() =>
		[...serverState.accounts.values()].filter((a) => a.isUser).map((a) => a.id)
	);

	const initialData = {
		settlePrice: 0,
		buyerId: 0
	};

	const form = protoSuperForm(
		'settle-auction',
		(v) => websocket_api.SettleAuction.fromObject({ ...v, auctionId: id }),
		(settleAuction) => {
			showDialog = false;
			sendClientMessage({ settleAuction });
			close();
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
						{#each isUser as id (id)}
							<Command.Item
								value={accountName(id, 'Yourself')}
								onSelect={() => {
									$formData.buyerId = id;
									closePopoverAndFocusTrigger(triggerRef);
								}}
							>
								{accountName(id, 'Yourself')}
								<Check
									class={cn('ml-auto h-4 w-4', id !== $formData.buyerId && 'text-transparent')}
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
				<Input {...props} type="number" step="0.01" bind:value={$formData.settlePrice} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full">Settle Auction</Form.Button>
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
			<AlertDialog.Cancel
				onclick={() => {
					confirmed = false;
					formEl.reset();
				}}
			>
				Cancel
			</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					confirmed = true;
					formEl.requestSubmit();
				}}
			>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
