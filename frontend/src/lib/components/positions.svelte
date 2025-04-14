<script lang="ts">
    import { accountName } from '$lib/api.svelte';
    import FlexNumber from '$lib/components/flexNumber.svelte';
    import * as Table from '$lib/components/ui/table';
    import type { websocket_api } from 'schema-js';

    // Instead of destructuring $props, declare the prop so that Svelte makes it reactive.
    export let trades: websocket_api.ITrade[];

    console.log('[p] Positions component mounted');
    console.log('[p] Initial trades:', trades);

    // This reactive statement will run whenever `trades` changes.
    $: console.log('[p] Trades changed:', trades);

    // Calculate positions for each trader in a reactive statement.
    $: positions = (() => {
        console.log('[p] Calculating positions from trades:', trades);
        const posMap = new Map<number, number>();
        
        for (const trade of trades) {
            console.log('[p] Processing trade:', trade);
            if (trade.buyerId) {
                const newBuyerPos = (posMap.get(trade.buyerId) || 0) + (trade.size || 0);
                console.log(`[p] Buyer ${trade.buyerId} position updated to ${newBuyerPos}`);
                posMap.set(trade.buyerId, newBuyerPos);
            }
            if (trade.sellerId) {
                const newSellerPos = (posMap.get(trade.sellerId) || 0) - (trade.size || 0);
                console.log(`[p] Seller ${trade.sellerId} position updated to ${newSellerPos}`);
                posMap.set(trade.sellerId, newSellerPos);
            }
        }

        const result = Array.from(posMap.entries())
            .map(([traderId, position]) => ({
                traderId,
                position,
                name: accountName(traderId)
            }))
            .sort((a, b) => Math.abs(b.position) - Math.abs(a.position));
        
        console.log('[p] Final positions:', result);
        return result;
    })();
</script>

<div>
    <h2 class="text-center text-lg font-bold">Positions</h2>
    <Table.Root>
        <Table.Header>
            <Table.Row>
                <Table.Head class="text-center">Trader</Table.Head>
                <Table.Head class="text-center">Position</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each positions as { traderId, position, name }}
                <Table.Row>
                    <Table.Cell class="text-center">{name}</Table.Cell>
                    <Table.Cell class="text-center">
                        <FlexNumber value={position.toFixed(2)} />
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
</div>
