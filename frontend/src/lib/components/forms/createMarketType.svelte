<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	let { children, ...rest } = $props();

	const initialData = websocket_api.CreateMarketType.create({
		name: '',
		description: '',
		public: false
	});
	let open = $state(false);

	const form = protoSuperForm(
		'create-market-type',
		websocket_api.CreateMarketType.fromObject,
		(createMarketType) => {
			sendClientMessage({ createMarketType });
			open = false;
		},
		initialData
	);

	const { form: formData, enhance } = form;
</script>

{#if serverState.isAdmin}
	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline', className: 'text-base' })} {...rest}>
			{@render children()}
		</Dialog.Trigger>
		<Dialog.Content>
			<form use:enhance>
				<Dialog.Header>
					<Dialog.Title>Create Category</Dialog.Title>
				</Dialog.Header>
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} placeholder="Enter category name..." />
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
								placeholder="Enter a description for this category..."
								rows={2}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="public">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center gap-2 mt-4">
								<Checkbox {...props} bind:checked={$formData.public} />
								<Form.Label class="cursor-pointer">Public (non-admins can create markets in this category)</Form.Label>
							</div>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Dialog.Footer class="mt-4">
					<Form.Button>Create Category</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/if}
