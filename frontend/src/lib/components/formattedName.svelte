<script lang="ts">
	import { parseAltName, formatUsername } from '$lib/utils';

	let {
		name,
		fallback = '',
		inGroup = false
	}: { name: string | null | undefined; fallback?: string; inGroup?: boolean } = $props();

	let parsed = $derived(parseAltName(name || fallback));
	let displayName = $derived(inGroup ? formatUsername(parsed.name, 'compact') : parsed.name);
</script>

<span class:italic={parsed.isAlt}>{displayName}</span>
