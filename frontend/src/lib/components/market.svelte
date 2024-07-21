<script lang="ts">
	import type { websocket_api } from 'schema-js';
	import type { Readable } from 'svelte/store';

	export let market: Readable<websocket_api.IMarket>;
</script>

<h2 class="mt-12 text-2xl font-bold">Market {$market.id}</h2>
<pre>{JSON.stringify($market, null, 2)}</pre>
