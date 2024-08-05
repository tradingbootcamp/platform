<script lang="ts">
	import { sendClientMessage } from '$lib/api';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = {
		name: ''
	};

	const form = protoSuperForm(
		'create-bot',
		websocket_api.CreateBot.fromObject,
		(createBot) => sendClientMessage({ createBot }),
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance class="flex gap-4">
	<Form.Button class="w-32">Create Bot</Form.Button>
	<Form.Field {form} name="name" class="w-56">
		<Form.Control let:attrs>
			<Input {...attrs} bind:value={$formData.name} placeholder="Name your bot" />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
