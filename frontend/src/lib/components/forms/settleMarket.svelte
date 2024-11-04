<script lang="ts">
	import { sendClientMessage } from '$lib/api';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		id: number | null | undefined;
		name: string | null | undefined;
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
	}

	let { id, name, minSettlement, maxSettlement }: Props = $props();

	let formEl: HTMLFormElement = $state(null!);
	let showDialog = $state(false);
	let confirmed = $state(false);

	const initialData = {
		settlePrice: 0
	};

	const form = protoSuperForm(
		'settle-market',
		(v) => websocket_api.SettleMarket.fromObject({ ...v, marketId: id }),
		(settleMarket) => sendClientMessage({ settleMarket }),
		initialData,
		{
			cancelPred() {
				if (confirmed) {
					confirmed = false;
					return false;
				} else {
					showDialog = true;
					return true;
				}
			}
		}
	);

	const { form: formData, enhance } = form;
</script>

<form use:enhance bind:this={formEl} class="flex flex-col gap-2">
	<Form.Field {form} name="settlePrice">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Settle Price</Form.Label>
				<Input
					{...props}
					type="number"
					min={minSettlement}
					max={maxSettlement}
					step="0.01"
					bind:value={$formData.settlePrice}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="w-full">Settle Market</Form.Button>
</form>

<AlertDialog.Root bind:open={showDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				{name} will be settled to {$formData.settlePrice}.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					confirmed = false;
					formEl.reset();
				}}
			>
				Cancel
			</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					confirmed = true;
					formEl.requestSubmit();
				}}
			>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
