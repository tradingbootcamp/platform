<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart } from 'layerchart';
	import { websocket_api } from 'schema-js';

	interface Props {
		trades: websocket_api.ITrade[];
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
	}

	let { trades, minSettlement, maxSettlement }: Props = $props();

	let sidebar = useSidebar();

	const tradeTimestamp = (trade: websocket_api.ITrade) => {
		if (!trade) {
			return undefined;
		}
		const timestamp = trade.transactionTimestamp;
		return timestamp ? new Date(timestamp.seconds * 1000) : undefined;
	};
</script>

<div class="h-[20rem] w-full pt-4 md:h-96">
	<LineChart
		data={trades}
		x={tradeTimestamp}
		y="price"
		yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
		props={{
			xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
			yAxis: { grid: { class: 'stroke-surface-content/30' } }
		}}
		tooltip={false}
	/>
</div>
