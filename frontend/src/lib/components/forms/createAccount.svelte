<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { websocket_api } from 'schema-js';
	import { tick } from 'svelte';
	import { buttonVariants } from '../ui/button';
	import { protoSuperForm } from './protoSuperForm';
	import { universeMode } from '$lib/universeMode.svelte';

	interface Props {
		prefillUniverseId?: number | null;
		prefillUniverseName?: string;
		onPrefillUsed?: () => void;
	}

	let { prefillUniverseId = null, prefillUniverseName = '', onPrefillUsed }: Props = $props();

	const initialData = {
		ownerId: 0,
		name: '',
		universeId: 0,
		initialBalance: 0
	};

	// Handle prefill when props change
	$effect(() => {
		if (prefillUniverseId && prefillUniverseId > 0) {
			$formData.universeId = prefillUniverseId;
			$formData.name = prefillUniverseName;
			$formData.initialBalance = 100;
			$formData.ownerId = serverState.userId ?? 0;
			onPrefillUsed?.();
		}
	});

	// Get universe name for prefixing account names
	function getUniverseName(universeId: number): string {
		const universe = serverState.universes.get(universeId);
		return universe?.name || '';
	}

	const form = protoSuperForm(
		'create-account',
		// TODO: allow creating sub accounts
		(v) => {
			// Prepend universe name to account name for non-main universes
			const name = v.name as string;
			const universeId = (v.universeId as number) || 0;
			let finalAccountName = name;
			if (universeId > 0) {
				const universeName = getUniverseName(universeId);
				if (universeName && !name.includes('__')) {
					finalAccountName = `${universeName}__${name}`;
				}
			}
			return websocket_api.CreateAccount.fromObject({
				...v,
				name: finalAccountName,
				ownerId: v.ownerId || serverState.userId,
				universeId: universeId,
				initialBalance: v.initialBalance || 0
			});
		},
		(createAccount) => sendClientMessage({ createAccount }),
		initialData
	);

	const { form: formData, enhance } = form;

	let validOwnerIds = $derived(
		Array.from(
			[...serverState.portfolios.values()]
				.filter(
					(p) =>
						p.accountId === serverState.userId ||
						p.ownerCredits?.find((oc) => oc.ownerId === serverState.userId)
				)
				.map((p) => p.accountId)
		)
	);

	// Universes where the user is the owner (can set initial balance)
	let ownedUniverses = $derived(
		[...serverState.universes.values()].filter((u) => u.ownerId === serverState.userId)
	);

	// Can only set initial balance if user owns the selected universe
	let canSetInitialBalance = $derived(
		$formData.universeId > 0 && ownedUniverses.some((u) => u.id === $formData.universeId)
	);

	let popoverOpen = $state(false);
	let popoverTriggerRef = $state<HTMLButtonElement>(null!);

	let universePopoverOpen = $state(false);
	let universePopoverTriggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger() {
		popoverOpen = false;
		tick().then(() => {
			popoverTriggerRef.focus();
		});
	}

	function closeUniversePopoverAndFocusTrigger() {
		universePopoverOpen = false;
		tick().then(() => {
			universePopoverTriggerRef.focus();
		});
	}

	function universeName(universeId: number) {
		const universe = serverState.universes.get(universeId);
		return universe?.name || 'Main';
	}
</script>

<form use:enhance class="flex flex-col gap-4 md:flex-row md:flex-wrap">
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
						{#each validOwnerIds as accountId (accountId)}
							<Command.Item
								value={accountName(accountId)}
								onSelect={() => {
									$formData.ownerId = accountId;
									closePopoverAndFocusTrigger();
								}}
							>
								{accountName(accountId)}
								<Check
									class={cn(
										'ml-auto h-4 w-4',
										accountId !== $formData.ownerId && 'text-transparent'
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

	{#if universeMode.enabled}
		<Form.Field {form} name="universeId">
			<Popover.Root bind:open={universePopoverOpen}>
				<Form.Control>
					{#snippet children({ props })}
						<Popover.Trigger
							class={cn(
								buttonVariants({ variant: 'outline' }),
								'w-56 justify-between',
								!$formData.universeId && 'text-muted-foreground'
							)}
							role="combobox"
							bind:ref={universePopoverTriggerRef}
							{...props}
						>
							{universeName($formData.universeId)}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={$formData.universeId} name={props.name} />
					{/snippet}
				</Form.Control>
				<Popover.Content class="w-56 p-0">
					<Command.Root>
						<Command.Input autofocus placeholder="Search universes..." class="h-9" />
						<Command.Empty>No universes found</Command.Empty>
						<Command.Group>
							{#each [...serverState.universes.values()] as universe (universe.id)}
								<Command.Item
									value={universe.name ?? undefined}
									onSelect={() => {
										$formData.universeId = universe.id;
										closeUniversePopoverAndFocusTrigger();
									}}
								>
									{universe.name ?? 'Unknown'}
									<Check
										class={cn(
											'ml-auto h-4 w-4',
											universe.id !== $formData.universeId && 'text-transparent'
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

		{#if canSetInitialBalance}
			<Form.Field {form} name="initialBalance" class="w-56">
				<Form.Control>
					{#snippet children({ props })}
						<Input
							{...props}
							type="number"
							bind:value={$formData.initialBalance}
							placeholder="Initial balance"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{/if}
	{/if}

	<Form.Button class="w-32">Submit</Form.Button>
</form>
