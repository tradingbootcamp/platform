<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	let popoverOpen = $state(false);
	let popoverTriggerRef = $state<HTMLButtonElement>(null!);

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closePopoverAndFocusTrigger() {
		popoverOpen = false;
		tick().then(() => {
			popoverTriggerRef.focus();
		});
	}

	let availableMarkets = $derived.by(() => {
		return [...serverState.markets.entries()]
			.map(([id, market]) => ({
				id,
				name: market.definition.name || `Market ${id}`,
				isOpen: market.definition.open ? true : false,
				transactionId: Number(market.definition.transactionId || 0)
			}))
			.sort((a, b) => {
				if (a.isOpen !== b.isOpen) {
					return a.isOpen ? -1 : 1;
				}
				return b.transactionId - a.transactionId;
			});
	});
</script>

<div class="relative">
	<Popover.Root bind:open={popoverOpen}>
		<Popover.Trigger
			class={cn(
				buttonVariants({ variant: 'ghost' }),
				'text-md flex w-48 justify-between font-normal'
			)}
			role="combobox"
			bind:ref={popoverTriggerRef}
		>
			<span>
				<em class="pl-2">Select Market</em>
			</span>
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Popover.Trigger>
		<Popover.Content class="w-48 p-0">
			<Command.Root>
				<Command.Input autofocus placeholder="Search markets..." class="h-9" />
				<Command.Empty>No markets available</Command.Empty>
				<Command.Group>
					{#each availableMarkets as { id, name } (id)}
						<Command.Item value={name} onSelect={() => closePopoverAndFocusTrigger()}>
							<a href={`/market/${id}`} class="flex w-full">
								{name}
							</a>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
