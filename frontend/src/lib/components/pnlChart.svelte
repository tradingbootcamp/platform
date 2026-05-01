<script lang="ts">
	import type { PnLDataPoint } from '$lib/pnlMetrics';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart, Rule } from 'layerchart';
	import type { PauseInterval } from '$lib/marketTime';

	interface Props {
		dataPoints: PnLDataPoint[];
		xDomain?: [Date, Date];
		pauseOverlays?: PauseInterval[];
	}

	let { dataPoints, xDomain, pauseOverlays = [] }: Props = $props();

	// Step-after curve so the line jumps trade-by-trade rather than
	// interpolating diagonals between events.
	type PathCtx = { moveTo: (x: number, y: number) => void; lineTo: (x: number, y: number) => void };
	function curveStepAfter(context: PathCtx) {
		let y = NaN;
		let point = 0;
		return {
			areaStart() {},
			areaEnd() {},
			lineStart() {
				y = NaN;
				point = 0;
			},
			lineEnd() {},
			point(nx: number, ny: number) {
				nx = +nx;
				ny = +ny;
				if (point === 0) {
					context.moveTo(nx, ny);
					point = 1;
				} else {
					context.lineTo(nx, y);
					context.lineTo(nx, ny);
				}
				y = ny;
			}
		};
	}

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

	$effect(() => {
		if (!containerEl || !hasWidth || dataPoints.length <= 1) return;
		const observer = new MutationObserver(() => colorTickLabels());
		observer.observe(containerEl, { childList: true, subtree: true });
		requestAnimationFrame(() => colorTickLabels());
		return () => observer.disconnect();
	});
</script>

<div bind:this={containerEl} class="pnl-chart relative h-[20rem] w-full pt-4 md:h-96">
	{#if hasWidth && dataPoints.length > 1}
		<LineChart
			data={dataPoints}
			x="timestamp"
			y="cumulativePnL"
			{yDomain}
			{xDomain}
			props={{
				xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
				yAxis: { class: 'pnl-y-axis', grid: { class: 'stroke-surface-content/30' } },
				spline: { curve: curveStepAfter }
			}}
			tooltip={false}
		>
			<svelte:fragment slot="belowMarks" let:xScale let:padding let:height>
				<Rule y={0} class="stroke-muted-foreground/60" stroke-dasharray="6 3" stroke-width="1.5" />
				{#if pauseOverlays.length > 0}
					{@const plotBottom = height - (padding?.top ?? 0) - (padding?.bottom ?? 0)}
					{#each pauseOverlays as iv, i (i)}
						{@const x1 = xScale(new Date(iv.start))}
						{@const x2 = xScale(new Date(iv.end))}
						<rect
							x={Math.min(x1, x2)}
							y={0}
							width={Math.max(1, Math.abs(x2 - x1))}
							height={plotBottom}
							class="pointer-events-none fill-muted-foreground/15"
						/>
					{/each}
				{/if}
			</svelte:fragment>
		</LineChart>
	{:else if dataPoints.length <= 1}
		<div class="flex h-full items-center justify-center text-muted-foreground">
			Not enough trade data to display chart
		</div>
	{/if}
</div>
