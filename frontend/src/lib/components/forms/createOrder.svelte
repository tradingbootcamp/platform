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

<form use:enhance class="gap-4 sm:flex">
	<Form.Fieldset {form} name="side" class="flex flex-col">
		<Form.Legend>Side</Form.Legend>
		<div class="flex-grow"></div>
		<RadioGroup.Root bind:value={$formData.side}>
			<div class="flex items-center gap-2">
				<Form.Control let:attrs>
					<RadioGroup.Item value="BID" {...attrs} />
					<Form.Label class="font-normal">Bid</Form.Label>
				</Form.Control>
			</div>
			<div class="flex items-center gap-2">
				<Form.Control let:attrs>
					<RadioGroup.Item value="OFFER" {...attrs} />
					<Form.Label class="font-normal">Offer</Form.Label>
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
	<Form.Button class="mb-2 self-end">Create Order</Form.Button>
</form>
