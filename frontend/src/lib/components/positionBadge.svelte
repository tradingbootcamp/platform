<script lang="ts">
	import { cn } from '$lib/utils';

	export let value: number | string = 0;

	const numericValue = Number(value ?? 0);
	const variant = numericValue > 0 ? 'positive' : numericValue < 0 ? 'negative' : 'neutral';

	const baseClasses =
		'inline-flex min-w-[3rem] items-center justify-center rounded px-2 py-1 text-sm font-semibold';
	const variantClasses =
		variant === 'positive'
			? 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-200'
			: variant === 'negative'
				? 'bg-red-500/15 text-red-700 dark:bg-red-500/20 dark:text-red-200'
				: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200';
</script>

<span class={cn(baseClasses, variantClasses)}>{numericValue}</span>
