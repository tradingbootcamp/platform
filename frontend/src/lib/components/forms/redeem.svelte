<script lang="ts">
	import { markets, redeemables, sendClientMessage } from '$lib/api';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { get } from 'svelte/store';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		marketId: number;
	}

	let { marketId }: Props = $props();

	const initialData = {
		amount: 0
	};

	let formElement: HTMLFormElement = $state(null!);

	const form = protoSuperForm(
		'redeem',
		(v) => websocket_api.Redeem.fromObject({ ...v, fundId: marketId }),
		(redeem) => sendClientMessage({ redeem }),
		initialData
	);

	const { form: formData, enhance } = form;

	let constituentList = $derived(
		redeemables
			.filter(([first]) => first === marketId)
			.map(([, second]) => get($markets[second]).name)
			.join(', ')
	);
</script>

<form bind:this={formElement} use:enhance class="flex flex-col gap-2 text-left">
	<Form.Field {form} name="amount" class="flex flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Amount to exchange for {constituentList}</Form.Label>
				<div class="flex-grow"></div>
				<Input {...props} type="number" step="0.01" bind:value={$formData.amount} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full">Redeem</Form.Button>
</form>
