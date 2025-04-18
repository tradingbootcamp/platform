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
	@keyframes wave {
		0%,
		100% {
			border-radius: 15% 12% 10% 17% / 17% 10% 17% 12%;
		}
		25% {
			border-radius: 10% 15% 17% 12% / 15% 17% 10% 15%;
		}
		50% {
			border-radius: 12% 17% 10% 15% / 12% 10% 17% 15%;
		}
		75% {
			border-radius: 17% 10% 15% 12% / 10% 15% 12% 17%;
		}
	}

	.wavy-frame {
		position: relative;
		z-index: 0;
	}

	.wavy-frame::before {
		content: '';
		position: absolute;
		z-index: -1;
		inset: var(--wavy-frame-inset, -15px);
		background: linear-gradient(45deg, #4a148c, #7b1fa2, #9c27b0);
		border-radius: 15% 12% 10% 17% / 17% 10% 17% 12%;
		animation: wave 8s ease-in-out infinite;
	}
</style>
