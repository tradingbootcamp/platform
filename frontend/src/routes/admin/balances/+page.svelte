<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { fetchAllBalances, type CohortBalances, type UserBalance } from '$lib/adminApi';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';

	let loading = $state(true);
	let cohorts = $state<CohortBalances[]>([]);
	let search = $state('');

	onMount(async () => {
		try {
			const response = await fetchAllBalances();
			cohorts = response.cohorts;
		} catch (e) {
			toast.error('Failed to load balances: ' + (e instanceof Error ? e.message : String(e)));
			goto('/admin');
			return;
		}
		loading = false;
	});

	function formatBalance(n: number): string {
		return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
	}

	function matches(row: UserBalance, q: string): boolean {
		if (!q) return true;
		const needle = q.toLowerCase();
		return (
			row.display_name.toLowerCase().includes(needle) ||
			(row.email?.toLowerCase().includes(needle) ?? false)
		);
	}

	let filteredCohorts = $derived(
		cohorts.map((c) => ({
			...c,
			members: c.members.filter((r) => matches(r, search)),
			guests: c.guests.filter((r) => matches(r, search))
		}))
	);
</script>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<div class="mb-6 flex items-center gap-3">
		<a
			href="/admin"
			class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
		>
			<ArrowLeft class="h-4 w-4" /> Admin
		</a>
		<h1 class="text-2xl font-bold">Balances</h1>
	</div>

	<input
		class="mb-6 w-full rounded-md border bg-background px-3 py-2 text-sm"
		placeholder="Search by name or email…"
		bind:value={search}
	/>

	{#if loading}
		<p class="text-muted-foreground">Loading…</p>
	{:else if cohorts.length === 0}
		<p class="text-muted-foreground">No cohorts.</p>
	{:else}
		{#each filteredCohorts as cohort (cohort.cohort_name)}
			<section class="mb-10">
				<h2 class="mb-1 text-xl font-semibold">{cohort.cohort_display_name}</h2>
				<p class="mb-4 text-sm text-muted-foreground">{cohort.cohort_name}</p>

				<h3 class="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
					Members ({cohort.members.length})
				</h3>
				{#if cohort.members.length === 0}
					<p class="mb-6 text-sm text-muted-foreground">No member balances.</p>
				{:else}
					<div class="mb-6 overflow-hidden rounded-md border">
						<table class="w-full text-sm">
							<thead class="bg-muted/30 text-left text-xs uppercase tracking-wide">
								<tr>
									<th class="px-3 py-2">Name</th>
									<th class="px-3 py-2">Email</th>
									<th class="px-3 py-2 text-right">Balance</th>
								</tr>
							</thead>
							<tbody>
								{#each cohort.members as row (row.global_user_id)}
									<tr class="border-t">
										<td class="px-3 py-1.5">{row.display_name}</td>
										<td class="px-3 py-1.5 text-muted-foreground">{row.email ?? '—'}</td>
										<td class="px-3 py-1.5 text-right font-mono">📎 {formatBalance(row.balance)}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}

				<h3 class="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
					Public guests ({cohort.guests.length})
				</h3>
				{#if cohort.guests.length === 0}
					<p class="text-sm text-muted-foreground">
						No public-auction guests have an account here.
					</p>
				{:else}
					<div class="overflow-hidden rounded-md border">
						<table class="w-full text-sm">
							<thead class="bg-muted/30 text-left text-xs uppercase tracking-wide">
								<tr>
									<th class="px-3 py-2">Name</th>
									<th class="px-3 py-2">Email</th>
									<th class="px-3 py-2 text-right">Balance</th>
								</tr>
							</thead>
							<tbody>
								{#each cohort.guests as row (row.global_user_id)}
									<tr class="border-t">
										<td class="px-3 py-1.5">{row.display_name}</td>
										<td class="px-3 py-1.5 text-muted-foreground">{row.email ?? '—'}</td>
										<td class="px-3 py-1.5 text-right font-mono">📎 {formatBalance(row.balance)}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</section>
		{/each}
	{/if}
</div>
