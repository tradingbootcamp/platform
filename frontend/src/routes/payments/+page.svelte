<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import MakePayment from '$lib/components/forms/makePayment.svelte';
	import * as Table from '$lib/components/ui/table';

	let payments = $derived(
		serverState.payments.toSorted((a, b) => b.transaction?.id - a.transaction?.id)
	);
</script>

<div class="pt-8">
	<h1 class="mb-4 text-xl font-bold">Payments</h1>
	<MakePayment />
	<Table.Root class="hidden text-center md:block">
		<Table.Header>
			<Table.Row>
				<Table.Head class="px-8 text-center">Payer</Table.Head>
				<Table.Head class="px-8 text-center">Recipient</Table.Head>
				<Table.Head class="px-8 text-center">Amount</Table.Head>
				<Table.Head class="px-8 text-center">Note</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each payments as { amount, payerId, recipientId, note, id } (id)}
				<Table.Row>
					<Table.Cell>
						{payerId === serverState.actingAs
							? 'You'
							: serverState.users.get(payerId ?? 0)?.name || 'Unnamed user'}
					</Table.Cell>
					<Table.Cell>
						{recipientId === serverState.actingAs
							? 'You'
							: serverState.users.get(recipientId ?? 0)?.name || 'Unnamed user'}
					</Table.Cell>
					<Table.Cell>📎 {amount}</Table.Cell>
					<Table.Cell>{note}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="md:hidden">
		{#each payments as { amount, payerId, recipientId, note, id } (id)}
			<div class="flex flex-col gap-4 border-b-2 p-4">
				<div>
					<span class="font-bold">Payer:</span>
					<span>
						{payerId === serverState.actingAs
							? 'You'
							: serverState.users.get(payerId ?? 0)?.name || 'Unnamed user'}
					</span>
				</div>
				<div>
					<span class="font-bold">Recipient:</span>
					<span>
						{recipientId === serverState.actingAs
							? 'You'
							: serverState.users.get(recipientId ?? 0)?.name || 'Unnamed user'}
					</span>
				</div>
				<div>
					<span class="font-bold">Amount:</span>
					<span>📎 {amount}</span>
				</div>
				<div>
					<span class="font-bold">Note:</span>
					<span>{note}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
