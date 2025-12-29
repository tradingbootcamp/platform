<script lang="ts">
	import { Button, type ButtonSize } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import type { ComponentProps } from 'svelte';
	import { useSidebar } from './context.svelte.js';

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		size = 'icon' as ButtonSize,
		...restProps
	}: ComponentProps<typeof Button> & {
		onclick?: (e: MouseEvent) => void;
	} = $props();

	const sidebar = useSidebar();
</script>

<Button
	type="button"
	onclick={(e) => {
		onclick?.(e);
		sidebar.toggle();
	}}
	data-sidebar="trigger"
	variant="ghost"
	{size}
	class={cn(className)}
	{...restProps}
>
	<PanelLeft class="size-4" />
	<span class="sr-only">Toggle Sidebar</span>
</Button>
