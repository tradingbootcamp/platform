<script lang="ts">
	import { accountName, serverState } from '$lib/api.svelte';
	import MakeTransfer from '$lib/components/forms/makeTransfer.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Table from '$lib/components/ui/table';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Clock from '@lucide/svelte/icons/clock';

	let transfers = $derived(
		serverState.transfers.toSorted((a, b) => b.transactionId - a.transactionId)
	);

	function formatTimestamp(ts: { seconds?: number | null } | null | undefined): string {
		if (!ts?.seconds) return '';
		return new Date(Number(ts.seconds) * 1000).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<div class="pt-8">
	<h1 class="mb-1 text-xl font-bold">Transfers</h1>
	<p class="mb-4 text-sm text-muted-foreground">Transfer clips to other accounts.</p>
	<MakeTransfer />
	<h2 class="mb-2 mt-6 text-lg font-semibold">Transfer Log</h2>
	<Table.Root class="hidden text-center md:block">
		<Table.Header>
			<Table.Row>
				<Table.Head class="px-3 py-2 text-center">Initiator</Table.Head>
				<Table.Head class="px-3 py-2 text-center">From</Table.Head>
				<Table.Head class="px-3 py-2 text-center">To</Table.Head>
				<Table.Head class="px-3 py-2 text-center">Amount</Table.Head>
				<Table.Head class="px-3 py-2 text-center">Note</Table.Head>
				<Table.Head class="px-3 py-2 text-center">Time</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each transfers as { amount, initiatorId, fromAccountId, toAccountId, note, id, transactionTimestamp } (id)}
				<Table.Row>
					<Table.Cell class="px-3 py-1.5">{accountName(initiatorId)}</Table.Cell>
					<Table.Cell class="px-3 py-1.5">{accountName(fromAccountId)}</Table.Cell>
					<Table.Cell class="px-3 py-1.5">{accountName(toAccountId)}</Table.Cell>
					<Table.Cell class="px-3 py-1.5">📎 {amount}</Table.Cell>
					<Table.Cell class="px-3 py-1.5">
						{#if note && note.length > 12}
							<Popover.Root>
								<Popover.Trigger class="cursor-help underline decoration-dotted">
									{note.slice(0, 12)}…
								</Popover.Trigger>
								<Popover.Content class="w-auto max-w-64 text-sm">
									{note}
								</Popover.Content>
							</Popover.Root>
						{:else}
							{note}
						{/if}
					</Table.Cell>
					<Table.Cell class="px-3 py-1.5 text-muted-foreground">
						<span class="hidden whitespace-nowrap min-[900px]:inline"
							>{formatTimestamp(transactionTimestamp)}</span
						>
						<span class="min-[900px]:hidden">
							<Popover.Root>
								<Popover.Trigger class="text-muted-foreground hover:text-foreground">
									<Clock class="h-4 w-4" />
								</Popover.Trigger>
								<Popover.Content class="w-auto px-3 py-1.5 text-sm">
									{formatTimestamp(transactionTimestamp)}
								</Popover.Content>
							</Popover.Root>
						</span>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	<div class="md:hidden">
		{#each transfers as { amount, fromAccountId, toAccountId, note, id, transactionTimestamp } (id)}
			<div class="flex items-center gap-3 border-b px-3 py-2 text-sm">
				<span class="shrink-0">📎 {amount}</span>
				<span class="flex shrink items-center gap-1 truncate">
					<span class="truncate">{accountName(fromAccountId)}</span>
					<ArrowRight class="h-3 w-3 shrink-0" />
					<span class="truncate">{accountName(toAccountId)}</span>
				</span>
				{#if note}
					{#if note.length > 12}
						<Popover.Root>
							<Popover.Trigger
								class="shrink-0 cursor-help text-muted-foreground underline decoration-dotted"
							>
								{note.slice(0, 12)}…
							</Popover.Trigger>
							<Popover.Content class="w-auto max-w-64 text-sm">
								{note}
							</Popover.Content>
						</Popover.Root>
					{:else}
						<span class="shrink-0 text-muted-foreground">{note}</span>
					{/if}
				{/if}
				<Popover.Root>
					<Popover.Trigger class="ml-auto shrink-0 text-muted-foreground hover:text-foreground">
						<Clock class="h-3.5 w-3.5" />
					</Popover.Trigger>
					<Popover.Content class="w-auto px-3 py-1.5 text-sm">
						{formatTimestamp(transactionTimestamp)}
					</Popover.Content>
				</Popover.Root>
			</div>
		{/each}
	</div>
</div>
