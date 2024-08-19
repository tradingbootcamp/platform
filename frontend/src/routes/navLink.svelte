<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	export let href: string;
	let className: string | undefined = undefined;
	export { className as class };
</script>

<li>
	{#if href === $page.url.pathname}
		<Button class={cn('px-2 text-lg', className)} variant="link" disabled><slot /></Button>
	{:else}
		<a {href}>
			<Button class={cn('px-2 text-lg', className)} variant="link"><slot /></Button>
		</a>
	{/if}
</li>
