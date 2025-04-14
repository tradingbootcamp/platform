<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { accountName } from '$lib/api.svelte';
	import type { websocket_api } from 'schema-js';

	interface Position {
		userId: number;
		position: number;
		avgPrice: number;
		highestBuyPrice: number;
		lowestSellPrice: number;
	}

	interface Aggregation {
		net: number;
		totalBuyCost: number;
		totalBuySize: number;
		totalSellCost: number;
		totalSellSize: number;
		maxBuyPrice: number;
		minSellPrice: number;
	}

	let { trades }: { trades: websocket_api.ITrade[] } = $props();

	function aggregateTradesByAccount(trades: websocket_api.ITrade[]) {
		const result: Record<number, Aggregation> = {};

		for (const t of trades) {
			const buyerRec = (result[t.buyerId!] ??= {
				net: 0,
				totalBuyCost: 0,
				totalBuySize: 0,
				totalSellCost: 0,
				totalSellSize: 0,
				maxBuyPrice: -Infinity,
				minSellPrice: Infinity
			});
			const sellerRec = (result[t.sellerId!] ??= {
				net: 0,
				totalBuyCost: 0,
				totalBuySize: 0,
				totalSellCost: 0,
				totalSellSize: 0,
				maxBuyPrice: -Infinity,
				minSellPrice: Infinity
			});

			buyerRec.net += t.size ?? 0;
			sellerRec.net -= t.size ?? 0;

			buyerRec.totalBuyCost += (t.price ?? 0) * (t.size ?? 0);
			buyerRec.totalBuySize += t.size ?? 0;
			sellerRec.totalSellCost += (t.price ?? 0) * (t.size ?? 0);
			sellerRec.totalSellSize += t.size ?? 0;

			buyerRec.maxBuyPrice = Math.max(buyerRec.maxBuyPrice, t.price ?? 0);
			sellerRec.minSellPrice = Math.min(sellerRec.minSellPrice, t.price ?? Infinity);
		}

		return result;
	}

	let positions = $derived(
		Object.entries(aggregateTradesByAccount(trades)).map(([userId, data]) => ({
			userId: Number(userId),
			position: data.net,
			avgPrice:
				data.net > 0
					? data.totalBuyCost / data.totalBuySize
					: data.net < 0
						? data.totalSellCost / data.totalSellSize
						: 0,
			highestBuyPrice: data.maxBuyPrice === -Infinity ? 0 : data.maxBuyPrice,
			lowestSellPrice: data.minSellPrice === Infinity ? 0 : data.minSellPrice
		}))
	);

	const getShortTraderName = (id: number) => {
		const name = accountName(id);
		return name.substring(6);
	};
</script>

<div>
	<Table.Root>
		<Table.Header>
			<Table.Row class="grid h-full grid-cols-[8rem_3rem_4rem_4rem_4rem]">
				<Table.Head class="text-center font-mono">Trader</Table.Head>
				<Table.Head class="text-center font-mono">Pos</Table.Head>
				<Table.Head class="text-center font-mono">Avg</Table.Head>
				<Table.Head class="text-center font-mono">High</Table.Head>
				<Table.Head class="text-center font-mono">Low</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each positions as position}
				<Table.Row class="grid h-full grid-cols-[3.5rem_3rem_4rem_4rem_4rem]">
					<Table.Cell class="truncate px-0.5 py-0.5 text-center font-mono text-xs">
						{getShortTraderName(position.userId)}
					</Table.Cell>
					<Table.Cell class="px-0.5 py-0.5 text-center font-mono">
						{position.position.toFixed(1)}
					</Table.Cell>
					<Table.Cell class="px-0.5 py-0.5 text-center font-mono">
						{position.avgPrice.toFixed(2)}
					</Table.Cell>
					<Table.Cell class="px-0.5 py-0.5 text-center font-mono">
						{position.highestBuyPrice.toFixed(2)}
					</Table.Cell>
					<Table.Cell class="px-0.5 py-0.5 text-center font-mono">
						{position.lowestSellPrice.toFixed(2)}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
