<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { roundToTenth } from '$lib/components/marketDataUtils';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import { formatMarketName } from '$lib/utils';

	interface Props {
		id: number | null | undefined;
		name: string | null | undefined;
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
		ownerId: number | null | undefined;
	}

	let { id, name, minSettlement, maxSettlement, ownerId }: Props = $props();

	let formEl: HTMLFormElement = $state(null!);
	let mobileFormEl: HTMLFormElement = $state(null!);
	let showDialog = $state(false);
	let confirmed = $state(false);
	let popoverOpen = $state(false);
	let mobileModalOpen = $state(false);
	let activeFormEl: HTMLFormElement | null = $state(null);

	const initialData: websocket_api.ISettleMarket = {
		settlePrice: null
	};

	const form = protoSuperForm(
		'settle-market',
		(v) =>
			websocket_api.SettleMarket.fromObject({
				...v,
				marketId: id
			}),
		(settleMarket) => {
			showDialog = false;
			popoverOpen = false;
			mobileModalOpen = false;
			sendClientMessage({ settleMarket });
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

	const { form: formData, enhance } = form;
</script>

<!-- Desktop: Popover -->
<div class="hidden md:block">
	<Popover.Root bind:open={popoverOpen}>
		<Popover.Trigger
			class="inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
		>
			{#if popoverOpen}
				<ChevronDown class="h-4 w-4" />
			{:else}
				<ChevronRight class="h-4 w-4" />
			{/if}
			Settle
		</Popover.Trigger>
		<Popover.Content class="w-auto p-3" align="start">
			<form
				use:enhance
				bind:this={formEl}
				class="flex flex-col gap-2"
				onsubmit={() => (activeFormEl = formEl)}
			>
				<Form.Field {form} name="settlePrice" class="flex flex-col gap-0 space-y-0">
					<Form.Control>
						{#snippet children({ props })}
							<Input
								{...props}
								type="number"
								min={minSettlement}
								max={maxSettlement}
								step="0.1"
								placeholder="Settle Price"
								aria-label="Settle Price"
								class="h-10 w-32"
								bind:value={$formData.settlePrice}
								onblur={() => {
									$formData.settlePrice = roundToTenth($formData.settlePrice as unknown as number);
								}}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button class="h-10 w-full">Settle Market</Form.Button>
			</form>
		</Popover.Content>
	</Popover.Root>
</div>

<!-- Mobile: Modal -->
<div class="md:hidden">
	<Button class="h-10 px-4" onclick={() => (mobileModalOpen = true)}>Settle</Button>
	<Dialog.Root bind:open={mobileModalOpen}>
		<Dialog.Content class="sm:max-w-[280px]">
			<Dialog.Header>
				<Dialog.Title>Settle Market</Dialog.Title>
			</Dialog.Header>
			<form
				use:enhance
				bind:this={mobileFormEl}
				class="flex flex-col gap-4"
				onsubmit={() => (activeFormEl = mobileFormEl)}
			>
				<Form.Field {form} name="settlePrice" class="flex flex-col gap-1">
					<Form.Control>
						{#snippet children({ props })}
							<Input
								{...props}
								type="number"
								min={minSettlement}
								max={maxSettlement}
								step="0.1"
								placeholder="Settle Price"
								aria-label="Settle Price"
								class="h-10"
								bind:value={$formData.settlePrice}
								onblur={() => {
									$formData.settlePrice = roundToTenth($formData.settlePrice as unknown as number);
								}}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Button class="h-10 w-full">Settle Market</Form.Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>

<AlertDialog.Root bind:open={showDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				{formatMarketName(name)} will be settled to {$formData.settlePrice}.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel
				onclick={() => {
					confirmed = false;
					activeFormEl?.reset();
				}}
			>
				Cancel
			</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					confirmed = true;
					activeFormEl?.requestSubmit();
				}}
			>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
