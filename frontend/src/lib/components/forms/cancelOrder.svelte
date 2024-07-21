<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { sendClientMessage } from '$lib/api';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = websocket_api.CancelOrder.create({
		id: '1'
	});

	const form = protoSuperForm(
		websocket_api.CancelOrder.fromObject,
		(cancelOrder) => sendClientMessage({ cancelOrder }),
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
	<Form.Button class="w-full">Cancel Order</Form.Button>
</form>
