<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import MakeTransfer from '$lib/components/forms/makeTransfer.svelte';
	import * as Table from '$lib/components/ui/table';

	let transfers = $derived(
		serverState.transfers.toSorted((a, b) => b.transaction?.id - a.transaction?.id)
	);
</script>

<div class="pt-8">
	<h1 class="mb-4 text-xl font-bold">Payments</h1>
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
					<Table.Cell>
						{initiatorId === serverState.userId
							? 'You'
							: serverState.accounts.get(initiatorId ?? 0)?.name || 'Unnamed user'}
					</Table.Cell>
					<Table.Cell>
						{fromAccountId === serverState.userId
							? 'You'
							: serverState.accounts.get(fromAccountId ?? 0)?.name || 'Unnamed user'}
					</Table.Cell>
					<Table.Cell>
						{toAccountId === serverState.userId
							? 'You'
							: serverState.accounts.get(toAccountId ?? 0)?.name || 'Unnamed user'}
					</Table.Cell>
					<Table.Cell>📎 {amount}</Table.Cell>
					<Table.Cell>{note}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="md:hidden">
		{#each transfers as { amount, initiatorId, fromAccountId, toAccountId, note, id } (id)}
			<div class="flex flex-col gap-4 border-b-2 p-4">
				<div>
					<span class="font-bold">Initiator:</span>
					<span>
						{initiatorId === serverState.userId
							? 'You'
							: serverState.accounts.get(initiatorId ?? 0)?.name || 'Unnamed user'}
					</span>
				</div>
				<div>
					<span class="font-bold">From:</span>
					<span>
						{fromAccountId === serverState.userId
							? 'You'
							: serverState.accounts.get(fromAccountId ?? 0)?.name || 'Unnamed user'}
					</span>
				</div>
				<div>
					<span class="font-bold">To:</span>
					<span>
						{toAccountId === serverState.userId
							? 'You'
							: serverState.accounts.get(toAccountId ?? 0)?.name || 'Unnamed user'}
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
