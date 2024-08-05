<script lang="ts">
	import { actingAs, ownerships, sendClientMessage, users } from '$lib/api';
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
		userId: ''
	};

	const form = protoSuperForm(
		'act-as',
		websocket_api.ActAs.fromObject,
		(actAs) => sendClientMessage({ actAs }),
		initialData
	);

	const { form: formData, enhance } = form;

	let popoverOpen = false;

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger(triggerId: string) {
		popoverOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<form use:enhance class="flex gap-4">
	<Form.Button class="w-32">Act as</Form.Button>
	<Form.Field {form} name="userId">
		<Popover.Root bind:open={popoverOpen} let:ids>
			<Form.Control let:attrs>
				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'w-56 justify-between',
						!$formData.userId && 'text-muted-foreground'
					)}
					role="combobox"
					{...attrs}
				>
					{$formData.userId === $user?.id
						? 'Yourself'
						: $formData.userId
							? $users.get($formData.userId)?.name || 'Unnamed user'
							: 'Select owned account'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Popover.Trigger>
				<input hidden value={$formData.userId} name={attrs.name} />
			</Form.Control>
			<Popover.Content class="w-56 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search owned accounts..." class="h-9" />
					<Command.Empty>No other owned accounts</Command.Empty>
					<Command.Group>
						{#each [...$ownerships] as { ofBotId } (ofBotId)}
							{#if ofBotId && ofBotId !== $actingAs}
								<Command.Item
									value={$users.get(ofBotId)?.name || 'Unnamed bot'}
									onSelect={() => {
										$formData.userId = ofBotId;
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
						{#if $user?.id && $user.id !== $actingAs}
							<Command.Item
								value={'Yourself'}
								onSelect={() => {
									$formData.userId = $user?.id || '';
									closePopoverAndFocusTrigger(ids.trigger);
								}}
							>
								Yourself
								<Check
									class={cn('ml-auto h-4 w-4', $user.id !== $formData.userId && 'text-transparent')}
								/>
							</Command.Item>
						{/if}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
		<Form.FieldErrors />
	</Form.Field>
</form>
