<script lang="ts">
	import { browser } from '$app/environment';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils.js';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from './constants.js';
	import { setSidebar } from './context.svelte.js';

	const SIDEBAR_STORAGE_KEY = 'sidebar:state';

	// Read initial state from localStorage
	function getInitialOpenState(): boolean {
		if (browser) {
			const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
			if (stored !== null) {
				return stored === 'true';
			}
		}
		return true; // Default to open
	}

	let {
		ref = $bindable(null),
		open = $bindable(getInitialOpenState()),
		onOpenChange = () => {},
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	const sidebar = setSidebar({
		open: () => open,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			// Persist sidebar state to localStorage
			if (browser) {
				localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
			}
		}
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<Tooltip.Provider delayDuration={0}>
	<div
		style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
		class={cn(
			'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
			className
		)}
		bind:this={ref}
		{...restProps}
	>
		{@render children?.()}
	</div>
</Tooltip.Provider>
