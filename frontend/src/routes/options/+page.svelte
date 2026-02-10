<script lang="ts">
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { websocket_api } from 'schema-js';
	import { onMount } from 'svelte';
	import { mode } from 'mode-watcher';
	import * as Select from '$lib/components/ui/select';

	// ============================================================
	// CONFIGURATION
	// ============================================================
	const DEFAULT_CONTROL_POINTS = [0, 10, 20, 30];
	const STRIKES = [/* 5, */ 10, /* 15, */ 20 /* , 25 */];

	// ============================================================
	// MARKET GROUP SELECTION
	// ============================================================
	let selectedGroupId: number | null = $state(null);

	// Find the "Options" market type ID
	const optionsTypeId = $derived.by(() => {
		for (const [id, marketType] of serverState.marketTypes) {
			if (marketType.name === 'Options') {
				return id;
			}
		}
		return null;
	});

	// Get all market groups in the "Options" category
	const optionsGroups = $derived.by(() => {
		if (optionsTypeId === null) return [];
		const groups: { id: number; name: string }[] = [];
		for (const [id, group] of serverState.marketGroups) {
			if (group.typeId === optionsTypeId) {
				groups.push({ id, name: group.name ?? `Group ${id}` });
			}
		}
		return groups.sort((a, b) => a.name.localeCompare(b.name));
	});

	// Auto-select first group if none selected
	$effect(() => {
		if (selectedGroupId === null && optionsGroups.length > 0) {
			selectedGroupId = optionsGroups[0].id;
		}
	});

	const selectedGroupName = $derived(
		optionsGroups.find((g) => g.id === selectedGroupId)?.name ?? 'Select a group...'
	);

	// ============================================================
	// MARKET LOOKUP
	// ============================================================
	function findMarketInGroup(
		name: string,
		groupId: number | null
	): { id: number; minSettlement: number; maxSettlement: number } | null {
		if (groupId === null) return null;
		for (const [id, marketData] of serverState.markets) {
			// Check if market is in the selected group
			if (marketData.definition.groupId !== groupId) continue;
			const marketName = marketData.definition.name;
			// Match "Above 5" or "prefix__Above 5"
			if (marketName === name || marketName?.endsWith(`__${name}`)) {
				return {
					id,
					minSettlement: marketData.definition.minSettlement ?? 0,
					maxSettlement: marketData.definition.maxSettlement ?? 100
				};
			}
		}
		return null;
	}

	function getMarketId(strike: number, type: 'above' | 'below'): number | null {
		const name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${strike}`;
		const market = findMarketInGroup(name, selectedGroupId);
		return market?.id ?? null;
	}

	function getPosition(strike: number, type: 'above' | 'below'): number {
		const marketId = getMarketId(strike, type);
		if (marketId === null) return 0;

		const activeAccountId = serverState.actingAs ?? serverState.userId;
		const marketData = serverState.markets.get(marketId);
		if (!marketData) return 0;

		const portfolioPosition = serverState.portfolio?.marketExposures?.find(
			(me) => me.marketId === marketId
		)?.position;
		return portfolioPosition ?? 0;
	}

	// ============================================================
	// API FUNCTIONS
	// ============================================================
	function placeBid(marketId: number, price: number, size: number) {
		sendClientMessage({
			createOrder: {
				marketId,
				price,
				size,
				side: websocket_api.Side.BID
			}
		});
	}

	function placeOffer(marketId: number, price: number, size: number) {
		sendClientMessage({
			createOrder: {
				marketId,
				price,
				size,
				side: websocket_api.Side.OFFER
			}
		});
	}

	function clearBids(marketId: number) {
		sendClientMessage({
			out: {
				marketId,
				side: websocket_api.Side.BID
			}
		});
	}

	function clearOffers(marketId: number) {
		sendClientMessage({
			out: {
				marketId,
				side: websocket_api.Side.OFFER
			}
		});
	}

	// ============================================================
	// NORMAL DISTRIBUTION FUNCTIONS
	// ============================================================
	function normalPDF(x: number): number {
		return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
	}

	function normalCDF(x: number): number {
		const a1 = 0.254829592;
		const a2 = -0.284496736;
		const a3 = 1.421413741;
		const a4 = -1.453152027;
		const a5 = 1.061405429;
		const p = 0.3275911;

		const sign = x < 0 ? -1 : 1;
		x = Math.abs(x) / Math.sqrt(2);

		const t = 1.0 / (1.0 + p * x);
		const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

		return 0.5 * (1.0 + sign * y);
	}

	function priceOverNormal(K: number, mu: number, sigma: number): number {
		if (sigma < 0.01) {
			return Math.max(0, mu - K);
		}
		const d = (mu - K) / sigma;
		return sigma * normalPDF(d) + (mu - K) * normalCDF(d);
	}

	function priceUnderNormal(K: number, mu: number, sigma: number): number {
		if (sigma < 0.01) {
			return Math.max(0, K - mu);
		}
		const d = (mu - K) / sigma;
		return sigma * normalPDF(d) + (K - mu) * normalCDF(-d);
	}

	function getNormalPDFValue(x: number, mu: number, sigma: number): number {
		if (sigma < 0.01) return 0;
		const z = (x - mu) / sigma;
		return normalPDF(z) / sigma;
	}

	// ============================================================
	// SPLINE ENGINE
	// ============================================================
	interface SplineSegment {
		a: number;
		b: number;
		c: number;
		d: number;
		x0: number;
		x1: number;
	}

	class SplineEngine {
		segments: SplineSegment[] = [];

		computeCoefficients(controlPoints: number[], heights: number[]): SplineSegment[] {
			const n = heights.length;
			const x = controlPoints;
			const y = heights;

			const h: number[] = [];
			for (let i = 0; i < n - 1; i++) {
				h.push(x[i + 1] - x[i]);
			}

			const alpha: number[] = [0];
			for (let i = 1; i < n - 1; i++) {
				alpha.push((3 / h[i]) * (y[i + 1] - y[i]) - (3 / h[i - 1]) * (y[i] - y[i - 1]));
			}

			const l: number[] = [1];
			const mu: number[] = [0];
			const z: number[] = [0];

			for (let i = 1; i < n - 1; i++) {
				l.push(2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1]);
				mu.push(h[i] / l[i]);
				z.push((alpha[i] - h[i - 1] * z[i - 1]) / l[i]);
			}

			l.push(1);
			z.push(0);

			const c: number[] = new Array(n).fill(0);
			for (let j = n - 2; j >= 0; j--) {
				c[j] = z[j] - mu[j] * c[j + 1];
			}

			this.segments = [];
			for (let i = 0; i < n - 1; i++) {
				const a = y[i];
				const b = (y[i + 1] - y[i]) / h[i] - (h[i] * (c[i + 1] + 2 * c[i])) / 3;
				const d = (c[i + 1] - c[i]) / (3 * h[i]);

				this.segments.push({
					a: a,
					b: b,
					c: c[i],
					d: d,
					x0: x[i],
					x1: x[i + 1]
				});
			}

			return this.segments;
		}

		evaluate(x: number): number {
			let segIdx = 0;
			for (let i = 0; i < this.segments.length; i++) {
				if (x >= this.segments[i].x0 && x <= this.segments[i].x1) {
					segIdx = i;
					break;
				}
				if (x > this.segments[i].x1) {
					segIdx = i;
				}
			}

			const seg = this.segments[segIdx];
			const u = x - seg.x0;
			return seg.a + seg.b * u + seg.c * u * u + seg.d * u * u * u;
		}

		findRoots(segIdx: number): number[] {
			const seg = this.segments[segIdx];
			const { a, b, c, d, x0, x1 } = seg;
			const roots: number[] = [];

			if (Math.abs(d) < 1e-12) {
				if (Math.abs(c) < 1e-12) {
					if (Math.abs(b) > 1e-12) {
						const r = -a / b;
						if (r > 0 && r < x1 - x0) roots.push(r + x0);
					}
				} else {
					const disc = b * b - 4 * c * a;
					if (disc >= 0) {
						const sqrtDisc = Math.sqrt(disc);
						const r1 = (-b + sqrtDisc) / (2 * c);
						const r2 = (-b - sqrtDisc) / (2 * c);
						if (r1 > 0 && r1 < x1 - x0) roots.push(r1 + x0);
						if (r2 > 0 && r2 < x1 - x0 && Math.abs(r2 - r1) > 1e-12) roots.push(r2 + x0);
					}
				}
			} else {
				const A = c / d;
				const B = b / d;
				const C = a / d;

				const p = B - (A * A) / 3;
				const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;

				const disc = (q * q) / 4 + (p * p * p) / 27;

				if (disc > 1e-12) {
					const sqrtDisc = Math.sqrt(disc);
					const u1 = Math.cbrt(-q / 2 + sqrtDisc);
					const u2 = Math.cbrt(-q / 2 - sqrtDisc);
					const t = u1 + u2;
					const r = t - A / 3;
					if (r > 0 && r < x1 - x0) roots.push(r + x0);
				} else if (disc < -1e-12) {
					const m = 2 * Math.sqrt(-p / 3);
					const theta = Math.acos((3 * q) / (p * m)) / 3;
					for (let k = 0; k < 3; k++) {
						const t = m * Math.cos(theta - (2 * Math.PI * k) / 3);
						const r = t - A / 3;
						if (r > 1e-10 && r < x1 - x0 - 1e-10) roots.push(r + x0);
					}
				} else {
					const t1 = (3 * q) / p;
					const t2 = -t1 / 2;
					const r1 = t1 - A / 3;
					const r2 = t2 - A / 3;
					if (r1 > 0 && r1 < x1 - x0) roots.push(r1 + x0);
					if (Math.abs(r2 - r1) > 1e-12 && r2 > 0 && r2 < x1 - x0) roots.push(r2 + x0);
				}
			}

			return roots.sort((a, b) => a - b);
		}
	}

	// ============================================================
	// PDF MANAGER
	// ============================================================
	class PDFManager {
		spline: SplineEngine;
		controlPoints: number[] = DEFAULT_CONTROL_POINTS;
		normalizationConstant: number = 1;
		_wasClamped: boolean = false;

		constructor(splineEngine: SplineEngine) {
			this.spline = splineEngine;
		}

		buildPDF(controlPoints: number[], heights: number[]): PDFManager {
			this.controlPoints = controlPoints;
			const segmentCount = controlPoints.length - 1;

			this.spline.computeCoefficients(controlPoints, heights);

			this._wasClamped = false;

			for (let i = 0; i < segmentCount; i++) {
				const seg = this.spline.segments[i];
				const roots = this.spline.findRoots(i);

				const testPoints = [seg.x0, (seg.x0 + seg.x1) / 2, seg.x1];
				roots.forEach((r) => testPoints.push(r - 0.01, r + 0.01));

				for (const x of testPoints) {
					if (x >= seg.x0 && x <= seg.x1) {
						const val = this.spline.evaluate(x);
						if (val < -1e-10) {
							this._wasClamped = true;
							break;
						}
					}
				}
			}

			this.normalizationConstant = this.integrateRaw(0, 30);

			if (this.normalizationConstant < 1e-10) {
				this.normalizationConstant = 1;
			}

			return this;
		}

		wasClamped(): boolean {
			return this._wasClamped;
		}

		integrateRaw(a: number, b: number): number {
			let total = 0;
			const segmentCount = this.controlPoints.length - 1;

			for (let i = 0; i < segmentCount; i++) {
				const seg = this.spline.segments[i];

				const left = Math.max(a, seg.x0);
				const right = Math.min(b, seg.x1);

				if (left >= right) continue;

				const roots = this.spline.findRoots(i);
				const breakpoints = [left, ...roots.filter((r) => r > left && r < right), right];

				for (let j = 0; j < breakpoints.length - 1; j++) {
					const subLeft = breakpoints[j];
					const subRight = breakpoints[j + 1];
					const midVal = this.spline.evaluate((subLeft + subRight) / 2);

					if (midVal > 0) {
						total += this.integrateSegment(seg, subLeft, subRight);
					}
				}
			}

			return total;
		}

		integrateXRaw(a: number, b: number): number {
			let total = 0;
			const segmentCount = this.controlPoints.length - 1;

			for (let i = 0; i < segmentCount; i++) {
				const seg = this.spline.segments[i];

				const left = Math.max(a, seg.x0);
				const right = Math.min(b, seg.x1);

				if (left >= right) continue;

				const roots = this.spline.findRoots(i);
				const breakpoints = [left, ...roots.filter((r) => r > left && r < right), right];

				for (let j = 0; j < breakpoints.length - 1; j++) {
					const subLeft = breakpoints[j];
					const subRight = breakpoints[j + 1];
					const midVal = this.spline.evaluate((subLeft + subRight) / 2);

					if (midVal > 0) {
						total += this.integrateXSegment(seg, subLeft, subRight);
					}
				}
			}

			return total;
		}

		integrateSegment(seg: SplineSegment, left: number, right: number): number {
			const { a, b, c, d, x0 } = seg;

			const evalAntideriv = (x: number) => {
				const u = x - x0;
				return a * u + (b / 2) * u * u + (c / 3) * u * u * u + (d / 4) * u * u * u * u;
			};

			return evalAntideriv(right) - evalAntideriv(left);
		}

		integrateXSegment(seg: SplineSegment, left: number, right: number): number {
			const { a, b, c, d, x0 } = seg;

			const evalAntideriv = (x: number) => {
				const u = x - x0;
				return (
					a * x0 * u +
					((a + b * x0) / 2) * u * u +
					((b + c * x0) / 3) * u * u * u +
					((c + d * x0) / 4) * u * u * u * u +
					(d / 5) * u * u * u * u * u
				);
			};

			return evalAntideriv(right) - evalAntideriv(left);
		}

		integrateX2Segment(seg: SplineSegment, left: number, right: number): number {
			const { a, b, c, d, x0 } = seg;

			const evalAntideriv = (x: number) => {
				const u = x - x0;
				const x0_2 = x0 * x0;
				return (
					a * x0_2 * u +
					(a * x0 + (b * x0_2) / 2) * u * u +
					(a / 3 + (2 * b * x0) / 3 + (c * x0_2) / 3) * u * u * u +
					(b / 4 + (c * x0) / 2 + (d * x0_2) / 4) * u * u * u * u +
					(c / 5 + (2 * d * x0) / 5) * u * u * u * u * u +
					(d / 6) * u * u * u * u * u * u
				);
			};

			return evalAntideriv(right) - evalAntideriv(left);
		}

		integrateX2Raw(a: number, b: number): number {
			let total = 0;
			const segmentCount = this.controlPoints.length - 1;

			for (let i = 0; i < segmentCount; i++) {
				const seg = this.spline.segments[i];

				const left = Math.max(a, seg.x0);
				const right = Math.min(b, seg.x1);

				if (left >= right) continue;

				const roots = this.spline.findRoots(i);
				const breakpoints = [left, ...roots.filter((r) => r > left && r < right), right];

				for (let j = 0; j < breakpoints.length - 1; j++) {
					const subLeft = breakpoints[j];
					const subRight = breakpoints[j + 1];
					const midVal = this.spline.evaluate((subLeft + subRight) / 2);

					if (midVal > 0) {
						total += this.integrateX2Segment(seg, subLeft, subRight);
					}
				}
			}

			return total;
		}

		M0(a: number, b: number): number {
			return this.integrateRaw(a, b) / this.normalizationConstant;
		}

		M1(a: number, b: number): number {
			return this.integrateXRaw(a, b) / this.normalizationConstant;
		}

		M2(a: number, b: number): number {
			return this.integrateX2Raw(a, b) / this.normalizationConstant;
		}

		variance(): number {
			const mu = this.M1(0, 30);
			return this.M2(0, 30) - mu * mu;
		}

		stddev(): number {
			return Math.sqrt(Math.max(0, this.variance()));
		}

		getValue(x: number): number {
			const raw = this.spline.evaluate(x);
			return Math.max(0, raw) / this.normalizationConstant;
		}
	}

	// ============================================================
	// OPTION PRICER
	// ============================================================
	class OptionPricer {
		pdf: PDFManager;

		constructor(pdfManager: PDFManager) {
			this.pdf = pdfManager;
		}

		priceOver(K: number): number {
			return this.pdf.M1(K, 30) - K * this.pdf.M0(K, 30);
		}

		priceUnder(K: number): number {
			return K * this.pdf.M0(0, K) - this.pdf.M1(0, K);
		}

		priceAll(): Record<number, { above: number; below: number }> {
			const prices: Record<number, { above: number; below: number }> = {};
			for (const K of STRIKES) {
				prices[K] = {
					above: Math.max(0, this.priceOver(K)),
					below: Math.max(0, this.priceUnder(K))
				};
			}
			return prices;
		}

		expectedValue(): number {
			return this.pdf.M1(0, 30);
		}
	}

	// ============================================================
	// STATE
	// ============================================================
	let appMode: 'custom' | 'normal' = $state('custom');
	let normalMean = $state(15);
	let normalStdDev = $state(5);
	let controlPoints = $state([...DEFAULT_CONTROL_POINTS]);
	let heights = $state(DEFAULT_CONTROL_POINTS.map(() => 1));

	let prices: Record<number, { above: number; below: number }> = $state({});
	let expectedValue = $state(15);

	// Trader inputs per strike
	let traderInputs: Record<
		number,
		{
			aboveBidSize: number;
			aboveBidEdge: number;
			aboveBidEnabled: boolean;
			aboveOfferSize: number;
			aboveOfferEdge: number;
			aboveOfferEnabled: boolean;
			belowBidSize: number;
			belowBidEdge: number;
			belowBidEnabled: boolean;
			belowOfferSize: number;
			belowOfferEdge: number;
			belowOfferEnabled: boolean;
		}
	> = $state({});

	// Global toggle for autotrader visibility
	let showAllAutotrader = $state(false);

	function setAllAutotraderEnabled(enabled: boolean) {
		for (const K of STRIKES) {
			traderInputs[K].aboveBidEnabled = enabled;
			traderInputs[K].aboveOfferEnabled = enabled;
			traderInputs[K].belowBidEnabled = enabled;
			traderInputs[K].belowOfferEnabled = enabled;
		}
	}

	// Initialize trader inputs
	for (const K of STRIKES) {
		traderInputs[K] = {
			aboveBidSize: 3,
			aboveBidEdge: 2,
			aboveBidEnabled: false,
			aboveOfferSize: 3,
			aboveOfferEdge: 2,
			aboveOfferEnabled: false,
			belowBidSize: 3,
			belowBidEdge: 2,
			belowBidEnabled: false,
			belowOfferSize: 3,
			belowOfferEdge: 2,
			belowOfferEnabled: false
		};
	}

	const spline = new SplineEngine();
	const pdf = new PDFManager(spline);
	const pricer = new OptionPricer(pdf);

	function updatePrices() {
		if (appMode === 'custom') {
			pdf.buildPDF(controlPoints, heights);
			prices = pricer.priceAll();
			expectedValue = pricer.expectedValue();
		} else {
			const newPrices: Record<number, { above: number; below: number }> = {};
			for (const K of STRIKES) {
				newPrices[K] = {
					above: Math.max(0, priceOverNormal(K, normalMean, normalStdDev)),
					below: Math.max(0, priceUnderNormal(K, normalMean, normalStdDev))
				};
			}
			prices = newPrices;
			expectedValue = normalMean;
		}
	}

	// Initial calculation
	updatePrices();

	// ============================================================
	// CANVAS VISUALIZATION
	// ============================================================
	let canvas: HTMLCanvasElement;
	let draggingIndex = -1;
	let draggingNormal: 'mean' | 'sigma' | null = null;

	const padding = { top: 30, right: 30, bottom: 50, left: 50 };
	const sliderRadius = 12;
	const xMin = 0;
	const xMax = 30;
	let yMax = 0.1;

	function getCanvasDimensions() {
		if (!canvas) return { width: 860, height: 350 };
		const rect = canvas.getBoundingClientRect();
		return { width: rect.width, height: rect.height };
	}

	function xToCanvas(x: number): number {
		const { width } = getCanvasDimensions();
		const plotWidth = width - padding.left - padding.right;
		return padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
	}

	function yToCanvas(y: number): number {
		const { height } = getCanvasDimensions();
		const plotHeight = height - padding.top - padding.bottom;
		return height - padding.bottom - (y / yMax) * plotHeight;
	}

	function canvasToX(cx: number): number {
		const { width } = getCanvasDimensions();
		const plotWidth = width - padding.left - padding.right;
		return ((cx - padding.left) / plotWidth) * (xMax - xMin) + xMin;
	}

	function canvasToY(cy: number): number {
		const { height } = getCanvasDimensions();
		const plotHeight = height - padding.top - padding.bottom;
		return ((height - padding.bottom - cy) / plotHeight) * yMax;
	}

	function autoScaleY() {
		let maxVal = 0;
		for (let x = 0; x <= 30; x += 0.5) {
			if (appMode === 'normal') {
				maxVal = Math.max(maxVal, getNormalPDFValue(x, normalMean, normalStdDev));
			} else {
				maxVal = Math.max(maxVal, pdf.getValue(x));
			}
		}
		yMax = maxVal * 1.15;
		if (yMax < 0.01) yMax = 0.1;
	}

	function drawCanvas() {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const { width, height } = getCanvasDimensions();
		const dpr = window.devicePixelRatio || 1;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, width, height);

		const isDark = $mode === 'dark';
		const colors = isDark
			? {
					grid: '#334155',
					strike: '#fcd34d',
					axis: '#64748b',
					label: '#94a3b8',
					curve: '#60a5fa',
					curveFill: 'rgba(96, 165, 250, 0.15)',
					sliderStem: '#3b82f6',
					slider: '#60a5fa',
					sliderActive: '#3b82f6'
				}
			: {
					grid: '#e5e7eb',
					strike: '#fcd34d',
					axis: '#94a3b8',
					label: '#64748b',
					curve: '#2563eb',
					curveFill: 'rgba(37, 99, 235, 0.15)',
					sliderStem: '#93c5fd',
					slider: '#2563eb',
					sliderActive: '#1e40af'
				};

		autoScaleY();

		// Draw grid
		ctx.strokeStyle = colors.grid;
		ctx.lineWidth = 1;

		for (const x of [0, 5, 10, 15, 20, 25, 30]) {
			const cx = xToCanvas(x);
			ctx.beginPath();
			ctx.moveTo(cx, padding.top);
			ctx.lineTo(cx, height - padding.bottom);
			if (STRIKES.includes(x)) {
				ctx.strokeStyle = colors.strike;
				ctx.setLineDash([5, 5]);
			} else {
				ctx.strokeStyle = colors.grid;
				ctx.setLineDash([]);
			}
			ctx.stroke();
		}
		ctx.setLineDash([]);

		ctx.strokeStyle = colors.grid;
		const yStep = yMax / 4;
		for (let y = 0; y <= yMax; y += yStep) {
			const cy = yToCanvas(y);
			ctx.beginPath();
			ctx.moveTo(padding.left, cy);
			ctx.lineTo(width - padding.right, cy);
			ctx.stroke();
		}

		// Draw axes
		ctx.strokeStyle = colors.axis;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(padding.left, height - padding.bottom);
		ctx.lineTo(width - padding.right, height - padding.bottom);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(padding.left, height - padding.bottom);
		ctx.lineTo(padding.left, padding.top);
		ctx.stroke();

		// X-axis labels
		ctx.fillStyle = colors.label;
		ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
		ctx.textAlign = 'center';
		const labelPoints = new Set([0, 10, 20, 30]);
		if (appMode === 'custom') {
			controlPoints.forEach((x) => labelPoints.add(Math.round(x)));
		}
		for (const x of [...labelPoints].sort((a, b) => a - b)) {
			const cx = xToCanvas(x);
			ctx.fillText(x.toString(), cx, height - padding.bottom + 20);
		}

		ctx.fillText('Settlement Value', width / 2, height - 10);

		ctx.save();
		ctx.translate(15, height / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText('Probability Density', 0, 0);
		ctx.restore();

		const getPDFValue = (x: number) => {
			if (appMode === 'normal') {
				return getNormalPDFValue(x, normalMean, normalStdDev);
			} else {
				return pdf.getValue(x);
			}
		};

		const step = appMode === 'normal' && normalStdDev < 3 ? 0.1 : 0.25;

		// Draw filled curve
		ctx.beginPath();
		ctx.moveTo(xToCanvas(0), yToCanvas(0));

		for (let x = 0; x <= 30; x += step) {
			const y = getPDFValue(x);
			ctx.lineTo(xToCanvas(x), yToCanvas(y));
		}
		ctx.lineTo(xToCanvas(30), yToCanvas(0));

		ctx.closePath();
		ctx.fillStyle = colors.curveFill;
		ctx.fill();

		// Draw curve stroke
		ctx.beginPath();
		for (let x = 0; x <= 30; x += step) {
			const y = getPDFValue(x);
			if (x === 0) {
				ctx.moveTo(xToCanvas(x), yToCanvas(y));
			} else {
				ctx.lineTo(xToCanvas(x), yToCanvas(y));
			}
		}
		ctx.strokeStyle = colors.curve;
		ctx.lineWidth = 2.5;
		ctx.stroke();

		// Draw slider handles (custom mode)
		if (appMode === 'custom') {
			for (let i = 0; i < controlPoints.length; i++) {
				const x = controlPoints[i];
				const y = heights[i] / pdf.normalizationConstant;
				const cx = xToCanvas(x);
				const cy = yToCanvas(y);

				ctx.beginPath();
				ctx.moveTo(cx, yToCanvas(0));
				ctx.lineTo(cx, cy);
				ctx.strokeStyle = colors.sliderStem;
				ctx.lineWidth = 2;
				ctx.stroke();

				ctx.beginPath();
				ctx.arc(cx, cy, sliderRadius, 0, Math.PI * 2);
				ctx.fillStyle = draggingIndex === i ? colors.sliderActive : colors.slider;
				ctx.fill();
				ctx.strokeStyle = isDark ? '#1e293b' : '#fff';
				ctx.lineWidth = 2;
				ctx.stroke();
			}
		}

		// Draw normal mode sliders
		if (appMode === 'normal') {
			const mu = normalMean;
			const sigma = normalStdDev;

			const meanX = xToCanvas(mu);
			const meanY = yToCanvas(getPDFValue(mu));

			ctx.beginPath();
			ctx.moveTo(meanX, yToCanvas(0));
			ctx.lineTo(meanX, meanY);
			ctx.strokeStyle = colors.sliderStem;
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(meanX, meanY, sliderRadius, 0, Math.PI * 2);
			ctx.fillStyle = draggingNormal === 'mean' ? colors.sliderActive : colors.slider;
			ctx.fill();
			ctx.strokeStyle = isDark ? '#1e293b' : '#fff';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.fillStyle = colors.label;
			ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText('\u03BC', meanX, meanY - 18);

			const sigmaX = xToCanvas(mu + sigma);
			const sigmaY = yToCanvas(getPDFValue(mu + sigma));

			ctx.beginPath();
			ctx.moveTo(sigmaX, yToCanvas(0));
			ctx.lineTo(sigmaX, sigmaY);
			ctx.strokeStyle = colors.sliderStem;
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(sigmaX, sigmaY, sliderRadius, 0, Math.PI * 2);
			ctx.fillStyle = draggingNormal === 'sigma' ? colors.sliderActive : colors.slider;
			ctx.fill();
			ctx.strokeStyle = isDark ? '#1e293b' : '#fff';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.fillText('\u03C3', sigmaX, sigmaY - 18);
		}
	}

	function getMousePos(e: MouseEvent): { x: number; y: number } {
		const rect = canvas.getBoundingClientRect();
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}

	function findSlider(pos: { x: number; y: number }): number {
		for (let i = 0; i < controlPoints.length; i++) {
			const sx = xToCanvas(controlPoints[i]);
			const sy = yToCanvas(heights[i] / pdf.normalizationConstant);
			const dist = Math.sqrt((pos.x - sx) ** 2 + (pos.y - sy) ** 2);
			if (dist < sliderRadius + 10) return i;
		}
		return -1;
	}

	function findNormalSlider(pos: { x: number; y: number }): 'mean' | 'sigma' | null {
		const mu = normalMean;
		const sigma = normalStdDev;

		const meanX = xToCanvas(mu);
		const meanY = yToCanvas(getNormalPDFValue(mu, mu, sigma));
		if (Math.sqrt((pos.x - meanX) ** 2 + (pos.y - meanY) ** 2) < sliderRadius + 10) {
			return 'mean';
		}

		const sigmaX = xToCanvas(mu + sigma);
		const sigmaY = yToCanvas(getNormalPDFValue(mu + sigma, mu, sigma));
		if (Math.sqrt((pos.x - sigmaX) ** 2 + (pos.y - sigmaY) ** 2) < sliderRadius + 10) {
			return 'sigma';
		}

		return null;
	}

	function handleMouseDown(e: MouseEvent) {
		const pos = getMousePos(e);

		if (appMode === 'normal') {
			draggingNormal = findNormalSlider(pos);
		} else {
			draggingIndex = findSlider(pos);
		}
	}

	function handleMouseMove(e: MouseEvent) {
		const pos = getMousePos(e);

		if (appMode === 'normal') {
			if (draggingNormal) {
				const newX = canvasToX(pos.x);

				if (draggingNormal === 'mean') {
					normalMean = Math.max(0, Math.min(30, newX));
				} else if (draggingNormal === 'sigma') {
					const newSigma = Math.abs(newX - normalMean);
					normalStdDev = Math.max(0.5, Math.min(15, newSigma));
				}

				updatePrices();
				drawCanvas();
			}
		} else {
			if (draggingIndex >= 0) {
				let newY = canvasToY(pos.y);
				newY = Math.max(0, newY * pdf.normalizationConstant);
				heights[draggingIndex] = newY;

				const idx = draggingIndex;
				if (controlPoints[idx] !== 0 && controlPoints[idx] !== 30) {
					let newX = canvasToX(pos.x);
					const minX = idx > 0 ? controlPoints[idx - 1] + 0.5 : 0;
					const maxX = idx < controlPoints.length - 1 ? controlPoints[idx + 1] - 0.5 : 30;
					newX = Math.max(minX, Math.min(maxX, newX));
					controlPoints[idx] = newX;
				}

				updatePrices();
				drawCanvas();
			}
		}
	}

	function handleMouseUp() {
		draggingIndex = -1;
		draggingNormal = null;
	}

	function handleDblClick(e: MouseEvent) {
		if (appMode !== 'custom') return;

		const pos = getMousePos(e);
		const sliderIdx = findSlider(pos);

		if (sliderIdx >= 0) {
			if (
				controlPoints.length > 2 &&
				controlPoints[sliderIdx] !== 0 &&
				controlPoints[sliderIdx] !== 30
			) {
				controlPoints.splice(sliderIdx, 1);
				heights.splice(sliderIdx, 1);
				controlPoints = [...controlPoints];
				heights = [...heights];
				updatePrices();
				drawCanvas();
			}
		} else {
			const x = canvasToX(pos.x);
			if (x >= 0.5 && x <= 29.5) {
				let tooClose = false;
				for (const cp of controlPoints) {
					if (Math.abs(cp - x) < 1) {
						tooClose = true;
						break;
					}
				}

				if (!tooClose) {
					let insertIdx = 0;
					while (insertIdx < controlPoints.length && controlPoints[insertIdx] < x) {
						insertIdx++;
					}

					const interpolatedHeight = pdf.getValue(x) * pdf.normalizationConstant;
					controlPoints.splice(insertIdx, 0, x);
					heights.splice(insertIdx, 0, Math.max(0.1, interpolatedHeight));
					controlPoints = [...controlPoints];
					heights = [...heights];
					updatePrices();
					drawCanvas();
				}
			}
		}
	}

	function setMode(newMode: 'custom' | 'normal') {
		if (newMode === 'normal' && appMode === 'custom') {
			pdf.buildPDF(controlPoints, heights);
			const mu = pricer.expectedValue();
			const sigma = Math.max(0.5, pdf.stddev());
			normalMean = mu;
			normalStdDev = sigma;
		}
		appMode = newMode;
		updatePrices();
		drawCanvas();
	}

	function reset() {
		controlPoints = [...DEFAULT_CONTROL_POINTS];
		heights = controlPoints.map(() => 1);
		normalMean = 15;
		normalStdDev = 5;
		updatePrices();
		drawCanvas();
	}

	// ============================================================
	// TRADER ACTIONS
	// ============================================================
	function roundToNearestDime(value: number): number {
		return Math.round(value * 10) / 10;
	}

	function handlePlaceBids(strike: number, type: 'above' | 'below') {
		const inputs = traderInputs[strike];
		const enabled = type === 'above' ? inputs.aboveBidEnabled : inputs.belowBidEnabled;
		if (!enabled) return;

		const marketId = getMarketId(strike, type);
		if (marketId === null) {
			console.error(`Market not found: ${type} ${strike}`);
			return;
		}

		const edge = type === 'above' ? inputs.aboveBidEdge : inputs.belowBidEdge;
		const size = Math.round(type === 'above' ? inputs.aboveBidSize : inputs.belowBidSize);
		const fair = prices[strike]?.[type] ?? 0;

		for (let i = 0; i < size; i++) {
			const price = roundToNearestDime(Math.max(0, Math.min(30, fair - edge - i)));
			placeBid(marketId, price, 1);
		}
	}

	function handlePlaceOffers(strike: number, type: 'above' | 'below') {
		const inputs = traderInputs[strike];
		const enabled = type === 'above' ? inputs.aboveOfferEnabled : inputs.belowOfferEnabled;
		if (!enabled) return;

		const marketId = getMarketId(strike, type);
		if (marketId === null) {
			console.error(`Market not found: ${type} ${strike}`);
			return;
		}

		const edge = type === 'above' ? inputs.aboveOfferEdge : inputs.belowOfferEdge;
		const size = Math.round(type === 'above' ? inputs.aboveOfferSize : inputs.belowOfferSize);
		const fair = prices[strike]?.[type] ?? 0;

		for (let i = 0; i < size; i++) {
			const price = roundToNearestDime(Math.max(0, Math.min(30, fair + edge + i)));
			placeOffer(marketId, price, 1);
		}
	}

	function handleClearBids(strike: number, type: 'above' | 'below') {
		const marketId = getMarketId(strike, type);
		if (marketId === null) {
			console.error(`Market not found: ${type} ${strike}`);
			return;
		}
		clearBids(marketId);
	}

	function handleClearOffers(strike: number, type: 'above' | 'below') {
		const marketId = getMarketId(strike, type);
		if (marketId === null) {
			console.error(`Market not found: ${type} ${strike}`);
			return;
		}
		clearOffers(marketId);
	}

	function handleClearAllOrders() {
		for (const K of STRIKES) {
			for (const type of ['above', 'below'] as const) {
				const marketId = getMarketId(K, type);
				if (marketId !== null) {
					clearBids(marketId);
					clearOffers(marketId);
				}
			}
		}
	}

	// ============================================================
	// LIFECYCLE
	// ============================================================
	onMount(() => {
		drawCanvas();
		window.addEventListener('resize', drawCanvas);
		return () => window.removeEventListener('resize', drawCanvas);
	});

	$effect(() => {
		// Redraw when mode changes
		void $mode;
		drawCanvas();
	});
</script>

<div class="flex h-full w-full flex-col overflow-auto p-5">
	<header class="mb-6 flex-shrink-0 text-center">
		<div class="mb-2 flex items-center justify-center gap-3">
			<h1 class="text-2xl font-semibold">Options Pricing Helper</h1>
			<button
				class="rounded-lg border bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80"
				onclick={reset}
			>
				Reset
			</button>
		</div>
		<p class="text-sm text-muted-foreground">
			{#if appMode === 'custom'}
				Drag sliders to shape your probability distribution.
			{:else}
				Adjust mean and standard deviation to define a normal distribution.
			{/if}
		</p>
	</header>

	<!-- Market Group Selector -->
	<div class="mb-5 flex flex-shrink-0 justify-center">
		<div class="flex items-center gap-3">
			<span class="text-sm font-medium text-muted-foreground">Market Group:</span>
			<Select.Root
				type="single"
				value={selectedGroupId !== null ? String(selectedGroupId) : undefined}
				onValueChange={(v) => {
					if (v) selectedGroupId = Number(v);
				}}
			>
				<Select.Trigger class="w-[200px]">
					{selectedGroupName}
				</Select.Trigger>
				<Select.Content>
					{#each optionsGroups as group (group.id)}
						<Select.Item value={String(group.id)} label={group.name}>
							{group.name}
						</Select.Item>
					{/each}
					{#if optionsGroups.length === 0}
						<div class="px-2 py-1.5 text-sm text-muted-foreground">No Options groups found</div>
					{/if}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="mb-5 flex flex-shrink-0 justify-center">
		<div class="inline-flex rounded-lg border">
			<button
				class="px-6 py-2.5 text-sm font-medium transition-colors {appMode === 'custom'
					? 'bg-primary text-primary-foreground'
					: 'bg-background text-muted-foreground hover:bg-muted'} rounded-l-lg"
				onclick={() => setMode('custom')}
			>
				Custom Distribution
			</button>
			<button
				class="px-6 py-2.5 text-sm font-medium transition-colors {appMode === 'normal'
					? 'bg-primary text-primary-foreground'
					: 'bg-background text-muted-foreground hover:bg-muted'} rounded-r-lg border-l"
				onclick={() => setMode('normal')}
			>
				Normal Distribution
			</button>
		</div>
	</div>

	{#if appMode === 'normal'}
		<div class="mb-4 flex flex-shrink-0 flex-wrap justify-center gap-6">
			<div class="flex flex-col items-center gap-2">
				<span class="text-sm font-semibold text-muted-foreground">Mean (&mu;)</span>
				<div class="flex items-center gap-3">
					<input
						type="range"
						min="0"
						max="30"
						step="0.1"
						bind:value={normalMean}
						oninput={() => {
							updatePrices();
							drawCanvas();
						}}
						class="w-36"
						aria-label="Mean"
					/>
					<input
						type="number"
						min="0"
						max="30"
						step="0.1"
						bind:value={normalMean}
						oninput={() => {
							updatePrices();
							drawCanvas();
						}}
						class="w-20 rounded-md border px-2 py-1.5 text-center font-mono text-sm"
						aria-label="Mean value"
					/>
				</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<span class="text-sm font-semibold text-muted-foreground">Std Dev (&sigma;)</span>
				<div class="flex items-center gap-3">
					<input
						type="range"
						min="0.5"
						max="15"
						step="0.1"
						bind:value={normalStdDev}
						oninput={() => {
							updatePrices();
							drawCanvas();
						}}
						class="w-36"
						aria-label="Standard deviation"
					/>
					<input
						type="number"
						min="0.5"
						max="15"
						step="0.1"
						bind:value={normalStdDev}
						oninput={() => {
							updatePrices();
							drawCanvas();
						}}
						class="w-20 rounded-md border px-2 py-1.5 text-center font-mono text-sm"
						aria-label="Standard deviation value"
					/>
				</div>
			</div>
		</div>
	{/if}

	<div class="relative mb-5 flex-shrink-0 rounded-xl bg-card p-5 shadow-sm">
		<canvas
			bind:this={canvas}
			class="block w-full cursor-default"
			style="height: min(350px, 40vh);"
			onmousedown={handleMouseDown}
			onmousemove={handleMouseMove}
			onmouseup={handleMouseUp}
			onmouseleave={handleMouseUp}
			ondblclick={handleDblClick}
		></canvas>
		{#if appMode === 'custom'}
			<div
				class="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-xs text-muted-foreground"
			>
				Double-click to add or remove sliders
			</div>
		{/if}
		<div class="mt-4 text-center">
			<span class="text-sm font-semibold uppercase text-muted-foreground"
				>Expected Settlement Value:
			</span>
			<span class="font-mono text-xl font-semibold text-primary">${expectedValue.toFixed(2)}</span>
		</div>
	</div>

	<div class="min-h-0 flex-1 overflow-auto rounded-xl bg-card p-5 uppercase shadow-sm">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="text-lg font-semibold">Scales Auto Trader</div>
				<label class="flex items-center gap-2 text-sm text-muted-foreground">
					<input
						type="checkbox"
						class="h-4 w-4 accent-primary"
						bind:checked={showAllAutotrader}
						onchange={() => setAllAutotraderEnabled(showAllAutotrader)}
					/>
					<span>Show All</span>
				</label>
			</div>
			<button
				class="rounded bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
				onclick={handleClearAllOrders}
			>
				CLR ALL ORDERS
			</button>
		</div>
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr>
					<th
						colspan="4"
						class="rounded-l-md bg-muted px-2 py-2 text-center text-xs font-bold uppercase tracking-wide"
						>Above Bids</th
					>
					<th class="px-1"></th>
					<th rowspan="2" class="bg-muted px-2 py-2 text-center font-bold">Above (Call)</th>
					<th class="px-1"></th>
					<th
						colspan="4"
						class="bg-muted px-2 py-2 text-center text-xs font-bold uppercase tracking-wide"
						>Above Offers</th
					>
					<th rowspan="2" class="bg-muted px-2 py-2 text-center text-xs font-bold">Call Pos</th>
					<th rowspan="2" class="bg-muted px-3 py-2 text-center text-lg font-extrabold">Strike</th>
					<th rowspan="2" class="bg-muted px-2 py-2 text-center text-xs font-bold">Put Pos</th>
					<th
						colspan="4"
						class="bg-muted px-2 py-2 text-center text-xs font-bold uppercase tracking-wide"
						>Below Bids</th
					>
					<th class="px-1"></th>
					<th rowspan="2" class="bg-muted px-2 py-2 text-center font-bold">Below (Put)</th>
					<th class="px-1"></th>
					<th
						colspan="4"
						class="rounded-r-md bg-muted px-2 py-2 text-center text-xs font-bold uppercase tracking-wide"
						>Below Offers</th
					>
				</tr>
				<tr>
					<th class="rounded-bl-md bg-muted px-1 py-1 text-xs"></th>
					<th class="bg-muted px-1 py-1 text-xs"></th>
					<th class="bg-muted px-1 py-1 text-xs">size</th>
					<th class="bg-muted px-1 py-1 text-xs">edge</th>
					<th class="bg-muted px-1 py-1"></th>
					<th class="bg-muted px-1 py-1"></th>
					<th class="bg-muted px-1 py-1 text-xs">edge</th>
					<th class="bg-muted px-1 py-1 text-xs">size</th>
					<th class="bg-muted px-1 py-1 text-xs"></th>
					<th class="bg-muted px-1 py-1 text-xs"></th>
					<th class="bg-muted px-1 py-1 text-xs"></th>
					<th class="bg-muted px-1 py-1 text-xs"></th>
					<th class="bg-muted px-1 py-1 text-xs">size</th>
					<th class="bg-muted px-1 py-1 text-xs">edge</th>
					<th class="bg-muted px-1 py-1"></th>
					<th class="bg-muted px-1 py-1"></th>
					<th class="bg-muted px-1 py-1 text-xs">edge</th>
					<th class="bg-muted px-1 py-1 text-xs">size</th>
					<th class="bg-muted px-1 py-1 text-xs"></th>
					<th class="rounded-br-md bg-muted px-1 py-1 text-xs"></th>
				</tr>
			</thead>
			<tbody>
				{#each STRIKES as K}
					{@const inputs = traderInputs[K]}
					<tr class="border-b border-border/60 odd:bg-muted/30">
						<!-- Above Bids -->
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveBidEnabled}>
							<button
								class="rounded bg-muted-foreground/80 px-2 py-1 text-xs font-semibold text-background hover:bg-muted-foreground"
								onclick={() => handleClearBids(K, 'above')}>CLR BIDS</button
							>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveBidEnabled}>
							<button
								class="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
								onclick={() => handlePlaceBids(K, 'above')}>PLACE BIDS</button
							>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveBidEnabled}>
							<input
								type="number"
								class="w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.aboveBidSize}
								min="1"
							/>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveBidEnabled}>
							<input
								type="number"
								class="no-spin w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.aboveBidEdge}
								min="0"
								step="0.1"
							/>
						</td>
						<td class="px-1 py-2 text-center">
							<input
								type="checkbox"
								class="h-4 w-4 accent-primary"
								bind:checked={inputs.aboveBidEnabled}
							/>
						</td>
						<!-- Above Price -->
						<td class="px-2 py-2 text-center font-mono text-green-600 dark:text-green-400">
							${(prices[K]?.above ?? 0).toFixed(2)}
						</td>
						<td class="px-1 py-2 text-center">
							<input
								type="checkbox"
								class="h-4 w-4 accent-primary"
								bind:checked={inputs.aboveOfferEnabled}
							/>
						</td>
						<!-- Above Offers -->
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveOfferEnabled}>
							<input
								type="number"
								class="no-spin w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.aboveOfferEdge}
								min="0"
								step="0.1"
							/>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveOfferEnabled}>
							<input
								type="number"
								class="w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.aboveOfferSize}
								min="1"
							/>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveOfferEnabled}>
							<button
								class="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
								onclick={() => handlePlaceOffers(K, 'above')}>PLACE OFFERS</button
							>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.aboveOfferEnabled}>
							<button
								class="rounded bg-muted-foreground/80 px-2 py-1 text-xs font-semibold text-background hover:bg-muted-foreground"
								onclick={() => handleClearOffers(K, 'above')}>CLR OFFERS</button
							>
						</td>
						<!-- Call Position -->
						<td
							class="px-2 py-2 text-center font-mono font-semibold {getPosition(K, 'above') > 0
								? 'text-green-600 dark:text-green-400'
								: getPosition(K, 'above') < 0
									? 'text-red-600 dark:text-red-400'
									: ''}"
						>
							{getPosition(K, 'above') !== 0 ? getPosition(K, 'above') : '-'}
						</td>
						<!-- Strike -->
						<td class="px-3 py-2 text-center text-xl font-bold">{K}</td>
						<!-- Put Position -->
						<td
							class="px-2 py-2 text-center font-mono font-semibold {getPosition(K, 'below') > 0
								? 'text-green-600 dark:text-green-400'
								: getPosition(K, 'below') < 0
									? 'text-red-600 dark:text-red-400'
									: ''}"
						>
							{getPosition(K, 'below') !== 0 ? getPosition(K, 'below') : '-'}
						</td>
						<!-- Below Bids -->
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowBidEnabled}>
							<button
								class="rounded bg-muted-foreground/80 px-2 py-1 text-xs font-semibold text-background hover:bg-muted-foreground"
								onclick={() => handleClearBids(K, 'below')}>CLR BIDS</button
							>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowBidEnabled}>
							<button
								class="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
								onclick={() => handlePlaceBids(K, 'below')}>PLACE BIDS</button
							>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowBidEnabled}>
							<input
								type="number"
								class="w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.belowBidSize}
								min="1"
							/>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowBidEnabled}>
							<input
								type="number"
								class="no-spin w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.belowBidEdge}
								min="0"
								step="0.1"
							/>
						</td>
						<td class="px-1 py-2 text-center">
							<input
								type="checkbox"
								class="h-4 w-4 accent-primary"
								bind:checked={inputs.belowBidEnabled}
							/>
						</td>
						<!-- Below Price -->
						<td class="px-2 py-2 text-center font-mono text-green-600 dark:text-green-400">
							${(prices[K]?.below ?? 0).toFixed(2)}
						</td>
						<td class="px-1 py-2 text-center">
							<input
								type="checkbox"
								class="h-4 w-4 accent-primary"
								bind:checked={inputs.belowOfferEnabled}
							/>
						</td>
						<!-- Below Offers -->
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowOfferEnabled}>
							<input
								type="number"
								class="no-spin w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.belowOfferEdge}
								min="0"
								step="0.1"
							/>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowOfferEnabled}>
							<input
								type="number"
								class="w-12 rounded border px-1.5 py-1 text-center font-mono text-xs"
								bind:value={inputs.belowOfferSize}
								min="1"
							/>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowOfferEnabled}>
							<button
								class="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
								onclick={() => handlePlaceOffers(K, 'below')}>PLACE OFFERS</button
							>
						</td>
						<td class="px-1 py-2 text-center" class:opacity-30={!inputs.belowOfferEnabled}>
							<button
								class="rounded bg-muted-foreground/80 px-2 py-1 text-xs font-semibold text-background hover:bg-muted-foreground"
								onclick={() => handleClearOffers(K, 'below')}>CLR OFFERS</button
							>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	/* Hide spin buttons on number inputs with no-spin class */
	:global(.no-spin::-webkit-outer-spin-button),
	:global(.no-spin::-webkit-inner-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}
	:global(.no-spin) {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
