<script lang="ts">
	import { ownerships, sendClientMessage, users } from '$lib/api';
	import { user } from '$lib/auth';
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
		ofBotId: '',
		toUserId: ''
	};

	const form = protoSuperForm(
		'give-ownership',
		websocket_api.GiveOwnership.fromObject,
		(giveOwnership) => sendClientMessage({ giveOwnership }),
		initialData
	);

	const { form: formData, enhance } = form;

	let firstPopoverOpen = false;
	let secondPopoverOpen = false;

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger(triggerId: string) {
		firstPopoverOpen = false;
		secondPopoverOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<form use:enhance class="grid grid-cols-[auto_auto] gap-4">
	<Form.Button class="w-32">Give Ownership</Form.Button>
	<Form.Field {form} name="ofBotId">
		<Popover.Root bind:open={firstPopoverOpen} let:ids>
			<Form.Control let:attrs>
				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'w-56 justify-between',
						!$formData.ofBotId && 'text-muted-foreground'
					)}
					role="combobox"
					{...attrs}
				>
					{$formData.ofBotId ? $users.get($formData.ofBotId)?.name || 'Unnamed bot' : 'Select bot'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Popover.Trigger>
				<input hidden value={$formData.ofBotId} name={attrs.name} />
			</Form.Control>
			<Popover.Content class="w-56 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search bots..." class="h-9" />
					<Command.Empty>No owned bots</Command.Empty>
					<Command.Group>
						{#each [...$ownerships] as { ofBotId } (ofBotId)}
							{#if ofBotId}
								<Command.Item
									value={$users.get(ofBotId)?.name || 'Unnamed bot'}
									onSelect={() => {
										$formData.ofBotId = ofBotId;
										closePopoverAndFocusTrigger(ids.trigger);
									}}
								>
									{$users.get(ofBotId)?.name || 'Unnamed bot'}
									<Check
										class={cn(
											'ml-auto h-4 w-4',
											ofBotId !== $formData.userId && 'text-transparent'
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
	<Form.Field {form} name="toUserId" class="col-start-2">
		<Popover.Root bind:open={secondPopoverOpen} let:ids>
			<Form.Control let:attrs>
				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'w-56 justify-between',
						!$formData.toUserId && 'text-muted-foreground'
					)}
					role="combobox"
					{...attrs}
				>
					{$formData.toUserId
						? $users.get($formData.toUserId)?.name || 'Unnamed user'
						: 'Select new owner'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Popover.Trigger>
				<input hidden value={$formData.toUserId} name={attrs.name} />
			</Form.Control>
			<Popover.Content class="w-56 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search users..." class="h-9" />
					<Command.Empty>No users found</Command.Empty>
					<Command.Group>
						{#each [...$users] as [id, acocunt] (id)}
							{#if id !== $user?.id && !acocunt.isBot}
								<Command.Item
									value={acocunt.name || 'Unnamed user'}
									onSelect={() => {
										$formData.toUserId = id;
										closePopoverAndFocusTrigger(ids.trigger);
									}}
								>
									{acocunt.name || 'Unnamed user'}
									<Check
										class={cn('ml-auto h-4 w-4', id !== $formData.toUserId && 'text-transparent')}
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
