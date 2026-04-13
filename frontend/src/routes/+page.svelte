<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { fetchCohorts, type CohortInfo } from '$lib/cohortApi';
	import { kinde } from '$lib/auth.svelte';
	import { onMount } from 'svelte';

	let cohorts = $state<CohortInfo[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			const response = await fetchCohorts();
			cohorts = response.cohorts;

			// Auto-redirect if user has exactly 1 cohort
			if (cohorts.length === 1) {
				goto(`/${cohorts[0].name}/market`, { replaceState: true });
				return;
			}

			// Check localStorage for last-used cohort
			if (browser) {
				const lastCohort = localStorage.getItem('lastCohort');
				if (lastCohort && cohorts.some((c) => c.name === lastCohort)) {
					goto(`/${lastCohort}/market`, { replaceState: true });
					return;
				}
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load cohorts';
		} finally {
			loading = false;
		}
	});

	function selectCohort(cohort: CohortInfo) {
		if (browser) {
			localStorage.setItem('lastCohort', cohort.name);
		}
		goto(`/${cohort.name}/market`);
	}
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else if error}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="text-lg text-muted-foreground">{error}</p>
			<button
				class="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
				onclick={() => window.location.reload()}
			>
				Retry
			</button>
		</div>
	</div>
{:else if cohorts.length === 0}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<p class="text-lg text-muted-foreground">Your account isn't authorized for any cohort yet.</p>
			<p class="mt-2 text-sm text-muted-foreground">Contact an administrator to get access.</p>
			<button
				class="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-muted"
				onclick={() => kinde.logout()}
			>
				Log Out
			</button>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center p-8">
		<div class="w-full max-w-2xl">
			<div class="mb-8 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Select a Cohort</h1>
				<button
					class="rounded-md border px-4 py-2 text-sm hover:bg-muted"
					onclick={() => kinde.logout()}
				>
					Log Out
				</button>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				{#each cohorts as cohort}
					<button
						class="rounded-lg border bg-card p-6 text-left transition-colors hover:bg-muted"
						onclick={() => selectCohort(cohort)}
					>
						<h2 class="text-xl font-semibold">{cohort.display_name}</h2>
						<p class="mt-1 text-sm text-muted-foreground">{cohort.name}</p>
						{#if cohort.is_read_only}
							<span
								class="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400"
							>
								Read-only
							</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}
