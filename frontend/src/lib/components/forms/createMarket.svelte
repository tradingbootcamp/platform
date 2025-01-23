<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	const initialData = websocket_api.CreateMarket.create({
		name: '',
		description: '',
		minSettlement: 0,
		maxSettlement: 0
	});
	let open = $state(false);

	const form = protoSuperForm(
		'create-market',
		websocket_api.CreateMarket.fromObject,
		(createMarket) => {
			sendClientMessage({ createMarket });
			open = false;
		},
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', className: 'text-base' })}
		>Create Market</Dialog.Trigger
	>
	<Dialog.Content>
		<form use:enhance>
			<Dialog.Header>
				<Dialog.Title>Create Market</Dialog.Title>
			</Dialog.Header>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Input {...props} bind:value={$formData.description} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="minSettlement">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Min Settlement</Form.Label>
						<Input
							{...props}
							type="number"
							max="1000000000000"
							step="0.01"
							bind:value={$formData.minSettlement}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="maxSettlement">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Max Settlement</Form.Label>
						<Input
							{...props}
							type="number"
							max="1000000000000"
							step="0.01"
							bind:value={$formData.maxSettlement}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button>Submit</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
