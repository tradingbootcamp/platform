<script lang="ts">
	import { sendClientMessage } from '$lib/api';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	export let marketId: string;

	const initialData = {
		settlePrice: '0'
	};

	const form = protoSuperForm(
		'settle-market',
		(v) => websocket_api.SettleMarket.fromObject({ ...v, marketId }),
		(settleMarket) => sendClientMessage({ settleMarket }),
		initialData
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance>
	<Form.Field {form} name="settlePrice">
		<Form.Control let:attrs>
			<Form.Label>Settle Price</Form.Label>
			<Input {...attrs} type="number" min="0" step="0.01" bind:value={$formData.settlePrice} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full">Settle Market</Form.Button>
</form>
