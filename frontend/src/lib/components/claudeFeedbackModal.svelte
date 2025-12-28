<script lang="ts">
	import type { MarketData } from '$lib/api.svelte';
	import { accountName, serverState } from '$lib/api.svelte';
	import { PUBLIC_ANTHROPIC_API_KEY } from '$env/static/public';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Loader from '@lucide/svelte/icons/loader';

	let { marketData }: { marketData: MarketData } = $props();

	let open = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let feedback = $state<string | null>(null);

	const activeAccountId = $derived(serverState.actingAs ?? serverState.userId);

	function buildPrompt(): string {
		const def = marketData.definition;
		const trades = marketData.trades;
		const positions = marketData.positions;

		const requestingUserName = accountName(activeAccountId) ?? 'Unknown';

		const positionsText = positions
			.map((p) => {
				const name = accountName(p.accountId) ?? 'Unknown';
				const net = Number(p.net ?? 0).toFixed(2);
				const avgBuy = p.avgBuyPrice != null ? Number(p.avgBuyPrice).toFixed(2) : 'N/A';
				const avgSell = p.avgSellPrice != null ? Number(p.avgSellPrice).toFixed(2) : 'N/A';
				const isMe = p.accountId === activeAccountId ? ' (YOU)' : '';
				return `- ${name}${isMe}: Net position ${net}, avg buy @ ${avgBuy}, avg sell @ ${avgSell}`;
			})
			.join('\n');

		const tradesText = trades
			.slice()
			.sort((a, b) => {
				const aTime = Number(a.transactionTimestamp?.seconds ?? 0);
				const bTime = Number(b.transactionTimestamp?.seconds ?? 0);
				return aTime - bTime;
			})
			.map((t) => {
				const buyerName = accountName(t.buyerId) ?? 'Unknown';
				const sellerName = accountName(t.sellerId) ?? 'Unknown';
				const price = Number(t.price ?? 0).toFixed(2);
				const size = Number(t.size ?? 0).toFixed(2);
				const taker = t.buyerIsTaker ? '(buyer took)' : '(seller took)';
				const isMeTrade =
					t.buyerId === activeAccountId || t.sellerId === activeAccountId ? ' [YOUR TRADE]' : '';
				return `- ${buyerName} bought ${size} from ${sellerName} @ ${price} ${taker}${isMeTrade}`;
			})
			.join('\n');

		return `You are analyzing trading behavior in a prediction market that just settled.

## Market Details
- Name: ${def.name ?? 'Unknown'}
- Settlement Price: ${def.closed?.settlePrice ?? 'Unknown'}
- Price Range: ${def.minSettlement ?? 0} - ${def.maxSettlement ?? 100}

## Participants and Final Positions
${positionsText || 'No position data available'}

## Trade History (chronological)
${tradesText || 'No trade data available'}

## The User Requesting Feedback
User "${requestingUserName}" is asking for your analysis. Their trades are marked with [YOUR TRADE].

## Your Task
Please provide:
1. **Feedback on the requesting user's trading behavior**: Were their trades well-timed? Did they buy low and sell high? What patterns do you notice?
2. **Observations about other participants**: What strategies might different traders have been employing? Who seemed to have the best information or timing?
3. **Interesting market dynamics**: Were there any notable price movements, liquidity patterns, or trading sequences worth highlighting?

Keep your analysis concise but insightful. Focus on actionable feedback for learning.`;
	}

	async function fetchFeedback() {
		if (!PUBLIC_ANTHROPIC_API_KEY) {
			error = 'Anthropic API key not configured';
			return;
		}

		loading = true;
		error = null;

		const prompt = buildPrompt();

		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': PUBLIC_ANTHROPIC_API_KEY,
				'anthropic-version': '2023-06-01',
				'anthropic-dangerous-direct-browser-access': 'true'
			},
			body: JSON.stringify({
				model: 'claude-sonnet-4-20250514',
				max_tokens: 1500,
				messages: [{ role: 'user', content: prompt }]
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			error = `API error: ${response.status} - ${errorText}`;
			loading = false;
			return;
		}

		const data = await response.json();
		feedback = data.content?.[0]?.text ?? 'No feedback received';
		loading = false;
	}

	function handleOpen() {
		open = true;
		if (!feedback && !loading) {
			fetchFeedback();
		}
	}
</script>

<Button variant="outline" size="sm" class="h-9 gap-1" onclick={handleOpen}>
	<Sparkles class="h-4 w-4" />
	AI Feedback
</Button>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>AI Trading Feedback</Dialog.Title>
			<Dialog.Description>Analysis of your trading in {marketData.definition.name}</Dialog.Description
			>
		</Dialog.Header>
		<div class="mt-4">
			{#if loading}
				<div class="flex items-center justify-center gap-2 py-8">
					<Loader class="h-5 w-5 animate-spin" />
					<span class="text-muted-foreground">Analyzing trades...</span>
				</div>
			{:else if error}
				<div class="rounded-md bg-destructive/10 p-4 text-destructive">
					<p class="font-medium">Error</p>
					<p class="text-sm">{error}</p>
					<Button variant="outline" size="sm" class="mt-2" onclick={fetchFeedback}>Retry</Button>
				</div>
			{:else if feedback}
				<div class="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
					{feedback}
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
