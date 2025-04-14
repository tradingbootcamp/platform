<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		marketId: number;
		minSettlement?: number | null | undefined;
		maxSettlement?: number | null | undefined;
	}

	let { marketId, minSettlement, maxSettlement }: Props = $props();

	const initialData = {
		price: 0,
		size: 0,
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

	const toggleSide = () => {
		$formData.side = $formData.side === 'BID' ? 'OFFER' : 'BID';
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === '`') {
			if ((event.target as HTMLElement).tagName === 'INPUT') {
				event.preventDefault();
			}
			toggleSide();
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<form use:enhance class="flex flex-col gap-4 text-left">
	<div class="flex items-center justify-between">
		<Form.Fieldset {form} name="side" class="flex flex-1 flex-col">
			<RadioGroup.Root bind:value={$formData.side} class="flex justify-around">
				<div class="flex flex-col items-center gap-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="font-normal">Bid</Form.Label>
							<RadioGroup.Item value="BID" bind:ref={bidButton} {...props} />
						{/snippet}
					</Form.Control>
				</div>
				<div class="flex flex-col items-center gap-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="font-normal">Offer</Form.Label>
							<RadioGroup.Item value="OFFER" bind:ref={offerButton} {...props} />
						{/snippet}
					</Form.Control>
				</div>
			</RadioGroup.Root>
			<Form.FieldErrors />
		</Form.Fieldset>
		<button
			type="button"
			class="ml-2 rounded border px-2 py-1 text-sm opacity-50 hover:opacity-100"
			on:click={toggleSide}
		>
			`
		</button>
	</div>
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
					step="0.01"
					bind:value={$formData.price}
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
					step="0.01"
					bind:value={$formData.size}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button variant={$formData.side === 'BID' ? 'green' : 'red'} class="w-full"
		>Place {$formData.side}</Form.Button
	>
</form>
