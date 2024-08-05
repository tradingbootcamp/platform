<script lang="ts">
	import { sendClientMessage } from '$lib/api';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	export let marketId: string;

	const initialData = {
		price: '0',
		size: '0',
		side: 'BID'
	};

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
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance class="flex flex-col gap-4">
	<Form.Fieldset {form} name="side" class="flex flex-col">
		<RadioGroup.Root bind:value={$formData.side} class="flex justify-around">
			<div class="flex flex-col items-center gap-2">
				<Form.Control let:attrs>
					<Form.Label class="font-normal">Bid</Form.Label>
					<RadioGroup.Item value="BID" {...attrs} />
				</Form.Control>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Form.Control let:attrs>
					<Form.Label class="font-normal">Offer</Form.Label>
					<RadioGroup.Item value="OFFER" {...attrs} />
				</Form.Control>
			</div>
			<RadioGroup.Input name="side" />
		</RadioGroup.Root>
		<Form.FieldErrors />
	</Form.Fieldset>
	<Form.Field {form} name="price" class="flex flex-col">
		<Form.Control let:attrs>
			<Form.Label>Price</Form.Label>
			<div class="flex-grow"></div>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.price} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="size" class="flex flex-col">
		<Form.Control let:attrs>
			<Form.Label>Size</Form.Label>
			<div class="flex-grow"></div>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.size} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full">Place Order</Form.Button>
</form>
