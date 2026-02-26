<script lang="ts">
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Command from '$lib/components/ui/command';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import { roundToTenth } from '$lib/components/marketDataUtils';
	import { cn } from '$lib/utils';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { websocket_api } from 'schema-js';
	import { tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		children?: Snippet;
		onclick?: () => void;
		[key: string]: unknown;
	}

	let { children, ...rest }: Props = $props();

	const initialData = {
		fromAccountId: 0,
		toAccountId: 0,
		amount: 0,
		note: ''
	};
	let open = $state(false);

	let selectedToAccountIds = $state(new Set<number>());
	let selectedCount = $derived(selectedToAccountIds.size);

	const form = protoSuperForm(
		'make-transfer',
		(v) => websocket_api.MakeTransfer.fromObject(v),
		(makeTransfer) => {
			open = false;
			for (const toAccountId of selectedToAccountIds) {
				sendClientMessage({
					makeTransfer: websocket_api.MakeTransfer.fromObject({
						...makeTransfer,
						toAccountId
					})
				});
			}
			selectedToAccountIds = new Set();
		},
		initialData,
		{
			cancelPred: () => selectedCount === 0
		}
	);

	const { form: formData, enhance } = form;

	let fromPopoverOpen = $state(false);
	let toPopoverOpen = $state(false);
	let fromTriggerRef = $state<HTMLButtonElement>(null!);
	let toSearchValue = $state('');

	function closeFromPopoverAndFocusTrigger() {
		fromPopoverOpen = false;
		tick().then(() => {
			fromTriggerRef.focus();
		});
	}

	function toggleToAccount(id: number) {
		const next = new Set(selectedToAccountIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedToAccountIds = next;
		toSearchValue = '';
	}

	// Clear selection when from account changes
	let prevFromAccountId = $state($formData.fromAccountId);
	$effect(() => {
		if ($formData.fromAccountId !== prevFromAccountId) {
			prevFromAccountId = $formData.fromAccountId;
			selectedToAccountIds = new Set();
		}
	});

	// Filter accounts to only show those in current universe
	function isInCurrentUniverse(accountId: number): boolean {
		const account = serverState.accounts.get(accountId);
		return account?.universeId === serverState.currentUniverseId;
	}

	let validFromAccounts = $derived(
		Array.from(serverState.portfolios.keys()).filter(isInCurrentUniverse)
	);
	let validToAccounts = $derived.by(() => {
		const fromAccountId = $formData.fromAccountId;
		if (!fromAccountId) return [];

		// Accounts owned by the from account (owner -> owned transfers)
		const owned = [...serverState.portfolios.values()]
			.filter(({ ownerCredits }) => ownerCredits?.find(({ ownerId }) => ownerId === fromAccountId))
			.map(({ accountId }) => accountId);

		// Accounts that own the from account (owned -> owner transfers)
		const owners =
			serverState.portfolios
				.get(fromAccountId)
				?.ownerCredits?.map(({ ownerId }) => ownerId)
				.filter((accountId) => serverState.portfolios.has(accountId)) ?? [];

		// User-to-user transfers (only from main user account to other users)
		const users =
			fromAccountId === serverState.userId
				? [...serverState.accounts.values()]
						.filter((a) => a.isUser && a.id !== fromAccountId)
						.map((a) => a.id)
				: [];

		// Filter all candidates to current universe (cross-universe transfers not allowed)
		return [...owned, ...owners, ...users].filter(isInCurrentUniverse);
	});

	let maxAmount = $derived.by(() => {
		const fromAccount = serverState.portfolios.get($formData.fromAccountId);
		if (!fromAccount || selectedCount === 0) return undefined;
		const available = fromAccount.availableBalance ?? 0;
		const perRecipient = available / selectedCount;

		// Check owner credit limits for each selected recipient
		let minPerRecipient = perRecipient;
		for (const toId of selectedToAccountIds) {
			const ownerCredit = fromAccount.ownerCredits?.find(({ ownerId }) => ownerId === toId);
			if (ownerCredit) {
				minPerRecipient = Math.min(minPerRecipient, ownerCredit.credit ?? 0);
			}
		}
		return minPerRecipient;
	});

	let toTriggerLabel = $derived.by(() => {
		if (selectedCount === 0) return 'Select recipients';
		if (selectedCount === 1) {
			const [id] = selectedToAccountIds;
			return accountName(id);
		}
		return `${selectedCount} accounts selected`;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', className: 'text-base' })} {...rest}
		>{#if children}{@render children()}{:else}Make Transfer{/if}</Dialog.Trigger
	>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
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
								bind:ref={fromTriggerRef}
								class={cn(
									buttonVariants({ variant: 'outline' }),
									'w-[200px] justify-between',
									!$formData.fromAccountId && 'text-muted-foreground'
								)}
								role="combobox"
								{...props}
							>
								{$formData.fromAccountId ? accountName($formData.fromAccountId) : 'Select source'}
								<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Popover.Trigger>
							<input hidden value={$formData.fromAccountId} name={props.name} />
						{/snippet}
					</Form.Control>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input autofocus placeholder="Search account..." class="h-9" />
							<Command.List>
								<Command.Empty>No account found.</Command.Empty>
								<Command.Group>
									{#each validFromAccounts as id (id)}
										<Command.Item
											value={accountName(id)}
											onSelect={() => {
												$formData.fromAccountId = id;
												closeFromPopoverAndFocusTrigger();
											}}
										>
											{accountName(id)}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="toAccountId" class="flex flex-col">
				<Popover.Root bind:open={toPopoverOpen}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label
								>To{#if selectedCount > 0}
									({selectedCount}){/if}</Form.Label
							>
							<div class="flex items-center gap-2">
								<Popover.Trigger
									class={cn(
										buttonVariants({ variant: 'outline' }),
										'w-[200px] justify-between',
										selectedCount === 0 && 'text-muted-foreground'
									)}
									role="combobox"
									{...props}
								>
									{toTriggerLabel}
									<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Popover.Trigger>
								{#if validToAccounts.length > 0}
									<button
										type="button"
										class={buttonVariants({ variant: 'outline' })}
										onclick={() => {
											selectedToAccountIds = new Set(validToAccounts);
										}}
									>
										All
									</button>
									<button
										type="button"
										class={buttonVariants({ variant: 'outline' })}
										onclick={() => {
											selectedToAccountIds = new Set();
										}}
									>
										Clear
									</button>
								{/if}
							</div>
							<input hidden value={$formData.toAccountId} name={props.name} />
						{/snippet}
					</Form.Control>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input
								autofocus
								placeholder="Search account..."
								class="h-9"
								bind:value={toSearchValue}
							/>
							<Command.List>
								<Command.Empty>No account found.</Command.Empty>
								<Command.Group>
									{#each validToAccounts as id (id)}
										<Command.Item
											value={accountName(id)}
											onSelect={() => {
												toggleToAccount(id);
											}}
										>
											<Checkbox checked={selectedToAccountIds.has(id)} class="mr-2" />
											{accountName(id)}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="amount">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label
							>Amount{#if maxAmount !== undefined}
								{' '}(max: {maxAmount}){/if}{#if selectedCount > 1 && $formData.amount}
								{' '}&mdash; total: {roundToTenth(
									$formData.amount * selectedCount
								)}{/if}</Form.Label
						>
						<Input
							{...props}
							type="number"
							min="0.1"
							max={maxAmount}
							step="0.1"
							bind:value={$formData.amount}
							onblur={() => {
								$formData.amount = roundToTenth($formData.amount as unknown as number);
							}}
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
				<Form.Button disabled={selectedCount === 0}>Submit</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
