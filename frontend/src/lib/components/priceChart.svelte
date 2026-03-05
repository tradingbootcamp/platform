<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart, Points, Rule, type Point } from 'layerchart';
	import { websocket_api } from 'schema-js';

	interface Props {
		trades: websocket_api.ITrade[];
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
		showMyTrades?: boolean;
		accountId?: number;
		xDomain?: [Date, Date];
		highlightClientX?: number;
		settlePrice?: number;
		onTradeClick?: (trade: websocket_api.ITrade, clientX: number) => void;
		onHoverClientX?: (clientX: number | undefined) => void;
	}

	let { trades, minSettlement, maxSettlement, showMyTrades = true, accountId, xDomain, highlightClientX, settlePrice, onTradeClick, onHoverClientX }: Props = $props();

	// Chart scales captured from slot props for tooltip positioning
	let chartXScale: any = $state(null);
	let chartYScale: any = $state(null);

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

	// Convert SVG plot coordinates to container-relative pixel coordinates
	function plotToContainer(plotX: number, plotY: number): { x: number; y: number } | null {
		if (!containerEl) return null;
		const svg = containerEl.querySelector('svg');
		if (!svg) return null;
		const g = svg.querySelector<SVGGraphicsElement>(':scope > g');
		const ctm = g?.getScreenCTM();
		const containerRect = containerEl.getBoundingClientRect();
		if (!ctm) return null;
		return {
			x: ctm.a * plotX + ctm.e - containerRect.left,
			y: ctm.d * plotY + ctm.f - containerRect.top
		};
	}

	// Last price tooltip derived reactively from highlightClientX + captured scales
	const lastPriceTooltipData = $derived.by(() => {
		if (highlightClientX === undefined || !chartXScale || !chartYScale) return undefined;
		const plotX = clientXToPlotX(highlightClientX);
		if (plotX === null) return undefined;
		const ts = chartXScale.invert(plotX);
		const t = (ts instanceof Date ? ts : new Date(ts)).getTime();
		let lastPrice: number | undefined;
		for (const trade of trades) {
			const tts = trade.transactionTimestamp;
			if (tts && tts.seconds * 1000 <= t) lastPrice = trade.price ?? lastPrice;
			else if (tts && tts.seconds * 1000 > t) break;
		}
		if (lastPrice === undefined) return undefined;
		return { price: lastPrice, plotX, plotY: chartYScale(lastPrice) };
	});

	let sidebar = useSidebar();

	const tradeTimestamp = (trade: websocket_api.ITrade) => {
		if (!trade) {
			return undefined;
		}
		const timestamp = trade.transactionTimestamp;
		return timestamp ? new Date(timestamp.seconds * 1000) : undefined;
	};

	const formatTradeTooltip = (trade: websocket_api.ITrade) => {
		const ts = trade.transactionTimestamp;
		if (!ts) return { price: '', size: '', time: '' };
		const date = new Date(ts.seconds * 1000);
		const time = date.toLocaleTimeString();
		const price = trade.price ?? '';
		const size = trade.size ?? '';
		return { price: `Price: ${price}`, size: `Size: ${size}`, time };
	};

	// Tooltip state
	let tooltipText = $state<{ price: string; size: string; time: string }>({ price: '', size: '', time: '' });
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipVisible = $state(false);
	let tooltipSide = $state<'buy' | 'sell'>('buy');
	let lineTooltipActive = $state(false);

	const showTooltip = (e: MouseEvent, trade: websocket_api.ITrade, side: 'buy' | 'sell') => {
		if (lineTooltipActive) return; // Line tooltip takes precedence
		if (!containerEl) return;
		const containerRect = containerEl.getBoundingClientRect();
		tooltipText = formatTradeTooltip(trade);
		tooltipX = e.clientX - containerRect.left;
		tooltipY = e.clientY - containerRect.top;
		tooltipSide = side;
		tooltipVisible = true;
	};

	const hideTooltip = () => {
		if (lineTooltipActive) return;
		tooltipVisible = false;
	};

	// Get current user's account ID (allow override via prop)
	const activeAccountId = $derived(accountId ?? serverState.actingAs ?? serverState.userId);

	// Filter trades where the user was the buyer (they bought - green)
	const userBuyTrades = $derived(trades.filter((trade) => trade.buyerId === activeAccountId));

	// Filter trades where the user was the seller (they sold - red)
	const userSellTrades = $derived(trades.filter((trade) => trade.sellerId === activeAccountId));

	// Find the nearest account trade to the highlight line
	const lineHighlightedTrade = $derived.by(() => {
		if (highlightClientX === undefined || !chartXScale || !showMyTrades) return null;

		const plotX = clientXToPlotX(highlightClientX);
		if (plotX === null) return null;

		let closest: { trade: websocket_api.ITrade; side: 'buy' | 'sell'; dist: number } | null = null;

		for (const trade of userBuyTrades) {
			const ts = tradeTimestamp(trade);
			if (!ts) continue;
			const dist = Math.abs(chartXScale(ts) - plotX);
			if (!closest || dist < closest.dist) closest = { trade, side: 'buy', dist };
		}
		for (const trade of userSellTrades) {
			const ts = tradeTimestamp(trade);
			if (!ts) continue;
			const dist = Math.abs(chartXScale(ts) - plotX);
			if (!closest || dist < closest.dist) closest = { trade, side: 'sell', dist };
		}

		return closest && closest.dist <= 8 ? { trade: closest.trade, side: closest.side } : null;
	});

	// Show tooltip when line is near a trade
	$effect(() => {
		const match = lineHighlightedTrade;
		if (match && containerEl && chartXScale && chartYScale) {
			const { trade, side } = match;
			const svg = containerEl.querySelector('svg');
			if (!svg) return;
			const ts = tradeTimestamp(trade);
			if (!ts) return;

			// Position relative to container using SVG CTM offset from container
			const g = svg.querySelector<SVGGraphicsElement>(':scope > g');
			const ctm = g?.getScreenCTM();
			const containerRect = containerEl.getBoundingClientRect();
			if (!ctm) return;

			const px = chartXScale(ts);
			const py = chartYScale(trade.price ?? 0);

			tooltipText = formatTradeTooltip(trade);
			tooltipX = ctm.a * px + ctm.e - containerRect.left;
			tooltipY = ctm.d * py + ctm.f - containerRect.top;
			tooltipSide = side;
			tooltipVisible = true;
			lineTooltipActive = true;
		} else {
			if (lineTooltipActive) {
				tooltipVisible = false;
				lineTooltipActive = false;
			}
		}
	});

	// Track container width to avoid LayerCake zero-width warning
	let containerEl: HTMLDivElement | undefined = $state();
	let hasWidth = $state(false);
	$effect(() => {
		if (!containerEl) return;
		const observer = new ResizeObserver(() => {
			// Use rAF to ensure layout is stable before rendering chart
			requestAnimationFrame(() => {
				if (containerEl) {
					hasWidth = containerEl.offsetWidth > 0;
				}
			});
		});
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	const formatTime = (d: Date) =>
		d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={containerEl} class="relative h-[20rem] w-full pt-4 md:h-96" onmousemove={handleMouseMove} onmouseleave={handleMouseLeave}>
	{#if lastPriceTooltipData && containerEl}
		{@const pos = plotToContainer(lastPriceTooltipData.plotX, lastPriceTooltipData.plotY)}
		{#if pos}
			{@const flipX = pos.x + 8 + 160 > containerEl.offsetWidth}
			{@const flipY = pos.y - 40 < 0}
			<div
				class="pointer-events-none absolute z-50 rounded-md border border-primary/30 px-3 py-1.5 text-[15px] font-semibold text-primary shadow-sm"
				style="left: {flipX ? pos.x - 168 : pos.x + 8}px; top: {flipY ? pos.y + 8 : pos.y - 40}px; background: hsl(var(--background));"
			>
				Last: {lastPriceTooltipData.price % 1 === 0 ? lastPriceTooltipData.price.toFixed(1) : lastPriceTooltipData.price}
			</div>
		{/if}
	{/if}
	{#if tooltipVisible && containerEl}
		{@const flipX = tooltipX - 120 < 0}
		{@const flipY = tooltipY - 70 < 0}
		<div
			class="pointer-events-none absolute z-50 rounded border px-2 py-1 text-xs shadow-md {tooltipSide === 'buy' ? 'border-green-300 bg-green-50 text-green-950 dark:border-green-700 dark:bg-green-950 dark:text-green-100' : 'border-red-300 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950 dark:text-red-100'}"
			style="left: {flipX ? tooltipX + 10 : tooltipX - 120}px; top: {flipY ? tooltipY + 10 : tooltipY - 70}px;"
		>
			<div class="font-semibold">{tooltipSide === 'buy' ? 'Bought' : 'Sold'}</div>
			<div>{tooltipText.price}</div>
			<div>{tooltipText.size}</div>
			<div class="text-muted-foreground">{tooltipText.time}</div>
		</div>
	{/if}
	{#if hasWidth}
		<LineChart
			data={trades}
			x={tradeTimestamp}
			y="price"
			yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
			xDomain={xDomain}
			props={{
				xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
				yAxis: { grid: { class: 'stroke-surface-content/30' } }
			}}
			tooltip={false}
		>
			<svelte:fragment slot="belowMarks" let:xScale let:yScale let:width let:padding let:height>
				{@const _cap = ((chartXScale = xScale), (chartYScale = yScale))}
				{#if settlePrice !== undefined}
					<Rule y={settlePrice} class="stroke-yellow-500/50" stroke-width="2.5" stroke-dasharray="6 3" />
					<text
						x={width - (padding?.right ?? 0)}
						y={yScale(settlePrice) - 6}
						text-anchor="end"
						class="fill-yellow-600 dark:fill-yellow-400"
						font-size="10"
						font-weight="300"
					>
						Settled: {settlePrice % 1 === 0 ? settlePrice.toFixed(1) : settlePrice}
					</text>
				{/if}
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
			<svelte:fragment slot="aboveMarks">
				{#if showMyTrades}
					<!-- User buy trades (green up triangles) -->
					{#if userBuyTrades.length > 0}
						<Points data={userBuyTrades} r={5}>
							{#snippet children({ points }: { points: Point[] })}
								<g class="point-group">
									{#each points as point}
										{@const r = point.r}
										<polygon
											points="{point.x},{point.y - r} {point.x - r},{point.y + r} {point.x +
												r},{point.y + r}"
											fill="#22c55e"
											stroke="#15803d"
											stroke-width="1"
											class="cursor-pointer hover:opacity-80"
											role="button"
											tabindex="0"
											onclick={(e) => onTradeClick?.(point.data, e.clientX)}
											onkeydown={(e) => e.key === 'Enter' && onTradeClick?.(point.data, 0)}
											onmouseenter={(e) => showTooltip(e, point.data, 'buy')}
											onmouseleave={hideTooltip}
										/>
									{/each}
								</g>
							{/snippet}
						</Points>
					{/if}

					<!-- User sell trades (red down triangles) -->
					{#if userSellTrades.length > 0}
						<Points data={userSellTrades} r={5}>
							{#snippet children({ points }: { points: Point[] })}
								<g class="point-group">
									{#each points as point}
										{@const r = point.r}
										<polygon
											points="{point.x},{point.y + r} {point.x - r},{point.y - r} {point.x +
												r},{point.y - r}"
											fill="#ef4444"
											stroke="#b91c1c"
											stroke-width="1"
											class="cursor-pointer hover:opacity-80"
											role="button"
											tabindex="0"
											onclick={(e) => onTradeClick?.(point.data, e.clientX)}
											onkeydown={(e) => e.key === 'Enter' && onTradeClick?.(point.data, 0)}
											onmouseenter={(e) => showTooltip(e, point.data, 'sell')}
											onmouseleave={hideTooltip}
										/>
									{/each}
								</g>
							{/snippet}
						</Points>
					{/if}
				{/if}
			</svelte:fragment>
		</LineChart>
	{/if}
</div>
