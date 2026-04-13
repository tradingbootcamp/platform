<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { parseMarketName } from '$lib/utils';
	import { websocket_api } from 'schema-js';
	import { protoSuperForm } from './protoSuperForm';

	interface Props {
		marketId: number;
		disabled?: boolean;
	}

	let { marketId, disabled = false }: Props = $props();

	const initialData: websocket_api.IRedeem = {
		amount: 0
	};

	let formElement: HTMLFormElement = $state(null!);

	const form = protoSuperForm(
		'redeem',
		(v) => websocket_api.Redeem.fromObject({ ...v, fundId: marketId }),
		(redeem) => sendClientMessage({ redeem }),
		initialData as { amount: number }
	);

	const { form: formData, enhance } = form;

	let constituents = $derived(
		serverState.markets
			.get(marketId)
			?.definition?.redeemableFor?.map(({ constituentId, multiplier }) => ({
				id: constituentId,
				multiplier,
				name: parseMarketName(serverState.markets.get(constituentId)?.definition?.name).suffix
			}))
	);
	let redeemFee = $derived(serverState.markets.get(marketId)?.definition?.redeemFee);
</script>

<form bind:this={formElement} use:enhance class="flex flex-wrap items-center gap-2">
	<div
		class="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-muted/50 pl-2.5 pr-1.5 text-sm font-medium"
	>
		Exchanges for
		{#each constituents ?? [] as constituent, i}
			{#if i > 0}<span>,</span>{/if}
			<a
				href="/market/{constituent.id}"
				class="flex h-7 items-center rounded border border-border bg-background px-2 transition-colors hover:bg-accent"
			>
				{constituent.multiplier}x {constituent.name}
			</a>
		{/each}
	</div>
	<Form.Field {form} name="amount" class="flex flex-col gap-0 space-y-0">
		<Form.Control>
			{#snippet children({ props })}
				<Input
					{...props}
					type="number"
					step="0.01"
					placeholder="Amount"
					aria-label="Amount"
					class="h-10 w-32"
					bind:value={$formData.amount}
					{disabled}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	{#if redeemFee}
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Form.Button {...props} type="submit" class="h-10 px-4" {disabled}>Redeem</Form.Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>
				{redeemFee}📎 fee
			</Tooltip.Content>
		</Tooltip.Root>
	{:else}
		<Form.Button class="h-10 px-4" {disabled}>Redeem</Form.Button>
	{/if}
</form>
