<script lang="ts">
	import { isAltAccount, sendClientMessage, serverState } from '$lib/api.svelte';
	import FlexNumber from '$lib/components/flexNumber.svelte';
	import { getShortUserName } from '$lib/components/marketDataUtils';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Table from '$lib/components/ui/table';
	import { cn } from '$lib/utils';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Zap, X } from '@lucide/svelte/icons';
	import { websocket_api } from 'schema-js';

	let {
		bids,
		offers,
		displayTransactionId,
		marketId,
		minSettlement,
		maxSettlement,
		canCancelOrders = true,
		shouldShowOrderUI = false,
		marketStatusAllowsOrders = true,
		tabbedMode = false,
		isDarkOrderBook = false
	} = $props<{
		bids: websocket_api.IOrder[];
		offers: websocket_api.IOrder[];
		displayTransactionId: number | undefined;
		marketId?: number;
		minSettlement?: number | null | undefined;
		maxSettlement?: number | null | undefined;
		canCancelOrders?: boolean;
		shouldShowOrderUI?: boolean;
		marketStatusAllowsOrders?: boolean;
		tabbedMode?: boolean;
		isDarkOrderBook?: boolean;
	}>();

	// Dark order book: filter to show only user's orders + best bid/offer from others
	const displayBids = $derived.by(() => {
		if (!isDarkOrderBook) return bids;
		const userBids = bids.filter((order: websocket_api.IOrder) => order.ownerId === serverState.actingAs);
		// Find the best bid that isn't ours
		const bestOtherBid = bids.find((order: websocket_api.IOrder) => order.ownerId !== serverState.actingAs);
		if (bestOtherBid) {
			// Insert in correct position (bids sorted by price descending)
			const result = [...userBids];
			const insertIdx = result.findIndex((o) => (o.price ?? 0) < (bestOtherBid.price ?? 0));
			if (insertIdx === -1) {
				result.push(bestOtherBid);
			} else {
				result.splice(insertIdx, 0, bestOtherBid);
			}
			return result;
		}
		return userBids;
	});

	const displayOffers = $derived.by(() => {
		if (!isDarkOrderBook) return offers;
		const userOffers = offers.filter((order: websocket_api.IOrder) => order.ownerId === serverState.actingAs);
		// Find the best offer that isn't ours
		const bestOtherOffer = offers.find((order: websocket_api.IOrder) => order.ownerId !== serverState.actingAs);
		if (bestOtherOffer) {
			// Insert in correct position (offers sorted by price ascending)
			const result = [...userOffers];
			const insertIdx = result.findIndex((o) => (o.price ?? 0) > (bestOtherOffer.price ?? 0));
			if (insertIdx === -1) {
				result.push(bestOtherOffer);
			} else {
				result.splice(insertIdx, 0, bestOtherOffer);
			}
			return result;
		}
		return userOffers;
	});

	const bidRowClass = 'order-book-bid-cols justify-start';
	const offerRowClass = 'order-book-offer-cols justify-end';
	let canShowOrderEntry = $derived(shouldShowOrderUI && marketId !== undefined);

	// Order form state - separate for bids and offers
	let bidPrice = $state('');
	let bidSize = $state('');
	let offerPrice = $state('');
	let offerSize = $state('');
	let bidPriceError = $state('');
	let bidSizeError = $state('');
	let offerPriceError = $state('');
	let offerSizeError = $state('');

	// Zap button limits - empty means no limit (infinity)
	// Persist to localStorage per market
	const zapLimitsKey = $derived(`zap-limits-${marketId}`);
	let bidPriceLimit = $state('');
	let bidSizeLimit = $state('');
	let offerPriceLimit = $state('');
	let offerSizeLimit = $state('');

	// Load zap limits from localStorage on mount
	$effect(() => {
		if (typeof window === 'undefined' || !marketId) return;
		try {
			const stored = localStorage.getItem(zapLimitsKey);
			if (stored) {
				const parsed = JSON.parse(stored);
				bidPriceLimit = parsed.bidPriceLimit ?? '';
				bidSizeLimit = parsed.bidSizeLimit ?? '';
				offerPriceLimit = parsed.offerPriceLimit ?? '';
				offerSizeLimit = parsed.offerSizeLimit ?? '';
			}
		} catch {}
	});

	// Save zap limits to localStorage when they change
	$effect(() => {
		if (typeof window === 'undefined' || !marketId) return;
		const limits = { bidPriceLimit, bidSizeLimit, offerPriceLimit, offerSizeLimit };
		localStorage.setItem(zapLimitsKey, JSON.stringify(limits));
	});

	function hasMoreThanOneDecimal(value: string | number): boolean {
		const str = String(value);
		const match = str.match(/\.(\d+)/);
		return match ? match[1].length > 1 : false;
	}

	function validatePrice(value: string | number, min: number | null | undefined, max: number | null | undefined): string {
		if (value === '' || value === null || value === undefined) return 'Price is required';
		const num = Number(value);
		if (!Number.isFinite(num)) return 'Invalid number';
		if (hasMoreThanOneDecimal(value)) return 'Max 1 decimal place';
		if (min != null && num < min) return `Min price is ${min}`;
		if (max != null && num > max) return `Max price is ${max}`;
		return '';
	}

	function validateSize(value: string | number): string {
		if (value === '' || value === null || value === undefined) return 'Size is required';
		const num = Number(value);
		if (!Number.isFinite(num)) return 'Invalid number';
		if (hasMoreThanOneDecimal(value)) return 'Max 1 decimal place';
		if (num <= 0) return 'Size must be positive';
		return '';
	}

	function submitBid() {
		if (!marketId) return;
		bidPriceError = validatePrice(bidPrice, minSettlement, maxSettlement);
		bidSizeError = validateSize(bidSize);
		if (bidPriceError || bidSizeError) return;
		const p = Number(bidPrice);
		const s = Number(bidSize);
		sendClientMessage({ createOrder: { marketId, price: p, size: s, side: websocket_api.Side.BID } });
	}

	function submitOffer() {
		if (!marketId) return;
		offerPriceError = validatePrice(offerPrice, minSettlement, maxSettlement);
		offerSizeError = validateSize(offerSize);
		if (offerPriceError || offerSizeError) return;
		const p = Number(offerPrice);
		const s = Number(offerSize);
		sendClientMessage({ createOrder: { marketId, price: p, size: s, side: websocket_api.Side.OFFER } });
	}

	function clearOrders(side: 'BID' | 'OFFER') {
		if (!canCancelOrders) return;
		sendClientMessage({ out: { marketId, side: side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER } });
	}

	// Clear errors when user types
	$effect(() => { if (bidPrice) bidPriceError = ''; });
	$effect(() => { if (bidSize) bidSizeError = ''; });
	$effect(() => { if (offerPrice) offerPriceError = ''; });
	$effect(() => { if (offerSize) offerSizeError = ''; });

	// Check if an order would be taken by the current form input
	const bidPriceNum = $derived(bidPrice ? Number(bidPrice) : null);
	const bidSizeNum = $derived(bidSize ? Number(bidSize) : 1.0);
	const offerPriceNum = $derived(offerPrice ? Number(offerPrice) : null);
	const offerSizeNum = $derived(offerSize ? Number(offerSize) : 1.0);

	// Compute which offers would be taken by the current bid (sorted by price ascending)
	const takenOfferIds = $derived.by(() => {
		if (bidPriceNum === null || !Number.isFinite(bidPriceNum) || !Number.isFinite(bidSizeNum)) {
			return new Set<number>();
		}
		const ids = new Set<number>();
		let remainingSize = bidSizeNum;
		for (const offer of offers) {
			if (remainingSize <= 0) break;
			if ((offer.price ?? Infinity) > bidPriceNum) break;
			ids.add(offer.id ?? -1);
			remainingSize -= offer.size ?? 0;
		}
		return ids;
	});

	// Compute which bids would be taken by the current offer (sorted by price descending)
	const takenBidIds = $derived.by(() => {
		if (offerPriceNum === null || !Number.isFinite(offerPriceNum) || !Number.isFinite(offerSizeNum)) {
			return new Set<number>();
		}
		const ids = new Set<number>();
		let remainingSize = offerSizeNum;
		for (const bid of bids) {
			if (remainingSize <= 0) break;
			if ((bid.price ?? -Infinity) < offerPriceNum) break;
			ids.add(bid.id ?? -1);
			remainingSize -= bid.size ?? 0;
		}
		return ids;
	});

	function handleBidKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submitBid();
	}

	function handleOfferKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submitOffer();
	}

	function limitDecimals(e: Event) {
		const input = e.target as HTMLInputElement;
		const value = input.value;
		const match = value.match(/^(-?\d*\.?\d?)/);
		if (match && match[1] !== value) {
			input.value = match[1];
			// Trigger reactive update
			input.dispatchEvent(new Event('input', { bubbles: true }));
		}
	}

	let takingOrderId = $state<number | null>(null);

	$effect(() => {
		if (takingOrderId === null) return;
		const orderStillExists =
			bids.some((o: websocket_api.IOrder) => o.id === takingOrderId) ||
			offers.some((o: websocket_api.IOrder) => o.id === takingOrderId);
		if (!orderStillExists) {
			takingOrderId = null;
		}
	});

	const cancelOrder = (id: number) => {
		if (!canCancelOrders) return;
		sendClientMessage({ cancelOrder: { id } });
	};

	// Compute effective price/size after applying limits
	const getEffectiveOrder = (order: websocket_api.IOrder, side: 'BID' | 'OFFER') => {
		const priceLimit = side === 'BID' ? bidPriceLimit : offerPriceLimit;
		const sizeLimit = side === 'BID' ? bidSizeLimit : offerSizeLimit;

		let price = order.price ?? 0;
		let size = order.size ?? 0;
		const originalSize = size;

		// Apply price limit
		if (priceLimit !== '' && Number.isFinite(Number(priceLimit))) {
			if (side === 'BID') {
				price = Math.min(price, Number(priceLimit));
			} else {
				price = Math.max(price, Number(priceLimit));
			}
		}
		// Apply size limit
		if (sizeLimit !== '' && Number.isFinite(Number(sizeLimit))) {
			size = Math.min(size, Number(sizeLimit));
		}

		return { price, size, originalSize, orderPrice: order.price ?? 0 };
	};

	// Check if a zap would result in any trade
	const wouldTrade = (order: websocket_api.IOrder, side: 'BID' | 'OFFER') => {
		const { price, size, orderPrice } = getEffectiveOrder(order, side);

		// No trade if size is 0 or negative
		if (size <= 0) return false;

		// Check if price would allow the trade to execute
		// BID (buying from offer): our bid price must be >= offer price
		// OFFER (selling to bid): our offer price must be <= bid price
		if (side === 'BID') {
			return price >= orderPrice;
		} else {
			return price <= orderPrice;
		}
	};

	// Check if it would be a partial fill
	const isPartialFill = (order: websocket_api.IOrder, side: 'BID' | 'OFFER') => {
		const { size, originalSize } = getEffectiveOrder(order, side);
		return size > 0 && size < originalSize;
	};

	const takeOrder = (order: websocket_api.IOrder, side: 'BID' | 'OFFER') => {
		if (marketId === undefined) return;

		const { price, size, originalSize } = getEffectiveOrder(order, side);

		// Only hide button (set takingOrderId) if it's a full fill
		if (size >= originalSize) {
			takingOrderId = order.id ?? null;
		}

		sendClientMessage({
			createOrder: {
				marketId,
				price,
				size,
				side: side === 'BID' ? websocket_api.Side.BID : websocket_api.Side.OFFER
			}
		});
	};
</script>

{#snippet cancelButton(orderId: number | null | undefined)}
	<Button
		variant="inverted"
		class={cn('h-6 w-6 shrink-0 rounded-2xl p-0', !canCancelOrders && 'pointer-events-none opacity-50')}
		disabled={!canCancelOrders}
		onclick={() => orderId != null && cancelOrder(orderId)}
	>
		<X class="h-4 w-4" />
	</Button>
{/snippet}

{#snippet takeButton(order: websocket_api.IOrder, side: 'BID' | 'OFFER', variant: 'green' | 'red')}
	{@const canTrade = wouldTrade(order, side)}
	{@const partial = isPartialFill(order, side)}
	{@const isDisabled = !marketStatusAllowsOrders || !canTrade}
	{@const tooltipText = !canTrade ? 'Limit settings prevent this trade.' : partial ? 'Partial fill due to size limit.' : `Places a ${side} with the same size and price.`}
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<span {...props} class="inline-flex">
					<Button
						{variant}
						class={cn('h-6 w-6 shrink-0 rounded-2xl p-0', isDisabled && 'opacity-50 pointer-events-none')}
						disabled={isDisabled}
						onclick={() => takeOrder(order, side)}
					>
						<Zap class={partial ? 'h-3 w-3' : 'h-4 w-4'} />
					</Button>
				</span>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>{tooltipText}</Tooltip.Content>
	</Tooltip.Root>
{/snippet}

{#snippet bidOrderRow(order: websocket_api.IOrder)}
	<Table.Row
		class={cn(
			`h-8 grid ${bidRowClass} border-b border-border/60`,
			takenBidIds.has(order.id ?? -1)
				? 'bg-green-300 dark:bg-green-500/60'
				: 'bg-green-50 even:bg-green-100 dark:bg-green-700/35 dark:even:bg-green-900/35',
			order.ownerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
		)}
	>
		<Table.Cell class="flex items-center justify-center truncate p-0 pl-1">
			{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
				{@render cancelButton(order.id)}
			{:else if shouldShowOrderUI && displayBids[0] === order && displayTransactionId === undefined && takingOrderId !== order.id}
				{@render takeButton(order, 'OFFER', 'red')}
			{/if}
		</Table.Cell>
		<Table.Cell class="flex items-center truncate px-1 py-0"><span class:italic={isAltAccount(order.ownerId)}>{getShortUserName(order.ownerId)}</span></Table.Cell>
		<Table.Cell class="flex items-center truncate px-1 py-0"><FlexNumber value={(order.size ?? 0).toString()} /></Table.Cell>
		<Table.Cell class="flex items-center truncate px-1 py-0"><FlexNumber value={(order.price ?? 0).toString()} /></Table.Cell>
	</Table.Row>
{/snippet}

{#snippet offerOrderRow(order: websocket_api.IOrder)}
	<Table.Row
		class={cn(
			`h-8 grid ${offerRowClass} border-b border-border/60`,
			takenOfferIds.has(order.id ?? -1)
				? 'bg-red-300 dark:bg-red-500/60'
				: 'bg-red-50 even:bg-red-100 dark:bg-red-700/35 dark:even:bg-red-900/35',
			order.ownerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
		)}
	>
		<Table.Cell class="flex items-center truncate px-1 py-0"><FlexNumber value={(order.price ?? 0).toString()} /></Table.Cell>
		<Table.Cell class="flex items-center truncate px-1 py-0"><FlexNumber value={(order.size ?? 0).toString()} /></Table.Cell>
		<Table.Cell class="flex items-center truncate px-1 py-0"><span class:italic={isAltAccount(order.ownerId)}>{getShortUserName(order.ownerId)}</span></Table.Cell>
		<Table.Cell class="flex items-center justify-center truncate p-0 pr-1">
			{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
				{@render cancelButton(order.id)}
			{:else if shouldShowOrderUI && displayOffers[0] === order && displayTransactionId === undefined && takingOrderId !== order.id}
				{@render takeButton(order, 'BID', 'green')}
			{/if}
		</Table.Cell>
	</Table.Row>
{/snippet}

<div class="order-container w-full">
	{#if !canShowOrderEntry && !tabbedMode}
		<!-- Show Order Book header when order entry is not available -->
		<div class="order-book-wrapper orders-header h-10 relative">
			<span class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-lg font-bold z-10 pointer-events-none">Order Book{isDarkOrderBook ? ' (dark)' : ''}</span>
			<div class="order-book-side"></div>
			<div class="order-book-side"></div>
		</div>
	{/if}

	{#if canShowOrderEntry && tabbedMode}
		<!-- Tabbed mode: order entry above -->
		<div class="flex min-w-0 w-full flex-col gap-2 px-1 py-2">
			<div class="flex min-w-0 w-full gap-2">
				<!-- Bid side -->
				<div class="flex flex-1 min-w-0 flex-col gap-2">
					<Button variant="greenOutline" class={cn('h-8 w-full', !canCancelOrders && 'opacity-50')} disabled={!canCancelOrders} onclick={() => clearOrders('BID')}>Clear Bids</Button>
					<Button variant="green" class={cn('h-8 w-full', !marketStatusAllowsOrders && 'opacity-50')} disabled={!marketStatusAllowsOrders} onclick={submitBid}>Place BID</Button>
					<div class="relative">
						<div class="flex gap-2">
							<Input type="number" placeholder="Size" min="0" class={cn('h-8 flex-1 text-sm no-spinner', bidSizeError && 'border-red-500')} bind:value={bidSize} onkeydown={handleBidKeydown} oninput={limitDecimals} />
							<Input type="number" placeholder="Bid" min={minSettlement} max={maxSettlement} class={cn('h-8 flex-1 text-sm no-spinner', bidPriceError && 'border-red-500')} bind:value={bidPrice} onkeydown={handleBidKeydown} oninput={limitDecimals} />
						</div>
						{#if bidSizeError || bidPriceError}
							<div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 rounded border bg-red-500 text-white border-red-500 px-2 py-1 shadow-md">
								<p class="text-xs whitespace-nowrap">{bidSizeError || bidPriceError}</p>
							</div>
						{/if}
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-xs text-red-600 dark:text-red-400 flex items-center"><Zap class="h-3 w-3 mr-1" />Quick Sell Limit</span>
						<div class="flex gap-2">
							<Input type="number" placeholder="∞" min="0" class="h-8 flex-1 text-sm no-spinner" bind:value={offerSizeLimit} oninput={limitDecimals} />
							<Input type="number" placeholder="∞" min={minSettlement} max={maxSettlement} class="h-8 flex-1 text-sm no-spinner" bind:value={offerPriceLimit} oninput={limitDecimals} />
						</div>
					</div>
				</div>
				<!-- Offer side -->
				<div class="flex flex-1 min-w-0 flex-col gap-2">
					<Button variant="redOutline" class={cn('h-8 w-full', !canCancelOrders && 'opacity-50')} disabled={!canCancelOrders} onclick={() => clearOrders('OFFER')}>Clear Offers</Button>
					<Button variant="red" class={cn('h-8 w-full', !marketStatusAllowsOrders && 'opacity-50')} disabled={!marketStatusAllowsOrders} onclick={submitOffer}>Place OFFER</Button>
					<div class="relative">
						<div class="flex gap-2">
							<Input type="number" placeholder="Offer" min={minSettlement} max={maxSettlement} class={cn('h-8 flex-1 text-sm no-spinner', offerPriceError && 'border-red-500')} bind:value={offerPrice} onkeydown={handleOfferKeydown} oninput={limitDecimals} />
							<Input type="number" placeholder="Size" min="0" class={cn('h-8 flex-1 text-sm no-spinner', offerSizeError && 'border-red-500')} bind:value={offerSize} onkeydown={handleOfferKeydown} oninput={limitDecimals} />
						</div>
						{#if offerPriceError || offerSizeError}
							<div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 rounded border bg-red-500 text-white border-red-500 px-2 py-1 shadow-md">
								<p class="text-xs whitespace-nowrap">{offerPriceError || offerSizeError}</p>
							</div>
						{/if}
					</div>
					<div class="flex flex-col gap-1">
						<span class="text-xs text-green-600 dark:text-green-400 flex items-center justify-end"><Zap class="h-3 w-3 mr-1" />Quick Buy Limit</span>
						<div class="flex gap-2">
							<Input type="number" placeholder="∞" min={minSettlement} max={maxSettlement} class="h-8 flex-1 text-sm no-spinner" bind:value={bidPriceLimit} oninput={limitDecimals} />
							<Input type="number" placeholder="∞" min="0" class="h-8 flex-1 text-sm no-spinner" bind:value={bidSizeLimit} oninput={limitDecimals} />
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if canShowOrderEntry && !tabbedMode}
		<!-- Non-tabbed mode: order entry in header rows (outside scroll) -->
		<div class="order-book-wrapper orders-header relative">
			<span class="absolute left-1/2 -translate-x-1/2 top-5 -translate-y-1/2 text-lg font-bold z-10 pointer-events-none">Order Book{isDarkOrderBook ? ' (dark)' : ''}</span>
			<div class="order-book-side overflow-visible">
				<Table.Root class="border-collapse border-spacing-0 overflow-visible">
					<Table.Header class="[&_tr]:border-0 overflow-visible">
						<!-- Row 1: Clear Bids button -->
						<Table.Row class={cn('grid', bidRowClass, 'h-10 bg-background hover:bg-background overflow-visible')}>
							<Table.Head class="col-span-2 flex items-center justify-end px-0.5 py-0 pl-1 overflow-visible">
								<Button variant="greenOutline" class={cn('h-8 w-[5.5rem]', !canCancelOrders && 'opacity-50')} disabled={!canCancelOrders} onclick={() => clearOrders('BID')}>Clear Bids</Button>
							</Table.Head>
							<Table.Head class="col-span-2"></Table.Head>
						</Table.Row>
						<!-- Row 2: Place BID button + inputs -->
						<Table.Row class={cn('grid', bidRowClass, 'h-10 bg-background hover:bg-background overflow-visible relative')}>
							<Table.Head class="col-span-2 flex items-center justify-end px-0.5 py-0 pl-1 overflow-visible">
								<Button variant="green" class={cn('h-8 w-[5.5rem]', !marketStatusAllowsOrders && 'opacity-50')} disabled={!marketStatusAllowsOrders} onclick={submitBid}>Place BID</Button>
							</Table.Head>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder="1.0" min="0" class={cn('h-8 w-full px-1.5 text-sm no-spinner', bidSizeError && 'border-red-500')} bind:value={bidSize} onkeydown={handleBidKeydown} oninput={limitDecimals} />
							</Table.Head>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder={((minSettlement ?? 0) + 1).toFixed(1)} min={minSettlement} max={maxSettlement} class={cn('h-8 w-full px-1.5 text-sm no-spinner', bidPriceError && 'border-red-500')} bind:value={bidPrice} onkeydown={handleBidKeydown} oninput={limitDecimals} />
							</Table.Head>
							{#if bidSizeError || bidPriceError}
								<div class="absolute top-full right-0 mt-1 z-50 rounded border bg-red-500 text-white border-red-500 px-2 py-1 shadow-md">
									<p class="text-xs whitespace-nowrap">{bidSizeError || bidPriceError}</p>
								</div>
							{/if}
						</Table.Row>
						<!-- Row 3: Quick Sell Limit (for selling to bids) -->
						<Table.Row class={cn('grid', bidRowClass, 'h-10 bg-background hover:bg-background overflow-visible')}>
							<Table.Head class="col-span-2 flex items-center justify-end px-0.5 py-0 pl-1 text-xs text-red-600 dark:text-red-400">
								<Zap class="h-3 w-3 mr-1" />Quick Sell Limit
							</Table.Head>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder="∞" min="0" class="h-8 w-full px-1.5 text-sm no-spinner" bind:value={offerSizeLimit} oninput={limitDecimals} />
							</Table.Head>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder="∞" min={minSettlement} max={maxSettlement} class="h-8 w-full px-1.5 text-sm no-spinner" bind:value={offerPriceLimit} oninput={limitDecimals} />
							</Table.Head>
						</Table.Row>
					</Table.Header>
				</Table.Root>
			</div>
			<div class="order-book-side overflow-visible">
				<Table.Root class="border-collapse border-spacing-0 overflow-visible">
					<Table.Header class="[&_tr]:border-0 overflow-visible">
						<!-- Row 1: Clear Offers button -->
						<Table.Row class={cn('grid', offerRowClass, 'h-10 bg-background hover:bg-background overflow-visible')}>
							<Table.Head class="col-span-2"></Table.Head>
							<Table.Head class="col-span-2 flex items-center justify-start px-0.5 py-0 pr-1 overflow-visible">
								<Button variant="redOutline" class={cn('h-8 w-24', !canCancelOrders && 'opacity-50')} disabled={!canCancelOrders} onclick={() => clearOrders('OFFER')}>Clear Offers</Button>
							</Table.Head>
						</Table.Row>
						<!-- Row 2: inputs + Place OFFER button -->
						<Table.Row class={cn('grid', offerRowClass, 'h-10 bg-background hover:bg-background overflow-visible relative')}>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder={((maxSettlement ?? 100) - 1).toFixed(1)} min={minSettlement} max={maxSettlement} class={cn('h-8 w-full px-1.5 text-sm no-spinner', offerPriceError && 'border-red-500')} bind:value={offerPrice} onkeydown={handleOfferKeydown} oninput={limitDecimals} />
							</Table.Head>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder="1.0" min="0" class={cn('h-8 w-full px-1.5 text-sm no-spinner', offerSizeError && 'border-red-500')} bind:value={offerSize} onkeydown={handleOfferKeydown} oninput={limitDecimals} />
							</Table.Head>
							<Table.Head class="col-span-2 flex items-center justify-start px-0.5 py-0 pr-1 overflow-visible">
								<Button variant="red" class={cn('h-8 w-24', !marketStatusAllowsOrders && 'opacity-50')} disabled={!marketStatusAllowsOrders} onclick={submitOffer}>Place OFFER</Button>
							</Table.Head>
							{#if offerPriceError || offerSizeError}
								<div class="absolute top-full left-0 mt-1 z-50 rounded border bg-red-500 text-white border-red-500 px-2 py-1 shadow-md">
									<p class="text-xs whitespace-nowrap">{offerPriceError || offerSizeError}</p>
								</div>
							{/if}
						</Table.Row>
						<!-- Row 3: Quick Buy Limit (for buying from offers) -->
						<Table.Row class={cn('grid', offerRowClass, 'h-10 bg-background hover:bg-background overflow-visible')}>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder="∞" min={minSettlement} max={maxSettlement} class="h-8 w-full px-1.5 text-sm no-spinner" bind:value={bidPriceLimit} oninput={limitDecimals} />
							</Table.Head>
							<Table.Head class="flex items-center px-0.5 py-0">
								<Input type="number" placeholder="∞" min="0" class="h-8 w-full px-1.5 text-sm no-spinner" bind:value={bidSizeLimit} oninput={limitDecimals} />
							</Table.Head>
							<Table.Head class="col-span-2 flex items-center justify-start px-0.5 py-0 pr-1 text-xs text-green-600 dark:text-green-400">
								<Zap class="h-3 w-3 mr-1" />Quick Buy Limit
							</Table.Head>
						</Table.Row>
					</Table.Header>
				</Table.Root>
			</div>
		</div>
	{/if}

	<!-- Column headers (outside scroll) -->
	<div class="order-book-wrapper orders-header">
		<div class="order-book-side">
			<Table.Root class="border-collapse border-spacing-0">
				<Table.Header class="[&_tr]:border-0">
					<Table.Row class={cn('grid', bidRowClass, 'bg-background hover:bg-background')}>
						<Table.Head class="flex items-center justify-center truncate py-0 pl-1"></Table.Head>
						<Table.Head class="flex items-center justify-center truncate py-0 text-center">Owner</Table.Head>
						<Table.Head class="flex items-center justify-center truncate py-0 text-center">Size</Table.Head>
						<Table.Head class="flex items-center justify-center truncate py-0 text-center">Bid</Table.Head>
					</Table.Row>
				</Table.Header>
			</Table.Root>
		</div>
		<div class="order-book-side">
			<Table.Root class="border-collapse border-spacing-0">
				<Table.Header class="[&_tr]:border-0">
					<Table.Row class={cn('grid', offerRowClass, 'bg-background hover:bg-background')}>
						<Table.Head class="flex items-center justify-center truncate py-0 text-center">Offer</Table.Head>
						<Table.Head class="flex items-center justify-center truncate py-0 text-center">Size</Table.Head>
						<Table.Head class="flex items-center justify-center truncate py-0 text-center">Owner</Table.Head>
						<Table.Head class="flex items-center justify-center truncate py-0 pr-1"></Table.Head>
					</Table.Row>
				</Table.Header>
			</Table.Root>
		</div>
	</div>

	<!-- Divider -->
	<div class="order-book-wrapper orders-header">
		<div class="order-book-side h-px bg-border"></div>
		<div class="order-book-side h-px bg-border"></div>
	</div>

	<!-- Order rows (scrollable) -->
	<div class="orders-scroll h-[20rem] w-full overflow-y-scroll overflow-x-hidden md:h-[28rem]">
		<div class="order-book-wrapper">
			<div class="order-book-side">
				<Table.Root class="border-collapse border-spacing-0">
					<Table.Body>
						{#each displayBids as order (order.id)}
							{@render bidOrderRow(order)}
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="order-book-side">
				<Table.Root class="border-collapse border-spacing-0">
					<Table.Body>
						{#each displayOffers as order (order.id)}
							{@render offerOrderRow(order)}
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
	</div>
</div>

<style>
	/* Order container is the query container for the wrapper gap */
	:global(.order-container) {
		container-type: inline-size;
		overflow: visible;
	}

	/* Use CSS Grid for the two-column layout with explicit sizing */
	.order-book-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		width: 100%;
	}

	/* Each side is a container for responsive column sizing */
	.order-book-side {
		container-type: inline-size;
		min-width: 0;
		width: 100%;
		max-width: 15rem;
	}

	/* Allow button overflow in header rows */
	.order-book-side > :global(div),
	.order-book-side :global(table),
	.order-book-side :global(thead),
	.order-book-side :global(tr),
	.order-book-side :global(th) {
		overflow: visible;
	}

	/* Force table to respect container width */
	.order-book-side :global(table) {
		width: 100%;
		table-layout: fixed;
	}

	/* Smooth interpolation: columns scale with container width using cqi units */
	/* Minimum per side: 1.75 + 3 + 2.5 + 2.5 = 9.75rem */
	/* Button: fixed 1.75rem (h-6 w-6 button + 0.25rem outer padding) */
	/* Owner: 3rem / 9.5rem = 31.579cqi, max 6rem */
	/* Size: 2.5rem / 9.5rem = 26.316cqi, max 3.5rem */
	/* Price: 2.5rem / 9.5rem = 26.316cqi, max 3.5rem */

	.order-book-side :global(.order-book-bid-cols) {
		width: 100%;
		grid-template-columns:
			1.75rem
			clamp(3rem, 31.579cqi, 6rem)
			clamp(2.5rem, 26.316cqi, 3.5rem)
			clamp(2.5rem, 26.316cqi, 3.5rem);
	}

	.order-book-side :global(.order-book-offer-cols) {
		width: 100%;
		grid-template-columns:
			clamp(2.5rem, 26.316cqi, 3.5rem)
			clamp(2.5rem, 26.316cqi, 3.5rem)
			clamp(3rem, 31.579cqi, 6rem)
			1.75rem;
	}

	/* Only apply scrollbar offset for webkit browsers (Chrome/Safari/Edge) */
	@supports selector(::-webkit-scrollbar) {
		.orders-header {
			margin-right: 6px;
		}
	}

	:global(.orders-scroll)::-webkit-scrollbar {
		width: 6px;
	}
	:global(.orders-scroll)::-webkit-scrollbar-track {
		background: transparent;
	}
	:global(.orders-scroll)::-webkit-scrollbar-thumb {
		background: hsl(var(--border));
		border-radius: 3px;
	}
	:global(.orders-scroll)::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground));
	}
	:global(.no-spinner[type='number']) {
		appearance: textfield;
	}
	:global(.no-spinner[type='number']::-webkit-inner-spin-button),
	:global(.no-spinner[type='number']::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}
</style>
