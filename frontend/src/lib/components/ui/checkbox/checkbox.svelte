<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type Props = WithElementRef<HTMLInputAttributes> & {
		checked?: boolean;
	};

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className,
		...restProps
	}: Props = $props();
</script>

<input
	bind:this={ref}
	type="checkbox"
	bind:checked
	class={cn(
		'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
		className
	)}
	{...restProps}
/>
