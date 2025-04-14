<script lang="ts">
  import { accountName } from '$lib/api.svelte';
  import FlexNumber from '$lib/components/flexNumber.svelte';
  import * as Table from '$lib/components/ui/table';
  import type { websocket_api } from 'schema-js';

  // Use Svelte's reactive export so updates to trades trigger re-computation.
  export let trades: websocket_api.ITrade[];

  // New prop to control the minimum maximum used for the color gradient.
  export let maxColorThreshold: number = 10;

  console.log('[p] Positions component mounted');
  console.log('[p] Initial trades:', trades);

  // This reactive statement runs whenever `trades` changes.
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

  // Compute the maximum absolute position from the positions,
  // but never less than maxColorThreshold (default = 10).
  $: computedMaxColor = positions.reduce((max, p) => Math.max(max, Math.abs(p.position)), maxColorThreshold);

  /**
   * Returns a background color based on the position number.
   * The color for positive positions interpolates from white (0) to green,
   * and for negative positions from white to red.
   */
  function posColor(pos: number): string {
      const factor = Math.min(Math.abs(pos) / computedMaxColor, 1);
      if (pos > 0) {
          // Interpolate from white (255,255,255) to green (0,255,0)
          const r = Math.round(255 * (1 - factor));
          const g = 255;
          const b = Math.round(255 * (1 - factor));
          return `rgb(${r}, ${g}, ${b})`;
      } else if (pos < 0) {
          // Interpolate from white (255,255,255) to red (255,0,0)
          const r = 255;
          const g = Math.round(255 * (1 - factor));
          const b = Math.round(255 * (1 - factor));
          return `rgb(${r}, ${g}, ${b})`;
      }
      return 'white';
  }
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
                  <!-- Apply a background color based on the position value -->
                  <Table.Cell
                      class="text-center"
                      style="background-color: {posColor(position)};">
                      <FlexNumber value={position.toFixed(2)} />
                  </Table.Cell>
              </Table.Row>
          {/each}
      </Table.Body>
  </Table.Root>
</div>
