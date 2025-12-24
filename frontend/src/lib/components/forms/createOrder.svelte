<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		marketId: number;
		minSettlement?: number | null | undefined;
		maxSettlement?: number | null | undefined;
		canPlaceOrders?: boolean;
	}

	let { marketId, minSettlement, maxSettlement, canPlaceOrders = true }: Props = $props();

	const initialData = {
		price: '',
		size: '',
		side: 'BID'
	};

	let bidButton: HTMLButtonElement | null = $state(null);
	let offerButton: HTMLButtonElement | null = $state(null);

	let prevSide = $state('BID');

	const form = protoSuperForm(
		'create-order',
		(v) => {
			const o = websocket_api.CreateOrder.fromObject({
				marketId,
				...v,
				price: v.price ? Number(v.price) : 0,
				size: v.size ? Number(v.size) : 0
			});
			const side = o.side === websocket_api.Side.BID ? 'BID' : 'OFFER';
			return { price: o.price || '', size: o.size || '', side };
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
				if (prev && prev.side !== $formData.side) {
					if ($formData.side === 'BID') {
						bidButton?.focus();
					} else {
						offerButton?.focus();
					}
				}
			},
			resetForm: false
		}
	);

	const { form: formData, enhance } = form;

	$effect(() => {
		const currentSide = $formData.side;
		if (prevSide !== currentSide) {
			$formData.price = '';
			$formData.size = '';
			prevSide = currentSide;
		}
	});

	// Keep track of which input was focused before submission
	let lastFocusedInput: HTMLInputElement | null = $state(null);
	let priceInput: HTMLInputElement | null = $state(null);
	let sizeInput: HTMLInputElement | null = $state(null);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			// Store which input was focused
			lastFocusedInput = event.target as HTMLInputElement;
		}
	}

	function handleSubmit(event: SubmitEvent) {
		// Store which input was focused before submission
		if (document.activeElement instanceof HTMLInputElement) {
			lastFocusedInput = document.activeElement;
		}
	}

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

<form use:enhance class="flex flex-col gap-4 text-left" on:submit={handleSubmit}>
	<input type="hidden" name="side" value={$formData.side} />
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
	<Form.Field {form} name="price" class="flex flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Price</Form.Label>
				<div class="flex-grow"></div>
				<Input
					{...props}
					type="number"
					min={minSettlement}
					max={maxSettlement}
					placeholder={Math.max(minSettlement ?? 0, 0)
						.toFixed(2)
						.toString()}
					step="0.01"
					bind:value={$formData.price}
					bind:ref={priceInput}
					on:keydown={handleKeydown}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="size" class="flex flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Size</Form.Label>
				<div class="flex-grow"></div>
				<Input
					{...props}
					type="number"
					min="0"
					max="1000000000000"
					placeholder="0.00"
					step="0.01"
					bind:value={$formData.size}
					bind:ref={sizeInput}
					on:keydown={handleKeydown}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button
		variant={$formData.side === 'BID' ? 'green' : 'red'}
		class="w-full"
		disabled={!canPlaceOrders}
		>Place {$formData.side}</Form.Button
	>
</form>
