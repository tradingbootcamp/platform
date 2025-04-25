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

	const form = protoSuperForm(
		'create-order',
		(v) => {
			const o = websocket_api.CreateOrder.fromObject({ marketId, ...v });
			const side = o.side === websocket_api.Side.BID ? 'BID' : 'OFFER';
			return { price: o.price, size: o.size, side };
		},
		(createOrder) => {
			const side = createOrder.side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER;
			sendClientMessage({ createOrder: { ...createOrder, side, marketId } });
		},
		initialData,
		{
			onUpdated() {
				if ($formData.side === 'BID') bidButton?.focus();
				else offerButton?.focus();
			},
			resetForm: false
		}
	);

	const { form: formData, enhance } = form;
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
					type="number"
					min={minSettlement}
					max={maxSettlement}
					step="0.01"
					bind:value={$formData.price}
					placeholder="0.00"
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
					type="number"
					min="0"
					max="1000000000000"
					step="0.01"
					bind:value={$formData.size}
					placeholder="0.00"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button variant={$formData.side === 'BID' ? 'green' : 'red'} class="w-full"
		>Place {$formData.side}</Form.Button
	>
</form>
