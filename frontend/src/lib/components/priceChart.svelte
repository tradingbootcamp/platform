<script lang="ts">
	import { LineChart } from 'layerchart';
	import { websocket_api } from 'schema-js';

	interface Props {
		trades: websocket_api.ITrade[];
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
	}

	let { trades, minSettlement, maxSettlement }: Props = $props();
</script>

<div class="h-96 pt-4">
	<LineChart
		data={trades}
		x={(trade: websocket_api.ITrade) => new Date(trade?.transactionTimestamp?.seconds * 1000)}
		y="price"
		yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
		props={{ xAxis: { format: 15 }, yAxis: { grid: { class: 'stroke-surface-content/30' } } }}
		tooltip={false}
	/>
</div>
