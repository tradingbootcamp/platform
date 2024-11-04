<script lang="ts">
	import { websocket_api } from 'schema-js';
	import type { Readable } from 'svelte/store';

	interface Props {
		market: Readable<websocket_api.IMarket> | undefined;
	}

	let { market }: Props = $props();
</script>

{$market?.name || 'Unnamed market'}
