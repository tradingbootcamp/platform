<script lang="ts">
	import {
		accountName,
		disambiguatedAccountNames,
		getCurrentCohort,
		sendClientMessage,
		serverState
	} from '$lib/api.svelte';
	import { fetchAllBalances } from '$lib/adminApi';
	import { universeMode } from '$lib/universeMode.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { roundToTenth } from '$lib/components/marketDataUtils';
	import { cn } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Trash from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import { onMount, tick } from 'svelte';

	interface Props {
		id: number | null | undefined;
		name: string | null | undefined;
		close: () => void;
	}

	let { id, name, close }: Props = $props();

	let formEl: HTMLFormElement = $state(null!);
	let showDialog = $state(false);
	let confirmed = $state(false);
	let isSubmitting = $state(false);

	// Single-buyer combobox state
	let singleBuyerPopoverOpen = $state(false);
	let singleBuyerTriggerRef = $state<HTMLButtonElement>(null!);

	// Per-row combobox state for split mode (track open state by row id)
	let openRowComboboxId = $state<number | null>(null);

	type ContributorRow = { rowId: number; buyerId: number; amount: number };
	let splitMode = $state(false);
	let contribRows: ContributorRow[] = $state([]);
	let nextRowId = 0;
	// Local state for owner radio in split mode. 0 = no owner picked.
	let ownerSelectionId = $state(0);

	// Per-account balance lookup (only fetched in admin context, which is the only
	// place this form is rendered). Empty until the fetch resolves; rows with no
	// balance entry skip the over-budget check rather than blocking submission.
	let balances: Map<number, number> = $state(new Map());

	onMount(() => {
		const cohort = getCurrentCohort();
		fetchAllBalances()
			.then((response) => {
				const map = new Map<number, number>();
				for (const c of response.cohorts) {
					if (cohort && c.cohort_name !== cohort) continue;
					for (const u of [...c.members, ...c.guests]) {
						map.set(u.account_id, u.balance);
					}
				}
				balances = map;
			})
			.catch((err) => console.error('Failed to load account balances:', err));
	});

	function balanceFor(accountId: number): number | undefined {
		return balances.get(accountId);
	}

	function isOverBudget(accountId: number, amount: number): boolean {
		const b = balanceFor(accountId);
		return b !== undefined && amount > b + 0.005;
	}

	function formatClips(n: number): string {
		return `📎 ${n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
	}

	function focusTrigger(triggerRef: HTMLButtonElement | null) {
		if (!triggerRef) return;
		tick().then(() => triggerRef.focus());
	}

	let isUser = $derived.by(() => {
		if (isSubmitting) return [];
		let users = [...serverState.accounts.values()].filter((a) => a.isUser);
		if (universeMode.enabled) {
			users = users.filter((a) => a.universeId === serverState.currentUniverseId);
		}
		return users.map((a) => a.id);
	});

	let displayNames = $derived(disambiguatedAccountNames(isUser, 'Yourself'));

	const initialData = {
		settlePrice: 0,
		buyerId: 0
	};

	const form = protoSuperForm(
		'settle-auction',
		(v) => {
			const base = {
				auctionId: id,
				settlePrice: v.settlePrice
			};
			if (splitMode) {
				const contributions = contribRows
					.filter((r) => r.buyerId !== 0)
					.map((r) => ({ buyerId: r.buyerId, amount: r.amount || 0 }));
				return websocket_api.SettleAuction.fromObject({
					...base,
					buyerId: 0,
					contributions,
					...(ownerSelectionId !== 0 ? { ownerId: ownerSelectionId } : {})
				});
			}
			return websocket_api.SettleAuction.fromObject({
				...base,
				buyerId: v.buyerId
			});
		},
		async (settleAuction) => {
			try {
				isSubmitting = true;
				showDialog = false;
				await new Promise((resolve) => requestAnimationFrame(resolve));
				sendClientMessage({ settleAuction });
				await new Promise((resolve) => setTimeout(resolve, 100));
				close();
			} catch (error) {
				console.error('Error settling auction:', error);
				isSubmitting = false;
			}
		},
		initialData,
		{
			cancelPred() {
				if (confirmed) {
					confirmed = false;
					return false;
				}
				showDialog = true;
				return true;
			}
		}
	);

	const { form: formData, enhance } = form;

	function enterSplitMode() {
		splitMode = true;
		// Seed two rows: the current single buyer (if any) at full price, and an empty row.
		const seedBuyer = $formData.buyerId;
		const seedAmount = $formData.settlePrice;
		contribRows = [
			{ rowId: nextRowId++, buyerId: seedBuyer, amount: seedBuyer ? seedAmount : 0 },
			{ rowId: nextRowId++, buyerId: 0, amount: 0 }
		];
		ownerSelectionId = seedBuyer;
	}

	function exitSplitMode() {
		splitMode = false;
		contribRows = [];
		ownerSelectionId = 0;
	}

	function addRow() {
		contribRows = [...contribRows, { rowId: nextRowId++, buyerId: 0, amount: 0 }];
	}

	function removeRow(rowId: number) {
		const row = contribRows.find((r) => r.rowId === rowId);
		if (row && ownerSelectionId === row.buyerId) ownerSelectionId = 0;
		contribRows = contribRows.filter((r) => r.rowId !== rowId);
	}

	function splitEvenly() {
		const total = $formData.settlePrice;
		const n = contribRows.length;
		if (n === 0 || total <= 0) return;
		// Divide to one decimal place; assign remainder to first row so sum matches exactly.
		const per = Math.floor((total / n) * 10) / 10;
		const remainder = Math.round((total - per * n) * 10) / 10;
		contribRows = contribRows.map((r, i) => ({
			...r,
			amount: i === 0 ? roundToTenth(per + remainder) : per
		}));
	}

	function pickWeightedOwner() {
		const valid = contribRows.filter((r) => r.buyerId !== 0);
		if (valid.length === 0) return;
		const total = valid.reduce((s, r) => s + Math.max(0, r.amount || 0), 0);
		if (total <= 0) {
			// Everyone contributed 0 — fall back to uniform random across contributors.
			const picked = valid[Math.floor(Math.random() * valid.length)];
			ownerSelectionId = picked.buyerId;
			return;
		}
		let roll = Math.random() * total;
		for (const r of valid) {
			roll -= Math.max(0, r.amount || 0);
			if (roll <= 0) {
				ownerSelectionId = r.buyerId;
				return;
			}
		}
		ownerSelectionId = valid[valid.length - 1].buyerId;
	}

	let validRows = $derived(contribRows.filter((r) => r.buyerId !== 0));
	let totalContributed = $derived(validRows.reduce((s, r) => s + (r.amount || 0), 0));
	let sumMatchesPrice = $derived(Math.abs(totalContributed - ($formData.settlePrice || 0)) < 0.005);
	let hasNegativeContribution = $derived(validRows.some((r) => r.amount < 0));
	let hasDuplicateBuyer = $derived(
		new Set(validRows.map((r) => r.buyerId)).size !== validRows.length
	);
	let hasOverBudgetSplit = $derived(validRows.some((r) => isOverBudget(r.buyerId, r.amount || 0)));
	let canSubmitSplit = $derived(
		validRows.length >= 1 &&
			sumMatchesPrice &&
			!hasDuplicateBuyer &&
			!hasNegativeContribution &&
			!hasOverBudgetSplit &&
			!isSubmitting
	);
	let singleBuyerOverBudget = $derived(
		!splitMode &&
			$formData.buyerId !== 0 &&
			isOverBudget($formData.buyerId, $formData.settlePrice || 0)
	);

	function resetForm() {
		// bits-ui closes the dialog on its own when AlertDialog.Cancel is clicked.
		// We only need to clear the confirmed/submitting flags; calling formEl.reset()
		// here would wipe what the user already typed.
		confirmed = false;
		isSubmitting = false;
	}

	function ownerLabel(): string {
		if (splitMode) {
			if (ownerSelectionId === 0) return 'no labeled owner';
			return displayNames.get(ownerSelectionId) ?? accountName(ownerSelectionId, 'Yourself');
		}
		return displayNames.get($formData.buyerId) ?? accountName($formData.buyerId, 'Yourself');
	}
</script>

Settle auction:

<form use:enhance bind:this={formEl} class="flex flex-col gap-3">
	<Form.Field {form} name="settlePrice">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Total Settle Price</Form.Label>
				<Input
					{...props}
					type="number"
					step="0.1"
					bind:value={$formData.settlePrice}
					disabled={isSubmitting}
					onblur={() => {
						$formData.settlePrice = roundToTenth($formData.settlePrice as unknown as number);
					}}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	{#if !splitMode}
		<Form.Field {form} name="buyerId">
			<Popover.Root bind:open={singleBuyerPopoverOpen}>
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Buyer</Form.Label>
						<br />
						<Popover.Trigger
							class={cn(
								buttonVariants({ variant: 'outline' }),
								'w-56 justify-between',
								!$formData.buyerId && 'text-muted-foreground'
							)}
							role="combobox"
							disabled={isSubmitting}
							{...props}
							bind:ref={singleBuyerTriggerRef}
						>
							{$formData.buyerId
								? (displayNames.get($formData.buyerId) ??
									accountName($formData.buyerId, 'Yourself'))
								: 'Select buyer'}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<input hidden value={$formData.buyerId} name={props.name} />
					{/snippet}
				</Form.Control>
				<Popover.Content class="w-56 p-0">
					<Command.Root>
						<Command.Input autofocus placeholder="Search users..." class="h-9" />
						<Command.List>
							<Command.Empty>No users found</Command.Empty>
							<Command.Group>
								{#each isUser as userId (userId)}
									<Command.Item
										value={displayNames.get(userId)}
										onSelect={() => {
											$formData.buyerId = userId;
											singleBuyerPopoverOpen = false;
											focusTrigger(singleBuyerTriggerRef);
										}}
									>
										{displayNames.get(userId)}
										<Check
											class={cn(
												'ml-auto h-4 w-4',
												userId !== $formData.buyerId && 'text-transparent'
											)}
										/>
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<Form.FieldErrors />
		</Form.Field>

		{#if $formData.buyerId !== 0 && balanceFor($formData.buyerId) !== undefined}
			<div
				class={cn('text-xs', singleBuyerOverBudget ? 'text-destructive' : 'text-muted-foreground')}
			>
				Buyer's balance: {formatClips(balanceFor($formData.buyerId)!)}
				{#if singleBuyerOverBudget}
					— settle price exceeds buyer's balance
				{/if}
			</div>
		{/if}

		<Button
			type="button"
			variant="outline"
			size="sm"
			class="self-start"
			onclick={enterSplitMode}
			disabled={isSubmitting}
		>
			Split among multiple buyers
		</Button>
		<Form.Button
			class="w-full"
			disabled={isSubmitting || !$formData.buyerId || singleBuyerOverBudget}
		>
			{isSubmitting ? 'Settling...' : 'Settle Auction'}
		</Form.Button>
	{:else}
		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Contributors</span>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onclick={exitSplitMode}
					disabled={isSubmitting}
				>
					Back to single buyer
				</Button>
			</div>

			{#each contribRows as row (row.rowId)}
				<div class="flex items-center gap-2">
					<input
						type="radio"
						name="owner"
						aria-label="Mark as labeled owner"
						class="h-4 w-4"
						checked={ownerSelectionId !== 0 && ownerSelectionId === row.buyerId}
						disabled={row.buyerId === 0 || isSubmitting}
						onclick={() => {
							if (row.buyerId === 0) return;
							ownerSelectionId = ownerSelectionId === row.buyerId ? 0 : row.buyerId;
						}}
					/>
					<Popover.Root
						open={openRowComboboxId === row.rowId}
						onOpenChange={(o) => (openRowComboboxId = o ? row.rowId : null)}
					>
						<Popover.Trigger
							class={cn(
								buttonVariants({ variant: 'outline' }),
								'w-44 justify-between',
								!row.buyerId && 'text-muted-foreground'
							)}
							role="combobox"
							disabled={isSubmitting}
						>
							{row.buyerId
								? (displayNames.get(row.buyerId) ?? accountName(row.buyerId, 'Yourself'))
								: 'Select buyer'}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Popover.Trigger>
						<Popover.Content class="w-56 p-0">
							<Command.Root>
								<Command.Input autofocus placeholder="Search users..." class="h-9" />
								<Command.List>
									<Command.Empty>No users found</Command.Empty>
									<Command.Group>
										{#each isUser as userId (userId)}
											<Command.Item
												value={displayNames.get(userId)}
												onSelect={() => {
													const prevBuyerId = row.buyerId;
													contribRows = contribRows.map((r) =>
														r.rowId === row.rowId ? { ...r, buyerId: userId } : r
													);
													if (ownerSelectionId === prevBuyerId && prevBuyerId !== 0) {
														ownerSelectionId = userId;
													}
													openRowComboboxId = null;
												}}
											>
												{displayNames.get(userId)}
												<Check
													class={cn(
														'ml-auto h-4 w-4',
														userId !== row.buyerId && 'text-transparent'
													)}
												/>
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
					<div class="flex flex-col">
						<Input
							type="number"
							step="0.1"
							class={cn(
								'w-28',
								isOverBudget(row.buyerId, row.amount || 0) &&
									'border-destructive focus-visible:ring-destructive'
							)}
							value={row.amount}
							disabled={isSubmitting}
							oninput={(e) => {
								const v = (e.currentTarget as HTMLInputElement).valueAsNumber;
								contribRows = contribRows.map((r) =>
									r.rowId === row.rowId ? { ...r, amount: Number.isFinite(v) ? v : 0 } : r
								);
							}}
							onblur={() => {
								contribRows = contribRows.map((r) =>
									r.rowId === row.rowId ? { ...r, amount: roundToTenth(r.amount) } : r
								);
							}}
						/>
						{#if row.buyerId !== 0 && balanceFor(row.buyerId) !== undefined}
							<span
								class={cn(
									'mt-0.5 text-[10px] leading-tight',
									isOverBudget(row.buyerId, row.amount || 0)
										? 'text-destructive'
										: 'text-muted-foreground'
								)}
							>
								max {formatClips(balanceFor(row.buyerId)!)}
							</span>
						{/if}
					</div>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Remove contributor"
						onclick={() => removeRow(row.rowId)}
						disabled={isSubmitting || contribRows.length <= 1}
					>
						<Trash class="h-4 w-4" />
					</Button>
				</div>
			{/each}

			<div class="flex flex-wrap gap-2">
				<Button type="button" variant="outline" size="sm" onclick={addRow} disabled={isSubmitting}>
					<Plus class="mr-1 h-4 w-4" /> Add contributor
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={splitEvenly}
					disabled={isSubmitting || contribRows.length === 0 || $formData.settlePrice <= 0}
				>
					Split evenly
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={pickWeightedOwner}
					disabled={isSubmitting || validRows.length === 0}
				>
					Pick clip-weighted owner
				</Button>
			</div>

			<div class="text-xs text-muted-foreground">
				Total contributed: {totalContributed.toFixed(1)} / {($formData.settlePrice || 0).toFixed(1)}
				{#if !sumMatchesPrice}
					<span class="text-destructive"> — must match settle price</span>
				{/if}
				{#if hasNegativeContribution}
					<span class="text-destructive"> — negative contribution</span>
				{/if}
				{#if hasDuplicateBuyer}
					<span class="text-destructive"> — duplicate buyer</span>
				{/if}
				{#if hasOverBudgetSplit}
					<span class="text-destructive"> — contribution exceeds buyer's balance</span>
				{/if}
			</div>
			<div class="text-xs text-muted-foreground">
				Labeled owner: <span class="font-medium">{ownerLabel()}</span>
				{#if ownerSelectionId !== 0}
					<button
						type="button"
						class="ml-2 underline"
						onclick={() => (ownerSelectionId = 0)}
						disabled={isSubmitting}
					>
						clear
					</button>
				{/if}
			</div>

			<Form.Button class="w-full" disabled={!canSubmitSplit}>
				{isSubmitting ? 'Settling...' : 'Settle Auction'}
			</Form.Button>
		</div>
	{/if}
</form>

<AlertDialog.Root bind:open={showDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if splitMode}
					{name} will be sold for {$formData.settlePrice} clips, split among {validRows.length}
					{validRows.length === 1 ? 'contributor' : 'contributors'}.
					{#if ownerSelectionId !== 0}
						The labeled owner will be {ownerLabel()}.
					{:else}
						No labeled owner will be assigned.
					{/if}
				{:else}
					{name} will be sold to {ownerLabel()} for {$formData.settlePrice} clips.
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={resetForm} disabled={isSubmitting}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					confirmed = true;
					formEl.requestSubmit();
				}}
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Processing...' : 'Continue'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
