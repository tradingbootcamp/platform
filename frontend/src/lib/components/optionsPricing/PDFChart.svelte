<script lang="ts">
	import type { ControlPoint } from './optionsPricingMath';

	interface Props {
		controlPoints: ControlPoint[];
		onPointDrag: (index: number, newY: number) => void;
	}

	let { controlPoints, onPointDrag }: Props = $props();

	// Chart dimensions
	const width = 600;
	const height = 300;
	const padding = { top: 20, right: 30, bottom: 40, left: 50 };

	// Data bounds
	const xMin = 0;
	const xMax = 30;

	// Calculate y max from control points (with some headroom)
	let yMax = $derived(Math.max(0.1, ...controlPoints.map((p) => p.y)) * 1.2);

	// Scale functions
	function xScale(x: number): number {
		return padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right);
	}

	function yScale(y: number): number {
		return height - padding.bottom - (y / yMax) * (height - padding.top - padding.bottom);
	}

	function yScaleInverse(svgY: number): number {
		return ((height - padding.bottom - svgY) / (height - padding.top - padding.bottom)) * yMax;
	}

	// Generate the path for the filled area
	let areaPath = $derived.by(() => {
		if (controlPoints.length === 0) return '';

		let path = `M ${xScale(controlPoints[0].x)} ${yScale(0)}`;
		path += ` L ${xScale(controlPoints[0].x)} ${yScale(controlPoints[0].y)}`;

		for (let i = 1; i < controlPoints.length; i++) {
			path += ` L ${xScale(controlPoints[i].x)} ${yScale(controlPoints[i].y)}`;
		}

		path += ` L ${xScale(controlPoints[controlPoints.length - 1].x)} ${yScale(0)}`;
		path += ' Z';

		return path;
	});

	// Generate the path for the curve line
	let linePath = $derived.by(() => {
		if (controlPoints.length === 0) return '';

		let path = `M ${xScale(controlPoints[0].x)} ${yScale(controlPoints[0].y)}`;

		for (let i = 1; i < controlPoints.length; i++) {
			path += ` L ${xScale(controlPoints[i].x)} ${yScale(controlPoints[i].y)}`;
		}

		return path;
	});

	// Grid lines
	const xGridLines = [0, 5, 10, 15, 20, 25, 30];
	const yGridCount = 5;
	let yGridLines = $derived(
		Array.from({ length: yGridCount + 1 }, (_, i) => (i / yGridCount) * yMax)
	);

	// Drag state
	let dragIndex = $state<number | null>(null);
	let svgRef = $state<SVGSVGElement | null>(null);

	function handlePointerDown(index: number, event: PointerEvent) {
		dragIndex = index;
		(event.target as SVGCircleElement).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (dragIndex === null || !svgRef) return;

		const svg = svgRef;
		const point = svg.createSVGPoint();
		point.x = event.clientX;
		point.y = event.clientY;

		const ctm = svg.getScreenCTM();
		if (!ctm) return;

		const svgPoint = point.matrixTransform(ctm.inverse());
		const newY = yScaleInverse(svgPoint.y);

		onPointDrag(dragIndex, Math.max(0, newY));
	}

	function handlePointerUp() {
		dragIndex = null;
	}
</script>

<div class="w-full">
	<svg
		bind:this={svgRef}
		viewBox="0 0 {width} {height}"
		class="w-full"
		style="max-height: 400px;"
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointerleave={handlePointerUp}
	>
		<!-- Grid lines -->
		{#each xGridLines as x}
			<line
				x1={xScale(x)}
				y1={padding.top}
				x2={xScale(x)}
				y2={height - padding.bottom}
				class="stroke-muted-foreground/20"
				stroke-width="1"
			/>
		{/each}
		{#each yGridLines as y}
			<line
				x1={padding.left}
				y1={yScale(y)}
				x2={width - padding.right}
				y2={yScale(y)}
				class="stroke-muted-foreground/20"
				stroke-width="1"
			/>
		{/each}

		<!-- X-axis -->
		<line
			x1={padding.left}
			y1={height - padding.bottom}
			x2={width - padding.right}
			y2={height - padding.bottom}
			class="stroke-muted-foreground"
			stroke-width="1"
		/>

		<!-- Y-axis -->
		<line
			x1={padding.left}
			y1={padding.top}
			x2={padding.left}
			y2={height - padding.bottom}
			class="stroke-muted-foreground"
			stroke-width="1"
		/>

		<!-- X-axis labels -->
		{#each xGridLines as x}
			<text
				x={xScale(x)}
				y={height - padding.bottom + 20}
				text-anchor="middle"
				class="fill-muted-foreground text-xs"
			>
				{x}
			</text>
		{/each}

		<!-- X-axis title -->
		<text
			x={(padding.left + width - padding.right) / 2}
			y={height - 5}
			text-anchor="middle"
			class="fill-muted-foreground text-sm"
		>
			Stock Price
		</text>

		<!-- Y-axis labels -->
		{#each yGridLines as y, i}
			{#if i > 0}
				<text
					x={padding.left - 10}
					y={yScale(y) + 4}
					text-anchor="end"
					class="fill-muted-foreground text-xs"
				>
					{y.toFixed(2)}
				</text>
			{/if}
		{/each}

		<!-- Y-axis title -->
		<text
			x={15}
			y={(padding.top + height - padding.bottom) / 2}
			text-anchor="middle"
			transform="rotate(-90, 15, {(padding.top + height - padding.bottom) / 2})"
			class="fill-muted-foreground text-sm"
		>
			Probability Density
		</text>

		<!-- Filled area under curve -->
		<path d={areaPath} class="fill-primary/20" />

		<!-- Curve line -->
		<path d={linePath} class="fill-none stroke-primary" stroke-width="2" />

		<!-- Draggable control points -->
		{#each controlPoints as point, i}
			<circle
				cx={xScale(point.x)}
				cy={yScale(point.y)}
				r="8"
				class="cursor-grab fill-primary stroke-background transition-colors hover:fill-primary/80"
				class:cursor-grabbing={dragIndex === i}
				stroke-width="2"
				onpointerdown={(e) => handlePointerDown(i, e)}
				role="slider"
				aria-label="Control point at x={point.x}"
				aria-valuenow={point.y}
				tabindex="0"
			/>
		{/each}
	</svg>
</div>
