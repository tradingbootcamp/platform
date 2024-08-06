<script lang="ts">
	import { cn } from '$lib/utils.js';
	import type { HTMLTableAttributes } from 'svelte/elements';

	type $$Props = HTMLTableAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<!-- Originally has overflow-auto, but we don't have wide tables -->
<div class="relative w-full">
	<table class={cn('w-full caption-bottom text-sm', className)} {...$$restProps}>
		<slot />
	</table>
</div>
