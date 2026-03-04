<script lang="ts">
	import type { PnLDataPoint } from '$lib/pnlMetrics';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart, Rule } from 'layerchart';

	interface Props {
		dataPoints: PnLDataPoint[];
		xDomain?: [Date, Date];
		highlightClientX?: number;
		onHoverClientX?: (clientX: number | undefined) => void;
	}

	let { dataPoints, xDomain, highlightClientX, onHoverClientX }: Props = $props();

	let sidebar = useSidebar();

	const handleMouseMove = (e: MouseEvent) => {
		onHoverClientX?.(e.clientX);
	};

	const handleMouseLeave = () => {
		onHoverClientX?.(undefined);
	};

	// Convert clientX to plot-area x coordinate using the SVG's <g> CTM
	function clientXToPlotX(clientX: number): number | null {
		if (!containerEl) return null;
		const svg = containerEl.querySelector('svg');
		if (!svg) return null;
		const g = svg.querySelector<SVGGraphicsElement>(':scope > g');
		const ctm = g?.getScreenCTM();
		if (!ctm) return null;
		return (clientX - ctm.e) / ctm.a;
	}

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
				<Rule y={0} class="stroke-muted-foreground/60" stroke-dasharray="6 3" stroke-width="1.5" />
				{#if highlightClientX !== undefined}
					{@const plotX = clientXToPlotX(highlightClientX)}
					{#if plotX !== null}
						{@const ts = xScale.invert(plotX)}
						<line
							x1={plotX}
							y1={0}
							x2={plotX}
							y2={height - (padding?.top ?? 0) - (padding?.bottom ?? 0)}
							class="stroke-primary"
							stroke-width="1.5"
							stroke-dasharray="4 3"
						/>
						<text
							x={plotX}
							y={height - (padding?.top ?? 0) - (padding?.bottom ?? 0) + 14}
							text-anchor="middle"
							font-size="10"
							font-weight="300"
							class="fill-primary"
						>
							{formatTime(ts instanceof Date ? ts : new Date(ts))}
						</text>
					{/if}
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="aboveMarks" let:xScale let:yScale>
				{#if highlightClientX !== undefined}
					{@const plotX = clientXToPlotX(highlightClientX)}
					{#if plotX !== null}
						{@const ts = xScale.invert(plotX)}
						{@const t = (ts instanceof Date ? ts : new Date(ts)).getTime()}
						{@const pnl = (() => { let v: number | undefined; for (const dp of dataPoints) { if (dp.timestamp.getTime() <= t) v = dp.cumulativePnL; else break; } return v; })()}
						{#if pnl !== undefined}
							{@const tx = plotX}
							{@const ty = yScale(pnl)}
							{@const label = `PnL: ${formatPnL(pnl)}`}
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
								fill={pnl >= 0 ? '#48ad5c' : '#d2605f'}
							>
								{label}
							</text>
						{/if}
					{/if}
				{/if}
			</svelte:fragment>
		</LineChart>
	{:else if dataPoints.length <= 1}
		<div class="flex h-full items-center justify-center text-muted-foreground">
			Not enough trade data to display chart
		</div>
	{/if}
</div>
