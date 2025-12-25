<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import type { OptionPrice } from './optionsPricingMath';

	interface Props {
		optionPrices: OptionPrice[];
	}

	let { optionPrices }: Props = $props();

	const formatPrice = (value: number) => value.toFixed(2);
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="text-center">Strike</Table.Head>
				<Table.Head class="text-center">Call Price</Table.Head>
				<Table.Head class="text-center">Put Price</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each optionPrices as row (row.strike)}
				<Table.Row>
					<Table.Cell class="text-center font-medium">{row.strike}</Table.Cell>
					<Table.Cell class="text-center">{formatPrice(row.callPrice)}</Table.Cell>
					<Table.Cell class="text-center">{formatPrice(row.putPrice)}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
