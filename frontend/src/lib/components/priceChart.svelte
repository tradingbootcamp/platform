<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { LineChart } from 'layerchart';
	import { websocket_api } from 'schema-js';

	interface Props {
		trades: websocket_api.ITrade[];
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
	}

	let { trades, minSettlement, maxSettlement }: Props = $props();

	const tradeTimestamp = (trade: websocket_api.ITrade) => {
		if (!trade) {
			return undefined;
		}
		const timestamp = serverState.transactions.get(trade.transactionId);
		return timestamp ? new Date(timestamp.seconds * 1000) : undefined;
	};
</script>

<div class="h-96 pt-4">
	<LineChart
		data={trades}
		x={tradeTimestamp}
		y="price"
		yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
		props={{ xAxis: { format: 15 }, yAxis: { grid: { class: 'stroke-surface-content/30' } } }}
		points
	/>
</div>
