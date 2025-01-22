<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { websocket_api } from 'schema-js';
	import { tick } from 'svelte';
	import { buttonVariants } from '../ui/button';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = {
		ownerId: 0,
		name: ''
	};

	const form = protoSuperForm(
		'create-account',
		// TODO: allow creating sub accounts
		(v) => websocket_api.CreateAccount.fromObject({ ...v, ownerId: serverState.userId }),
		(createAccount) => sendClientMessage({ createAccount }),
		initialData
	);

	const { form: formData, enhance } = form;

	let validOwnerIds = $derived(
		Array.from(
			serverState.portfolios
				.values()
				.filter(
					(p) =>
						p.accountId === serverState.userId ||
						p.ownerCredits?.find((oc) => oc.ownerId === serverState.userId)
				)
				.map((p) => p.accountId)
		)
	);

	let popoverOpen = $state(false);
	let popoverTriggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger() {
		popoverOpen = false;
		tick().then(() => {
			popoverTriggerRef.focus();
		});
	}
</script>

<form use:enhance class="flex gap-4">
	<Form.Button class="w-32">Create Account</Form.Button>
	<Form.Field {form} name="name" class="w-56">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} bind:value={$formData.name} placeholder="Name your account" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="ownerId">
		<Popover.Root bind:open={popoverOpen}>
			<Form.Control>
				{#snippet children({ props })}
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-56 justify-between',
							!$formData.accountId && 'text-muted-foreground'
						)}
						role="combobox"
						bind:ref={popoverTriggerRef}
						{...props}
					>
						{$formData.ownerId ? accountName($formData.ownerId) : 'Select owner'}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<input hidden value={$formData.ownerId} name={props.name} />
				{/snippet}
			</Form.Control>
			<Popover.Content class="w-56 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search owned accounts..." class="h-9" />
					<Command.Empty>No other owned accounts</Command.Empty>
					<Command.Group>
						{#each serverState.portfolios.keys() as accountId (accountId)}
							{#if accountId !== serverState.actingAs}
								<Command.Item
									value={accountName(accountId)}
									onSelect={() => {
										$formData.accountId = accountId;
										closePopoverAndFocusTrigger();
									}}
								>
									{accountName(accountId)}
									<Check
										class={cn(
											'ml-auto h-4 w-4',
											accountId !== $formData.accountId && 'text-transparent'
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
</form>
