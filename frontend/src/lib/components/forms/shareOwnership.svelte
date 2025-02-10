<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { websocket_api } from 'schema-js';
	import { tick } from 'svelte';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = {
		ofAccountId: 0,
		toAccountId: 0
	};

	const form = protoSuperForm(
		'share-ownership',
		(v) => websocket_api.ShareOwnership.fromObject(v),
		(shareOwnership) => sendClientMessage({ shareOwnership }),
		initialData
	);

	const { form: formData, enhance } = form;

	let firstPopoverOpen = $state(false);
	let secondPopoverOpen = $state(false);
	let firstTriggerRef = $state<HTMLButtonElement>(null!);
	let secondTriggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger(triggerRef: HTMLButtonElement) {
		firstPopoverOpen = false;
		secondPopoverOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	let canShare = $derived(
		[...serverState.portfolios.values()]
			.filter((p) =>
				p.ownerCredits?.find(({ ownerId }) => serverState.accounts.get(ownerId)?.isUser)
			)
			.map(({ accountId }) => accountId)
	);
	let canShareWith = $derived.by(() => {
		// This might not be serverState.userId if you're an admin
		const currentUser = [...serverState.portfolios.values()].find(
			(p) => !p.ownerCredits?.length
		)?.accountId;
		return [...serverState.accounts.values()]
			.filter((a) => a.isUser && a.id !== currentUser)
			.map(({ id }) => id);
	});
</script>

<form use:enhance class="flex gap-4">
	<Form.Button class="w-32">Share Ownership</Form.Button>
	<Form.Field {form} name="ofAccountId">
		<Popover.Root bind:open={firstPopoverOpen}>
			<Form.Control>
				{#snippet children({ props })}
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-56 justify-between',
							!$formData.ofAccountId && 'text-muted-foreground'
						)}
						role="combobox"
						{...props}
						bind:ref={firstTriggerRef}
					>
						{$formData.ofAccountId ? accountName($formData.ofAccountId) : 'Select account to share'}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<input hidden value={$formData.ofAccountId} name={props.name} />
				{/snippet}
			</Form.Control>
			<Popover.Content class="w-56 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search accounts..." class="h-9" />
					<Command.Empty>No owned accounts</Command.Empty>
					<Command.Group>
						{#each canShare as ofAccountId (ofAccountId)}
							<Command.Item
								value={accountName(ofAccountId)}
								onSelect={() => {
									$formData.ofAccountId = ofAccountId;
									closePopoverAndFocusTrigger(firstTriggerRef);
								}}
							>
								{accountName(ofAccountId)}
								<Check
									class={cn(
										'ml-auto h-4 w-4',
										ofAccountId !== $formData.ofAccountId && 'text-transparent'
									)}
								/>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="toUserId" class="col-start-2">
		<Popover.Root bind:open={secondPopoverOpen}>
			<Form.Control>
				{#snippet children({ props })}
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'outline' }),
							'w-56 justify-between',
							!$formData.toAccountId && 'text-muted-foreground'
						)}
						role="combobox"
						{...props}
						bind:ref={secondTriggerRef}
					>
						{$formData.toAccountId
							? accountName($formData.toAccountId, 'Yourself')
							: 'Select new owner'}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<input hidden value={$formData.toAccountId} name={props.name} />
				{/snippet}
			</Form.Control>
			<Popover.Content class="w-56 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search users..." class="h-9" />
					<Command.Empty>No users found</Command.Empty>
					<Command.Group>
						{#each canShareWith as id (id)}
							<Command.Item
								value={accountName(id, 'Yourself')}
								onSelect={() => {
									$formData.toAccountId = id;
									closePopoverAndFocusTrigger(secondTriggerRef);
								}}
							>
								{accountName(id, 'Yourself')}
								<Check
									class={cn('ml-auto h-4 w-4', id !== $formData.toAccountId && 'text-transparent')}
								/>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<Form.FieldErrors />
	</Form.Field>
</form>
