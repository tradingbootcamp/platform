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
		recipientId: '',
		amount: 0,
		note: ''
	};
	let open = $state(false);

	const form = protoSuperForm(
		'make-payment',
		websocket_api.MakePayment.fromObject,
		(makePayment) => {
			open = false;
			sendClientMessage({ makePayment });
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
		>Make Payment</Dialog.Trigger
	>
	<Dialog.Content>
		<form use:enhance class="flex flex-col gap-4">
			<Dialog.Header>
				<Dialog.Title>Make Payment</Dialog.Title>
			</Dialog.Header>
			<Form.Field {form} name="recipientId">
				<Popover.Root bind:open={popoverOpen}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Recipient</Form.Label>
							<Popover.Trigger
								class={cn(
									buttonVariants({ variant: 'outline' }),
									'w-[200px] justify-between',
									!$formData.recipientId && 'text-muted-foreground'
								)}
								role="combobox"
								{...props}
							>
								{$formData.recipientId
									? serverState.users[$formData.recipientId]?.name || 'Unnamed user'
									: 'Select recipient'}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Popover.Trigger>
							<input hidden value={$formData.recipientId} name={props.name} />
						{/snippet}
					</Form.Control>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input autofocus placeholder="Search user..." class="h-9" />
							<Command.Empty>No user found.</Command.Empty>
							<Command.Group>
								{#each [...Object.entries(serverState.users)] as [id, user] (id)}
									{#if id !== serverState.actingAs}
										<Command.Item
											value={user.name || `Unnamed user (${id})`}
											onSelect={() => {
												$formData.recipientId = user.id ?? '';
												closePopoverAndFocusTrigger();
											}}
										>
											{user.name || 'Unnamed user'}
											<Check
												class={cn(
													'ml-auto h-4 w-4',
													user.id !== $formData.recipientId && 'text-transparent'
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
