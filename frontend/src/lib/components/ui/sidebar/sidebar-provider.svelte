<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils.js';
	import type { WithElementRef } from 'bits-ui';
	import { onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SIDEBAR_COOKIE_NAME, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from './constants.js';
	import { setSidebar } from './context.svelte.js';

	// Read initial state from localStorage
	function getInitialOpen(): boolean {
		if (typeof window === 'undefined') return true;
		const stored = localStorage.getItem(SIDEBAR_COOKIE_NAME);
		if (stored === null) return true;
		return stored === 'true';
	}

	let {
		ref = $bindable(null),
		open = $bindable(getInitialOpen()),
		onOpenChange = () => {},
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	// Sync with localStorage after hydration to avoid SSR mismatch
	onMount(() => {
		const stored = localStorage.getItem(SIDEBAR_COOKIE_NAME);
		if (stored !== null) {
			open = stored === 'true';
		}
	});

	const sidebar = setSidebar({
		open: () => open,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			// Persist sidebar state to localStorage
			localStorage.setItem(SIDEBAR_COOKIE_NAME, String(open));
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
