<script lang="ts">
	import { actingAs, payments, users } from '$lib/api';
	import MakePayment from '$lib/components/forms/makePayment.svelte';
	import * as Table from '$lib/components/ui/table';
</script>

<div class="pt-8">
	<h1 class="mb-4 text-xl font-bold">Payments</h1>
	<MakePayment />
	<Table.Root class="text-center">
		<Table.Header>
			<Table.Row>
				<Table.Head class="px-8 text-center">Payer</Table.Head>
				<Table.Head class="px-8 text-center">Recipient</Table.Head>
				<Table.Head class="px-8 text-center">Amount</Table.Head>
				<Table.Head class="px-8 text-center">Note</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each $payments as { amount, payerId, recipientId, note, id } (id)}
				<Table.Row>
					<Table.Cell>
						{payerId === $actingAs ? 'You' : $users.get(payerId ?? '')?.name || 'Unnamed user'}
					</Table.Cell>
					<Table.Cell>
						{recipientId === $actingAs
							? 'You'
							: $users.get(recipientId ?? '')?.name || 'Unnamed user'}
					</Table.Cell>
					<Table.Cell>📎 {amount}</Table.Cell>
					<Table.Cell>{note}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
