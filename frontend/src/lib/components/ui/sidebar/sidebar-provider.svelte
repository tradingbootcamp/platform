<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils.js';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		SIDEBAR_COOKIE_MAX_AGE,
		SIDEBAR_COOKIE_NAME,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON
	} from './constants.js';
	import { setSidebar } from './context.svelte.js';

	const MIN_SIDEBAR_WIDTH = 200;
	const MAX_SIDEBAR_WIDTH = 400;
	const DEFAULT_SIDEBAR_WIDTH = parseInt(SIDEBAR_WIDTH) * 16; // Convert rem to px (16rem = 256px)

	let {
		ref = $bindable(null),
		open = $bindable(true),
		onOpenChange = () => {},
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	let sidebarWidth = $state(DEFAULT_SIDEBAR_WIDTH);
	let isResizing = $state(false);

	const sidebar = setSidebar({
		open: () => open,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			// This sets the cookie to keep the sidebar state.
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
		}
	});

	function handleMouseDown(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;

		const startX = e.clientX;
		const startWidth = sidebarWidth;

		function handleMouseMove(e: MouseEvent) {
			const delta = e.clientX - startX;
			const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidth + delta));
			sidebarWidth = newWidth;
		}

		function handleMouseUp() {
			isResizing = false;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	// Expose the resize handler for use by child components
	const resizeContext = {
		handleMouseDown,
		get isResizing() {
			return isResizing;
		}
	};
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<Tooltip.Provider delayDuration={0}>
	<div
		style="--sidebar-width: {sidebarWidth}px; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
		class={cn(
			'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
			isResizing && 'cursor-ew-resize select-none',
			className
		)}
		bind:this={ref}
		data-resizing={isResizing}
		{...restProps}
	>
		{@render children?.()}
		{#if open}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<div
				class="fixed left-[var(--sidebar-width)] top-0 z-50 hidden h-full w-1 cursor-ew-resize opacity-0 transition-opacity hover:bg-primary/20 hover:opacity-100 md:block"
				onmousedown={handleMouseDown}
				role="separator"
				aria-orientation="vertical"
				tabindex="-1"
			></div>
		{/if}
	</div>
</Tooltip.Provider>
