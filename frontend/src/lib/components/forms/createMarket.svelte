<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	let { children, ...rest } = $props();

	const initialData = websocket_api.CreateMarket.create({
		name: '',
		description: '',
		minSettlement: 0,
		maxSettlement: 0,
		visibleTo: []
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

	function roundToTenth(value: number | string) {
		if (value === '' || value === null || value === undefined) return value;
		const numeric = typeof value === 'number' ? value : Number(value);
		if (!Number.isFinite(numeric)) return value;
		return Math.round(numeric * 10) / 10;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', className: 'text-base' })} {...rest}>
		{@render children()}
	</Dialog.Trigger>
	<Dialog.Content>
		<form use:enhance>
			<Dialog.Header>
				<Dialog.Title>Create Market</Dialog.Title>
			</Dialog.Header>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Name</Form.Label>
						<Input {...props} bind:value={$formData.name} placeholder="Enter a name for your market..." />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Description</Form.Label>
						<Textarea
							{...props}
							bind:value={$formData.description}
							placeholder="Enter a detailed description of the market..."
							rows={4}
						/>
					{/snippet}
				</Form.Control>
				<Form.Description>
					You can provide a detailed description of the market, including any relevant rules or conditions.
				</Form.Description>
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
							step="0.1"
							bind:value={$formData.minSettlement}
							on:blur={() => {
								$formData.minSettlement = roundToTenth($formData.minSettlement);
							}}
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
							step="0.1"
							bind:value={$formData.maxSettlement}
							on:blur={() => {
								$formData.maxSettlement = roundToTenth($formData.maxSettlement);
							}}
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
