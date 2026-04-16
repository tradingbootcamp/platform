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

	// The scenarios server endpoint shape is assumed (see plan). Fields are
	// accessed defensively so minor naming differences don't break the page.
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

			// If the stored selection no longer exists, clear it.
			const stored = scenarioIdStore.value.trim();
			if (stored && !scenarioList.some((s) => String(s.id) === stored)) {
				scenarioIdStore.value = '';
			}
			// Auto-select the first unsettled scenario if nothing is selected.
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
		// Re-fetch immediately when the user picks a different scenario.
		void scenarioIdStore.value;
		roundState = null;
		fetchRoundState();
	});

	const selectedScenarioName = $derived(
		scenarioList.find((s) => String(s.id) === scenarioIdStore.value)?.name ?? 'Select scenario…'
	);

	// Normalize revealed stocks to a Map<ticker, numericValue>.
	// API returns booleans: true = good (20), false = bad (0).
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

	// -------------------------------------------------------------
	// Which markets to show
	// -------------------------------------------------------------
	// Preferred path: the round-state endpoint tells us the exact market IDs (or
	// names) for this scenario. Fallback: if those fields aren't present, we
	// auto-detect the first "Options" market group so the page still works.

	const scenarioMarketIds = $derived.by<Set<number> | null>(() => {
		if (!roundState?.market_ids?.length) return null;
		return new Set(roundState.market_ids);
	});

	// -------------------------------------------------------------
	// Market row derivation
	// -------------------------------------------------------------
	type Row = {
		id: number;
		name: string;
		sortKey: [number, number, string];
	};

	function canonicalKey(name: string): string {
		return name.toLowerCase().replace(/\s+/g, '_');
	}

	// Build a map from canonical exchange name → spec label for display.
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
		// Match both "Call 50" and "50 Call" formats.
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
			// Use spec label for display if available, otherwise the stripped exchange name.
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

	function position(marketId: number): number {
		const exp = serverState.portfolio?.marketExposures?.find((me) => me.marketId === marketId);
		return exp?.position ?? 0;
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

	function buyAtOffer(marketId: number) {
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
	}

	function sellAtBid(marketId: number) {
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

	<!-- Top strip: scenario connection + trade size + balance -->
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

		<div class="flex flex-col">
			<label for="size" class="text-sm font-medium">Trade Size</label>
			<Input id="size" type="number" min="1" class="w-24" bind:value={defaultSizeStore.value} />
			<div class="mt-1 text-xs text-muted-foreground">Size for one-click buy/sell</div>
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
			<div class="mb-1 text-xs text-muted-foreground">Player Knows:</div>
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
			<div class="mb-1 text-xs text-muted-foreground">Mark Knows:</div>
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
			<thead class="bg-muted">
				<tr>
					<th class="p-2 text-left">Market</th>
					<th class="p-2 text-center" colspan="4">Order Book</th>
					<th class="p-2 text-right">Position</th>
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
					<tr class="border-t">
						<td class="p-2 font-mono">{row.name}</td>

						<!-- Bid size -->
						<td class="p-1 text-right font-mono text-xs text-muted-foreground">
							{bid ? fmt(bid.size, 0) : ''}
						</td>

						<!-- Bid price (click to sell) -->
						<td class="p-1 text-right">
							{#if bid && bid.price != null}
								<Button
									variant="red"
									size="sm"
									class="h-7 gap-1 px-2 font-mono"
									onclick={() => sellAtBid(row.id)}
									title="Sell {defaultSizeStore.value} @ {fmt(bid.price)}"
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
									variant="green"
									size="sm"
									class="h-7 gap-1 px-2 font-mono"
									onclick={() => buyAtOffer(row.id)}
									title="Buy {defaultSizeStore.value} @ {fmt(offer.price)}"
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
							class="p-2 text-right font-mono {pos > 0
								? 'text-green-700'
								: pos < 0
									? 'text-red-700'
									: ''}"
						>
							{fmt(pos, 0)}
						</td>
						<td class="p-2 text-right font-mono">{pnl.count}</td>
						<td class="p-2 text-right font-mono">{fmt(pnl.cashflow, 0)}</td>
					</tr>
				{/each}
				{#if rows.length === 0}
					<tr>
						<td colspan="8" class="p-4 text-center text-muted-foreground">
							No markets found for this scenario.
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
