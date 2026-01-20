<script lang="ts">
	import { kinde } from '$lib/auth.svelte';
	import { serverState } from '$lib/api.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { goto } from '$app/navigation';

	type ScenarioState = 'idle' | 'creating' | 'created' | 'playing' | 'paused' | 'settling' | 'settled';

	interface MarketIds {
		min: number;
		max: number;
		sum: number;
	}

	interface Scenario {
		id: string;
		name: string;
		teamAccountId: number;
		marketIds: MarketIds;
		diceRoll: number;
		fundingPerPlayer: number;
	}

	interface SettlementResult {
		settlementValues: { min: number; max: number; sum: number };
		allDice: Record<string, number>;
	}

	let gameState: ScenarioState = $state('idle');
	let scenario: Scenario | null = $state(null);
	let settlementResult: SettlementResult | null = $state(null);
	let error: string | null = $state(null);

	// Form inputs for creating a scenario
	let fundingAmount: number = $state(100);
	let scenarioName: string = $state('');

	// Get user's available balance from serverState
	let availableBalance = $derived(
		serverState.actingAs
			? (serverState.portfolios.get(serverState.actingAs)?.availableBalance ?? 0)
			: 0
	);

	async function getAuthHeaders(): Promise<HeadersInit> {
		const token = await kinde.getToken();
		return {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		};
	}

	async function create() {
		// Validate funding amount
		if (fundingAmount <= 0) {
			error = 'Funding amount must be positive';
			return;
		}
		if (fundingAmount > availableBalance) {
			error = `Insufficient balance. You have ${availableBalance.toFixed(2)} clips available.`;
			return;
		}

		gameState = 'creating';
		error = null;
		try {
			const res = await fetch('/api/single-player/create', {
				method: 'POST',
				headers: await getAuthHeaders(),
				body: JSON.stringify({
					funding_amount: fundingAmount,
					scenario_name: scenarioName.trim() || null
				})
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Failed to create scenario: ${text}`);
			}
			const data = await res.json();
			scenario = {
				id: data.scenario_id,
				name: data.scenario_name,
				teamAccountId: data.team_account_id,
				marketIds: {
					min: data.market_ids.min,
					max: data.market_ids.max,
					sum: data.market_ids.sum
				},
				diceRoll: data.dice_roll,
				fundingPerPlayer: data.funding_per_player
			};
			gameState = 'created';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
			gameState = 'idle';
		}
	}

	async function play() {
		if (!scenario) return;
		error = null;
		try {
			const res = await fetch(`/api/single-player/${scenario.id}/play`, {
				method: 'POST',
				headers: await getAuthHeaders()
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Failed to start scenario: ${text}`);
			}
			gameState = 'playing';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		}
	}

	async function pause() {
		if (!scenario) return;
		error = null;
		try {
			const res = await fetch(`/api/single-player/${scenario.id}/pause`, {
				method: 'POST',
				headers: await getAuthHeaders()
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Failed to pause scenario: ${text}`);
			}
			gameState = 'paused';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		}
	}

	async function settle() {
		if (!scenario) return;
		gameState = 'settling';
		error = null;
		try {
			const res = await fetch(`/api/single-player/${scenario.id}/settle`, {
				method: 'POST',
				headers: await getAuthHeaders()
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Failed to settle scenario: ${text}`);
			}
			const data = await res.json();
			settlementResult = {
				settlementValues: data.settlement_values,
				allDice: data.all_dice
			};
			gameState = 'settled';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
			gameState = 'paused';
		}
	}

	function goToMarket(marketId: number) {
		goto(`/market/${marketId}`);
	}
</script>

<div class="container mx-auto max-w-2xl py-8">
	<h1 class="mb-6 text-2xl font-bold">Single-Player Dice Scenario</h1>

	<p class="mb-6 text-muted-foreground">
		Play a min-max-sum trading game against 4 bots. You and the bots each roll a d20. Trade on
		markets predicting the MIN, MAX, and SUM of all 5 rolls.
	</p>

	{#if error}
		<div class="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
			{error}
		</div>
	{/if}

	{#if gameState === 'idle'}
		<div class="rounded-lg border p-6">
			<h2 class="mb-4 text-lg font-semibold">Start a New Game</h2>
			<p class="mb-4 text-sm text-muted-foreground">
				This will create 3 markets (MIN, MAX, SUM) private to you and 4 bot traders. You'll receive
				your dice roll and can trade against the bots.
			</p>

			<div class="mb-4 space-y-4">
				<div>
					<Label for="funding">Funding Amount (clips)</Label>
					<p class="mb-1 text-xs text-muted-foreground">
						Split 5 ways between you and 4 bots. Available: {availableBalance.toFixed(2)}
					</p>
					<Input
						id="funding"
						type="number"
						min="1"
						max={availableBalance}
						bind:value={fundingAmount}
						placeholder="Enter total funding"
					/>
					<p class="mt-1 text-xs text-muted-foreground">
						Each player gets: {(fundingAmount / 5).toFixed(2)} clips
					</p>
				</div>

				<div>
					<Label for="name">Scenario Name (optional)</Label>
					<Input
						id="name"
						type="text"
						bind:value={scenarioName}
						placeholder="My Trading Game"
					/>
				</div>
			</div>

			<Button onclick={create} disabled={fundingAmount <= 0 || fundingAmount > availableBalance}>
				Create Scenario
			</Button>
		</div>
	{:else if gameState === 'creating'}
		<div class="rounded-lg border p-6">
			<p class="text-muted-foreground">Creating scenario...</p>
		</div>
	{:else if scenario}
		<div class="space-y-6">
			<div class="rounded-lg border p-6">
				<div class="mb-2 flex items-center justify-between">
					<h2 class="text-lg font-semibold">Your Dice Roll</h2>
					<span class="text-sm text-muted-foreground">{scenario.name}</span>
				</div>
				<div class="flex items-center gap-4">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-3xl font-bold text-primary-foreground"
					>
						{scenario.diceRoll}
					</div>
					<div>
						<p class="text-sm text-muted-foreground">
							This is your secret roll. The 4 bots also have secret rolls. Trade on the markets to
							profit from your information!
						</p>
						<p class="mt-1 text-xs text-muted-foreground">
							Starting balance: {scenario.fundingPerPlayer.toFixed(2)} clips per player
						</p>
					</div>
				</div>
			</div>

			<div class="rounded-lg border p-6">
				<h2 class="mb-4 text-lg font-semibold">Markets</h2>
				<div class="grid grid-cols-3 gap-4">
					<Button variant="outline" onclick={() => goToMarket(scenario!.marketIds.min)}>
						MIN Market
					</Button>
					<Button variant="outline" onclick={() => goToMarket(scenario!.marketIds.max)}>
						MAX Market
					</Button>
					<Button variant="outline" onclick={() => goToMarket(scenario!.marketIds.sum)}>
						SUM Market
					</Button>
				</div>
			</div>

			<div class="rounded-lg border p-6">
				<h2 class="mb-4 text-lg font-semibold">Controls</h2>
				<div class="flex flex-wrap gap-4">
					{#if gameState === 'created' || gameState === 'paused'}
						<Button onclick={play}>Start Bots</Button>
						<Button variant="destructive" onclick={settle}>Settle Markets</Button>
					{:else if gameState === 'playing'}
						<Button variant="secondary" onclick={pause}>Pause Bots</Button>
						<p class="flex items-center text-sm text-green-600">Bots are trading...</p>
					{:else if gameState === 'settling'}
						<p class="text-muted-foreground">Settling markets...</p>
					{/if}
				</div>
			</div>

			{#if gameState === 'settled' && settlementResult}
				<div class="rounded-lg border border-green-400 bg-green-50 p-6">
					<h2 class="mb-4 text-lg font-semibold text-green-800">Game Complete!</h2>

					<div class="mb-4">
						<h3 class="mb-2 font-medium text-green-700">Settlement Values</h3>
						<div class="grid grid-cols-3 gap-4 text-center">
							<div>
								<div class="text-sm text-muted-foreground">MIN</div>
								<div class="text-2xl font-bold">{settlementResult.settlementValues.min}</div>
							</div>
							<div>
								<div class="text-sm text-muted-foreground">MAX</div>
								<div class="text-2xl font-bold">{settlementResult.settlementValues.max}</div>
							</div>
							<div>
								<div class="text-sm text-muted-foreground">SUM</div>
								<div class="text-2xl font-bold">{settlementResult.settlementValues.sum}</div>
							</div>
						</div>
					</div>

					<div>
						<h3 class="mb-2 font-medium text-green-700">All Dice Rolls</h3>
						<div class="space-y-1">
							{#each Object.entries(settlementResult.allDice) as [name, roll]}
								<div class="flex justify-between text-sm">
									<span class="text-muted-foreground">{name.replace(/__/g, ' ')}</span>
									<span class="font-mono font-bold">{roll}</span>
								</div>
							{/each}
						</div>
					</div>

					<div class="mt-4">
						<Button
							onclick={() => {
								gameState = 'idle';
								scenario = null;
								settlementResult = null;
							}}
						>
							Play Again
						</Button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
