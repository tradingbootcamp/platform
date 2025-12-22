<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		id: number | null | undefined;
		name: string | null | undefined;
		close: () => void;
	}

	let { id, name, close }: Props = $props();

	let formEl: HTMLFormElement = $state(null!);
	let showDialog = $state(false);
	let confirmed = $state(false);

	const initialData = {};

	const form = protoSuperForm(
		'delete-auction',
		() =>
			websocket_api.DeleteAuction.fromObject({
				auctionId: id,
				confirmAdmin: serverState.confirmAdmin
			}),
		(deleteAuction) => {
			showDialog = false;
			sendClientMessage({ deleteAuction });
			close();
		},
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

	const { enhance } = form;
</script>

<form use:enhance bind:this={formEl} class="flex flex-col gap-2">
	<Button variant="destructive" type="submit" class="w-full">Delete Listing</Button>
</form>

<AlertDialog.Root bind:open={showDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Listing</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete {name}? This action cannot be undone.
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
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
