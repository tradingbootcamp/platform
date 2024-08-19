<script lang="ts">
	import { websocket_api } from 'schema-js';
	import type { Readable } from 'svelte/store';

	export let market: Readable<websocket_api.IMarket> | undefined;
</script>

{$market?.name || 'Unnamed market'}
