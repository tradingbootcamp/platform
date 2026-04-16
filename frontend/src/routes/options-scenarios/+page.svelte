<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { PUBLIC_SCENARIOS_SERVER_URL } from '$env/static/public';
	import { sendClientMessage, serverState } from '$lib/api.svelte';
	import { sortedBids, sortedOffers } from '$lib/components/marketDataUtils';
	import { LocalStore } from '$lib/localStore.svelte';
	import { kinde } from '$lib/auth.svelte';
	import { websocket_api } from 'schema-js';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Zap } from '@lucide/svelte/icons';
	import { goto } from '$app/navigation';

	type RoundState = {
		current_round?: number;
		total_rounds?: number;
		revealed_to_player?: Record<string, boolean>;
		revealed_to_mark?: Record<string, boolean>;
		market_ids?: number[];
		market_specs?: Array<{ type: string; strike: number | null; key: string; label: string }>;
	};

	type ScenarioListEntry = {
		id: number | string;
		name: string;
		settled?: boolean;
		market_count?: number;
	};

	const STOCKS = ['AAPL', 'BA', 'CSCO', 'DELL', 'EBAY'];

	const scenarioIdStore = new LocalStore<string>('options-scenarios:scenario-id', '');
	const defaultSizeStore = new LocalStore<number>('options-scenarios:default-size', 1);

	let scenarioList = $state<ScenarioListEntry[]>([]);
	let roundState = $state<RoundState | null>(null);
	let fetchError = $state<string | null>(null);
	let listError = $state<string | null>(null);
	let roundPollHandle: ReturnType<typeof setInterval> | null = null;
	let listPollHandle: ReturnType<typeof setInterval> | null = null;

	async function fetchScenarioList() {
		try {
			const token = await kinde.getToken();
			const url = new URL(`${PUBLIC_SCENARIOS_SERVER_URL}/options_ws/public/list-scenarios`);
			if (token) url.searchParams.set('token', token);
			const res = await fetch(url);
			if (!res.ok) {
				listError = `HTTP ${res.status}`;
				return;
			}
			const data = (await res.json()) as ScenarioListEntry[];
			scenarioList = Array.isArray(data) ? data : [];
			listError = null;

			const stored = scenarioIdStore.value.trim();
			if (stored && !scenarioList.some((s) => String(s.id) === stored)) {
				scenarioIdStore.value = '';
			}
			if (!scenarioIdStore.value && scenarioList.length > 0) {
				const preferred = scenarioList.find((s) => !s.settled) ?? scenarioList[0];
				scenarioIdStore.value = String(preferred.id);
			}
		} catch (e) {
			listError = e instanceof Error ? e.message : String(e);
		}
	}

	async function fetchRoundState() {
		const scenarioId = scenarioIdStore.value.trim();
		if (!scenarioId) {
			roundState = null;
			return;
		}
		try {
			const token = await kinde.getToken();
			const url = new URL(`${PUBLIC_SCENARIOS_SERVER_URL}/options_ws/public/round-state`);
			url.searchParams.set('scenario_id', scenarioId);
			if (token) url.searchParams.set('token', token);
			const res = await fetch(url);
			if (!res.ok) {
				fetchError = `HTTP ${res.status}`;
				return;
			}
			roundState = (await res.json()) as RoundState;
			fetchError = null;
		} catch (e) {
			fetchError = e instanceof Error ? e.message : String(e);
		}
	}

	onMount(() => {
		fetchScenarioList();
		fetchRoundState();
		roundPollHandle = setInterval(fetchRoundState, 2000);
		listPollHandle = setInterval(fetchScenarioList, 10000);
	});

	onDestroy(() => {
		if (roundPollHandle) clearInterval(roundPollHandle);
		if (listPollHandle) clearInterval(listPollHandle);
	});

	$effect(() => {
		void scenarioIdStore.value;
		roundState = null;
		fetchRoundState();
	});

	const selectedScenarioName = $derived(
		scenarioList.find((s) => String(s.id) === scenarioIdStore.value)?.name ?? 'Select scenario…'
	);

	function normalizeReveals(
		reveals: Record<string, boolean> | undefined
	): Map<string, number | null> {
		const map = new Map<string, number | null>();
		if (!reveals) return map;
		for (const [ticker, good] of Object.entries(reveals)) {
			map.set(ticker, good ? 20 : 0);
		}
		return map;
	}

	const playerReveals = $derived(normalizeReveals(roundState?.revealed_to_player));
	const markReveals = $derived(normalizeReveals(roundState?.revealed_to_mark));
	const currentRound = $derived(roundState?.current_round ?? null);
	const totalRounds = $derived(roundState?.total_rounds ?? 6);

	const scenarioMarketIds = $derived.by<Set<number> | null>(() => {
		if (!roundState?.market_ids?.length) return null;
		return new Set(roundState.market_ids);
	});

	type Row = {
		id: number;
		name: string;
		sortKey: [number, number, string];
	};

	function canonicalKey(name: string): string {
		return name.toLowerCase().replace(/\s+/g, '_');
	}

	const specLabelByCanonical = $derived.by<Map<string, string>>(() => {
		const map = new Map<string, string>();
		if (!roundState?.market_specs) return map;
		for (const s of roundState.market_specs) {
			map.set(canonicalKey(s.label ?? s.key ?? ''), s.label);
		}
		return map;
	});

	function classify(name: string): [number, number] {
		const upper = name.toUpperCase();
		if (upper === 'SUM') return [0, 0];
		const stockIdx = STOCKS.indexOf(upper);
		if (stockIdx >= 0) return [1, stockIdx];
		const m = name.match(/^(?:(\d+)\s+(Call|Put)|(Call|Put)\s+(\d+))$/i);
		if (m) {
			const strike = parseInt(m[1] ?? m[4], 10);
			const type = (m[2] ?? m[3]).toLowerCase();
			return [type === 'call' ? 2 : 3, strike];
		}
		return [4, 0];
	}

	const rows = $derived.by<Row[]>(() => {
		const ids = scenarioMarketIds;
		if (!ids || ids.size === 0) return [];
		const out: Row[] = [];
		for (const [id, md] of serverState.markets) {
			if (!ids.has(id)) continue;
			const rawName = md.definition.name ?? '';
			const stripped = rawName.includes('__') ? rawName.split('__').pop()! : rawName;
			const name = specLabelByCanonical.get(canonicalKey(stripped)) ?? stripped;
			const [cat, n] = classify(name);
			out.push({ id, name, sortKey: [cat, n, name] });
		}
		out.sort((a, b) => {
			for (let i = 0; i < 3; i++) {
				if (a.sortKey[i] < b.sortKey[i]) return -1;
				if (a.sortKey[i] > b.sortKey[i]) return 1;
			}
			return 0;
		});
		return out;
	});

	function bestBid(marketId: number): websocket_api.IOrder | undefined {
		const md = serverState.markets.get(marketId);
		return md ? sortedBids(md.orders)[0] : undefined;
	}

	function bestOffer(marketId: number): websocket_api.IOrder | undefined {
		const md = serverState.markets.get(marketId);
		return md ? sortedOffers(md.orders)[0] : undefined;
	}

	function isMarketOpen(marketId: number): boolean {
		const md = serverState.markets.get(marketId);
		return (md?.definition.status ?? 0) === websocket_api.MarketStatus.MARKET_STATUS_OPEN;
	}

	function position(marketId: number): number {
		const exp = serverState.portfolio?.marketExposures?.find((me) => me.marketId === marketId);
		return exp?.position ?? 0;
	}

	function capitalLocked(marketId: number): number {
		const pos = position(marketId);
		if (pos === 0) return 0;
		const md = serverState.markets.get(marketId);
		if (!md) return 0;
		const min = md.definition.minSettlement ?? 0;
		const max = md.definition.maxSettlement ?? 0;
		const bids = sortedBids(md.orders);
		const offers = sortedOffers(md.orders);
		const bestBidPrice = bids[0]?.price;
		const bestOfferPrice = offers[0]?.price;
		const mid =
			bestBidPrice != null && bestOfferPrice != null
				? (bestBidPrice + bestOfferPrice) / 2
				: (bestBidPrice ?? bestOfferPrice);
		if (mid == null) return 0;
		return pos >= 0 ? pos * (mid - min) : -pos * (max - mid);
	}

	function myTradePnl(marketId: number): { count: number; cashflow: number } {
		const md = serverState.markets.get(marketId);
		if (!md) return { count: 0, cashflow: 0 };
		const me = serverState.actingAs;
		let count = 0;
		let cashflow = 0;
		for (const t of md.trades) {
			const price = t.price ?? 0;
			const size = t.size ?? 0;
			if (t.buyerId === me) {
				count++;
				cashflow -= price * size;
			} else if (t.sellerId === me) {
				count++;
				cashflow += price * size;
			}
		}
		return { count, cashflow };
	}

	// Trade feedback: flash only when a real trade occurs after clicking.
	let tradeFlash = $state<Map<number, 'buy' | 'sell'>>(new Map());
	type PendingTrade = {
		direction: 'buy' | 'sell';
		tradeCount: number;
		timeout: ReturnType<typeof setTimeout>;
	};
	let pendingTrades = new Map<number, PendingTrade>();

	function watchForTrade(marketId: number, direction: 'buy' | 'sell') {
		const md = serverState.markets.get(marketId);
		const currentCount = md?.trades.length ?? 0;
		const existing = pendingTrades.get(marketId);
		if (existing) clearTimeout(existing.timeout);
		const timeout = setTimeout(() => pendingTrades.delete(marketId), 5000);
		pendingTrades.set(marketId, { direction, tradeCount: currentCount, timeout });
	}

	$effect(() => {
		for (const [marketId, pending] of pendingTrades) {
			const md = serverState.markets.get(marketId);
			if (!md) continue;
			if (md.trades.length > pending.tradeCount) {
				clearTimeout(pending.timeout);
				pendingTrades.delete(marketId);
				tradeFlash = new Map(tradeFlash).set(marketId, pending.direction);
				const id = marketId;
				setTimeout(() => {
					const next = new Map(tradeFlash);
					next.delete(id);
					tradeFlash = next;
				}, 2000);
			}
		}
	});

	function buyAtOffer(e: MouseEvent, marketId: number) {
		e.stopPropagation();
		if (!isMarketOpen(marketId)) return;
		const offer = bestOffer(marketId);
		if (!offer || offer.price == null) return;
		sendClientMessage({
			createOrder: {
				marketId,
				price: offer.price,
				size: defaultSizeStore.value,
				side: websocket_api.Side.BID
			}
		});
		watchForTrade(marketId, 'buy');
	}

	function sellAtBid(e: MouseEvent, marketId: number) {
		e.stopPropagation();
		if (!isMarketOpen(marketId)) return;
		const bid = bestBid(marketId);
		if (!bid || bid.price == null) return;
		sendClientMessage({
			createOrder: {
				marketId,
				price: bid.price,
				size: defaultSizeStore.value,
				side: websocket_api.Side.OFFER
			}
		});
		watchForTrade(marketId, 'sell');
	}

	function fmt(n: number | null | undefined, digits = 2): string {
		if (n == null || Number.isNaN(n)) return '—';
		return n.toFixed(digits);
	}

	function revealBadgeClass(value: number | null | undefined): string {
		if (value == null) return 'bg-muted text-muted-foreground';
		if (value >= 20) return 'bg-green-500/20 text-green-400 font-bold';
		return 'bg-red-500/20 text-red-400 font-bold';
	}

	function revealLabel(value: number | null | undefined): string {
		if (value == null) return '?';
		return value >= 20 ? '$20' : '$0';
	}
</script>

<div class="mx-auto max-w-6xl space-y-4 p-4">
	<h1 class="text-2xl font-bold">Options Scenarios</h1>

	<!-- Top strip: scenario + balance -->
	<div class="flex flex-wrap items-start gap-6 rounded border p-3">
		<div class="flex flex-col">
			<label for="scenario-id" class="text-sm font-medium">Scenario</label>
			<Select.Root
				type="single"
				value={scenarioIdStore.value || undefined}
				onValueChange={(v) => (scenarioIdStore.value = v ?? '')}
			>
				<Select.Trigger class="w-64" id="scenario-id">{selectedScenarioName}</Select.Trigger>
				<Select.Content>
					{#each scenarioList as s (s.id)}
						<Select.Item value={String(s.id)}>
							{s.name}{s.settled ? ' (settled)' : ''}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<div class="mt-1 text-xs text-muted-foreground">
				{#if listError}
					Couldn't load scenarios: {listError}
				{:else if scenarioList.length === 0}
					No scenarios available
				{:else}
					Pick the scenario you're trading
				{/if}
			</div>
		</div>

		<div class="ml-auto text-right">
			<div class="text-sm font-medium">Available Balance</div>
			<div class="font-mono text-xl">
				{fmt(serverState.portfolio?.availableBalance, 0)}
			</div>
		</div>
	</div>

	{#if fetchError}
		<div class="rounded border border-red-400 bg-red-50 p-2 text-sm text-red-800">
			Scenarios server: {fetchError}
		</div>
	{/if}

	<!-- Round + reveals header -->
	<div class="space-y-3 rounded border p-3">
		<div class="flex items-center justify-between">
			{#if roundState}
				<div class="text-lg font-semibold">
					Round {currentRound ?? '—'} / {totalRounds}
				</div>
			{:else}
				<div class="text-lg font-semibold text-muted-foreground">
					{scenarioIdStore.value.trim() ? 'Connecting…' : 'Select a scenario above'}
				</div>
			{/if}
		</div>

		<div>
			<div class="mb-1 text-xs text-muted-foreground">Your info:</div>
			<div class="flex flex-wrap gap-2">
				{#each STOCKS as ticker (ticker)}
					{@const revealed = playerReveals.has(ticker)}
					{@const v = playerReveals.get(ticker) ?? null}
					<span
						class={`inline-flex items-center rounded px-2 py-1 font-mono text-xs ${revealBadgeClass(revealed ? v : null)}`}
					>
						{ticker}: {revealed ? revealLabel(v) : '?'}
					</span>
				{/each}
			</div>
		</div>

		<div>
			<div class="mb-1 text-xs text-muted-foreground">Public info:</div>
			<div class="flex flex-wrap gap-2">
				{#each STOCKS as ticker (ticker)}
					{@const revealed = markReveals.has(ticker)}
					{@const v = markReveals.get(ticker) ?? null}
					<span
						class={`inline-flex items-center rounded px-2 py-1 font-mono text-xs ${revealBadgeClass(revealed ? v : null)}`}
					>
						{ticker}: {revealed ? revealLabel(v) : '?'}
					</span>
				{/each}
			</div>
		</div>
	</div>

	<!-- Trading table -->
	<div class="overflow-x-auto rounded border">
		<table class="w-full text-sm">
			<thead>
				<tr>
					<th class="p-1"></th>
					<th class="p-1 text-right" colspan="4">
						<span
							class="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground"
							title="Size for one-click buy/sell"
						>
							Trade size:
							<Input
								id="size"
								type="number"
								min="1"
								class="h-6 w-14 text-xs"
								bind:value={defaultSizeStore.value}
							/>
						</span>
					</th>
					<th class="p-1" colspan="4"></th>
				</tr>
			</thead>
			<thead class="bg-muted">
				<tr>
					<th class="p-2 text-left">Market</th>
					<th class="p-2 text-center" colspan="4">Quick Trade</th>
					<th class="p-2 text-right">Position</th>
					<th class="p-2 text-right">Capital Locked</th>
					<th class="p-2 text-right">My Trades</th>
					<th class="p-2 text-right">Cashflow</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.id)}
					{@const bid = bestBid(row.id)}
					{@const offer = bestOffer(row.id)}
					{@const pos = position(row.id)}
					{@const pnl = myTradePnl(row.id)}
					{@const open = isMarketOpen(row.id)}
					{@const flash = tradeFlash.get(row.id)}
					<tr
						class="cursor-pointer border-t hover:bg-yellow-500/10"
						onclick={() => goto(`/market/${row.id}`)}
					>
						<td class="p-2 font-mono">{row.name}</td>

						<!-- Bid size -->
						<td class="p-1 text-right font-mono text-xs text-muted-foreground">
							{bid ? fmt(bid.size, 0) : ''}
						</td>

						<!-- Bid price (click to sell) -->
						<td class="p-1 text-right">
							{#if bid && bid.price != null}
								<Button
									variant={open ? 'red' : 'outline'}
									size="sm"
									class="h-7 gap-1 px-2 font-mono {open
										? ''
										: 'border-red-300 text-red-300 opacity-40'}"
									disabled={!open}
									onclick={(e) => sellAtBid(e, row.id)}
									title={open
										? `Sell ${defaultSizeStore.value} @ ${fmt(bid.price)}`
										: 'Market is currently halted'}
								>
									<Zap class="h-3 w-3" />
									{fmt(bid.price)}
								</Button>
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
						</td>

						<!-- Offer price (click to buy) -->
						<td class="p-1 text-left">
							{#if offer && offer.price != null}
								<Button
									variant={open ? 'green' : 'outline'}
									size="sm"
									class="h-7 gap-1 px-2 font-mono {open
										? ''
										: 'border-green-300 text-green-300 opacity-40'}"
									disabled={!open}
									onclick={(e) => buyAtOffer(e, row.id)}
									title={open
										? `Buy ${defaultSizeStore.value} @ ${fmt(offer.price)}`
										: 'Market is currently halted'}
								>
									<Zap class="h-3 w-3" />
									{fmt(offer.price)}
								</Button>
							{:else}
								<span class="text-muted-foreground">—</span>
							{/if}
						</td>

						<!-- Offer size -->
						<td class="p-1 text-left font-mono text-xs text-muted-foreground">
							{offer ? fmt(offer.size, 0) : ''}
						</td>

						<td
							class="p-2 text-right font-mono transition-colors duration-300
								{pos > 0 ? 'text-green-700' : pos < 0 ? 'text-red-700' : ''}
								{flash === 'buy' ? 'trade-flash-buy' : flash === 'sell' ? 'trade-flash-sell' : ''}"
						>
							{#if flash}
								<span class="trade-arrow {flash === 'buy' ? 'text-green-500' : 'text-red-500'}">
									{flash === 'buy' ? '▲' : '▼'}
								</span>
							{/if}
							{fmt(pos, 1)}
						</td>
						<td class="p-2 text-right font-mono">{fmt(capitalLocked(row.id), 0)}</td>
						<td class="p-2 text-right font-mono">{pnl.count}</td>
						<td class="p-2 text-right font-mono">{fmt(pnl.cashflow, 0)}</td>
					</tr>
				{/each}
				{#if rows.length === 0}
					<tr>
						<td colspan="9" class="p-4 text-center text-muted-foreground">
							No markets found for this scenario.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	@keyframes flash-buy {
		0% {
			background-color: rgb(34 197 94 / 0.3);
		}
		100% {
			background-color: transparent;
		}
	}
	@keyframes flash-sell {
		0% {
			background-color: rgb(239 68 68 / 0.3);
		}
		100% {
			background-color: transparent;
		}
	}
	:global(.trade-flash-buy) {
		animation: flash-buy 0.6s ease-out;
	}
	:global(.trade-flash-sell) {
		animation: flash-sell 0.6s ease-out;
	}
	@keyframes fade-out {
		0% {
			opacity: 1;
		}
		70% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
	:global(.trade-arrow) {
		display: inline-block;
		margin-right: 0.25rem;
		font-size: 0.7rem;
		animation: fade-out 2s ease-out forwards;
	}
</style>
