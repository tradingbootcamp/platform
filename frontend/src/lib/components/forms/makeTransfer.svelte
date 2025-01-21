<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { websocket_api } from 'schema-js';
	import { tick } from 'svelte';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = {
		toAccountId: 0,
		amount: 0,
		note: ''
	};
	let open = $state(false);

	const form = protoSuperForm(
		'make-transfer',
		// TODO: allow making transfers from any owned account
		(v) => websocket_api.MakeTransfer.fromObject({ ...v, fromAccountId: serverState.actingAs }),
		(makeTransfer) => {
			open = false;
			sendClientMessage({ makeTransfer });
		},
		initialData
	);

	const { form: formData, enhance } = form;

	let popoverOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger() {
		popoverOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger bind:ref={triggerRef} class={buttonVariants({ variant: 'default' })}
		>Make Transfer</Dialog.Trigger
	>
	<Dialog.Content>
		<form use:enhance class="flex flex-col gap-4">
			<Dialog.Header>
				<Dialog.Title>Make Transfer</Dialog.Title>
			</Dialog.Header>
			<Form.Field {form} name="toAccountId">
				<Popover.Root bind:open={popoverOpen}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>To</Form.Label>
							<Popover.Trigger
								class={cn(
									buttonVariants({ variant: 'outline' }),
									'w-[200px] justify-between',
									!$formData.toAccountId && 'text-muted-foreground'
								)}
								role="combobox"
								{...props}
							>
								{$formData.toAccountId
									? serverState.accounts.get($formData.toAccountId)?.name || 'Unnamed account'
									: 'Select recipient'}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Popover.Trigger>
							<input hidden value={$formData.toAccountId} name={props.name} />
						{/snippet}
					</Form.Control>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input autofocus placeholder="Search account..." class="h-9" />
							<Command.Empty>No account found.</Command.Empty>
							<Command.Group>
								{#each serverState.accounts.entries() as [id, account] (id)}
									{#if id !== serverState.actingAs && (account.isUser || serverState.portfolios.has(id))}
										<Command.Item
											value={account.name || `Unnamed account (${id})`}
											onSelect={() => {
												$formData.toAccountId = id;
												closePopoverAndFocusTrigger();
											}}
										>
											{account.name || `Unnamed account (${id})`}
											<Check
												class={cn(
													'ml-auto h-4 w-4',
													id !== $formData.toAccountId && 'text-transparent'
												)}
											/>
										</Command.Item>
									{/if}
								{/each}
							</Command.Group>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="amount">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Amount</Form.Label>
						<Input {...props} type="number" min="0" step="0.0001" bind:value={$formData.amount} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="note">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Note</Form.Label>
						<Input {...props} bind:value={$formData.note} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button>Submit</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
