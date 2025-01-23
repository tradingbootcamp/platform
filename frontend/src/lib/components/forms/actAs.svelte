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
		accountId: 0
	};

	const form = protoSuperForm(
		'act-as',
		(v) => websocket_api.ActAs.fromObject(v),
		(actAs) => sendClientMessage({ actAs }),
		initialData
	);

	const { form: formData, enhance } = form;

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

	let canActAs = $derived.by(() => {
		const owned = serverState.portfolios.keys();
		const currentUser = serverState.portfolios
			.values()
			.find((p) => !p.ownerCredits?.length)?.accountId;
		const users = serverState.accounts
			.values()
			.filter((a) => a.isUser && a.id !== currentUser)
			.map(({ id }) => id);
		if (serverState.isAdmin) {
			return [...owned, ...users];
		}
		return owned;
	});
</script>

<form use:enhance class="flex gap-4">
	<Form.Field {form} name="userId" class="space-y-0">
		<Popover.Root bind:open={popoverOpen}>
			<Form.Control>
				{#snippet children({ props })}
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'ghost' }),
							'flex w-44 justify-between text-lg font-normal'
						)}
						role="combobox"
						bind:ref={popoverTriggerRef}
						{...props}
					>
						<span>
							Hi <em class="pl-2">{accountName(serverState.actingAs, '')}</em>
						</span>
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Popover.Trigger>
					<input hidden value={$formData.accountId} name={props.name} />
				{/snippet}
			</Form.Control>
			<Popover.Content class="w-44 p-0">
				<Command.Root>
					<Command.Input autofocus placeholder="Search accounts..." class="h-9" />
					<Command.Empty>No other owned accounts</Command.Empty>
					<Command.Group>
						{#each canActAs as accountId (accountId)}
							{#if accountId !== serverState.actingAs}
								<Command.Item
									value={accountName(accountId, 'Yourself')}
									onSelect={() => {
										$formData.accountId = accountId;
										closePopoverAndFocusTrigger();
										form.submit();
									}}
								>
									{accountName(accountId, 'Yourself')}
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
