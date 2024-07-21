<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { sendClientMessage } from '$lib/server';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = websocket_api.CreateOrder.create({
		marketId: '1',
		price: '0',
		size: '0',
		// @ts-expect-error Needed for the radio group
		side: 'BID'
	});

	const form = protoSuperForm(
		(v) => {
			const o = websocket_api.CreateOrder.fromObject(v);
			// @ts-expect-error Needed for the radio group
			o.side = o.side === websocket_api.Side.BID ? 'BID' : 'OFFER';
			return o;
		},
		(createOrder) => {
			createOrder.side =
				// @ts-expect-error Correct for the radio group
				createOrder.side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER;
			sendClientMessage({ createOrder });
		},
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance>
	<Form.Field {form} name="marketId">
		<Form.Control let:attrs>
			<Form.Label>Market ID</Form.Label>
			<Input {...attrs} type="number" min="1" bind:value={$formData.marketId} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="price">
		<Form.Control let:attrs>
			<Form.Label>Price</Form.Label>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.price} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="size">
		<Form.Control let:attrs>
			<Form.Label>Size</Form.Label>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.size} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Fieldset {form} name="side" class="space-y-3">
		<Form.Legend>Side</Form.Legend>
		<RadioGroup.Root bind:value={$formData.side} class="flex flex-col space-y-1">
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control let:attrs>
					<RadioGroup.Item value="BID" {...attrs} />
					<Form.Label class="font-normal">Bid</Form.Label>
				</Form.Control>
			</div>
			<div class="flex items-center space-x-3 space-y-0">
				<Form.Control let:attrs>
					<RadioGroup.Item value="OFFER" {...attrs} />
					<Form.Label class="font-normal">Offer</Form.Label>
				</Form.Control>
				<RadioGroup.Input name="side" />
			</div></RadioGroup.Root
		>
		<Form.FieldErrors />
	</Form.Fieldset>
	<Form.Button class="w-full">Create Order</Form.Button>
</form>
