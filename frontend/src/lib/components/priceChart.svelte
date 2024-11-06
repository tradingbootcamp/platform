<script lang="ts">
	import { LineChart } from 'layerchart';
	import { websocket_api } from 'schema-js';

	interface Props {
		trades: websocket_api.ITrade[];
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
	}

	let { trades, minSettlement, maxSettlement }: Props = $props();

	let data = $derived(trades.map((trade, i) => [i, trade.price]));
</script>

<div class="h-96 pt-4">
	<LineChart
		{data}
		x={0}
		y={1}
		yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
		props={{ xAxis: { ticks: 0 }, yAxis: { grid: { class: 'stroke-surface-content/30' } } }}
		tooltip={false}
	/>
</div>
