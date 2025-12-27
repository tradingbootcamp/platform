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
		tabbedMode = false
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
	}>();

	const bidRowClass = 'order-book-bid-cols justify-start';
	const offerRowClass = 'order-book-offer-cols justify-end';
	const canShowOrderEntry = shouldShowOrderUI && marketId !== undefined;

	// Order form state - separate for bids and offers
	let bidPrice = $state('');
	let bidSize = $state('');
	let offerPrice = $state('');
	let offerSize = $state('');
	let bidPriceError = $state('');
	let bidSizeError = $state('');
	let offerPriceError = $state('');
	let offerSizeError = $state('');

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

	// Check if forms are complete enough to submit
	const bidFormIncomplete = $derived(!bidPrice || !bidSize);
	const offerFormIncomplete = $derived(!offerPrice || !offerSize);

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

	const takeOrder = (order: websocket_api.IOrder, side: 'BID' | 'OFFER') => {
		if (marketId === undefined) return;
		takingOrderId = order.id ?? null;
		sendClientMessage({
			createOrder: {
				marketId,
				price: order.price ?? 0,
				size: order.size ?? 0,
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
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					{variant}
					class={cn('h-6 w-6 shrink-0 rounded-2xl p-0', !marketStatusAllowsOrders && 'opacity-50')}
					disabled={!marketStatusAllowsOrders}
					onclick={() => takeOrder(order, side)}
				>
					<Zap class="h-4 w-4" />
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>Places a {side} with the same size and price.</Tooltip.Content>
	</Tooltip.Root>
{/snippet}

{#snippet bidOrderRow(order: websocket_api.IOrder)}
	<Table.Row
		class={cn(
			`h-8 grid ${bidRowClass} border-b border-border/60 bg-green-50 even:bg-green-100 dark:bg-green-700/35 dark:even:bg-green-900/35`,
			order.ownerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
		)}
	>
		<Table.Cell class="flex items-center justify-center truncate p-0 pl-1">
			{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
				{@render cancelButton(order.id)}
			{:else if shouldShowOrderUI && bids[0] === order && displayTransactionId === undefined && takingOrderId !== order.id}
				{@render takeButton(order, 'OFFER', 'green')}
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
			`h-8 grid ${offerRowClass} border-b border-border/60 bg-red-50 even:bg-red-100 dark:bg-red-700/35 dark:even:bg-red-900/35`,
			order.ownerId === serverState.actingAs && 'ring-2 ring-inset ring-primary'
		)}
	>
		<Table.Cell class="flex items-center truncate px-1 py-0"><FlexNumber value={(order.price ?? 0).toString()} /></Table.Cell>
		<Table.Cell class="flex items-center truncate px-1 py-0"><FlexNumber value={(order.size ?? 0).toString()} /></Table.Cell>
		<Table.Cell class="flex items-center truncate px-1 py-0"><span class:italic={isAltAccount(order.ownerId)}>{getShortUserName(order.ownerId)}</span></Table.Cell>
		<Table.Cell class="flex items-center justify-center truncate p-0 pr-1">
			{#if order.ownerId === serverState.actingAs && displayTransactionId === undefined}
				{@render cancelButton(order.id)}
			{:else if shouldShowOrderUI && offers[0] === order && displayTransactionId === undefined && takingOrderId !== order.id}
				{@render takeButton(order, 'BID', 'red')}
			{/if}
		</Table.Cell>
	</Table.Row>
{/snippet}

<div class="order-container w-full">
	{#if !canShowOrderEntry && !tabbedMode}
		<!-- Show Order Book header when order entry is not available -->
		<div class="order-book-wrapper orders-header h-10 relative">
			<span class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-lg font-bold z-10 pointer-events-none">Order Book</span>
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
					<Tooltip.Root>
						<Tooltip.Trigger class="w-full">
							{#snippet child({ props })}
								<Button {...props} variant="green" class={cn('h-8 w-full', (!marketStatusAllowsOrders || bidFormIncomplete) && 'opacity-50')} disabled={!marketStatusAllowsOrders || bidFormIncomplete} onclick={submitBid}>Place BID</Button>
							{/snippet}
						</Tooltip.Trigger>
						{#if bidFormIncomplete}
							<Tooltip.Content>Fill in price and size</Tooltip.Content>
						{/if}
					</Tooltip.Root>
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
				</div>
				<!-- Offer side -->
				<div class="flex flex-1 min-w-0 flex-col gap-2">
					<Button variant="redOutline" class={cn('h-8 w-full', !canCancelOrders && 'opacity-50')} disabled={!canCancelOrders} onclick={() => clearOrders('OFFER')}>Clear Offers</Button>
					<Tooltip.Root>
						<Tooltip.Trigger class="w-full">
							{#snippet child({ props })}
								<Button {...props} variant="red" class={cn('h-8 w-full', (!marketStatusAllowsOrders || offerFormIncomplete) && 'opacity-50')} disabled={!marketStatusAllowsOrders || offerFormIncomplete} onclick={submitOffer}>Place OFFER</Button>
							{/snippet}
						</Tooltip.Trigger>
						{#if offerFormIncomplete}
							<Tooltip.Content>Fill in price and size</Tooltip.Content>
						{/if}
					</Tooltip.Root>
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
				</div>
			</div>
		</div>
	{/if}

	{#if canShowOrderEntry && !tabbedMode}
		<!-- Non-tabbed mode: order entry in header rows (outside scroll) -->
		<div class="order-book-wrapper orders-header relative">
			<span class="absolute left-1/2 -translate-x-1/2 top-5 -translate-y-1/2 text-lg font-bold z-10 pointer-events-none">Order Book</span>
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
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="green" class={cn('h-8 w-[5.5rem]', (!marketStatusAllowsOrders || bidFormIncomplete) && 'opacity-50')} disabled={!marketStatusAllowsOrders || bidFormIncomplete} onclick={submitBid}>Place BID</Button>
										{/snippet}
									</Tooltip.Trigger>
									{#if bidFormIncomplete}
										<Tooltip.Content>Fill in price and size</Tooltip.Content>
									{/if}
								</Tooltip.Root>
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
								<Tooltip.Root>
									<Tooltip.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="red" class={cn('h-8 w-24', (!marketStatusAllowsOrders || offerFormIncomplete) && 'opacity-50')} disabled={!marketStatusAllowsOrders || offerFormIncomplete} onclick={submitOffer}>Place OFFER</Button>
										{/snippet}
									</Tooltip.Trigger>
									{#if offerFormIncomplete}
										<Tooltip.Content>Fill in price and size</Tooltip.Content>
									{/if}
								</Tooltip.Root>
							</Table.Head>
							{#if offerPriceError || offerSizeError}
								<div class="absolute top-full left-0 mt-1 z-50 rounded border bg-red-500 text-white border-red-500 px-2 py-1 shadow-md">
									<p class="text-xs whitespace-nowrap">{offerPriceError || offerSizeError}</p>
								</div>
							{/if}
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
						{#each bids as order (order.id)}
							{@render bidOrderRow(order)}
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="order-book-side">
				<Table.Root class="border-collapse border-spacing-0">
					<Table.Body>
						{#each offers as order (order.id)}
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
