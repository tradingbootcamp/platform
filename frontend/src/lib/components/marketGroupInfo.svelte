<script lang="ts">
	import type { components } from '$lib/api.generated';
	import { serverState } from '$lib/api.svelte';
	import { scenarioData } from '$lib/scenarioData.svelte';
	import { dieRollVisibility } from '$lib/dieRollVisibility.svelte';
	import { cn } from '$lib/utils';
	import { Clock, Dices, Eye, EyeOff } from '@lucide/svelte/icons';

	type ClockResponse = components['schemas']['ClockResponse'];
	type DieRollResponse = components['schemas']['DieRollResponse'];
	type AllRollsResponse = components['schemas']['AllRollsResponse'];

	let {
		clock,
		myRoll,
		allRolls,
		settled = false
	} = $props<{
		clock?: ClockResponse;
		myRoll?: DieRollResponse;
		allRolls?: AllRollsResponse[];
		settled?: boolean;
	}>();

	let isAdminForRolls = $derived(serverState.isAdmin);
</script>

{#if clock}
	<div
		class={cn(
			'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium',
			settled
				? 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
				: clock.is_running
					? 'bg-green-500/20 text-green-700 dark:text-green-400'
					: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
		)}
	>
		<Clock class="h-4 w-4" />
		<span>{scenarioData.formatClockTime(clock)}</span>
		{#if settled}
			<span class="text-xs">(settled)</span>
		{:else if !clock.is_running}
			<span class="text-xs">(paused)</span>
		{/if}
	</div>
{/if}
{#if myRoll}
	<div
		class="flex items-center gap-1.5 rounded-md bg-blue-500/20 px-2 py-1 text-sm font-medium text-blue-700 dark:text-blue-400"
	>
		<Dices class="h-4 w-4" />
		<span>{dieRollVisibility.visible ? myRoll.roll : '??'}</span>
		<button
			type="button"
			class="ml-0.5 rounded p-0.5 hover:bg-blue-500/20"
			onclick={() => dieRollVisibility.toggle()}
		>
			{#if dieRollVisibility.visible}
				<EyeOff class="h-3.5 w-3.5" />
			{:else}
				<Eye class="h-3.5 w-3.5" />
			{/if}
		</button>
	</div>
{/if}
{#if isAdminForRolls && allRolls && allRolls.length > 0}
	<details class="relative">
		<summary
			class="cursor-pointer rounded-md bg-purple-500/20 px-2 py-1 text-sm font-medium text-purple-700 dark:text-purple-400"
		>
			All Rolls
		</summary>
		<div class="absolute left-0 top-full z-10 mt-1 rounded-md border bg-popover p-2 shadow-md">
			{#each allRolls as roll}
				<div class="flex items-center justify-between gap-4 whitespace-nowrap px-1 py-0.5 text-sm">
					<span class="text-muted-foreground"
						>{roll.team_name.includes('__')
							? roll.team_name.split('__').slice(1).join('__')
							: roll.team_name}</span
					>
					<span class="font-medium">{roll.roll}</span>
				</div>
			{/each}
		</div>
	</details>
{/if}
