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
		highlightTimestamp?: Date;
		onTradeClick?: (trade: websocket_api.ITrade) => void;
		onHoverTimestamp?: (fraction: number | undefined) => void;
	}

	let { trades, minSettlement, maxSettlement, showMyTrades = true, accountId, xDomain, highlightTimestamp, onTradeClick, onHoverTimestamp }: Props = $props();

	const handleMouseMove = (e: MouseEvent) => {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		onHoverTimestamp?.((e.clientX - rect.left) / rect.width);
	};

	const handleMouseLeave = () => {
		onHoverTimestamp?.(undefined);
	};

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

	const showTooltip = (e: MouseEvent, trade: websocket_api.ITrade, side: 'buy' | 'sell') => {
		tooltipText = formatTradeTooltip(trade);
		tooltipX = e.clientX;
		tooltipY = e.clientY;
		tooltipSide = side;
		tooltipVisible = true;
	};

	const hideTooltip = () => {
		tooltipVisible = false;
	};

	// Get current user's account ID (allow override via prop)
	const activeAccountId = $derived(accountId ?? serverState.actingAs ?? serverState.userId);

	// Filter trades where the user was the buyer (they bought - green)
	const userBuyTrades = $derived(trades.filter((trade) => trade.buyerId === activeAccountId));

	// Filter trades where the user was the seller (they sold - red)
	const userSellTrades = $derived(trades.filter((trade) => trade.sellerId === activeAccountId));

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
</script>

{#if tooltipVisible}
	<div
		class="pointer-events-none fixed z-50 rounded border px-2 py-1 text-xs shadow-md {tooltipSide === 'buy' ? 'border-green-300 bg-green-50 text-green-950 dark:border-green-700 dark:bg-green-950 dark:text-green-100' : 'border-red-300 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950 dark:text-red-100'}"
		style="left: {tooltipX + 10}px; top: {tooltipY - 40}px;"
	>
		<div>{tooltipText.price}</div>
		<div>{tooltipText.size}</div>
		<div class="text-muted-foreground">{tooltipText.time}</div>
	</div>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={containerEl} class="h-[20rem] w-full pt-4 md:h-96" onmousemove={handleMouseMove} onmouseleave={handleMouseLeave}>
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
			<svelte:fragment slot="belowMarks">
				{#if highlightTimestamp}
					<Rule x={highlightTimestamp} class="stroke-primary" stroke-width="1.5" stroke-dasharray="4 3" />
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
											onclick={() => onTradeClick?.(point.data)}
											onkeydown={(e) => e.key === 'Enter' && onTradeClick?.(point.data)}
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
											onclick={() => onTradeClick?.(point.data)}
											onkeydown={(e) => e.key === 'Enter' && onTradeClick?.(point.data)}
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
