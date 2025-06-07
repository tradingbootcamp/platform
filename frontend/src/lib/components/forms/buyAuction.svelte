<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		auctionId: number | null | undefined;
		auctionName: string | null | undefined;
		binPrice: number | null | undefined;
		close: () => void;
	}

	let { auctionId, auctionName, binPrice, close }: Props = $props();

	let formEl: HTMLFormElement = $state(null!);
	let showDialog = $state(false);
	let confirmed = $state(false);
	let isSubmitting = $state(false);

	const initialData = {};

	const form = protoSuperForm(
		'buy-auction',
		() => websocket_api.BuyAuction.fromObject({ auctionId }),
		async (buyAuction) => {
			try {
				isSubmitting = true;
				showDialog = false;

				// Use requestAnimationFrame to ensure UI updates before sending message
				await new Promise((resolve) => requestAnimationFrame(resolve));

				sendClientMessage({ buyAuction });

				// Small delay to ensure message is sent before closing
				await new Promise((resolve) => setTimeout(resolve, 100));

				close();
			} catch (error) {
				console.error('Error buying item:', error);
				isSubmitting = false;
			}
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

	// Clean up function to reset states
	function resetForm() {
		confirmed = false;
		isSubmitting = false;
		showDialog = false;
		if (formEl) {
			formEl.reset();
		}
	}
</script>

<form use:enhance bind:this={formEl} class="flex flex-col gap-2">
	<Button variant="default" type="submit" class="w-full" disabled={isSubmitting}>
		{isSubmitting ? 'Buying...' : `Buy Now for ${binPrice} clips`}
	</Button>
</form>

<AlertDialog.Root bind:open={showDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Buy Item</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to buy "{auctionName}" for {binPrice} clips?
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={resetForm} disabled={isSubmitting}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					confirmed = true;
					formEl.requestSubmit();
				}}
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Processing...' : 'Buy Now'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
