<script lang="ts">
	import { websocket_api } from 'schema-js';

	interface Props {
		market: websocket_api.IMarket | undefined;
	}

	let { market }: Props = $props();
</script>

{market?.name || 'Unnamed market'}
