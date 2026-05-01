<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { Input } from '$lib/components/ui/input';
	import * as Popover from '$lib/components/ui/popover';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import ArrowsInLineVertical from 'phosphor-svelte/lib/ArrowsInLineVertical';
	import ArrowsOutLineVertical from 'phosphor-svelte/lib/ArrowsOutLineVertical';
	import Ruler from 'phosphor-svelte/lib/Ruler';
	import Check from 'phosphor-svelte/lib/Check';
	import { LineChart, Points, Rule, type Point } from 'layerchart';
	import { websocket_api } from 'schema-js';
	import { toMarketMs, toRealMs, type PauseInterval } from '$lib/marketTime';

	// Step-after curve: line stays flat at the previous price, then jumps
	// vertically when a new trade arrives. Mirrors d3-shape's curveStepAfter so
	// we don't pull d3-shape in as a direct dep.
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

	interface Props {
		trades: websocket_api.ITrade[];
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
		showMyTrades?: boolean;
		accountId?: number;
		xDomain?: [Date, Date];
		highlightClientX?: number;
		settlePrice?: number;
		/** When `pauseIntervals` is set, this is interpreted as market-time ms
		 * (matching the slider in market.svelte). Otherwise it remains real-time ms. */
		trimStartMs?: number;
		/** Same convention as trimStartMs. */
		playheadMs?: number;
		allTrades?: websocket_api.ITrade[];
		marketOpenTime?: Date;
		/** Pause windows for the rendered market. When provided the x-axis collapses
		 * paused time so the chart shows market-elapsed time only. */
		pauseIntervals?: PauseInterval[];
		/** Pause windows to render as grey overlay rectangles, leaving the wall-
		 * clock x-axis intact. Use when the chart shares an x-axis with sibling
		 * real-time charts. Ignored when `pauseIntervals` is non-empty. */
		pauseOverlays?: PauseInterval[];
		onTradeClick?: (trade: websocket_api.ITrade, clientX: number) => void;
		onHoverClientX?: (clientX: number | undefined) => void;
	}

	let {
		trades: tradesProp,
		minSettlement,
		maxSettlement,
		showMyTrades = true,
		accountId,
		xDomain,
		highlightClientX,
		settlePrice,
		trimStartMs,
		playheadMs,
		allTrades,
		marketOpenTime,
		pauseIntervals = [],
		pauseOverlays = [],
		onTradeClick,
		onHoverClientX
	}: Props = $props();

	const overlayActive = $derived(pauseIntervals.length === 0 && pauseOverlays.length > 0);

	// All chart x-coordinates live in market-clock ms when pauseIntervals is
	// non-empty (paused time is collapsed). Without pauses, market-clock and
	// wall-clock are identical, so these helpers are no-ops.
	const realToMarket = (realMs: number): number =>
		pauseIntervals.length ? toMarketMs(realMs, pauseIntervals) : realMs;
	const marketToReal = (marketMs: number): number =>
		pauseIntervals.length ? toRealMs(marketMs, pauseIntervals) : marketMs;

	const tradeRealMs = (t: websocket_api.ITrade): number =>
		(Number(t.transactionTimestamp?.seconds) || 0) * 1000;
	const tradeMs = (t: websocket_api.ITrade): number => realToMarket(tradeRealMs(t));

	// Apply trim start to clip the windowed view. When the window is empty but
	// some prior trade exists at or before the playhead, render that single
	// trade as an anchor "current price" point so the chart isn't blank.
	const trades = $derived.by(() => {
		let base: websocket_api.ITrade[];
		if (trimStartMs === undefined) {
			base = tradesProp;
		} else {
			const windowed = tradesProp.filter((t) => tradeMs(t) >= trimStartMs);
			if (windowed.length > 0) {
				base = windowed;
			} else {
				const source = allTrades ?? tradesProp;
				const upper = playheadMs ?? Number.POSITIVE_INFINITY;
				let anchor: websocket_api.ITrade | undefined;
				for (const t of source) {
					const ms = tradeMs(t);
					if (ms <= upper && (anchor === undefined || ms > tradeMs(anchor))) {
						anchor = t;
					}
				}
				base = anchor ? [anchor] : [];
			}
		}

		// Extend the line out to the playhead by appending a synthetic point
		// at the last trade's price — the implied "current" price until the
		// next trade. Skip in live mode (playhead undefined) and when the
		// last trade already sits at or after the playhead.
		if (playheadMs !== undefined && base.length > 0) {
			const last = base[base.length - 1];
			if (last.price != null && tradeMs(last) < playheadMs) {
				// Synthetic anchor lives at the playhead in market-clock space; the
				// transactionTimestamp on the synthesized trade has to be in real
				// wall-clock seconds because tradeRealMs is what tradeTimestamp will
				// re-convert.
				const playheadRealMs = marketToReal(playheadMs);
				base = [
					...base,
					{
						price: last.price,
						transactionTimestamp: { seconds: Math.floor(playheadRealMs / 1000) }
					}
				];
			}
		}
		return base;
	});

	// Chart scales captured from slot props for tooltip positioning
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let chartXScale: any = $state(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let chartYScale: any = $state(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function captureScales(x: any, y: any) {
		chartXScale = x;
		chartYScale = y;
	}

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
		// xScale lives in market-clock when pauseIntervals is active. tradeMs()
		// returns market-clock too, so the comparison is apples-to-apples.
		const t = (ts instanceof Date ? ts : new Date(ts)).getTime();
		let lastPrice: number | undefined;
		for (const trade of trades) {
			const ms = tradeMs(trade);
			if (ms <= t) lastPrice = trade.price ?? lastPrice;
			else break;
		}
		if (lastPrice === undefined) return undefined;
		return { price: lastPrice, plotX, plotY: chartYScale(lastPrice) };
	});

	let sidebar = useSidebar();

	type YAxisMode = 'history' | 'settlement' | 'custom';
	let yAxisMode: YAxisMode = $state('history');
	let customYMin: number | null = $state(null);
	let customYMax: number | null = $state(null);
	// Drafts: edited freely while the popover is open; only flushed onto
	// customYMin/customYMax (and thus the chart) when the user clicks Apply.
	let draftYMin: number | null = $state(null);
	let draftYMax: number | null = $state(null);
	let yPickerOpen = $state(false);

	$effect(() => {
		if (yPickerOpen && yAxisMode === 'custom') {
			draftYMin = customYMin;
			draftYMax = customYMax;
		}
	});

	function selectYAxisMode(mode: YAxisMode) {
		if (mode === 'custom') {
			if (yAxisMode !== 'custom') {
				const [d0, d1] = yDomain;
				customYMin = d0;
				customYMax = d1;
			}
			draftYMin = customYMin;
			draftYMax = customYMax;
			yAxisMode = 'custom';
			// Stay open — user still has to commit min/max via Apply.
		} else {
			yAxisMode = mode;
			yPickerOpen = false;
		}
	}

	function blockSciNotation(e: InputEvent) {
		if (typeof e.data === 'string' && /[eE+]/.test(e.data)) {
			e.preventDefault();
		}
	}

	const customError = $derived.by((): string | null => {
		if (draftYMin == null || draftYMax == null) return 'Min and max are required';
		if (!Number.isFinite(draftYMin) || !Number.isFinite(draftYMax)) {
			return 'Min and max must be numbers';
		}
		if (draftYMin >= draftYMax) return 'Min must be less than max';
		if (minSettlement != null && draftYMin < minSettlement) {
			return `Min cannot be below ${minSettlement}`;
		}
		if (maxSettlement != null && draftYMax > maxSettlement) {
			return `Max cannot exceed ${maxSettlement}`;
		}
		return null;
	});

	function applyCustomBounds() {
		if (customError != null || draftYMin == null || draftYMax == null) return;
		customYMin = draftYMin;
		customYMax = draftYMax;
		yPickerOpen = false;
	}
	const Y_AXIS_OPTIONS = [
		{
			id: 'history' as const,
			label: 'Price history',
			tip: 'Fit the Y axis to the price range visible in the current chart window.',
			Icon: ArrowsInLineVertical
		},
		{
			id: 'settlement' as const,
			label: 'Settlement range',
			tip: "Show the market's full settlement bounds on the Y axis.",
			Icon: ArrowsOutLineVertical
		},
		{
			id: 'custom' as const,
			label: 'Custom',
			tip: 'Set your own Y-axis min and max.',
			Icon: Ruler
		}
	];

	function niceStep(range: number, targetTicks = 5): number {
		if (range <= 0) return 1;
		const rough = range / targetTicks;
		const exponent = Math.floor(Math.log10(rough));
		const fraction = rough / Math.pow(10, exponent);
		const nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
		return nice * Math.pow(10, exponent);
	}

	const yDomain = $derived.by(() => {
		const fullDomain: [number, number] = [minSettlement ?? 0, maxSettlement ?? 0];
		if (
			yAxisMode === 'custom' &&
			customYMin != null &&
			customYMax != null &&
			customYMin < customYMax
		) {
			return [customYMin, customYMax] as [number, number];
		}
		if (yAxisMode === 'settlement' || trades.length === 0) return fullDomain;

		let minPrice = Infinity;
		let maxPrice = -Infinity;
		for (const t of trades) {
			const p = t.price;
			if (p == null) continue;
			if (p < minPrice) minPrice = p;
			if (p > maxPrice) maxPrice = p;
		}
		if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) return fullDomain;

		const range = maxPrice - minPrice;
		let yMin: number;
		let yMax: number;
		if (range > 0) {
			// Snap raw extremes to the nearest step boundary. If a price already sits
			// on a round number, this leaves it as the top/bottom edge — no extra pad.
			const step = niceStep(range);
			yMin = Math.floor(minPrice / step) * step;
			yMax = Math.ceil(maxPrice / step) * step;
		} else {
			// Degenerate single-price case: pad symmetrically so the line isn't flat
			// against the axis.
			const pad = Math.max(Math.abs(maxPrice) * 0.1, 1);
			yMin = maxPrice - pad;
			yMax = maxPrice + pad;
		}

		if (maxSettlement != null) yMax = Math.min(yMax, maxSettlement);
		if (minPrice >= 0) yMin = Math.max(yMin, 0);
		return [yMin, yMax] as [number, number];
	});

	// Pass explicit y-ticks so d3 doesn't pick a step that skips yMin or yMax,
	// which would leave the topmost/bottommost gridline an unhelpful distance
	// from the plot edges.
	const yTicks = $derived.by(() => {
		const [yMin, yMax] = yDomain;
		const range = yMax - yMin;
		if (range <= 0) return [yMin];
		const step = niceStep(range);
		const ticks = new Set<number>();
		ticks.add(yMin);
		const startV = Math.ceil(yMin / step) * step;
		for (let v = startV; v < yMax; v += step) ticks.add(v);
		ticks.add(yMax);
		return Array.from(ticks).sort((a, b) => a - b);
	});

	function niceSecondStep(rangeSec: number, targetTicks: number): number {
		const STEPS = [30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14400, 28800, 86400];
		const rough = rangeSec / targetTicks;
		for (const s of STEPS) {
			if (s >= rough) return s;
		}
		return STEPS[STEPS.length - 1];
	}

	const rightEdgeTime = $derived.by((): number | undefined => {
		if (playheadMs !== undefined) return playheadMs;
		const source = allTrades && allTrades.length > 0 ? allTrades : trades;
		let max: number | undefined;
		for (const t of source) {
			const ms = tradeMs(t);
			if (ms > 0 && (max === undefined || ms > max)) max = ms;
		}
		return max;
	});

	const trimStartTime = $derived(trimStartMs);

	const effectiveXDomain = $derived.by((): [Date, Date] | undefined => {
		if (xDomain) return xDomain;
		if (!marketOpenTime) return undefined;
		const leftTime = trimStartTime ?? marketOpenTime.getTime();
		const rightTime =
			rightEdgeTime != null && rightEdgeTime > leftTime ? rightEdgeTime : leftTime + 60_000;
		return [new Date(leftTime), new Date(rightTime)];
	});

	const xTicks = $derived.by((): Date[] => {
		if (!marketOpenTime || !effectiveXDomain) return [];
		const t0 = marketOpenTime.getTime();
		const startSec = (effectiveXDomain[0].getTime() - t0) / 1000;
		const endSec = (effectiveXDomain[1].getTime() - t0) / 1000;
		const rangeSec = Math.max(endSec - startSec, 30);
		const targetTicks = sidebar.isMobile ? 3 : 5;
		const stepSec = niceSecondStep(rangeSec, targetTicks);
		const startK = Math.ceil(startSec / stepSec);
		const endK = Math.floor(endSec / stepSec);
		const ticks: Date[] = [];
		for (let k = startK; k <= endK; k++) {
			ticks.push(new Date(t0 + k * stepSec * 1000));
		}
		return ticks;
	});

	// Returns the trade's plotted x-position as a Date (market-clock).
	const tradeTimestamp = (trade: websocket_api.ITrade) => {
		if (!trade) {
			return undefined;
		}
		const timestamp = trade.transactionTimestamp;
		if (!timestamp) return undefined;
		const realMs = Number(timestamp.seconds) * 1000;
		return new Date(realToMarket(realMs));
	};

	// `marketMs` here is market-clock, anchored at marketOpenTime (which is
	// itself a real-time Date but coincides with market-clock origin since
	// no pause precedes it).
	const formatMarketTime = (marketMs: number): string => {
		if (!marketOpenTime) return '';
		const totalSec = Math.max(0, Math.round((marketMs - marketOpenTime.getTime()) / 1000));
		const h = Math.floor(totalSec / 3600);
		const m = Math.floor((totalSec % 3600) / 60);
		const s = totalSec % 60;
		const pad = (n: number) => String(n).padStart(2, '0');
		return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
	};

	const formatTradeTooltip = (trade: websocket_api.ITrade) => {
		const ts = trade.transactionTimestamp;
		if (!ts) return { price: '', size: '', time: '' };
		const realMs = Number(ts.seconds) * 1000;
		const wall = new Date(realMs).toLocaleTimeString();
		const market = formatMarketTime(realToMarket(realMs));
		const time = market ? `${market} (${wall})` : wall;
		const price = trade.price ?? '';
		const size = trade.size ?? '';
		return { price: `Price: ${price}`, size: `Size: ${size}`, time };
	};

	// Pause markers in market-clock space. Each pause collapses to a single
	// vertical line at `toMarketMs(pause.start)`. Tooltip recovers the
	// original wall-clock timestamp and pause duration for display.
	const pauseMarkers = $derived.by(() => {
		if (!pauseIntervals.length) return [];
		return pauseIntervals.map((iv) => {
			const marketMs = toMarketMs(iv.start, pauseIntervals);
			const durationSec = Math.round((iv.end - iv.start) / 1000);
			const m = Math.floor(durationSec / 60);
			const s = durationSec % 60;
			const dur = m > 0 ? `${m}m ${s}s` : `${s}s`;
			const wall = new Date(iv.start).toLocaleTimeString();
			return {
				x: new Date(marketMs),
				tooltip: `Paused for ${dur} at ${wall}`
			};
		});
	});

	// Tooltip state
	let tooltipText = $state<{ price: string; size: string; time: string }>({
		price: '',
		size: '',
		time: ''
	});
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipVisible = $state(false);
	let tooltipSide = $state<'buy' | 'sell'>('buy');
	let lineTooltipActive = $state(false);

	// Snappy hover tooltip for x-axis ticks (real wall-clock time). `tick` is in
	// market-clock space when pauses are active, so convert back for display.
	let tickTooltip = $state<{ x: number; y: number; text: string } | null>(null);
	const showTickTooltip = (e: MouseEvent, tick: Date) => {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const real = new Date(marketToReal(tick.getTime()));
		tickTooltip = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			text: real.toLocaleString()
		};
	};
	const hideTickTooltip = () => {
		tickTooltip = null;
	};

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

	// Per-instance clip-path id so the spline gets clipped to the plot
	// area (otherwise custom y-bounds let the line draw outside the chart).
	const clipId = `chart-clip-${Math.random().toString(36).slice(2, 10)}`;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerEl}
	class="relative mt-3 h-[20rem] w-full pt-7 md:h-96"
	onmousemove={handleMouseMove}
	onmouseleave={handleMouseLeave}
>
	<Popover.Root bind:open={yPickerOpen}>
		<Popover.Trigger>
			{#snippet child({ props })}
				<button
					{...props}
					type="button"
					class="absolute left-0 top-0 z-40 text-muted-foreground hover:text-foreground"
					aria-label="Y axis bounds"
				>
					{#if yAxisMode === 'history'}
						<ArrowsInLineVertical size={18} />
					{:else if yAxisMode === 'settlement'}
						<ArrowsOutLineVertical size={18} />
					{:else}
						<Ruler size={18} />
					{/if}
				</button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content
			side="right"
			align="start"
			class="w-56 p-1.5"
			onOpenAutoFocus={(e) => e.preventDefault()}
		>
			<div class="flex flex-col gap-0.5">
				{#each Y_AXIS_OPTIONS as opt (opt.id)}
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									class="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
									onclick={() => selectYAxisMode(opt.id)}
								>
									<opt.Icon size={14} />
									<span class="flex-1">{opt.label}</span>
									{#if yAxisMode === opt.id}
										<Check size={14} />
									{/if}
								</button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="right">{opt.tip}</Tooltip.Content>
					</Tooltip.Root>
				{/each}
				{#if yAxisMode === 'custom'}
					<form
						class="mt-1 flex flex-col gap-1 px-2 pb-1 pt-2"
						onsubmit={(e) => {
							e.preventDefault();
							applyCustomBounds();
						}}
					>
						<div class="flex items-end gap-1.5">
							<label class="flex flex-1 flex-col gap-0.5 text-xs text-muted-foreground">
								Min
								<Input
									type="number"
									class="h-7 text-xs"
									bind:value={draftYMin}
									step="any"
									onbeforeinput={blockSciNotation}
								/>
							</label>
							<label class="flex flex-1 flex-col gap-0.5 text-xs text-muted-foreground">
								Max
								<Input
									type="number"
									class="h-7 text-xs"
									bind:value={draftYMax}
									step="any"
									onbeforeinput={blockSciNotation}
								/>
							</label>
							<button
								type="submit"
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border bg-background text-muted-foreground transition-colors enabled:hover:bg-accent enabled:hover:text-foreground disabled:opacity-40"
								aria-label="Apply custom bounds"
								disabled={customError != null}
							>
								<Check size={14} />
							</button>
						</div>
						{#if customError}
							<p class="text-xs text-destructive">{customError}</p>
						{/if}
					</form>
				{/if}
			</div>
		</Popover.Content>
	</Popover.Root>
	{#if lastPriceTooltipData && containerEl}
		{@const pos = plotToContainer(lastPriceTooltipData.plotX, lastPriceTooltipData.plotY)}
		{#if pos}
			{@const flipX = pos.x + 8 + 160 > containerEl.offsetWidth}
			{@const flipY = pos.y - 40 < 0}
			<div
				class="pointer-events-none absolute z-50 rounded-md border border-primary/30 px-3 py-1.5 text-[15px] font-semibold text-primary shadow-sm"
				style="left: {flipX ? pos.x - 168 : pos.x + 8}px; top: {flipY
					? pos.y + 8
					: pos.y - 40}px; background: hsl(var(--background));"
			>
				Last: {lastPriceTooltipData.price % 1 === 0
					? lastPriceTooltipData.price.toFixed(1)
					: lastPriceTooltipData.price}
			</div>
		{/if}
	{/if}
	{#if tooltipVisible && containerEl}
		{@const flipX = tooltipX - 120 < 0}
		{@const flipY = tooltipY - 70 < 0}
		<div
			class="pointer-events-none absolute z-50 rounded border px-2 py-1 text-xs shadow-md {tooltipSide ===
			'buy'
				? 'border-green-300 bg-green-50 text-green-950 dark:border-green-700 dark:bg-green-950 dark:text-green-100'
				: 'border-red-300 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950 dark:text-red-100'}"
			style="left: {flipX ? tooltipX + 10 : tooltipX - 120}px; top: {flipY
				? tooltipY + 10
				: tooltipY - 70}px;"
		>
			<div class="font-semibold">{tooltipSide === 'buy' ? 'Bought' : 'Sold'}</div>
			<div>{tooltipText.price}</div>
			<div>{tooltipText.size}</div>
			<div class="text-muted-foreground">{tooltipText.time}</div>
		</div>
	{/if}
	{#if tickTooltip && containerEl}
		{@const flipX = tickTooltip.x + 8 + 180 > containerEl.offsetWidth}
		<div
			class="pointer-events-none absolute z-50 rounded-md border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md"
			style="left: {flipX ? tickTooltip.x - 188 : tickTooltip.x + 8}px; top: {tickTooltip.y -
				28}px;"
		>
			{tickTooltip.text}
		</div>
	{/if}
	{#if hasWidth}
		<LineChart
			data={trades}
			x={tradeTimestamp}
			y="price"
			{yDomain}
			xDomain={effectiveXDomain}
			props={{
				xAxis: {
					format: marketOpenTime
						? (d: Date) => Math.round((d.getTime() - marketOpenTime.getTime()) / 60000).toString()
						: 15,
					ticks: marketOpenTime ? xTicks : sidebar.isMobile ? 3 : undefined,
					tickLabelProps: marketOpenTime ? { class: 'opacity-0 pointer-events-none' } : undefined
				},
				yAxis: {
					grid: { class: 'stroke-surface-content/30' },
					ticks: yTicks,
					spring: false,
					tweened: false
				},
				grid: { yTicks, spring: false, tweened: false },
				spline: { curve: curveStepAfter, 'clip-path': `url(#${clipId})` }
			}}
			tooltip={false}
		>
			<svelte:fragment slot="belowMarks" let:xScale let:yScale let:width let:padding let:height>
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{@const _cap = captureScales(xScale, yScale)}
				<defs>
					<clipPath id={clipId}>
						<!-- LayerCake's width/height in slot props are already the inner
						     plot dimensions (after padding), so the rect uses them
						     directly. The slot itself sits inside the padding-translated
						     <g>, so origin (0,0) is the plot top-left. -->
						<rect x={0} y={0} {width} {height} />
					</clipPath>
				</defs>
				{#if marketOpenTime && xTicks.length > 0}
					{@const plotBottom = height - (padding?.top ?? 0) - (padding?.bottom ?? 0)}
					{#each xTicks as tick (tick.getTime())}
						{@const mins = (tick.getTime() - marketOpenTime.getTime()) / 60000}
						<text
							x={xScale(tick)}
							y={plotBottom + 16}
							text-anchor="middle"
							class="fill-muted-foreground"
							font-size="10"
							style="cursor: help;"
							onmouseenter={(e) => showTickTooltip(e, tick)}
							onmousemove={(e) => showTickTooltip(e, tick)}
							onmouseleave={hideTickTooltip}
						>
							{Number.isInteger(mins) ? mins.toFixed(0) : mins.toFixed(1)}
						</text>
					{/each}
				{/if}
				{#if settlePrice !== undefined}
					<Rule
						y={settlePrice}
						class="stroke-yellow-500/50"
						stroke-width="2.5"
						stroke-dasharray="6 3"
					/>
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
				{#if overlayActive}
					{@const plotBottom = height - (padding?.top ?? 0) - (padding?.bottom ?? 0)}
					{#each pauseOverlays as iv, i (i)}
						{@const x1 = xScale(new Date(iv.start))}
						{@const x2 = xScale(new Date(iv.end))}
						{@const durationSec = Math.round((iv.end - iv.start) / 1000)}
						{@const m = Math.floor(durationSec / 60)}
						{@const s = durationSec % 60}
						{@const dur = m > 0 ? `${m}m ${s}s` : `${s}s`}
						{@const wall = new Date(iv.start).toLocaleTimeString()}
						<rect
							x={Math.min(x1, x2)}
							y={0}
							width={Math.max(1, Math.abs(x2 - x1))}
							height={plotBottom}
							class="fill-muted-foreground/15"
							style="cursor: help;"
							onmouseenter={(e) => {
								if (!containerEl) return;
								const rect = containerEl.getBoundingClientRect();
								tickTooltip = {
									x: e.clientX - rect.left,
									y: e.clientY - rect.top,
									text: `Paused for ${dur} at ${wall}`
								};
							}}
							onmousemove={(e) => {
								if (!containerEl) return;
								const rect = containerEl.getBoundingClientRect();
								tickTooltip = {
									x: e.clientX - rect.left,
									y: e.clientY - rect.top,
									text: `Paused for ${dur} at ${wall}`
								};
							}}
							onmouseleave={hideTickTooltip}
						/>
					{/each}
				{/if}
				{#if pauseMarkers.length > 0}
					{@const plotBottom = height - (padding?.top ?? 0) - (padding?.bottom ?? 0)}
					{#each pauseMarkers as marker, i (i)}
						<line
							x1={xScale(marker.x)}
							y1={0}
							x2={xScale(marker.x)}
							y2={plotBottom}
							class="stroke-muted-foreground/40"
							stroke-width="6"
							style="cursor: help;"
							onmouseenter={(e) => {
								if (!containerEl) return;
								const rect = containerEl.getBoundingClientRect();
								tickTooltip = {
									x: e.clientX - rect.left,
									y: e.clientY - rect.top,
									text: marker.tooltip
								};
							}}
							onmousemove={(e) => {
								if (!containerEl) return;
								const rect = containerEl.getBoundingClientRect();
								tickTooltip = {
									x: e.clientX - rect.left,
									y: e.clientY - rect.top,
									text: marker.tooltip
								};
							}}
							onmouseleave={hideTickTooltip}
						/>
					{/each}
				{/if}
				{#if highlightClientX !== undefined}
					{@const plotX = clientXToPlotX(highlightClientX)}
					{#if plotX !== null}
						{@const ts = xScale.invert(plotX)}
						{@const marketDate = ts instanceof Date ? ts : new Date(ts)}
						{@const realDate = new Date(marketToReal(marketDate.getTime()))}
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
							{marketOpenTime
								? `${formatMarketTime(marketDate.getTime())} (${formatTime(realDate)})`
								: formatTime(realDate)}
						</text>
					{/if}
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="aboveMarks">
				<g clip-path="url(#{clipId})">
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
				</g>
			</svelte:fragment>
		</LineChart>
	{/if}
</div>
