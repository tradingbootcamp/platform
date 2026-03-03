<script lang="ts">
	import type { PnLDataPoint } from '$lib/pnlMetrics';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart, Rule } from 'layerchart';

	interface Props {
		dataPoints: PnLDataPoint[];
	}

	let { dataPoints }: Props = $props();

	let sidebar = useSidebar();

	// Ensure y-domain always includes 0 so the zero line is visible
	let yDomain = $derived.by(() => {
		if (dataPoints.length === 0) return [0, 0] as [number, number];
		let min = Infinity;
		let max = -Infinity;
		for (const dp of dataPoints) {
			if (dp.cumulativePnL < min) min = dp.cumulativePnL;
			if (dp.cumulativePnL > max) max = dp.cumulativePnL;
		}
		return [Math.min(min, 0), Math.max(max, 0)] as [number, number];
	});

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

	// Color y-axis tick labels: muted green for positive, muted red for negative
	function colorTickLabels() {
		if (!containerEl) return;
		// Target only tick labels inside the y-axis group (marked with pnl-y-axis class)
		const yAxisGroup = containerEl.querySelector('g.pnl-y-axis');
		if (!yAxisGroup) return;
		const tickLabels = yAxisGroup.querySelectorAll('text.tickLabel');
		for (const el of tickLabels) {
			const text = el.textContent?.trim() ?? '';
			const value = parseFloat(text.replace(/,/g, ''));
			if (isNaN(value)) continue;
			if (value > 0) {
				el.classList.remove('fill-surface-content');
				(el as SVGElement).style.fill = '#48ad5c';
			} else if (value < 0) {
				el.classList.remove('fill-surface-content');
				(el as SVGElement).style.fill = '#d2605f';
			} else {
				el.classList.add('fill-surface-content');
				(el as SVGElement).style.fill = '';
			}
		}
	}

	// Use MutationObserver to color labels whenever the chart SVG updates
	$effect(() => {
		if (!containerEl || !hasWidth || dataPoints.length <= 1) return;
		const observer = new MutationObserver(() => colorTickLabels());
		observer.observe(containerEl, { childList: true, subtree: true });
		// Also run immediately after a frame in case SVG is already rendered
		requestAnimationFrame(() => colorTickLabels());
		return () => observer.disconnect();
	});
</script>

<div bind:this={containerEl} class="pnl-chart h-[20rem] w-full pt-4 md:h-96">
	{#if hasWidth && dataPoints.length > 1}
		<LineChart
			data={dataPoints}
			x="timestamp"
			y="cumulativePnL"
			{yDomain}
			props={{
				xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
				yAxis: { class: 'pnl-y-axis', grid: { class: 'stroke-surface-content/30' } }
			}}
			tooltip={false}
		>
			<svelte:fragment slot="belowMarks">
				<Rule y={0} class="stroke-muted-foreground/60" stroke-dasharray="6 3" stroke-width="1.5" />
			</svelte:fragment>
		</LineChart>
	{:else if dataPoints.length <= 1}
		<div class="flex h-full items-center justify-center text-muted-foreground">
			Not enough trade data to display chart
		</div>
	{/if}
</div>
