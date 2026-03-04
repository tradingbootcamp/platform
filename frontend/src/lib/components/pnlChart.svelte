<script lang="ts">
	import type { PnLDataPoint } from '$lib/pnlMetrics';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart, Rule } from 'layerchart';

	interface Props {
		dataPoints: PnLDataPoint[];
		xDomain?: [Date, Date];
		highlightTimestamp?: Date;
		onHoverTimestamp?: (timestamp: Date | undefined) => void;
	}

	let { dataPoints, xDomain, highlightTimestamp, onHoverTimestamp }: Props = $props();

	let sidebar = useSidebar();

	// Chart scale captured from slot props for accurate mouse→timestamp mapping
	let chartXScale: any = $state(null);
	let chartPaddingLeft = $state(0);

	const handleMouseMove = (e: MouseEvent) => {
		if (!containerEl || !chartXScale?.invert) return;
		const svg = containerEl.querySelector('svg');
		if (!svg) return;
		const svgRect = svg.getBoundingClientRect();
		const plotX = e.clientX - svgRect.left - chartPaddingLeft;
		const ts = chartXScale.invert(plotX);
		onHoverTimestamp?.(ts instanceof Date ? ts : new Date(ts));
	};

	const handleMouseLeave = () => {
		onHoverTimestamp?.(undefined);
	};

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

	const formatTime = (d: Date) =>
		d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

	// PnL at the hovered timestamp (last data point at or before that time)
	const hoveredPnL = $derived.by(() => {
		if (!highlightTimestamp || !dataPoints.length) return undefined;
		const t = highlightTimestamp.getTime();
		let pnl: number | undefined;
		for (const dp of dataPoints) {
			if (dp.timestamp.getTime() <= t) pnl = dp.cumulativePnL;
			else break;
		}
		return pnl;
	});

	const formatPnL = (v: number) => {
		const sign = v >= 0 ? '+' : '';
		return `${sign}${Math.round(v).toLocaleString()}`;
	};
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={containerEl} class="pnl-chart h-[20rem] w-full pt-4 md:h-96" onmousemove={handleMouseMove} onmouseleave={handleMouseLeave}>
	{#if hasWidth && dataPoints.length > 1}
		<LineChart
			data={dataPoints}
			x="timestamp"
			y="cumulativePnL"
			{yDomain}
			xDomain={xDomain}
			props={{
				xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
				yAxis: { class: 'pnl-y-axis', grid: { class: 'stroke-surface-content/30' } }
			}}
			tooltip={false}
		>
			<svelte:fragment slot="belowMarks" let:xScale let:padding let:height>
				{@const _cap = ((chartXScale = xScale), (chartPaddingLeft = padding?.left ?? 0))}
				<Rule y={0} class="stroke-muted-foreground/60" stroke-dasharray="6 3" stroke-width="1.5" />
				{#if highlightTimestamp}
					<Rule x={highlightTimestamp} class="stroke-primary" stroke-width="1.5" stroke-dasharray="4 3" />
					<text
						x={xScale(highlightTimestamp)}
						y={height - (padding?.top ?? 0) - (padding?.bottom ?? 0) + 14}
						text-anchor="middle"
						font-size="10"
						font-weight="300"
						class="fill-primary"
					>
						{formatTime(highlightTimestamp)}
					</text>
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="aboveMarks" let:xScale let:yScale>
				{#if highlightTimestamp && hoveredPnL !== undefined}
					{@const tx = xScale(highlightTimestamp)}
					{@const ty = yScale(hoveredPnL)}
					{@const label = `PnL: ${formatPnL(hoveredPnL)}`}
					<rect
						x={tx + 4}
						y={ty - 14}
						width={label.length * 7.5 + 16}
						height={24}
						rx={4}
						fill="hsl(var(--background))"
					/>
					<text
						x={tx + 12}
						y={ty + 3}
						font-size="13"
						font-weight="600"
						fill={hoveredPnL >= 0 ? '#48ad5c' : '#d2605f'}
					>
						{label}
					</text>
				{/if}
			</svelte:fragment>
		</LineChart>
	{:else if dataPoints.length <= 1}
		<div class="flex h-full items-center justify-center text-muted-foreground">
			Not enough trade data to display chart
		</div>
	{/if}
</div>
