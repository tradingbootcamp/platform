<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import MakeTransfer from '$lib/components/forms/makeTransfer.svelte';
	import * as Table from '$lib/components/ui/table';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let transfers = $derived(
		serverState.transfers.toSorted((a, b) => b.transactionId - a.transactionId)
	);
</script>

<div class="container pt-8">
	<h1 class="mb-4 text-xl font-bold">Transfers</h1>
	<MakeTransfer />
	<Table.Root class="hidden text-center md:block">
		<Table.Header>
			<Table.Row>
				<Table.Head class="px-8 text-center">Initiator</Table.Head>
				<Table.Head class="px-8 text-center">From</Table.Head>
				<Table.Head class="px-8 text-center">To</Table.Head>
				<Table.Head class="px-8 text-center">Amount</Table.Head>
				<Table.Head class="px-8 text-center">Note</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each transfers as { amount, initiatorId, fromAccountId, toAccountId, note, id } (id)}
				<Table.Row>
					<Table.Cell>{accountName(initiatorId)}</Table.Cell>
					<Table.Cell>{accountName(fromAccountId)}</Table.Cell>
					<Table.Cell>{accountName(toAccountId)}</Table.Cell>
					<Table.Cell>📎 {amount}</Table.Cell>
					<Table.Cell>{note}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="md:hidden">
		{#each transfers as { amount, fromAccountId, toAccountId, note, id } (id)}
			<div class="flex flex-col gap-4 border-b-2 p-4">
				<div>
					<span>📎 {amount}</span>
				</div>
				<div class="flex items-center gap-2">
					<span>{accountName(fromAccountId)}</span>
					<ArrowRight />
					<span>{accountName(toAccountId)}</span>
				</div>
				<div>
					<span>{note}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
