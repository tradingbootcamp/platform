<script lang="ts">
	import { parseMarketName } from '$lib/utils';

	let {
		name,
		fallback = '',
		variant = 'default',
		inGroup = false
	}: {
		name: string | null | undefined;
		fallback?: string;
		variant?: 'default' | 'compact';
		inGroup?: boolean;
	} = $props();

	let parsed = $derived(parseMarketName(name || fallback));
</script>

{#if variant === 'default'}
	<span class="flex flex-col">
		<span class="font-medium">{parsed.suffix}</span>
		{#if parsed.group && !inGroup}
			<span class="text-sm text-muted-foreground">{parsed.group}</span>
		{/if}
	</span>
{:else}
	<span>
		<span class="font-medium">{parsed.suffix}</span>
		{#if parsed.group && !inGroup}
			<span class="text-sm text-muted-foreground"> / {parsed.group}</span>
		{/if}
	</span>
{/if}
