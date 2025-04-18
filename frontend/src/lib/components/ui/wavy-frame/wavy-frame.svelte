<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> = $props();
</script>

<span bind:this={ref} class={cn('wavy-frame', className)} {...restProps}>
	{@render children?.()}
</span>

<style>
	.wavy-frame {
		position: relative;
		z-index: 0;
		display: inline-block;
		border: 3px solid purple;
		padding: 10px;
		box-sizing: border-box;
	}

	.wavy-frame::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: -6px;
		border: 3px solid red;
		box-sizing: border-box;
	}
</style>
