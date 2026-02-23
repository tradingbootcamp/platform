<script lang="ts">
	import type { PnLDataPoint } from '$lib/pnlMetrics';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart } from 'layerchart';

	interface Props {
		dataPoints: PnLDataPoint[];
	}

	let { dataPoints }: Props = $props();

	let sidebar = useSidebar();

	// Track container width to avoid LayerCake zero-width warning
	let containerEl: HTMLDivElement | undefined = $state();
	let hasWidth = $state(false);
	$effect(() => {
		if (!containerEl) return;
		const observer = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				if (containerEl) {
					hasWidth = containerEl.offsetWidth > 0;
				}
			});
		});
		observer.observe(containerEl);
		return () => observer.disconnect();
	});
</script>

<div bind:this={containerEl} class="h-[20rem] w-full pt-4 md:h-96">
	{#if hasWidth && dataPoints.length > 1}
		<LineChart
			data={dataPoints}
			x="timestamp"
			y="cumulativePnL"
			props={{
				xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
				yAxis: { grid: { class: 'stroke-surface-content/30' } }
			}}
			tooltip={false}
		/>
	{:else if dataPoints.length <= 1}
		<div class="flex h-full items-center justify-center text-muted-foreground">
			Not enough trade data to display chart
		</div>
	{/if}
</div>
