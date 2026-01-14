<script lang="ts">
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-nocheck - bits-ui slider types are complex discriminated unions
	import { Slider as SliderPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	interface Props {
		ref?: HTMLSpanElement | null;
		value?: number[];
		class?: string;
		type?: 'single' | 'multiple';
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
	}

	let {
		ref = $bindable(null),
		value = $bindable([0]),
		class: className,
		type = 'single',
		min,
		max,
		step,
		disabled
	}: Props = $props();
</script>

<SliderPrimitive.Root
	bind:ref
	bind:value
	class={cn('relative flex w-full touch-none select-none items-center', className)}
	{type}
	{min}
	{max}
	{step}
	{disabled}
>
	{#snippet children({ thumbs })}
		<span class="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
			<SliderPrimitive.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbs as thumb}
			<SliderPrimitive.Thumb
				index={thumb}
				class="block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
