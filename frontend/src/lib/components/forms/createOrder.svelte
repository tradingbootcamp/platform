<script lang="ts">
	import { sendClientMessage } from '$lib/api.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';
	import Button from '$lib/components/ui/button/button.svelte';

	interface Props {
		buttonId: string;
		side?: string | undefined;
		marketId: number;
		minSettlement?: number | null | undefined;
		maxSettlement?: number | null | undefined;
		bids: websocket_api.IOrder[];
		offers: websocket_api.IOrder[];
	}

	let { buttonId, marketId, minSettlement, maxSettlement, side, bids, offers }: Props = $props();

	const initialData = {
		price: 0,
		size: 0,
		side
	};

	let bidButton: HTMLButtonElement | null = $state(null);
	let offerButton: HTMLButtonElement | null = $state(null);

	const form = protoSuperForm(
		`create-order-${buttonId}`,
		(v) => {
			const o = websocket_api.CreateOrder.fromObject({ marketId, ...v });
			const side = o.side === websocket_api.Side.BID ? 'BID' : 'OFFER';
			return { price: o.price, size: o.size, side };
		},
		(createOrder) => {
			const side = createOrder.side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER;
			sendClientMessage({ createOrder: { ...createOrder, side, marketId } });
		},
		initialData,
		{
			onUpdated() {
				if ($formData.side === 'BID') bidButton?.focus();
				else offerButton?.focus();
			},
			resetForm: false
		}
	);

	const { form: formData, enhance } = form;

	function handleQuickOrder() {
		const bestPrice =
			$formData.side === 'BID' ? (offers[0]?.price ?? 0) + 0.01 : (bids[0]?.price ?? 0) - 0.01;

		$formData.price = bestPrice;

		const side = $formData.side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER;
		sendClientMessage({
			createOrder: {
				marketId,
				price: bestPrice,
				size: $formData.size,
				side
			}
		});
	}

	function handleSnipe() {
		const bestPrice =
			$formData.side === 'BID' ? (bids[0]?.price ?? 0) + 0.01 : (offers[0]?.price ?? 0) - 0.01;

		const side = $formData.side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER;
		sendClientMessage({
			createOrder: {
				marketId,
				price: bestPrice,
				size: $formData.size,
				side
			}
		});
	}
</script>

<form use:enhance class="flex flex-col gap-4 text-left">
	<Form.Fieldset {form} name="side" class="flex flex-col">
		<RadioGroup.Root bind:value={$formData.side} class="flex justify-around">
			<div class="flex flex-col items-center gap-2">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="font-normal">Bid</Form.Label>
						<RadioGroup.Item value="BID" bind:ref={bidButton} {...props} />
					{/snippet}
				</Form.Control>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="font-normal">Offer</Form.Label>
						<RadioGroup.Item value="OFFER" bind:ref={offerButton} {...props} />
					{/snippet}
				</Form.Control>
			</div>
		</RadioGroup.Root>
		<Form.FieldErrors />
	</Form.Fieldset>
	<Form.Field {form} name="price" class="flex flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Price</Form.Label>
				<div class="flex-grow"></div>
				<Input
					{...props}
					type="number"
					min={minSettlement}
					max={maxSettlement}
					step="0.01"
					bind:value={$formData.price}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="size" class="flex flex-col">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Size</Form.Label>
				<div class="flex-grow"></div>
				<Input
					{...props}
					type="number"
					min="0"
					max="1000000000000"
					step="0.01"
					bind:value={$formData.size}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<div class="flex gap-2">
		<Form.Button variant={$formData.side === 'BID' ? 'green' : 'red'} class="flex-1">
			Place {$formData.side}
		</Form.Button>
		<Button
			type="button"
			variant={$formData.side === 'BID' ? 'green' : 'red'}
			class="flex-1"
			onclick={handleQuickOrder}
		>
			Quick {$formData.side}
		</Button>
	</div>
	<div class="flex">
		<Button
			type="button"
			variant={$formData.side === 'BID' ? 'green' : 'red'}
			class="flex-1"
			onclick={handleSnipe}
		>
			Snipe {$formData.side}
		</Button>
	</div>
</form>
