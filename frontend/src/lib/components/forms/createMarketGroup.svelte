<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	let { children, ...rest } = $props();

	// Get available market types, sorted by id
	let allTypes = $derived([...serverState.marketTypes.values()].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));

	// Default to first available type
	let defaultTypeId = $derived(allTypes[0]?.id ?? 1);

	const initialData = websocket_api.CreateMarketGroup.create({
		name: '',
		description: '',
		typeId: 1
	});
	let open = $state(false);

	const form = protoSuperForm(
		'create-market-group',
		websocket_api.CreateMarketGroup.fromObject,
		(createMarketGroup) => {
			sendClientMessage({ createMarketGroup });
			open = false;
		},
		initialData
	);

	const { form: formData, enhance } = form;

	// Update typeId to default when types load
	$effect(() => {
		if ($formData.typeId === 0 || $formData.typeId === undefined) {
			$formData.typeId = defaultTypeId;
		}
	});

	// Get display name for selected type
	let selectedTypeName = $derived(serverState.marketTypes.get($formData.typeId ?? 0)?.name ?? 'Select category...');
</script>

{#if serverState.isAdmin}
	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline', className: 'text-base' })} {...rest}>
			{@render children()}
		</Dialog.Trigger>
		<Dialog.Content>
			<form use:enhance>
				<Dialog.Header>
					<Dialog.Title>Create Group</Dialog.Title>
				</Dialog.Header>
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formData.name} placeholder="Enter group name..." />
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
								placeholder="Enter a description for this group..."
								rows={2}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="typeId">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Category</Form.Label>
							<Select.Root
								type="single"
								value={String($formData.typeId)}
								onValueChange={(v) => { if (v) $formData.typeId = Number(v); }}
							>
								<Select.Trigger {...props}>
									{selectedTypeName}
								</Select.Trigger>
								<Select.Content>
									{#each allTypes as marketType (marketType.id)}
										<Select.Item
											value={String(marketType.id)}
											label={marketType.name}
										>
											{marketType.name}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.Description>
						Markets in this group must be in this category.
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>
				<Dialog.Footer class="mt-4">
					<Form.Button>Create Group</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/if}
