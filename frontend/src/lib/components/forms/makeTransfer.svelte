<script lang="ts">
	import {
		accountName,
		disambiguatedAccountNames,
		sendClientMessage,
		serverState
	} from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Command from '$lib/components/ui/command';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { roundToTenth } from '$lib/components/marketDataUtils';
	import { cn, formatNumber } from '$lib/utils';
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
		amount: undefined as unknown as number,
		note: ''
	};
	let open = $state(false);
	let confirmOpen = $state(false);
	let pendingTransfer: Record<string, unknown> | null = $state(null);
	let confirmAmount = $state(0);
	let confirmDestinations = $state<{ id: number; name: string }[]>([]);

	let selectedToAccountIds = $state(new Set<number>());
	let selectedCount = $derived(selectedToAccountIds.size);

	const form = protoSuperForm(
		'make-transfer',
		(v) => websocket_api.MakeTransfer.fromObject(v),
		(makeTransfer) => {
			pendingTransfer = makeTransfer;
			confirmAmount = (makeTransfer as Record<string, unknown>).amount as number;
			confirmDestinations = [...selectedToAccountIds].map((id) => ({
				id,
				name: toDisplayNames.get(id) ?? accountName(id)
			}));
			confirmOpen = true;
		},
		initialData,
		{
			cancelPred: () => selectedCount === 0
		}
	);

	function executeTransfer() {
		if (!pendingTransfer) return;
		for (const { id } of confirmDestinations) {
			sendClientMessage({
				makeTransfer: websocket_api.MakeTransfer.fromObject({
					...pendingTransfer,
					toAccountId: id
				})
			});
		}
		open = false;
		confirmOpen = false;
		pendingTransfer = null;
		selectedToAccountIds = new Set();
	}

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

	// Auto-select source if there's only one option
	$effect(() => {
		if (validFromAccounts.length === 1 && $formData.fromAccountId === 0) {
			$formData.fromAccountId = validFromAccounts[0];
		}
	});
	let ownToAccounts = $derived.by(() => {
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

		return [...owned, ...owners].filter(isInCurrentUniverse);
	});

	let otherToAccounts = $derived.by(() => {
		const fromAccountId = $formData.fromAccountId;
		if (!fromAccountId) return [];

		// User-to-user transfers (only from main user account to other users)
		return fromAccountId === serverState.effectiveUserId
			? [...serverState.accounts.values()]
					.filter((a) => a.isUser && a.id !== fromAccountId && isInCurrentUniverse(a.id))
					.map((a) => a.id)
			: [];
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

	let formattedMax = $derived.by(() => {
		if (maxAmount === undefined) return undefined;
		const full = formatNumber(maxAmount, 20);
		const short = formatNumber(maxAmount);
		const truncated = short !== full;
		return { short: truncated ? short + '…' : short, full, truncated };
	});

	let fromSelected = $derived($formData.fromAccountId !== 0);
	let sourceBalance = $derived(
		fromSelected ? serverState.portfolios.get($formData.fromAccountId)?.availableBalance : undefined
	);
	let formattedSourceBalance = $derived(
		sourceBalance != null ? formatNumber(sourceBalance) : undefined
	);

	let totalAmount = $derived(
		selectedCount > 1 && $formData.amount ? $formData.amount * selectedCount : $formData.amount || 0
	);
	let exceedsBalance = $derived(
		sourceBalance != null && totalAmount > 0 && totalAmount > sourceBalance
	);

	let fromDisplayNames = $derived(disambiguatedAccountNames(validFromAccounts));
	let toDisplayNames = $derived(disambiguatedAccountNames([...ownToAccounts, ...otherToAccounts]));

	let toTriggerLabel = $derived.by(() => {
		if (selectedCount === 0) return 'Select recipient(s)';
		if (selectedCount === 1) {
			const [id] = selectedToAccountIds;
			return toDisplayNames.get(id) ?? accountName(id);
		}
		return `${selectedCount} accounts selected`;
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', className: 'text-base' })} {...rest}
		>{#if children}{@render children()}{:else}New Transfer{/if}</Dialog.Trigger
	>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<form use:enhance class="flex flex-col gap-4">
			<Dialog.Header>
				<Dialog.Title>Transfer Clips</Dialog.Title>
				{#if formattedSourceBalance !== undefined}
					<p class="text-sm text-muted-foreground">
						Available Balance: 📎 {formattedSourceBalance}
					</p>
				{/if}
			</Dialog.Header>
			<Form.Field {form} name="fromAccountId" class="flex flex-col">
				<Popover.Root bind:open={fromPopoverOpen}>
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Source</Form.Label>
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
								{$formData.fromAccountId
									? (fromDisplayNames.get($formData.fromAccountId) ??
										accountName($formData.fromAccountId))
									: 'Select source'}
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
											value={fromDisplayNames.get(id)}
											onSelect={() => {
												$formData.fromAccountId = id;
												closeFromPopoverAndFocusTrigger();
											}}
										>
											{fromDisplayNames.get(id)}
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
							<Form.Label>Destination(s)</Form.Label>
							{#if fromSelected}
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
							{:else}
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props: triggerProps })}
											<span {...triggerProps} class="inline-block w-[200px]">
												<button
													type="button"
													class={cn(
														buttonVariants({ variant: 'outline' }),
														'pointer-events-none w-full justify-between opacity-50'
													)}
													disabled
												>
													Select recipient(s)
													<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</button>
											</span>
										{/snippet}
									</Tooltip.Trigger>
									<Tooltip.Content side="right">
										<p>Choose a source account first</p>
									</Tooltip.Content>
								</Tooltip.Root>
							{/if}
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
								{#if ownToAccounts.length > 0}
									<Command.Group heading="Your accounts">
										{#each ownToAccounts as id (id)}
											<Command.Item
												value={toDisplayNames.get(id)}
												onSelect={() => {
													toggleToAccount(id);
												}}
											>
												<Checkbox checked={selectedToAccountIds.has(id)} class="mr-2" />
												{toDisplayNames.get(id)}
											</Command.Item>
										{/each}
									</Command.Group>
								{/if}
								{#if otherToAccounts.length > 0}
									{#if ownToAccounts.length > 0}
										<Command.Separator />
									{/if}
									<Command.Group heading="Other users">
										{#each otherToAccounts as id (id)}
											<Command.Item
												value={toDisplayNames.get(id)}
												onSelect={() => {
													toggleToAccount(id);
												}}
											>
												<Checkbox checked={selectedToAccountIds.has(id)} class="mr-2" />
												{toDisplayNames.get(id)}
											</Command.Item>
										{/each}
									</Command.Group>
								{/if}
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="amount">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							Amount{#if formattedMax}<span class="text-muted-foreground"
									>{' '}(max: 📎 {#if formattedMax.truncated}<Tooltip.Root>
											<Tooltip.Trigger>
												{#snippet child({ props: tipProps })}
													<span {...tipProps} class="cursor-help underline decoration-dotted"
														>{formattedMax.short}</span
													>
												{/snippet}
											</Tooltip.Trigger>
											<Tooltip.Content>{formattedMax.full}</Tooltip.Content>
										</Tooltip.Root>{:else}{formattedMax.short}{/if})</span
								>{/if}
						</Form.Label>
						<div class="flex items-center gap-3">
							<Input
								{...props}
								type="number"
								min="0.1"
								max={maxAmount}
								step="0.1"
								class="w-32"
								bind:value={$formData.amount}
								onblur={() => {
									$formData.amount = roundToTenth($formData.amount as unknown as number);
								}}
							/>
							{#if selectedCount > 1}
								<span class="text-sm text-muted-foreground">each</span>
							{/if}
						</div>
						<p class="text-sm text-muted-foreground">
							Total: <span class={exceedsBalance ? 'text-destructive line-through' : ''}
								>📎 {formatNumber(roundToTenth(totalAmount))}</span
							>
						</p>
						{#if exceedsBalance}
							<p class="text-sm text-destructive">Exceeds available balance</p>
						{/if}
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
				<Form.Button
					disabled={!fromSelected || selectedCount === 0 || !$formData.amount || exceedsBalance}
					>Submit</Form.Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={confirmOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Confirm Transfer</AlertDialog.Title>
			<AlertDialog.Description>
				{#if confirmDestinations.length === 1}
					You are about to transfer 📎 {formatNumber(confirmAmount)} to {confirmDestinations[0]
						.name}.
				{:else if confirmDestinations.length > 1}
					You are about to transfer 📎 {formatNumber(confirmAmount)} each to:
					<ul class="my-2 list-disc pl-5">
						{#each confirmDestinations as dest (dest.id)}
							<li>{dest.name}</li>
						{/each}
					</ul>
					Total: 📎 {formatNumber(roundToTenth(confirmAmount * confirmDestinations.length))}
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={executeTransfer}>Confirm</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
