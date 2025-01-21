<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = {
		name: ''
	};

	const form = protoSuperForm(
		'create-account',
		// TODO: allow creating sub accounts
		(v) => websocket_api.CreateAccount.fromObject({ ...v, ownerId: serverState.userId }),
		(createAccount) => sendClientMessage({ createAccount }),
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance class="flex gap-4">
	<Form.Button class="w-32">Create Account</Form.Button>
	<Form.Field {form} name="name" class="w-56">
		<Form.Control>
			{#snippet children({ props })}
				<Input {...props} bind:value={$formData.name} placeholder="Name your account" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
</form>
