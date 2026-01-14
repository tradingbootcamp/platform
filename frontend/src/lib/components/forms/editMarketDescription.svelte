<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Textarea } from '$lib/components/ui/textarea';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		marketId: number;
		currentDescription: string;
		currentStatus: websocket_api.MarketStatus;
		onclick?: () => void;
		[key: string]: unknown;
	}

	let { children, marketId, currentDescription, currentStatus, ...rest }: Props = $props();

	let open = $state(false);

	const initialData = websocket_api.EditMarket.create({
		id: marketId,
		description: currentDescription,
		status: currentStatus,
		confirmAdmin: false
	});

	const form = protoSuperForm(
		'edit-market-description',
		websocket_api.EditMarket.fromObject,
		(editMarket) => {
			// Set confirmAdmin flag if user is admin
			editMarket.confirmAdmin = serverState.confirmAdmin;
			// Ensure status is preserved
			editMarket.status = currentStatus;
			sendClientMessage({ editMarket });
			open = false;
		},
		initialData
	);

	const { form: formData, enhance } = form;

	// Reset form data when dialog opens
	$effect(() => {
		if (open) {
			$formData.description = currentDescription;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({
			variant: 'ghost',
			size: 'sm',
			className: rest.class as string | undefined
		})}
		{...rest}
	>
		{@render children()}
	</Dialog.Trigger>
	<Dialog.Content>
		<form use:enhance>
			<Dialog.Header>
				<Dialog.Title>Edit Market Description</Dialog.Title>
			</Dialog.Header>
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
					Update the description to provide more details about this market.
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button>Save</Form.Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
