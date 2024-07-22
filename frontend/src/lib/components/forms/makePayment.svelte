<script lang="ts">
	import { sendClientMessage } from '$lib/api';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = {
		recipientId: '',
		amount: '0',
		note: ''
	};
	let open = false;

	const form = protoSuperForm(
		websocket_api.MakePayment.fromObject,
		(makePayment) => {
			open = false;
			sendClientMessage({ makePayment });
		},
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}>Make Payment</Dialog.Trigger>
	<Dialog.Content>
		<form use:enhance class="flex flex-col gap-4">
			<Dialog.Header>
				<Dialog.Title>Make Payment</Dialog.Title>
			</Dialog.Header>
			<Form.Field {form} name="recipientId">
				<Form.Control let:attrs>
					<Form.Label>Recipient ID</Form.Label>
					<Input {...attrs} bind:value={$formData.recipientId} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="amount">
				<Form.Control let:attrs>
					<Form.Label>Amount</Form.Label>
					<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.amount} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="note">
				<Form.Control let:attrs>
					<Form.Label>Note</Form.Label>
					<Input {...attrs} bind:value={$formData.note} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button>Submit</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
