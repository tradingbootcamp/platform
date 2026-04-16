<script lang="ts">
	import { sendClientMessage, serverState, accountName } from '$lib/api.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { roundToTenth } from '$lib/components/marketDataUtils';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';
	import Plus from '@lucide/svelte/icons/plus';

	interface Props {
		children: Snippet;
		onclick?: () => void;
		[key: string]: unknown;
	}

	let { children, ...rest }: Props = $props();

	// Get available market types, sorted by id
	let allTypes = $derived(
		[...serverState.marketTypes.values()].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
	);

	// Types the user can select (public ones, or all if admin with sudo)
	let selectableTypes = $derived(
		allTypes.filter((t) => t.public || (serverState.isAdmin && serverState.sudoEnabled))
	);

	// Types to show in the dropdown:
	// - For admins: show all types (greyed out if not public and not sudoed)
	// - For non-admins: only show public types
	let visibleTypes = $derived(serverState.isAdmin ? allTypes : allTypes.filter((t) => t.public));

	// Hide the category selector if there's only one selectable option
	let showCategorySelector = $derived(selectableTypes.length > 1);

	// Default to type id=1 ("Other Markets") or first selectable
	let defaultTypeId = $derived(
		selectableTypes.find((t) => t.id === 1)?.id ?? selectableTypes[0]?.id ?? 1
	);

	// Get all available groups sorted by id
	let allGroups = $derived(
		[...serverState.marketGroups.values()].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
	);

	// Get available markets for constituent selection (sorted by name)
	let availableMarkets = $derived(
		[...serverState.markets.entries()]
			.map(([id, market]) => ({ id, name: market.definition.name || `Market ${id}` }))
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	// Filter to open, non-settled markets for underlying selection
	let availableUnderlyingMarkets = $derived(
		[...serverState.markets.entries()]
			.filter(([, market]) => !market.definition.closed)
			.map(([id, market]) => ({ id, name: market.definition.name || `Market ${id}` }))
			.sort((a, b) => a.name.localeCompare(b.name))
	);

	const initialData = websocket_api.CreateMarket.create({
		name: '',
		description: '',
		minSettlement: 0,
		maxSettlement: 0,
		visibleTo: [],
		typeId: 1,
		groupId: 0,
		hideAccountIds: false,
		redeemableFor: [],
		redeemFee: 0
	});
	let open = $state(false);
	let pendingCreateMarket = $state<websocket_api.ICreateMarket | null>(null);

	// Option market state
	let isOptionMode = $state(false);
	let optionUnderlyingId = $state(0);
	let optionStrikePrice = $state(0);
	let optionIsCall = $state(true);
	let optionHasExpiration = $state(false);
	// Default expiration: today, 10 minutes from now, rounded to minute
	function defaultExpiration(): string {
		const d = new Date(Date.now() + 10 * 60 * 1000);
		d.setSeconds(0, 0);
		// Format as YYYY-MM-DDTHH:MM:SS for datetime-local with step
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	}
	let optionExpirationDate = $state(defaultExpiration());

	// Auto-calculate option bounds
	let optionBounds = $derived.by(() => {
		if (!isOptionMode || !optionUnderlyingId) return null;
		const underlying = serverState.markets.get(optionUnderlyingId)?.definition;
		if (!underlying) return null;
		const uMin = underlying.minSettlement ?? 0;
		const uMax = underlying.maxSettlement ?? 0;
		const k = optionStrikePrice;
		if (optionIsCall) {
			return { min: Math.max(0, uMin - k), max: Math.max(0, uMax - k) };
		}
		return { min: Math.max(0, k - uMax), max: Math.max(0, k - uMin) };
	});

	let actingAsOtherUser = $derived(
		serverState.effectiveUserId !== undefined &&
			serverState.userId !== undefined &&
			serverState.effectiveUserId !== serverState.userId
	);

	let effectiveUserName = $derived(accountName(serverState.effectiveUserId));

	const form = protoSuperForm(
		'create-market',
		(v) => {
			const msg = websocket_api.CreateMarket.fromObject(v);
			if (isOptionMode && optionUnderlyingId) {
				msg.option = websocket_api.OptionInfo.create({
					underlyingMarketId: optionUnderlyingId,
					strikePrice: optionStrikePrice,
					isCall: optionIsCall,
					...(optionHasExpiration && optionExpirationDate
						? {
								expirationDate: {
									seconds: Math.floor(new Date(optionExpirationDate).getTime() / 1000),
									nanos: 0
								}
							}
						: {})
				});
				if (optionBounds) {
					msg.minSettlement = optionBounds.min;
					msg.maxSettlement = optionBounds.max;
				}
			}
			return msg;
		},
		(createMarket) => {
			if (actingAsOtherUser) {
				pendingCreateMarket = createMarket;
			} else {
				sendClientMessage({ createMarket });
				open = false;
			}
		},
		initialData
	);

	const { form: formData, enhance } = form;

	// Update typeId to default when types load
	$effect(() => {
		if ($formData.typeId === 0 || $formData.typeId === undefined) {
			$formData.typeId = defaultTypeId;
		}
	});

	// Handle group selection - update category to match the group's category
	function handleGroupChange(value: string | undefined) {
		if (!value) return;
		const groupId = Number(value);
		$formData.groupId = groupId;
		if (groupId > 0) {
			const group = serverState.marketGroups.get(groupId);
			if (group && group.typeId) {
				$formData.typeId = group.typeId;
			}
		}
	}

	// Get display name for selected type
	let selectedTypeName = $derived(
		serverState.marketTypes.get($formData.typeId ?? 0)?.name ?? 'Select category...'
	);

	// Get display name for selected group
	let selectedGroupName = $derived(
		$formData.groupId && $formData.groupId > 0
			? (serverState.marketGroups.get($formData.groupId)?.name ?? 'Select group...')
			: 'None'
	);

	// Constituent management
	function addConstituent() {
		if (!$formData.redeemableFor) {
			$formData.redeemableFor = [];
		}
		$formData.redeemableFor = [
			...$formData.redeemableFor,
			websocket_api.Redeemable.create({ constituentId: 0, multiplier: 1 })
		];
	}

	function removeConstituent(index: number) {
		if ($formData.redeemableFor) {
			$formData.redeemableFor = $formData.redeemableFor.filter((_, i) => i !== index);
		}
	}

	function getConstituentName(constituentId: number | bigint | null | undefined): string {
		if (!constituentId) return 'Select market...';
		const market = serverState.markets.get(Number(constituentId));
		return market?.definition?.name || `Market ${constituentId}`;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', className: 'text-base' })} {...rest}>
		{@render children()}
	</Dialog.Trigger>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto">
		<form use:enhance>
			<Dialog.Header>
				<Dialog.Title>Create Market</Dialog.Title>
			</Dialog.Header>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input
							{...props}
							bind:value={$formData.name}
							placeholder="Enter a name for your market..."
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Textarea
							{...props}
							bind:value={$formData.description}
							placeholder="Enter a detailed description of the market..."
							rows={4}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>
					You can provide a detailed description of the market, including any relevant rules or
					conditions.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			{#if showCategorySelector}
				<Form.Field {form} name="typeId">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Category</Form.Label>
							<Select.Root
								type="single"
								value={String($formData.typeId)}
								onValueChange={(v) => {
									if (v) $formData.typeId = Number(v);
								}}
							>
								<Select.Trigger {...props}>
									{selectedTypeName}
								</Select.Trigger>
								<Select.Content>
									{#each visibleTypes as marketType (marketType.id)}
										{@const isDisabled =
											!marketType.public && !(serverState.isAdmin && serverState.sudoEnabled)}
										<Select.Item
											value={String(marketType.id)}
											label={marketType.name ?? ''}
											disabled={isDisabled}
										>
											{marketType.name}{isDisabled ? ' (Admin only)' : ''}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}
			<Form.Field {form} name="minSettlement">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Min Settlement</Form.Label>
						<Input
							{...props}
							type="number"
							max="1000000000000"
							step="0.1"
							value={isOptionMode && optionBounds ? optionBounds.min : $formData.minSettlement}
							disabled={isOptionMode}
							onchange={(e) => {
								if (!isOptionMode) $formData.minSettlement = Number(e.currentTarget.value);
							}}
							onblur={() => {
								if (!isOptionMode)
									$formData.minSettlement = roundToTenth(
										$formData.minSettlement as unknown as number
									);
							}}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="maxSettlement">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Max Settlement</Form.Label>
						<Input
							{...props}
							type="number"
							max="1000000000000"
							step="0.1"
							value={isOptionMode && optionBounds ? optionBounds.max : $formData.maxSettlement}
							disabled={isOptionMode}
							onchange={(e) => {
								if (!isOptionMode) $formData.maxSettlement = Number(e.currentTarget.value);
							}}
							onblur={() => {
								if (!isOptionMode)
									$formData.maxSettlement = roundToTenth(
										$formData.maxSettlement as unknown as number
									);
							}}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			{#if serverState.isAdmin && serverState.sudoEnabled}
				<div class="mt-6 rounded-lg border border-border bg-muted/30 p-4">
					<h3 class="mb-4 text-sm font-semibold text-muted-foreground">Admin Options</h3>

					<div class="mb-4">
						<div class="flex items-center gap-2">
							<Checkbox bind:checked={isOptionMode} />
							<span class="text-sm font-medium">Option Market</span>
						</div>
					</div>

					{#if isOptionMode}
						<div class="mb-4 space-y-3 rounded-md border border-border p-3">
							<div>
								<span class="text-sm font-medium">Underlying Market</span>
								<Select.Root
									type="single"
									value={String(optionUnderlyingId)}
									onValueChange={(v) => {
										if (v) optionUnderlyingId = Number(v);
									}}
								>
									<Select.Trigger>
										{optionUnderlyingId
											? (serverState.markets.get(optionUnderlyingId)?.definition?.name ??
												'Select...')
											: 'Select underlying market...'}
									</Select.Trigger>
									<Select.Content>
										{#each availableUnderlyingMarkets as market (market.id)}
											<Select.Item value={String(market.id)} label={market.name}>
												{market.name}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>
							<div>
								<span class="text-sm font-medium">Strike Price</span>
								<Input
									type="number"
									step="0.01"
									placeholder="Strike price"
									bind:value={optionStrikePrice}
								/>
							</div>
							<div class="flex items-center gap-4">
								<label class="flex items-center gap-1.5 text-sm">
									<input
										type="radio"
										name="optionType"
										checked={optionIsCall}
										onchange={() => (optionIsCall = true)}
									/>
									Call
								</label>
								<label class="flex items-center gap-1.5 text-sm">
									<input
										type="radio"
										name="optionType"
										checked={!optionIsCall}
										onchange={() => (optionIsCall = false)}
									/>
									Put
								</label>
							</div>
							<div>
								<div class="flex items-center gap-2">
									<Checkbox bind:checked={optionHasExpiration} />
									<span class="text-sm font-medium"
										>Expiration Date <span
											class="rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs text-yellow-600"
											>Experimental</span
										></span
									>
								</div>
								{#if optionHasExpiration}
									<Input
										class="mt-1.5"
										type="datetime-local"
										step="1"
										bind:value={optionExpirationDate}
									/>
								{/if}
							</div>
							{#if optionBounds}
								<p class="text-xs text-muted-foreground">
									Computed bounds: [{optionBounds.min}, {optionBounds.max}]
								</p>
							{/if}
						</div>
					{/if}

					<Form.Field {form} name="groupId">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Group (Optional)</Form.Label>
								<Select.Root
									type="single"
									value={String($formData.groupId ?? 0)}
									onValueChange={handleGroupChange}
								>
									<Select.Trigger {...props}>
										{selectedGroupName}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="0" label="None">None</Select.Item>
										{#each allGroups as group (group.id)}
											{@const typeName = serverState.marketTypes.get(group.typeId ?? 0)?.name}
											<Select.Item value={String(group.id)} label={group.name ?? ''}>
												{group.name}{typeName ? ` (${typeName})` : ''}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							{/snippet}
						</Form.Control>
						<Form.Description>
							Optionally assign this market to a group. Groups help organize related markets.
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>

					<Form.Field {form} name="hideAccountIds">
						<Form.Control>
							{#snippet children({ props })}
								<div class="mt-4 flex items-center gap-2">
									<Checkbox {...props} bind:checked={$formData.hideAccountIds} />
									<Form.Label class="cursor-pointer">Hide account IDs</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.Description>
							When enabled, trader identities will be hidden in the order book and trade history.
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>

					<div class="mt-4">
						<span class="text-sm font-medium leading-none">Redeemable For (Constituents)</span>
						<p class="mb-2 text-sm text-muted-foreground">
							Define which markets this fund can be redeemed for, with multipliers.
						</p>

						{#if $formData.redeemableFor && $formData.redeemableFor.length > 0}
							<div class="space-y-2">
								{#each $formData.redeemableFor as constituent, index (index)}
									<div class="flex items-center gap-2">
										<Select.Root
											type="single"
											value={String(constituent.constituentId ?? 0)}
											onValueChange={(v) => {
												if (v && $formData.redeemableFor) {
													$formData.redeemableFor[index].constituentId = Number(v);
													$formData.redeemableFor = [...$formData.redeemableFor];
												}
											}}
										>
											<Select.Trigger class="flex-1">
												{getConstituentName(constituent.constituentId)}
											</Select.Trigger>
											<Select.Content>
												{#each availableMarkets as market (market.id)}
													<Select.Item value={String(market.id)} label={market.name}>
														{market.name}
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
										<Input
											type="number"
											step="1"
											placeholder="Multiplier"
											class="w-24"
											value={constituent.multiplier}
											onchange={(e) => {
												if ($formData.redeemableFor) {
													$formData.redeemableFor[index].multiplier = Number(e.currentTarget.value);
													$formData.redeemableFor = [...$formData.redeemableFor];
												}
											}}
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="h-9 w-9 shrink-0"
											onclick={() => removeConstituent(index)}
										>
											<X class="h-4 w-4" />
										</Button>
									</div>
								{/each}
							</div>
						{/if}

						<Button type="button" variant="outline" size="sm" class="mt-2" onclick={addConstituent}>
							<Plus class="mr-1 h-4 w-4" />
							Add Constituent
						</Button>
					</div>

					<Form.Field {form} name="redeemFee" class="mt-4">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Redeem Fee</Form.Label>
								<Input
									{...props}
									type="number"
									step="0.01"
									min="0"
									placeholder="0"
									bind:value={$formData.redeemFee}
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>
							Fee charged when redeeming fund shares for constituents (in clips).
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			{/if}

			<Dialog.Footer>
				<Form.Button>Submit</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	open={pendingCreateMarket !== null}
	onOpenChange={(o) => {
		if (!o) pendingCreateMarket = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Create market as {effectiveUserName}?</AlertDialog.Title>
			<AlertDialog.Description>
				This market will be owned by {effectiveUserName}, not your account.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (pendingCreateMarket = null)}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					if (pendingCreateMarket) {
						sendClientMessage({ createMarket: pendingCreateMarket });
						pendingCreateMarket = null;
						open = false;
					}
				}}>Create Market</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
