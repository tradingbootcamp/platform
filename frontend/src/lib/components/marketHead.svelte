<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { scenariosApi } from '$lib/scenariosApi';
	import type { components } from '$lib/api.generated';
	import FormattedAccountName from '$lib/components/formattedAccountName.svelte';
	import Redeem from '$lib/components/forms/redeem.svelte';
	import SettleMarket from '$lib/components/forms/settleMarket.svelte';
	import EditMarketDescription from '$lib/components/forms/editMarketDescription.svelte';
	import SelectMarket from '$lib/components/selectMarket.svelte';
	import { Button } from '$lib/components/ui/button';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { useStarredMarkets, usePinnedMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn } from '$lib/utils';
	import { History, LineChart, Pause, Play, Pencil, CircleDot, Clock } from '@lucide/svelte/icons';
	import Star from '@lucide/svelte/icons/star';
	import Pin from '@lucide/svelte/icons/pin';
	import { websocket_api } from 'schema-js';
	import { onDestroy } from 'svelte';

	let {
		marketData,
		showChart = $bindable(),
		showMyTrades = $bindable(),
		displayTransactionIdBindable = $bindable(),
		maxTransactionId,
		canPlaceOrders = false,
		isRedeemable = false
	} = $props<{
		marketData: MarketData;
		showChart: boolean;
		showMyTrades: boolean;
		displayTransactionIdBindable: number[];
		maxTransactionId: number;
		canPlaceOrders?: boolean;
		isRedeemable?: boolean;
	}>();

	let marketDefinition = $derived(marketData.definition);
	let id = $derived(marketDefinition.id);
	let marketStatus = $derived(
		marketDefinition.status ?? websocket_api.MarketStatus.MARKET_STATUS_OPEN
	);
	let pauseMode = $state(websocket_api.MarketStatus.MARKET_STATUS_PAUSED);

	const { isStarred, toggleStarred } = useStarredMarkets();
	const { isPinned, togglePinned } = usePinnedMarkets();

	const marketStatusLabel = (status: websocket_api.MarketStatus) => {
		switch (status) {
			case websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED:
				return 'Semi-Paused';
			case websocket_api.MarketStatus.MARKET_STATUS_PAUSED:
				return 'Paused';
			case websocket_api.MarketStatus.MARKET_STATUS_OPEN:
			default:
				return 'Open';
		}
	};

	const setMarketStatus = (status: websocket_api.MarketStatus) => {
		sendClientMessage({
			editMarket: { id, status }
		});
	};

	$effect(() => {
		if (marketStatus === websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED) {
			pauseMode = websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED;
		}
		if (marketStatus === websocket_api.MarketStatus.MARKET_STATUS_PAUSED) {
			pauseMode = websocket_api.MarketStatus.MARKET_STATUS_PAUSED;
		}
	});

	// Clock state
	type ClockResponse = components['schemas']['ClockResponse'];
	let allClocks = $state<ClockResponse[]>([]);
	let groupName = $derived(
		marketDefinition.groupId ? serverState.marketGroups.get(marketDefinition.groupId)?.name : null
	);
	let clock = $derived(groupName ? allClocks.find((c) => c.name === groupName) : null);

	async function fetchAllClocks() {
		try {
			const { data } = await scenariosApi.GET('/clocks');
			if (data) {
				allClocks = data;
			}
		} catch {
			// Ignore errors
		}
	}

	// Tick counter for live updating clock
	let tick = $state(0);
	const tickInterval = setInterval(() => {
		tick++;
	}, 1000);
	onDestroy(() => clearInterval(tickInterval));

	function getClockSeconds(c: ClockResponse): number {
		void tick; // Access tick to force reactivity
		if (c.is_running) {
			return Date.now() / 1000 - c.start_time;
		}
		return c.local_time;
	}

	function formatClockTime(c: ClockResponse): string {
		const seconds = getClockSeconds(c);
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Fetch clocks on mount and when market status changes
	let prevStatus: number | null = null;
	$effect(() => {
		const current = marketStatus;
		const shouldRefetch = prevStatus !== null && prevStatus !== current;
		prevStatus = current;
		if (shouldRefetch) {
			fetchAllClocks();
		}
	});

	// Fetch on mount if in a group
	let clocksFetched = false;
	$effect(() => {
		if (groupName && !clocksFetched) {
			clocksFetched = true;
			fetchAllClocks();
		}
	});
</script>

<div class="flex flex-col gap-3">
	<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
		<div class="flex items-center gap-2 whitespace-nowrap">
			<SelectMarket groupId={marketDefinition.groupId} />
			{#if (serverState.isAdmin && serverState.sudoEnabled) || isPinned(id)}
				<Button
					variant="ghost"
					size="icon"
					class="h-9 w-9 text-muted-foreground hover:bg-transparent focus:bg-transparent"
					onclick={() => togglePinned(id)}
					disabled={!(serverState.isAdmin && serverState.sudoEnabled)}
				>
					<Pin
						class={cn(
							'h-5 w-5',
							isPinned(id)
								? serverState.isAdmin && serverState.sudoEnabled
									? 'fill-blue-400 text-blue-400 hover:fill-blue-300 hover:text-blue-300'
									: 'fill-gray-400 text-gray-400'
								: 'hover:fill-yellow-100 hover:text-primary'
						)}
					/>
					<span class="sr-only">Pin Market</span>
				</Button>
			{/if}
			<Button
				variant="ghost"
				size="icon"
				class="h-9 w-9 text-muted-foreground hover:bg-transparent focus:bg-transparent"
				onclick={() => toggleStarred(id)}
			>
				<Star
					class={cn(
						'h-5 w-5',
						isStarred(id)
							? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-300 hover:text-yellow-300'
							: 'hover:fill-yellow-100 hover:text-primary'
					)}
				/>
				<span class="sr-only">Star Market</span>
			</Button>
			{#if clock}
				<div
					class={cn(
						'flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium',
						clock.is_running
							? 'bg-green-500/20 text-green-700 dark:text-green-400'
							: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
					)}
				>
					<Clock class="h-4 w-4" />
					<span>{formatClockTime(clock)}</span>
					{#if !clock.is_running}
						<span class="text-xs">(paused)</span>
					{/if}
				</div>
			{/if}
		</div>
		<div class="flex flex-wrap items-center gap-2 md:justify-end">
			{#if marketDefinition.closed}
				<p class="text-sm text-muted-foreground">
					Settle Price: {marketDefinition.closed.settlePrice}
				</p>
			{/if}
			{#if canPlaceOrders && isRedeemable}
				<div class="mr-4">
					<Redeem marketId={id} />
				</div>
			{/if}
			{#if serverState.isAdmin && serverState.sudoEnabled && !marketDefinition.closed}
				<div class="flex items-center gap-2">
					<span class="text-xs font-medium text-muted-foreground">
						{marketStatusLabel(marketStatus)}
					</span>
					<Button
						variant="outline"
						size="sm"
						class={cn(
							'h-9',
							marketStatus === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
								? 'border-amber-400 text-amber-600 hover:text-amber-600'
								: marketStatus === websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED
									? 'border-yellow-500 text-yellow-600 hover:text-yellow-600'
									: 'border-muted-foreground/30'
						)}
						onclick={() =>
							setMarketStatus(
								marketStatus === websocket_api.MarketStatus.MARKET_STATUS_OPEN
									? pauseMode
									: websocket_api.MarketStatus.MARKET_STATUS_OPEN
							)}
					>
						{#if marketStatus === websocket_api.MarketStatus.MARKET_STATUS_OPEN}
							<Pause class="h-4 w-4" />
						{:else}
							<Play class="h-4 w-4" />
						{/if}
					</Button>
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									role="switch"
									aria-checked={pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED}
									class={cn(
										'relative inline-flex h-6 w-12 items-center rounded-full border transition',
										'border-muted-foreground/30 bg-muted/60'
									)}
									onclick={() => {
										const nextMode =
											pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
												? websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED
												: websocket_api.MarketStatus.MARKET_STATUS_PAUSED;
										if (marketStatus !== websocket_api.MarketStatus.MARKET_STATUS_OPEN) {
											// When paused, only send to server; $effect will update pauseMode when server responds
											setMarketStatus(nextMode);
										} else {
											// When open, just update local preference for next pause
											pauseMode = nextMode;
										}
									}}
								>
									<span
										class={cn(
											'inline-block h-5 w-5 rounded-full bg-white shadow transition',
											pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
												? 'translate-x-6'
												: 'translate-x-1'
										)}
									></span>
								</button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>
							{pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
								? 'No new orders and no cancels'
								: 'No new orders'}
						</Tooltip.Content>
					</Tooltip.Root>
					<span class="inline-block w-20 text-left text-xs text-muted-foreground">
						{pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
							? 'Paused'
							: 'Semi-Paused'}
					</span>
				</div>
			{/if}
			{#if (marketDefinition.ownerId === serverState.userId || (serverState.isAdmin && serverState.sudoEnabled)) && !marketDefinition.closed}
				<SettleMarket
					{id}
					name={marketDefinition.name}
					minSettlement={marketDefinition.minSettlement}
					maxSettlement={marketDefinition.maxSettlement}
				/>
			{/if}
			<Toggle
				onclick={() => {
					if (displayTransactionIdBindable.length) {
						displayTransactionIdBindable = [];
					} else {
						displayTransactionIdBindable = [maxTransactionId];
						if (!marketData.hasFullOrderHistory) {
							sendClientMessage({ getFullOrderHistory: { marketId: id } });
						}
					}
				}}
				variant="outline"
			>
				<History />
			</Toggle>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Toggle {...props} bind:pressed={showMyTrades} variant="outline">
							<CircleDot />
						</Toggle>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>Show my trades on chart</Tooltip.Content>
			</Tooltip.Root>
			<Toggle bind:pressed={showChart} variant="outline" class="hidden md:block">
				<LineChart />
			</Toggle>
		</div>
	</div>
	<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
		<div class="flex items-center gap-1 text-sm">
			<p>
				Created by <FormattedAccountName accountId={marketDefinition.ownerId} />
				{#if marketDefinition.description}
					<span class="text-muted-foreground"> / {marketDefinition.description}</span>
				{/if}
			</p>
			{#if (serverState.isAdmin && serverState.sudoEnabled) || marketDefinition.ownerId === serverState.userId}
				<EditMarketDescription
					marketId={id}
					currentDescription={marketDefinition.description ?? ''}
					currentStatus={marketStatus}
					class="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
				>
					<Pencil class="h-3 w-3" />
				</EditMarketDescription>
			{/if}
		</div>
		<p class="text-sm text-muted-foreground">
			Settles {marketDefinition.minSettlement} - {marketDefinition.maxSettlement}
		</p>
	</div>
</div>
