<!-- Only rerender when there's a new trade -->
<svelte:options immutable={true} />

<script lang="ts">
	import { CategoryScale, Chart, Colors, LinearScale, LineElement, PointElement } from 'chart.js';
	import { mode } from 'mode-watcher';
	import { websocket_api } from 'schema-js';
	import { Line } from 'svelte-chartjs';

	export let trades: websocket_api.ITrade[];
	export let minSettlement: string | null | undefined;
	export let maxSettlement: string | null | undefined;

	Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Colors);
</script>

<Line
	data={{
		labels: Array.from({ length: trades.length }, (_, i) => i),
		datasets: [{ label: 'Price', data: trades.map((t) => Number(t.price)) }]
	}}
	options={{
		animation: false,
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				enabled: false
			}
		},
		responsive: true,
		scales: {
			x: { ticks: { display: false } },
			y: {
				min: Number(minSettlement),
				max: Number(maxSettlement),
				ticks: {
					callback: function (value) {
						if (value === Number(minSettlement)) {
							return `Min: ${minSettlement}`;
						}
						if (value === Number(maxSettlement)) {
							return `Max: ${maxSettlement}`;
						}
						return value;
					},
					color: $mode === 'light' ? 'hsl(222.2 84% 4.9%)' : 'hsl(210 40% 98%)'
				},
				grid: {
					color: $mode === 'light' ? 'hsl(215.4 16.3% 46.9%)' : 'hsl(215 20.2% 65.1%)'
				},
				border: { color: $mode === 'light' ? 'hsl(215.4 16.3% 46.9%)' : 'hsl(215 20.2% 65.1%)' }
			}
		}
	}}
/>
