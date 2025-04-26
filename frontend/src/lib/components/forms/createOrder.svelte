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
	}

	let { marketId, minSettlement, maxSettlement }: Props = $props();

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
</script>

<form use:enhance class="flex flex-col gap-4 text-left">
	<input type="hidden" name="side" value={$formData.side} />
	<Form.Fieldset {form} name="side" class="flex flex-col">
		<ToggleGroup.Root type="single" bind:value={$formData.side} class="grid grid-cols-2">
			<Form.Control>
				{#snippet children({ props })}
					<ToggleGroup.Item
						value="BID"
						variant="outline"
						class="data-[state=on]:text-background border-2 data-[state=on]:bg-green-500"
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
						class="data-[state=on]:text-background border-2 data-[state=on]:bg-red-500"
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
	<Form.Field {form} name="price" class="flex items-center gap-2 space-y-0">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="min-w-8">Price</Form.Label>
				<Input
					{...props}
					type="text"
					bind:value={$formData.price}
					placeholder="0.0"
					autocomplete="off"
					onkeydown={(e) => {
						// Allow: backspace, delete, tab, escape, enter, decimal point
						if (
							['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', ','].includes(e.key) ||
							// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
							(['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()) && e.ctrlKey) ||
							// Allow: home, end, left, right
							['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
							// Allow: numbers
							(!e.shiftKey && !isNaN(Number(e.key)))
						) {
							return true;
						}
						e.preventDefault();
						return false;
					}}
					on:input={(e) => {
						const value = e.currentTarget.value;
						if (value === '') {
							$formData.price = '';
						} else {
							const num = Number(value);
							if (!isNaN(num)) {
								if (minSettlement !== undefined && num < minSettlement) {
									$formData.price = minSettlement.toString();
								} else if (maxSettlement !== undefined && num > maxSettlement) {
									$formData.price = maxSettlement.toString();
								} else {
									$formData.price = value;
								}
							}
						}
					}}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="size" class="flex items-center gap-2 space-y-0">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="min-w-8">Size</Form.Label>
				<Input
					{...props}
					type="text"
					bind:value={$formData.size}
					placeholder="0.0"
					autocomplete="off"
					onkeydown={(e) => {
						// Allow: backspace, delete, tab, escape, enter, decimal point
						if (
							['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', ','].includes(e.key) ||
							// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
							(['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()) && e.ctrlKey) ||
							// Allow: home, end, left, right
							['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
							// Allow: numbers
							(!e.shiftKey && !isNaN(Number(e.key)))
						) {
							return true;
						}
						e.preventDefault();
						return false;
					}}
					on:input={(e) => {
						const value = e.currentTarget.value;
						if (value === '') {
							$formData.size = '';
						} else {
							const num = Number(value);
							if (!isNaN(num)) {
								if (num < 0) {
									$formData.size = '0';
								} else if (num > 1000000000000) {
									$formData.size = '1000000000000';
								} else {
									$formData.size = value;
								}
							}
						}
					}}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button variant={$formData.side === 'BID' ? 'green' : 'red'} class="w-full"
		>Place {$formData.side}</Form.Button
	>
</form>
