<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { sendClientMessage } from '$lib/websocket';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = websocket_api.SettleMarket.create({
		id: '1',
		settlePrice: '0'
	});

	const form = protoSuperForm(
		websocket_api.SettleMarket.fromObject,
		(settleMarket) => sendClientMessage({ settleMarket }),
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance>
	<Form.Field {form} name="id">
		<Form.Control let:attrs>
			<Form.Label>ID</Form.Label>
			<Input {...attrs} type="number" min="1" bind:value={$formData.id} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="settlePrice">
		<Form.Control let:attrs>
			<Form.Label>Settle Price</Form.Label>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.settlePrice} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full">Settle Market</Form.Button>
</form>
