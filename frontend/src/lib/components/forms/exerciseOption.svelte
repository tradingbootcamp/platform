<script lang="ts">
	import {
		sendClientMessage,
		serverState,
		requestOptionContracts,
		accountName
	} from '$lib/api.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { localStore } from '$lib/localStore.svelte';
	import { websocket_api } from 'schema-js';

	interface Props {
		marketId: number;
		disabled?: boolean;
	}

	let { marketId, disabled = false }: Props = $props();

	let open = $state(false);
	let confirmOpen = $state(false);
	let selectedWriterId = $state<number | null>(null);
	let exerciseAmount = $state(0);
	let skipConfirmation = localStore('skipOptionExerciseConfirmation', false);

	let contracts = $derived(serverState.optionContracts.get(marketId) ?? []);
	let optionInfo = $derived(serverState.markets.get(marketId)?.definition?.option);
	let underlyingMarket = $derived(
		optionInfo?.underlyingMarketId
			? serverState.markets.get(optionInfo.underlyingMarketId)
			: undefined
	);
	let underlyingSettled = $derived(!!underlyingMarket?.definition?.closed);
	let underlyingSettlePrice = $derived(underlyingMarket?.definition?.closed?.settlePrice ?? 0);
	let isCashExercise = $derived(underlyingSettled);
	let strikePrice = $derived(optionInfo?.strikePrice ?? 0);
	let isCall = $derived(optionInfo?.isCall ?? true);

	// Merge contracts by writer, summing remaining amounts
	let myContracts = $derived(
		contracts.filter(
			(c) => c.buyerId === (serverState.actingAs ?? serverState.userId)
		)
	);

	let mergedByWriter = $derived.by(() => {
		const map = new Map<number, { writerId: number; totalRemaining: number; contractIds: number[] }>();
		for (const c of myContracts) {
			const wid = c.writerId ?? 0;
			const existing = map.get(wid);
			if (existing) {
				existing.totalRemaining += c.remainingAmount ?? 0;
				existing.contractIds.push(c.id ?? 0);
			} else {
				map.set(wid, {
					writerId: wid,
					totalRemaining: c.remainingAmount ?? 0,
					contractIds: [c.id ?? 0]
				});
			}
		}
		return [...map.values()];
	});

	let selectedEntry = $derived(mergedByWriter.find((e) => e.writerId === selectedWriterId));

	let exerciseDescription = $derived.by(() => {
		if (!selectedEntry || exerciseAmount <= 0) return '';
		const amount = exerciseAmount;
		const counterpartyName = accountName(selectedEntry.writerId);
		const underlyingName = underlyingMarket?.definition?.name ?? 'underlying';

		if (isCashExercise) {
			const intrinsic = isCall
				? Math.max(0, underlyingSettlePrice - strikePrice)
				: Math.max(0, strikePrice - underlyingSettlePrice);
			const cashAmount = (amount * intrinsic).toFixed(2);
			return `You will receive ${cashAmount} clips from ${counterpartyName} (cash settlement).`;
		}
		if (isCall) {
			return `You will pay ${(amount * strikePrice).toFixed(2)} clips to ${counterpartyName} and gain ${amount} position in ${underlyingName}. ${counterpartyName} receives the clips and loses ${amount} position.`;
		}
		return `You will receive ${(amount * strikePrice).toFixed(2)} clips from ${counterpartyName} and lose ${amount} position in ${underlyingName}. ${counterpartyName} pays the clips and gains ${amount} position.`;
	});

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (isOpen) {
			requestOptionContracts(marketId);
			selectedWriterId = null;
			exerciseAmount = 0;
		}
	}

	function doExercise() {
		if (selectedWriterId == null || exerciseAmount <= 0 || !selectedEntry) return;
		// Pick contracts for this writer in order (FIFO by id), sending one exercise per contract
		let remaining = exerciseAmount;
		const writerContracts = myContracts
			.filter((c) => c.writerId === selectedWriterId)
			.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
		for (const c of writerContracts) {
			if (remaining <= 0) break;
			const amt = Math.min(remaining, c.remainingAmount ?? 0);
			if (amt > 0) {
				sendClientMessage({
					exerciseOption: {
						optionMarketId: marketId,
						contractId: c.id,
						amount: amt
					}
				});
				remaining -= amt;
			}
		}
		confirmOpen = false;
		open = false;
	}

	let totalRemaining = $derived(mergedByWriter.reduce((sum, e) => sum + e.totalRemaining, 0));

	function doExerciseAll() {
		for (const entry of mergedByWriter) {
			let remaining = entry.totalRemaining;
			const writerContracts = myContracts
				.filter((c) => c.writerId === entry.writerId)
				.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
			for (const c of writerContracts) {
				if (remaining <= 0) break;
				const amt = Math.min(remaining, c.remainingAmount ?? 0);
				if (amt > 0) {
					sendClientMessage({
						exerciseOption: {
							optionMarketId: marketId,
							contractId: c.id,
							amount: amt
						}
					});
					remaining -= amt;
				}
			}
		}
		confirmOpen = false;
		open = false;
	}

	let exerciseAllMode = $state(false);

	function handleExercise() {
		exerciseAllMode = false;
		if (skipConfirmation.value) {
			doExercise();
		} else {
			confirmOpen = true;
		}
	}

	function handleExerciseAll() {
		exerciseAllMode = true;
		if (skipConfirmation.value) {
			doExerciseAll();
		} else {
			confirmOpen = true;
		}
	}
</script>

<Dialog.Root open={open} onOpenChange={handleOpenChange}>
	<Dialog.Trigger>
		<Button variant="outline" size="sm" class="h-10" {disabled}>Exercise</Button>
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Exercise Option</Dialog.Title>
		</Dialog.Header>
		{#if mergedByWriter.length === 0}
			<p class="text-sm text-muted-foreground">You have no contracts in this option market.</p>
		{:else}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<p class="text-sm text-muted-foreground">
						Select a counterparty to exercise against{isCashExercise ? ' (cash settlement)' : ''}:
					</p>
					<Button
						size="sm"
						variant="outline"
						class="h-8"
						onclick={handleExerciseAll}
					>
						Exercise All ({totalRemaining})
					</Button>
				</div>
				{#each mergedByWriter as entry (entry.writerId)}
					<button
						type="button"
						class="flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors {selectedWriterId ===
						entry.writerId
							? 'border-primary bg-primary/10'
							: 'border-border hover:bg-muted/50'}"
						onclick={() => {
							selectedWriterId = entry.writerId;
							exerciseAmount = 0;
						}}
					>
						<div>
							<span class="text-sm font-medium">
								Writer: {accountName(entry.writerId)}
							</span>
							<span class="ml-2 text-sm text-muted-foreground">
								{entry.totalRemaining} remaining
							</span>
						</div>
					</button>
				{/each}

				{#if selectedEntry}
					<div class="flex items-center gap-2">
						<Input
							type="number"
							step="0.01"
							min="0.01"
							max={selectedEntry.totalRemaining}
							placeholder="Amount"
							class="h-10 w-32"
							bind:value={exerciseAmount}
						/>
						<Button
							size="sm"
							class="h-10"
							disabled={exerciseAmount <= 0 ||
								exerciseAmount > selectedEntry.totalRemaining}
							onclick={handleExercise}
						>
							Exercise
						</Button>
					</div>
					{#if exerciseDescription}
						<p class="text-xs text-muted-foreground">{exerciseDescription}</p>
					{/if}
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={confirmOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Exercise</Dialog.Title>
		</Dialog.Header>
		<p class="text-sm">{exerciseAllMode ? `Exercise all ${totalRemaining} contracts across ${mergedByWriter.length} counterpart${mergedByWriter.length === 1 ? 'y' : 'ies'}.` : exerciseDescription}</p>
		<div class="mt-4 flex items-center gap-2">
			<Checkbox bind:checked={skipConfirmation.value} />
			<span class="text-sm text-muted-foreground">Don't show this confirmation again</span>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
			<Button onclick={exerciseAllMode ? doExerciseAll : doExercise}>Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
