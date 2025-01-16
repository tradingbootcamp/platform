<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	interface Props {
		href: string;
		class?: string | undefined;
		children?: import('svelte').Snippet;
	}

	let { href, class: className = undefined, children }: Props = $props();
</script>

<li>
	{#if href === $page.url.pathname}
		<Button class={cn('px-2 text-lg', className)} variant="link" disabled
			>{@render children?.()}</Button
		>
	{:else}
		<a {href}>
			<Button class={cn('px-2 text-lg', className)} variant="link">{@render children?.()}</Button>
		</a>
	{/if}
</li>
