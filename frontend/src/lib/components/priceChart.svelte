<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart } from 'layerchart';
	import { websocket_api } from 'schema-js';
	import { sortedBids, sortedOffers } from '$lib/components/marketDataUtils';
	import type { MarketData } from '$lib/api.svelte';
	import { sendClientMessage } from '$lib/api.svelte';

	interface Props {
		trades: websocket_api.ITrade[];
		marketData: MarketData;
		showBidAsk: boolean;
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
	}

	let { trades, marketData, showBidAsk, minSettlement, maxSettlement }: Props = $props();
	
	// Request full order history if needed and not already available
	$effect(() => {
		if (showBidAsk && !marketData.hasFullOrderHistory && marketData.definition.id) {
			sendClientMessage({ getFullOrderHistory: { marketId: marketData.definition.id } });
		}
	});
	
	// Get all historical orders (including cancelled/filled ones) if full history is available
	// When hasFullOrderHistory is true, marketData.orders contains ALL orders including cancelled/filled ones
	// When false, it only contains active orders
	const allOrders = $derived(marketData.orders);

	let sidebar = useSidebar();

	const tradeTimestamp = (trade: websocket_api.ITrade) => {
		if (!trade) {
			return undefined;
		}
		const timestamp = trade.transactionTimestamp;
		return timestamp ? new Date(timestamp.seconds * 1000) : undefined;
	};

	// Create a map of transactionId -> timestamp from order sizes (most accurate)
	// and fall back to trades if order timestamps aren't available
	const transactionTimestampMap = $derived.by(() => {
		const map = new Map<number, Date>();
		
		// First, collect timestamps from order sizes (these are the exact times when orders changed)
		for (const order of allOrders) {
			if (order.sizes) {
				for (const size of order.sizes) {
					if (size.transactionId != null && size.transactionTimestamp) {
						const timestamp = new Date(size.transactionTimestamp.seconds * 1000);
						// Only set if not already set (order timestamps take precedence)
						if (!map.has(size.transactionId)) {
							map.set(size.transactionId, timestamp);
						}
					}
				}
			}
			// Also check if order creation has a timestamp
			if (order.transactionId != null && order.transactionTimestamp) {
				const timestamp = new Date(order.transactionTimestamp.seconds * 1000);
				if (!map.has(order.transactionId)) {
					map.set(order.transactionId, timestamp);
				}
			}
		}
		
		// Fall back to trade timestamps for transaction IDs not covered by orders
		for (const trade of trades) {
			if (trade.transactionId != null && trade.transactionTimestamp) {
				const timestamp = new Date(trade.transactionTimestamp.seconds * 1000);
				if (!map.has(trade.transactionId)) {
					map.set(trade.transactionId, timestamp);
				}
			}
		}
		
		return map;
	});

	// Compute best bid/ask at each point where orders change
	const bidAskHistory = $derived.by(() => {
		if (!showBidAsk || allOrders.length === 0) {
			return { bids: [], asks: [] };
		}

		const bidPoints: Array<{ timestamp: Date; price: number }> = [];
		const askPoints: Array<{ timestamp: Date; price: number }> = [];

		// Get all unique transaction IDs where orders change (created, modified, or cancelled)
		const allTxIds = new Set<number>();
		for (const order of allOrders) {
			// Order creation transaction ID
			if (order.transactionId != null) {
				allTxIds.add(order.transactionId);
			}
			// All size change transaction IDs
			if (order.sizes) {
				for (const size of order.sizes) {
					if (size.transactionId != null) {
						allTxIds.add(size.transactionId);
					}
				}
			}
		}
		// Also include trade transaction IDs for better timestamp mapping
		for (const trade of trades) {
			if (trade.transactionId != null) {
				allTxIds.add(trade.transactionId);
			}
		}
		const sortedTxIds = Array.from(allTxIds).sort((a, b) => a - b);

		if (sortedTxIds.length === 0) {
			return { bids: [], asks: [] };
		}

		let lastBidPrice: number | undefined | null = undefined;
		let lastAskPrice: number | undefined | null = undefined;
		let lastBidTimestamp: Date | undefined = undefined;
		let lastAskTimestamp: Date | undefined = undefined;

		// First, check initial state (before any transactions, if there are orders that existed before first txId)
		if (sortedTxIds.length > 0) {
			const firstTxId = sortedTxIds[0];
			// Check orders that existed before the first transaction
			// Use historical size lookup to include cancelled/filled orders
			const initialOrders = allOrders
				.filter((o) => {
					const orderCreatedAt = o.transactionId ?? 0;
					return orderCreatedAt < firstTxId;
				})
				.map((o) => {
					// Find the size entry at or before firstTxId
					const sizeEntry = o.sizes?.findLast((s) => s.transactionId <= firstTxId);
					if (sizeEntry) {
						return { ...o, size: sizeEntry.size };
					} else {
						// No size entry - use initial size (handle null/undefined)
						const initialSize = o.size;
						return { ...o, size: initialSize != null ? initialSize : 0 };
					}
				})
				.filter((o) => (o.size ?? 0) > 0);

			if (initialOrders.length > 0) {
				const initialBids = sortedBids(initialOrders);
				const initialOffers = sortedOffers(initialOrders);
				const initialBidPrice = initialBids[0]?.price;
				const initialAskPrice = initialOffers[0]?.price;

				// Get timestamp for initial state (use first trade timestamp or estimate)
				let initialTimestamp: Date | undefined;
				if (trades.length > 0 && trades[0]?.transactionTimestamp) {
					const firstTradeTimestamp = new Date(trades[0].transactionTimestamp.seconds * 1000);
					const firstTradeTxId = trades[0].transactionId ?? 0;
					if (firstTradeTxId >= firstTxId) {
						// Estimate timestamp before first transaction
						const txDiff = firstTxId - firstTradeTxId;
						initialTimestamp = new Date(firstTradeTimestamp.getTime() + txDiff * 1000);
					} else {
						initialTimestamp = firstTradeTimestamp;
					}
				}

				if (initialTimestamp) {
					// Use minSettlement for bid if not available, maxSettlement for ask if not available
					const initialBidPriceToUse = initialBidPrice != null && initialBidPrice !== undefined 
						? initialBidPrice 
						: (minSettlement ?? null);
					const initialAskPriceToUse = initialAskPrice != null && initialAskPrice !== undefined 
						? initialAskPrice 
						: (maxSettlement ?? null);
					
					if (initialBidPriceToUse !== null) {
						bidPoints.push({ timestamp: initialTimestamp, price: initialBidPriceToUse });
						lastBidPrice = initialBidPriceToUse;
						lastBidTimestamp = initialTimestamp;
					}
					if (initialAskPriceToUse !== null) {
						askPoints.push({ timestamp: initialTimestamp, price: initialAskPriceToUse });
						lastAskPrice = initialAskPriceToUse;
						lastAskTimestamp = initialTimestamp;
					}
				}
			}
		}

		// Process each transaction ID sequentially to track changes
		for (let i = 0; i < sortedTxIds.length; i++) {
			const txId = sortedTxIds[i];
			
			// Get orders active at this transaction ID (AFTER the transaction)
			// Reconstruct historical order book state using ALL orders (including cancelled/filled)
			const ordersAtTx = allOrders
				.filter((o) => {
					// Only include orders that were created at or before this transaction ID
					const orderCreatedAt = o.transactionId ?? 0;
					return txId >= orderCreatedAt;
				})
				.map((o) => {
					// Find the size entry at or before this transaction ID
					const sizeEntry = o.sizes?.findLast((s) => s.transactionId <= txId);
					
					if (sizeEntry) {
						// Use the size from the size entry (order has had size changes)
						return { ...o, size: sizeEntry.size };
					} else {
						// No size entry found - order hasn't had any size changes yet
						// Use the initial size (since we already filtered to orders created at or before txId)
						const initialSize = o.size;
						return { ...o, size: initialSize != null ? initialSize : 0 };
					}
				})
				.filter((o) => (o.size ?? 0) > 0);

			const bids = sortedBids(ordersAtTx);
			const offers = sortedOffers(ordersAtTx);

			const bestBid = bids[0];
			const bestOffer = offers[0];

			const bidPrice = bestBid?.price;
			const askPrice = bestOffer?.price;

			// Get timestamp for this transaction ID
			// First, try to get it directly from order size changes at this exact transaction ID
			let timestamp: Date | undefined = undefined;
			
			// Look for order size changes that happened at this exact transaction ID
			for (const order of allOrders) {
				if (order.sizes) {
					for (const size of order.sizes) {
						if (size.transactionId === txId && size.transactionTimestamp) {
							timestamp = new Date(size.transactionTimestamp.seconds * 1000);
							break;
						}
					}
				}
				if (timestamp) break;
			}
			
			// If not found, check if this is an order creation transaction ID
			if (!timestamp) {
				for (const order of allOrders) {
					if (order.transactionId === txId && order.transactionTimestamp) {
						timestamp = new Date(order.transactionTimestamp.seconds * 1000);
						break;
					}
				}
			}
			
			// Fall back to the map (which includes trades)
			if (!timestamp) {
				timestamp = transactionTimestampMap.get(txId);
			}

			if (timestamp) {
				// Track bid price changes, using minSettlement when bid doesn't exist
				const currentBidPrice = bidPrice != null && bidPrice !== undefined 
					? bidPrice 
					: (minSettlement ?? null);
				const bidChanged = currentBidPrice !== lastBidPrice;
				
				if (bidChanged) {
					// Add the new price point (will be minSettlement if no bid exists)
					if (currentBidPrice !== null) {
						bidPoints.push({ timestamp, price: currentBidPrice });
						lastBidTimestamp = timestamp;
					}
					lastBidPrice = currentBidPrice;
				}
				
				// Track ask price changes, using maxSettlement when ask doesn't exist
				const currentAskPrice = askPrice != null && askPrice !== undefined 
					? askPrice 
					: (maxSettlement ?? null);
				const askChanged = currentAskPrice !== lastAskPrice;
				
				if (askChanged) {
					// Add the new price point (will be maxSettlement if no ask exists)
					if (currentAskPrice !== null) {
						askPoints.push({ timestamp, price: currentAskPrice });
						lastAskTimestamp = timestamp;
					}
					lastAskPrice = currentAskPrice;
				}
			}
		}

		// Transform to step function: each price stays constant until the next change
		// For each point at time T with price P, add another point at time T_next with the same price P
		const stepBids: Array<{ timestamp: Date; price: number }> = [];
		const stepAsks: Array<{ timestamp: Date; price: number }> = [];
		
		// Process bids
		for (let i = 0; i < bidPoints.length; i++) {
			const currentPoint = bidPoints[i];
			stepBids.push(currentPoint);
			
			// If there's a next point, add an intermediate point at the next timestamp with the current price
			if (i < bidPoints.length - 1) {
				const nextPoint = bidPoints[i + 1];
				stepBids.push({ timestamp: nextPoint.timestamp, price: currentPoint.price });
			}
		}
		
		// Process asks
		for (let i = 0; i < askPoints.length; i++) {
			const currentPoint = askPoints[i];
			stepAsks.push(currentPoint);
			
			// If there's a next point, add an intermediate point at the next timestamp with the current price
			if (i < askPoints.length - 1) {
				const nextPoint = askPoints[i + 1];
				stepAsks.push({ timestamp: nextPoint.timestamp, price: currentPoint.price });
			}
		}
		
		// Extend both sides to the same maximum timestamp (latest change from either side)
		// This ensures both lines end at the same time
		const maxTimestamp = lastBidTimestamp && lastAskTimestamp
			? (lastBidTimestamp.getTime() > lastAskTimestamp.getTime() ? lastBidTimestamp : lastAskTimestamp)
			: (lastBidTimestamp || lastAskTimestamp);
		
		if (maxTimestamp) {
			// Extend bids to the maximum timestamp
			if (stepBids.length > 0) {
				const lastBidPoint = stepBids[stepBids.length - 1];
				if (lastBidPoint.timestamp.getTime() < maxTimestamp.getTime()) {
					stepBids.push({ timestamp: maxTimestamp, price: lastBidPoint.price });
				}
			}
			
			// Extend asks to the maximum timestamp
			if (stepAsks.length > 0) {
				const lastAskPoint = stepAsks[stepAsks.length - 1];
				if (lastAskPoint.timestamp.getTime() < maxTimestamp.getTime()) {
					stepAsks.push({ timestamp: maxTimestamp, price: lastAskPoint.price });
				}
			}
		}
		
		// Add min/max settlement points at first and last timestamps to ensure paths span full height
		// This ensures gradients span from min to max settlement, not just the path's bounding box
		if (stepBids.length > 0 && minSettlement != null) {
			const firstTimestamp = stepBids[0].timestamp;
			const lastTimestamp = stepBids[stepBids.length - 1].timestamp;
			// Add minSettlement point at first timestamp (before the first bid point)
			stepBids.unshift({ timestamp: firstTimestamp, price: minSettlement });
			// Add minSettlement point at last timestamp (after the last bid point)
			stepBids.push({ timestamp: lastTimestamp, price: minSettlement });
		}
		
		if (stepAsks.length > 0 && maxSettlement != null) {
			const firstTimestamp = stepAsks[0].timestamp;
			const lastTimestamp = stepAsks[stepAsks.length - 1].timestamp;
			// Add maxSettlement point at first timestamp (before the first ask point)
			stepAsks.unshift({ timestamp: firstTimestamp, price: maxSettlement });
			// Add maxSettlement point at last timestamp (after the last ask point)
			stepAsks.push({ timestamp: lastTimestamp, price: maxSettlement });
		}

		return { bids: stepBids, asks: stepAsks };
	});

	const bidTimestamp = (point: { timestamp: Date; price: number }) => point.timestamp;
	const askTimestamp = (point: { timestamp: Date; price: number }) => point.timestamp;
	const bidPrice = (point: { timestamp: Date; price: number }) => point.price;
	const askPrice = (point: { timestamp: Date; price: number }) => point.price;

	// Compute shared x-axis domain from all data sources (trades, bids, asks)
	const xDomain = $derived.by(() => {
		const timestamps: Date[] = [];
		
		// Collect timestamps from trades
		for (const trade of trades) {
			const ts = tradeTimestamp(trade);
			if (ts) timestamps.push(ts);
		}
		
		// Collect timestamps from bid/ask history if enabled
		if (showBidAsk) {
			for (const bid of bidAskHistory.bids) {
				if (bid.timestamp) timestamps.push(bid.timestamp);
			}
			for (const ask of bidAskHistory.asks) {
				if (ask.timestamp) timestamps.push(ask.timestamp);
			}
		}
		
		if (timestamps.length === 0) {
			return undefined;
		}
		
		const minTime = Math.min(...timestamps.map(ts => ts.getTime()));
		const maxTime = Math.max(...timestamps.map(ts => ts.getTime()));
		
		return [new Date(minTime), new Date(maxTime)];
	});

	// Track container dimensions to avoid LayerCake zero-width/height warnings
	let containerEl: HTMLDivElement | undefined = $state();
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let hasDimensions = $derived(containerWidth > 0 && containerHeight > 0);
	$effect(() => {
		if (!containerEl) return;
		const observer = new ResizeObserver(() => {
			// Use rAF to ensure layout is stable before rendering chart
			requestAnimationFrame(() => {
				if (containerEl) {
					containerWidth = containerEl.offsetWidth;
					containerHeight = containerEl.offsetHeight;
				}
			});
		});
		observer.observe(containerEl);
		return () => observer.disconnect();
	});

	// Add gradient fills to bid/ask lines after rendering
	$effect(() => {
		if (!showBidAsk || !hasDimensions) return;
		// Depend on bidAskHistory and settlement prices to re-run when data changes
		const _ = bidAskHistory.bids.length + bidAskHistory.asks.length;
		const _min = minSettlement;
		const _max = maxSettlement;
		
		// Use double rAF to ensure LayerChart has finished rendering
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				// Add gradient definitions to SVG if they don't exist
				const bidLineEl = containerEl?.querySelector('.bid-line svg');
				const askLineEl = containerEl?.querySelector('.ask-line svg');
			
			// Add gradients to bid line SVG
			if (bidLineEl) {
				// Remove existing gradient if it exists to recreate it
				const existingGradient = bidLineEl.querySelector('#bid-gradient');
				if (existingGradient) {
					existingGradient.remove();
				}
				
				const defs = bidLineEl.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
				if (!bidLineEl.querySelector('defs')) {
					bidLineEl.insertBefore(defs, bidLineEl.firstChild);
				}
				
				const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
				gradient.setAttribute('id', 'bid-gradient');
				gradient.setAttribute('gradientUnits', 'objectBoundingBox');
				// Vertical gradient: x1=x2 ensures same color at same x position (vertical)
				// y1=0% is top of bounding box, y2=100% is bottom
				gradient.setAttribute('x1', '0%');
				gradient.setAttribute('y1', '0%');
				gradient.setAttribute('x2', '0%');
				gradient.setAttribute('y2', '100%');
				
				// Gradient fades from top (transparent) to bottom (strongest)
				// This creates a fill below the line that fades downward
				const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
				stop1.setAttribute('offset', '0%');
				stop1.setAttribute('stop-color', 'rgb(34, 197, 94)');
				stop1.setAttribute('stop-opacity', '0');
				
				const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
				stop2.setAttribute('offset', '100%');
				stop2.setAttribute('stop-color', 'rgb(34, 197, 94)');
				stop2.setAttribute('stop-opacity', '0.3');
				
				gradient.appendChild(stop1);
				gradient.appendChild(stop2);
				defs.appendChild(gradient);
			}
			
			// Add gradients to ask line SVG
			if (askLineEl) {
				// Remove existing gradient if it exists to recreate it
				const existingGradient = askLineEl.querySelector('#ask-gradient');
				if (existingGradient) {
					existingGradient.remove();
				}
				
				const defs = askLineEl.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
				if (!askLineEl.querySelector('defs')) {
					askLineEl.insertBefore(defs, askLineEl.firstChild);
				}
				
				const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
				gradient.setAttribute('id', 'ask-gradient');
				gradient.setAttribute('gradientUnits', 'objectBoundingBox');
				// Vertical gradient: x1=x2 ensures same color at same x position (vertical)
				// y1=0% is top of bounding box, y2=100% is bottom
				gradient.setAttribute('x1', '0%');
				gradient.setAttribute('y1', '0%');
				gradient.setAttribute('x2', '0%');
				gradient.setAttribute('y2', '100%');
				
				// Gradient fades from top (strongest) to bottom (transparent)
				// This creates a fill above the line that fades upward
				const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
				stop1.setAttribute('offset', '0%');
				stop1.setAttribute('stop-color', 'rgb(239, 68, 68)');
				stop1.setAttribute('stop-opacity', '0.3');
				
				const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
				stop2.setAttribute('offset', '100%');
				stop2.setAttribute('stop-color', 'rgb(239, 68, 68)');
				stop2.setAttribute('stop-opacity', '0');
				
				gradient.appendChild(stop1);
				gradient.appendChild(stop2);
				defs.appendChild(gradient);
			}
			
			// Close bid paths to create area fill below the line
			const bidPath = bidLineEl?.querySelector('path');
			if (bidPath && bidPath.getAttribute('d')) {
				let pathData = bidPath.getAttribute('d') || '';
				// Remove closing Z if already closed, so we can re-close it properly
				pathData = pathData.replace(/[\s]*[Zz][\s]*$/, '').trim();
				
				// Get SVG dimensions and viewBox to determine bottom edge
				const svg = bidPath.closest('svg');
				if (svg && pathData) {
					const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) || [];
					if (viewBox.length === 4) {
						const [, , width, height] = viewBox;
						// Extract coordinates from path - handle various path commands
						const coords: number[][] = [];
						// Match M/L commands and extract coordinates
						const pathCommands = pathData.match(/[MLml][\s]*([\d.e-]+)[\s,]+([\d.e-]+)/g);
						if (pathCommands) {
							for (const cmd of pathCommands) {
								const match = cmd.match(/([\d.e-]+)[\s,]+([\d.e-]+)/);
								if (match) {
									coords.push([parseFloat(match[1]), parseFloat(match[2])]);
								}
							}
						}
						
						if (coords.length >= 2) {
							const firstX = coords[0][0];
							const lastX = coords[coords.length - 1][0];
							// Close path: line to bottom-right, line to bottom-left, line to start
							const closedPath = `${pathData} L ${lastX} ${height} L ${firstX} ${height} Z`;
							bidPath.setAttribute('d', closedPath);
						}
					}
				}
			}
			
			// Close ask paths to create area fill above the line
			const askPath = askLineEl?.querySelector('path');
			if (askPath && askPath.getAttribute('d')) {
				let pathData = askPath.getAttribute('d') || '';
				// Remove closing Z if already closed, so we can re-close it properly
				pathData = pathData.replace(/[\s]*[Zz][\s]*$/, '').trim();
				
				// Get SVG dimensions and viewBox to determine top edge
				const svg = askPath.closest('svg');
				if (svg && pathData) {
					const viewBox = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) || [];
					if (viewBox.length === 4) {
						const [, , width, height] = viewBox;
						// Extract coordinates from path - handle various path commands
						const coords: number[][] = [];
						// Match M/L commands and extract coordinates
						const pathCommands = pathData.match(/[MLml][\s]*([\d.e-]+)[\s,]+([\d.e-]+)/g);
						if (pathCommands) {
							for (const cmd of pathCommands) {
								const match = cmd.match(/([\d.e-]+)[\s,]+([\d.e-]+)/);
								if (match) {
									coords.push([parseFloat(match[1]), parseFloat(match[2])]);
								}
							}
						}
						
						if (coords.length >= 2) {
							const firstX = coords[0][0];
							const lastX = coords[coords.length - 1][0];
							// Close path: line to top-right, line to top-left, line to start
							const closedPath = `${pathData} L ${lastX} 0 L ${firstX} 0 Z`;
							askPath.setAttribute('d', closedPath);
						}
					}
				}
			}
			});
		});
	});
</script>

<div bind:this={containerEl} class="relative w-full pt-4" style="height: 20rem; min-height: 20rem;">
	{#if hasDimensions}
		<!-- Main chart with trades and axes -->
		<LineChart
			data={trades}
			x={tradeTimestamp}
			y="price"
			xDomain={xDomain}
			yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
			props={{
				xAxis: { format: 15, ticks: sidebar.isMobile ? 3 : undefined },
				yAxis: { grid: { class: 'stroke-surface-content/30' } }
			}}
			tooltip={false}
		/>
		<!-- Overlay bid/ask lines without axes -->
		{#if showBidAsk && bidAskHistory.bids.length > 0 && hasDimensions}
			<div class="absolute top-0 left-0 pointer-events-none bid-line" style="width: {containerWidth}px; height: {containerHeight}px;">
				<LineChart
					data={bidAskHistory.bids}
					x={bidTimestamp}
					y={bidPrice}
					xDomain={xDomain}
					yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
					props={{
						xAxis: undefined,
						yAxis: undefined
					}}
					tooltip={false}
				/>
			</div>
		{/if}
		{#if showBidAsk && bidAskHistory.asks.length > 0 && hasDimensions}
			<div class="absolute top-0 left-0 pointer-events-none ask-line" style="width: {containerWidth}px; height: {containerHeight}px;">
				<LineChart
					data={bidAskHistory.asks}
					x={askTimestamp}
					y={askPrice}
					xDomain={xDomain}
					yDomain={[minSettlement ?? 0, maxSettlement ?? 0]}
					props={{
						xAxis: undefined,
						yAxis: undefined
					}}
					tooltip={false}
				/>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Target line chart data paths - LayerChart renders the line as a path element */
	:global(.bid-line svg path) {
		stroke: rgb(34, 197, 94) !important; /* green-500 - best bid */
		stroke-width: 1.5px !important;
		fill: url(#bid-gradient) !important; /* Gradient fill below the line */
	}
	
	:global(.ask-line svg path) {
		stroke: rgb(239, 68, 68) !important; /* red-500 - best ask */
		stroke-width: 1.5px !important;
		fill: url(#ask-gradient) !important; /* Gradient fill above the line */
	}
	
	/* Hide axes, grid lines, and text in overlay charts */
	:global(.bid-line svg line),
	:global(.ask-line svg line),
	:global(.bid-line svg text),
	:global(.ask-line svg text) {
		display: none !important;
	}
	
	/* Hide axis and grid groups */
	:global(.bid-line svg g[class*="axis"]),
	:global(.ask-line svg g[class*="axis"]),
	:global(.bid-line svg g[class*="grid"]),
	:global(.ask-line svg g[class*="grid"]) {
		display: none !important;
	}
</style>

