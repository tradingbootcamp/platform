<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import { Textarea } from '$lib/components/ui/textarea';

	const initialData = {
		name: '',
		description: ''
	};

	const form = protoSuperForm(
		'create-universe',
		(v) => websocket_api.CreateUniverse.fromObject(v),
		(createUniverse) => sendClientMessage({ createUniverse }),
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance class="flex flex-col gap-4">
	<Form.Field {form} name="name" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} bind:value={$formData.name} placeholder="Universe name" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="description" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Textarea
					{...props}
					bind:value={$formData.description}
					placeholder="Description (optional)"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-32">Create Universe</Form.Button>
</form>
