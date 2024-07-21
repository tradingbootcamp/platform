<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { sendClientMessage } from '$lib/websocket';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = websocket_api.CreateMarket.create({
		name: '',
		description: '',
		minSettlement: '0',
		maxSettlement: '0'
	});

	const form = protoSuperForm(
		websocket_api.CreateMarket.fromObject,
		(createMarket) => sendClientMessage({ createMarket }),
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="description">
		<Form.Control let:attrs>
			<Form.Label>Description</Form.Label>
			<Input {...attrs} bind:value={$formData.description} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="minSettlement">
		<Form.Control let:attrs>
			<Form.Label>Min Settlement</Form.Label>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.minSettlement} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="maxSettlement">
		<Form.Control let:attrs>
			<Form.Label>Max Settlement</Form.Label>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.maxSettlement} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full">Create Market</Form.Button>
</form>
