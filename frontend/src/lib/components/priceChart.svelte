<script lang="ts">
	import { serverState } from '$lib/api.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { LineChart, Points, type Point } from 'layerchart';
	import { websocket_api } from 'schema-js';

	interface Props {
		trades: websocket_api.ITrade[];
		minSettlement: number | null | undefined;
		maxSettlement: number | null | undefined;
		showMyTrades?: boolean;
		accountId?: number;
		xDomain?: [Date, Date];
		onTradeClick?: (trade: websocket_api.ITrade) => void;
	}

	let { trades, minSettlement, maxSettlement, showMyTrades = true, accountId, xDomain, onTradeClick }: Props = $props();

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
		if (!ts) return '';
		const date = new Date(ts.seconds * 1000);
		const time = date.toLocaleTimeString();
		const price = trade.price ?? '';
		const size = trade.size ?? '';
		return `${time} · Price: ${price} · Size: ${size}`;
	};

	// Tooltip state
	let tooltipText = $state('');
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipVisible = $state(false);

	const showTooltip = (e: MouseEvent, trade: websocket_api.ITrade) => {
		tooltipText = formatTradeTooltip(trade);
		tooltipX = e.clientX;
		tooltipY = e.clientY;
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
		class="pointer-events-none fixed z-50 rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
		style="left: {tooltipX + 10}px; top: {tooltipY - 30}px;"
	>
		{tooltipText}
	</div>
{/if}

<div bind:this={containerEl} class="h-[20rem] w-full pt-4 md:h-96">
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
											onmouseenter={(e) => showTooltip(e, point.data)}
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
											onmouseenter={(e) => showTooltip(e, point.data)}
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
