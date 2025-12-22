<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { accountName, sendClientMessage, serverState } from '$lib/api.svelte';
	import { Button } from '$lib/components/ui/button';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import { useStarredMarkets, usePinnedMarkets } from '$lib/starPinnedMarkets.svelte';
	import { cn } from '$lib/utils';
	import { History, LineChart, Pause, Play, Pi } from '@lucide/svelte/icons';
	import Star from '@lucide/svelte/icons/star';
	import Pin from '@lucide/svelte/icons/pin';
	import { kinde } from '$lib/auth.svelte';
	import { websocket_api } from 'schema-js';

	let {
		marketData,
		showChart = $bindable(),
		displayTransactionIdBindable = $bindable(),
		maxTransactionId
	} = $props<{
		marketData: MarketData;
		showChart: boolean;
		displayTransactionIdBindable: number[];
		maxTransactionId: number;
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
</script>

<div class="md:flex md:justify-between">
	<div class="mb-4">
		<p class="mt-2 text-sm">{marketDefinition.description}</p>
		<div class="md:flex md:gap-4">
			<p class="mt-2 text-sm italic">
				Created by {accountName(marketDefinition.ownerId)}
			</p>
		</div>
	</div>
	<div class="flex items-start gap-4">
		{#if marketDefinition.open}
			<p class="text-sm text-muted-foreground mt-2">
				Settles {marketDefinition.minSettlement} - {marketDefinition.maxSettlement}
			</p>
		{/if}
		<div class="flex items-start gap-2">
			{#if serverState.isAdmin}
				<div class="flex items-center gap-2">
					<span class="text-xs font-medium text-muted-foreground">
						Status: {marketStatusLabel(marketStatus)}
					</span>
					<Button
						variant="outline"
						size="sm"
						class={cn(
							"h-9",
							marketStatus === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
								? "border-amber-400 text-amber-600 hover:text-amber-600"
								: marketStatus === websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED
									? "border-yellow-500 text-yellow-600 hover:text-yellow-600"
									: "border-muted-foreground/30"
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
					<button
						type="button"
						role="switch"
						aria-checked={pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED}
						class={cn(
							"relative inline-flex h-6 w-12 items-center rounded-full border transition",
							"border-muted-foreground/30 bg-muted/60"
						)}
						onclick={() => {
							const nextMode =
								pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
									? websocket_api.MarketStatus.MARKET_STATUS_SEMI_PAUSED
									: websocket_api.MarketStatus.MARKET_STATUS_PAUSED;
							pauseMode = nextMode;
							if (marketStatus !== websocket_api.MarketStatus.MARKET_STATUS_OPEN) {
								setMarketStatus(nextMode);
							}
						}}
					>
						<span
							class={cn(
								"inline-block h-5 w-5 rounded-full bg-white shadow transition",
								pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
									? "translate-x-6"
									: "translate-x-1"
							)}
						/>
					</button>
					<span class="inline-block w-20 text-left text-xs text-muted-foreground">
						{pauseMode === websocket_api.MarketStatus.MARKET_STATUS_PAUSED
							? 'Paused'
							: 'Semi-Paused'}
					</span>
				</div>
			{/if}
			{#if serverState.isAdmin || isPinned(id)}
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground h-10 w-10 hover:bg-transparent focus:bg-transparent"
					onclick={() => togglePinned(id)}
					disabled={!serverState.isAdmin}
				>
					<Pin
						class={cn(
							'h-5 w-5',
							isPinned(id)
								? serverState.isAdmin
									? 'fill-blue-400 text-blue-400 hover:fill-blue-300 hover:text-blue-300'
									: 'fill-gray-400 text-gray-400'  // Greyed out for non-admins
								: 'hover:text-primary hover:fill-yellow-100'
						)}
					/>
					<span class="sr-only">Pin Market</span>
				</Button>
			{/if}
			<Button
				variant="ghost"
				size="icon"
				class="text-muted-foreground h-10 w-10 hover:bg-transparent focus:bg-transparent"
				onclick={() => toggleStarred(id)}
			>
				<Star
					class={cn(
						'h-5 w-5',
						isStarred(id)
							? 'fill-yellow-400 text-yellow-400 hover:fill-yellow-300 hover:text-yellow-300'
							: 'hover:text-primary hover:fill-yellow-100'
					)}
				/>
				<span class="sr-only">Star Market</span>
			</Button>
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
			<Toggle bind:pressed={showChart} variant="outline" class="hidden md:block">
				<LineChart />
			</Toggle>
		</div>
	</div>
</div>

{#if marketDefinition.closed}
	<p class="text-sm italic">Market settled to {marketDefinition.closed.settlePrice}</p>
{/if}
