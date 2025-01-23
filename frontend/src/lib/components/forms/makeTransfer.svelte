<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
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
		fromAccountId: 0,
		toAccountId: 0,
		amount: 0,
		note: ''
	};
	let open = $state(false);

	const form = protoSuperForm(
		'make-transfer',
		(v) => websocket_api.MakeTransfer.fromObject(v),
		(makeTransfer) => {
			open = false;
			sendClientMessage({ makeTransfer });
		},
		initialData
	);

	const { form: formData, enhance } = form;

	let fromPopoverOpen = $state(false);
	let toPopoverOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger() {
		fromPopoverOpen = false;
		toPopoverOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	let validFromAccounts = $derived(Array.from(serverState.portfolios.keys()));
	let validToAccounts = $derived.by(() => {
		const fromAccountId = $formData.fromAccountId;
		if (!fromAccountId) return [];
		const owned = serverState.portfolios
			.values()
			.filter(({ ownerCredits }) => ownerCredits?.find(({ ownerId }) => ownerId === fromAccountId))
			.map(({ accountId }) => accountId);
		const owners =
			serverState.portfolios
				.get(fromAccountId)
				?.ownerCredits?.map(({ ownerId }) => ownerId)
				.filter((accountId) => serverState.portfolios.has(accountId)) ?? [];
		// This might not be serverState.userId if you're an admin
		const currentUser = serverState.portfolios
			.values()
			.find((p) => !p.ownerCredits?.length)?.accountId;
		const users =
			fromAccountId === currentUser
				? serverState.accounts
						.values()
						.filter((a) => a.isUser && a.id !== fromAccountId)
						.map((a) => a.id)
				: [];
		return [...owned, ...owners, ...users];
	});
	let maxAmount = $derived.by(() => {
		const fromAccount = serverState.portfolios.get($formData.fromAccountId);
		const toAccount = serverState.portfolios.get($formData.toAccountId);
		if (!fromAccount || !toAccount) return;
		const available = fromAccount.availableBalance;
		const ownerCredit = fromAccount.ownerCredits?.find(
			({ ownerId }) => ownerId === toAccount.accountId
		);
		if (ownerCredit) {
			return Math.min(available ?? 0, ownerCredit.credit ?? 0);
		}
		return available;
	});
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
			<Form.Field {form} name="fromAccountId" class="flex flex-col">
				<Popover.Root bind:open={fromPopoverOpen}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>From</Form.Label>
							<Popover.Trigger
								class={cn(
									buttonVariants({ variant: 'outline' }),
									'w-[200px] justify-between',
									!$formData.fromAccountId && 'text-muted-foreground'
								)}
								role="combobox"
								{...props}
							>
								{$formData.fromAccountId
									? accountName($formData.fromAccountId, 'Yourself')
									: 'Select source'}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Popover.Trigger>
							<input hidden value={$formData.fromAccountId} name={props.name} />
						{/snippet}
					</Form.Control>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input autofocus placeholder="Search account..." class="h-9" />
							<Command.Empty>No account found.</Command.Empty>
							<Command.Group>
								{#each validFromAccounts as id (id)}
									<Command.Item
										value={accountName(id, 'Yourself')}
										onSelect={() => {
											$formData.fromAccountId = id;
											closePopoverAndFocusTrigger();
										}}
									>
										{accountName(id, 'Yourself')}
										<Check
											class={cn(
												'ml-auto h-4 w-4',
												id !== $formData.fromAccountId && 'text-transparent'
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
			<Form.Field {form} name="toAccountId" class="flex flex-col">
				<Popover.Root bind:open={toPopoverOpen}>
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
									? accountName($formData.toAccountId, 'Yourself')
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
								{#each validToAccounts as id (id)}
									<Command.Item
										value={accountName(id, 'Yourself')}
										onSelect={() => {
											$formData.toAccountId = id;
											closePopoverAndFocusTrigger();
										}}
									>
										{accountName(id, 'Yourself')}
										<Check
											class={cn(
												'ml-auto h-4 w-4',
												id !== $formData.toAccountId && 'text-transparent'
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
			<Form.Field {form} name="amount">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label
							>Amount {#if maxAmount !== undefined}
								(max: {maxAmount}){/if}</Form.Label
						>
						<Input
							{...props}
							type="number"
							min="0.0001"
							max={maxAmount}
							step="0.0001"
							bind:value={$formData.amount}
						/>
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
