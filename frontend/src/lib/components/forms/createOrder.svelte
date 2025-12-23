<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { cn } from '$lib/utils';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		marketId: number;
		minSettlement?: number | null | undefined;
		maxSettlement?: number | null | undefined;
		sideLocked?: 'BID' | 'OFFER';
		layout?: 'panel' | 'inline';
		formId?: string;
		gridClass?: string;
		fieldOrder?: 'price-size' | 'size-price';
	}

	let {
		marketId,
		minSettlement,
		maxSettlement,
		sideLocked,
		layout = 'panel',
		formId = 'create-order',
		gridClass,
		fieldOrder
	}: Props = $props();

	const initialData = {
		price: '',
		size: '',
		side: sideLocked ?? 'BID'
	};

	let bidButton: HTMLButtonElement | null = $state(null);
	let offerButton: HTMLButtonElement | null = $state(null);

	const showSideToggle = sideLocked === undefined;
	let prevSide = $state('BID');
	let showPriceError = $state(false);
	let showSizeError = $state(false);
	const priceErrorMessage = 'Price is required';
	const sizeErrorMessage = 'Size is required';
	const isEmptyField = (value: unknown) => {
		if (value === '' || value === null || value === undefined) return true;
		if (typeof value === 'string') return value.trim() === '';
		if (typeof value === 'number') return !Number.isFinite(value);
		return false;
	};
	const toNumber = (value: unknown) => (typeof value === 'number' ? value : Number(value));

	const labelClass = layout === 'inline' ? 'sr-only' : undefined;
	const inputClass =
		layout === 'inline' ? 'h-7 w-full px-1.5 text-base md:text-sm leading-none' : undefined;
	const inlineFieldOrder =
		fieldOrder ?? (layout === 'inline' && (sideLocked ?? 'BID') === 'BID' ? 'size-price' : 'price-size');

	const form = protoSuperForm(
		formId,
		(v) => {
			const rawPrice = v.price;
			const rawSize = v.size;
			const priceNumber = toNumber(rawPrice);
			const sizeNumber = toNumber(rawSize);
			if (isEmptyField(rawPrice) || !Number.isFinite(priceNumber)) {
				throw new Error('Price is required');
			}
			if (isEmptyField(rawSize) || !Number.isFinite(sizeNumber)) {
				throw new Error('Size is required');
			}
			const normalizedSide =
				sideLocked ?? (typeof v.side === 'string' ? (v.side as 'BID' | 'OFFER') : 'BID');
			const o = websocket_api.CreateOrder.fromObject({
				marketId,
				...v,
				price: priceNumber,
				size: sizeNumber,
				side: normalizedSide
			});
			const side = o.side === websocket_api.Side.BID ? 'BID' : 'OFFER';
			return {
				price:
					rawPrice === '' || rawPrice === null || rawPrice === undefined
						? ''
						: o.price === 0
							? '0'
							: o.price || '',
				size:
					rawSize === '' || rawSize === null || rawSize === undefined
						? ''
						: o.size === 0
							? '0'
							: o.size || '',
				side: sideLocked ?? side
			};
		},
		(createOrder) => {
			const side = createOrder.side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER;
			sendClientMessage({
				createOrder: {
					...createOrder,
					price: createOrder.price ? Number(createOrder.price) : 0,
					size: createOrder.size ? Number(createOrder.size) : 0,
					side,
					marketId
				}
			});
		},
		initialData,
		{
			onUpdated(prev) {
				// Only focus and clear values when the side changes
				if (showSideToggle && prev && prev.side !== $formData.side) {
					if ($formData.side === 'BID') {
						bidButton?.focus();
					} else {
						offerButton?.focus();
					}
				}
			},
			resetForm: false,
			validationMethod: 'submit-only'
		}
	);

	const { form: formData, enhance, errors } = form;

	$effect(() => {
		if (sideLocked && $formData.side !== sideLocked) {
			$formData.side = sideLocked;
		}
	});

	$effect(() => {
		if (!showSideToggle) return;
		const currentSide = $formData.side;
		if (prevSide !== currentSide) {
			$formData.price = '';
			$formData.size = '';
			showPriceError = false;
			showSizeError = false;
			errors.clear();
			prevSide = currentSide;
		}
	});

	// Keep track of which input was focused before submission
	let lastFocusedInput: HTMLInputElement | null = $state(null);
	let priceInput: HTMLInputElement | null = $state(null);
	let sizeInput: HTMLInputElement | null = $state(null);

	function clearFieldError(field: 'price' | 'size') {
		errors.update((current) => {
			const next = { ...(current ?? {}) } as Record<string, unknown>;
			delete next[field];
			return next;
		});
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (event.key === 'Enter') {
			// Store which input was focused
			lastFocusedInput = event.currentTarget;
		}
	}

	// Replicate Firefox behavior: double-click at end of input selects all text
	function handleDblClick(event: MouseEvent & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget;
		const textLength = input.value.length;
		// If cursor is at or after the text, select all
		if (input.selectionStart !== null && input.selectionStart >= textLength) {
			input.select();
		}
	}

	function handleSubmit(event: SubmitEvent) {
		// Store which input was focused before submission
		if (document.activeElement instanceof HTMLInputElement) {
			lastFocusedInput = document.activeElement;
		}
		showPriceError = true;
		showSizeError = true;
	}

	$effect(() => {
		if (showPriceError && !isEmptyField($formData.price)) {
			showPriceError = false;
			clearFieldError('price');
		}
	});

	$effect(() => {
		if (showSizeError && !isEmptyField($formData.size)) {
			showSizeError = false;
			clearFieldError('size');
		}
	});

	// Restore focus after form submission
	$effect(() => {
		if (lastFocusedInput) {
			// Small delay to ensure the form has been reset
			setTimeout(() => {
				lastFocusedInput?.focus();
				lastFocusedInput = null;
			}, 100);
		}
	});
</script>

{#snippet priceField()}
	<Form.Field
		{form}
		name="price"
		class={layout === 'inline' ? 'relative' : 'flex flex-col'}
	>
		<Form.Control>
			{#snippet children({ props })}
				{#if layout !== 'inline'}
					<Form.Label class={labelClass}>Price</Form.Label>
					<div class="flex-grow"></div>
				{/if}
				{#if layout === 'inline' && showPriceError && isEmptyField($formData.price)}
					<Tooltip.Root open>
						<Tooltip.Trigger>
							{#snippet child({ props: tooltipProps })}
								<Input
									{...props}
									{...tooltipProps}
									type="number"
									min={minSettlement}
									max={maxSettlement}
									placeholder={Math.max(minSettlement ?? 0, 0)
										.toFixed(1)
										.toString()}
									step="0.1"
									class={cn(inputClass, 'no-spinner')}
									aria-label="Price"
									autocomplete="off"
									bind:value={$formData.price}
									bind:ref={priceInput}
									onkeydown={handleKeydown}
									ondblclick={handleDblClick}
								/>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom" align="start">{priceErrorMessage}</Tooltip.Content>
					</Tooltip.Root>
				{:else}
					<Input
						{...props}
						type="number"
						min={minSettlement}
						max={maxSettlement}
						placeholder={Math.max(minSettlement ?? 0, 0)
							.toFixed(1)
							.toString()}
						step="0.1"
						class={cn(inputClass, 'no-spinner')}
						autocomplete="off"
						bind:value={$formData.price}
						bind:ref={priceInput}
						onkeydown={handleKeydown}
						ondblclick={handleDblClick}
					/>
				{/if}
			{/snippet}
		</Form.Control>
		{#if layout !== 'inline' && showPriceError && isEmptyField($formData.price)}
			<div class="text-destructive text-sm font-medium">{priceErrorMessage}</div>
		{/if}
	</Form.Field>
{/snippet}

{#snippet sizeField()}
	<Form.Field
		{form}
		name="size"
		class={layout === 'inline' ? 'relative' : 'flex flex-col'}
	>
		<Form.Control>
			{#snippet children({ props })}
				{#if layout !== 'inline'}
					<Form.Label class={labelClass}>Size</Form.Label>
					<div class="flex-grow"></div>
				{/if}
				{#if layout === 'inline' && showSizeError && isEmptyField($formData.size)}
					<Tooltip.Root open>
						<Tooltip.Trigger>
							{#snippet child({ props: tooltipProps })}
								<Input
									{...props}
									{...tooltipProps}
									type="number"
									min="0"
									max="1000000000000"
									placeholder="0.0"
									step="0.1"
									class={cn(inputClass, 'no-spinner')}
									aria-label="Size"
									autocomplete="off"
									bind:value={$formData.size}
									bind:ref={sizeInput}
									onkeydown={handleKeydown}
									ondblclick={handleDblClick}
								/>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom" align="start">{sizeErrorMessage}</Tooltip.Content>
					</Tooltip.Root>
				{:else}
					<Input
						{...props}
						type="number"
						min="0"
						max="1000000000000"
						placeholder="0.0"
						step="0.1"
						class={cn(inputClass, 'no-spinner')}
						autocomplete="off"
						bind:value={$formData.size}
						bind:ref={sizeInput}
						onkeydown={handleKeydown}
						ondblclick={handleDblClick}
					/>
				{/if}
			{/snippet}
		</Form.Control>
		{#if layout !== 'inline' && showSizeError && isEmptyField($formData.size)}
			<div class="text-destructive text-sm font-medium">{sizeErrorMessage}</div>
		{/if}
	</Form.Field>
{/snippet}

<form
	use:enhance
	class={cn(
		layout === 'inline' ? 'grid items-start gap-1 text-left' : 'flex flex-col gap-2 text-left',
		layout === 'inline' ? gridClass : undefined
	)}
	on:submit={handleSubmit}
>
	<input type="hidden" name="side" value={$formData.side} />
	{#if showSideToggle}
		<Form.Fieldset {form} name="side" class="flex flex-col">
			<ToggleGroup.Root type="single" bind:value={$formData.side} class="grid grid-cols-2">
				<Form.Control>
					{#snippet children({ props })}
						<ToggleGroup.Item
							value="BID"
							variant="outline"
							class="border-2 data-[state=on]:bg-green-500 data-[state=on]:text-background"
							bind:ref={bidButton}
							{...props}>BID</ToggleGroup.Item
						>
					{/snippet}
				</Form.Control>
				<Form.Control>
					{#snippet children({ props })}
						<ToggleGroup.Item
							value="OFFER"
							variant="outline"
							class="border-2 data-[state=on]:bg-red-500 data-[state=on]:text-background"
							bind:ref={offerButton}
							{...props}
						>
							OFFER
						</ToggleGroup.Item>
					{/snippet}
				</Form.Control>
			</ToggleGroup.Root>
			<Form.FieldErrors />
		</Form.Fieldset>
	{/if}
	{#if layout === 'inline'}
		{#if (sideLocked ?? 'BID') === 'BID'}
			<div class="hidden md:block" aria-hidden="true"></div>
			<Form.Button
				variant="green"
				class="h-7 w-full whitespace-nowrap px-1.5 text-base md:text-sm"
			>
				<span class="hidden md:inline">Place BID</span>
				<span class="md:hidden">BID</span>
			</Form.Button>
			{#if inlineFieldOrder === 'size-price'}
				{@render sizeField()}
				{@render priceField()}
			{:else}
				{@render priceField()}
				{@render sizeField()}
			{/if}
		{:else}
			{#if inlineFieldOrder === 'price-size'}
				{@render priceField()}
				{@render sizeField()}
			{:else}
				{@render sizeField()}
				{@render priceField()}
			{/if}
			<Form.Button
				variant="red"
				class="h-7 w-full whitespace-nowrap px-1.5 text-base md:text-sm"
			>
				<span class="hidden md:inline">Place OFFER</span>
				<span class="md:hidden">OFFER</span>
			</Form.Button>
			<div class="hidden md:block" aria-hidden="true"></div>
		{/if}
	{:else}
		{@render priceField()}
		{@render sizeField()}
		<Form.Button variant={$formData.side === 'BID' ? 'green' : 'red'} class="w-full"
			>Place {$formData.side}</Form.Button
		>
	{/if}
</form>

<style>
	:global(.no-spinner[type='number']) {
		appearance: textfield;
	}

	:global(.no-spinner[type='number']::-webkit-inner-spin-button),
	:global(.no-spinner[type='number']::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
