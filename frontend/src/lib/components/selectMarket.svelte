<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { serverState } from '$lib/api.svelte';
	import { shouldShowPuzzleHuntBorder } from '$lib/components/marketDataUtils';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { useStarredMarkets, usePinnedMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn } from '$lib/utils';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	let popoverOpen = $state(false);
	let popoverTriggerRef = $state<HTMLButtonElement>(null!);
	const { isStarred } = useStarredMarkets();
	const { isPinned } = usePinnedMarkets();

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function onSelect(id?: number) {
		popoverOpen = false;
		tick().then(() => {
			popoverTriggerRef.focus();
		});
		if (id) {
			goto(`/market/${id}`);
		} else {
			goto('/market');
		}
	}

	let availableMarkets = $derived.by(() => {
		return [...serverState.markets.entries()]
			.map(([id, market]) => ({
				id,
				market,
				name: market.definition.name || `Market ${id}`,
				isOpen: market.definition.open ? true : false,
				transactionId: Number(market.definition.transactionId || 0),
				starred: isStarred(Number(id)),
				pinned: isPinned(Number(id))
			}))
			.sort((a, b) => {
				if (a.pinned !== b.pinned) {
					return a.pinned ? -1 : 1;
				}
				if (a.starred !== b.starred) {
					return a.starred ? -1 : 1;
				}
				if (a.isOpen !== b.isOpen) {
					return a.isOpen ? -1 : 1;
				}
				return b.transactionId - a.transactionId;
			});
	});

	let id = $derived(Number($page.params.id));
	let marketData = $derived(Number.isNaN(id) ? undefined : serverState.markets.get(id));
	let title = $derived(marketData?.definition.name || 'Select Market');
	let currentGroupId = $derived(marketData?.definition?.groupId ?? 0);
	let currentGroup = $derived(
		currentGroupId ? serverState.marketGroups.get(Number(currentGroupId)) : undefined
	);

	// Filter to only show markets in the same group as the current market
	let marketsInGroup = $derived.by(() => {
		if (!currentGroupId) {
			// No group - show empty (the current market has no group)
			return [];
		}
		return availableMarkets.filter(
			(m) => m.market.definition.groupId === currentGroupId && m.id !== id
		);
	});
</script>

<div class="relative">
	<Popover.Root bind:open={popoverOpen}>
		<Popover.Trigger
			class={cn(
				buttonVariants({ variant: 'ghost' }),
				'justify-between pl-0 text-2xl font-semibold'
			)}
			role="combobox"
			bind:ref={popoverTriggerRef}
		>
			<h1 class="text-start">{title}</h1>
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Popover.Trigger>
		<Popover.Content class="w-64 p-0">
			<Command.Root>
				{#if marketsInGroup.length > 0}
					<Command.Input autofocus placeholder="Search markets in group..." class="h-9" />
					<Command.Empty>No matching markets</Command.Empty>
					<Command.Group heading={currentGroup?.name ?? 'Markets in Group'}>
						{#each marketsInGroup as { id, name, market } (id)}
							<Command.Item
								class={cn(
									'p-0',
									shouldShowPuzzleHuntBorder(market.definition) && 'puzzle-hunt-frame'
								)}
								value={name}
								onSelect={() => onSelect(id)}
							>
								<a href={`/market/${id}`} class="w-full p-2">
									{name}
								</a>
							</Command.Item>
						{/each}
					</Command.Group>
				{:else if currentGroupId}
					<div class="p-3 text-center text-sm text-muted-foreground">
						No other markets in this group
					</div>
				{:else}
					<div class="p-3 text-center text-sm text-muted-foreground">
						This market is not part of a group
					</div>
				{/if}
				<Command.Separator />
				<Command.Group>
					<Command.Item class="p-0" value="all markets" onSelect={() => onSelect()}>
						<a href="/market" class="w-full p-2 font-semibold italic"> View All Markets </a>
					</Command.Item>
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
