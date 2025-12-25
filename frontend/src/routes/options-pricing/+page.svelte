<script lang="ts">
	import PDFChart from '$lib/components/optionsPricing/PDFChart.svelte';
	import OptionsPricingTable from '$lib/components/optionsPricing/OptionsPricingTable.svelte';
	import {
		initializeUniformDistribution,
		normalizePDF,
		calculateOptionPrices,
		type ControlPoint
	} from '$lib/components/optionsPricing/optionsPricingMath';

	const STRIKES = [5, 10, 15, 20, 25];

	// Raw control points (before normalization)
	let rawPoints: ControlPoint[] = $state(initializeUniformDistribution());

	// Normalized points for display
	let normalizedPoints = $derived(normalizePDF(rawPoints));

	// Option prices derived from normalized PDF
	let optionPrices = $derived(calculateOptionPrices(rawPoints, STRIKES));

	function handlePointDrag(index: number, newY: number) {
		rawPoints[index] = { ...rawPoints[index], y: Math.max(0, newY) };
	}

	function resetDistribution() {
		rawPoints = initializeUniformDistribution();
	}
</script>

<svelte:head>
	<title>Options Pricing Helper - Trading Bootcamp</title>
</svelte:head>

<div class="w-full py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-xl font-bold">Options Pricing Helper</h1>
		<button
			type="button"
			class="rounded-md border border-muted-foreground/50 px-3 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
			onclick={resetDistribution}
		>
			Reset to Uniform
		</button>
	</div>

	<p class="mb-4 text-sm text-muted-foreground">
		Drag the control points to adjust the probability distribution. The option prices below will
		update automatically based on your PDF.
	</p>

	<div class="rounded-md border bg-muted/30 p-4">
		<PDFChart controlPoints={normalizedPoints} onPointDrag={handlePointDrag} />
	</div>

	<div class="mt-8">
		<h2 class="mb-4 text-lg font-semibold">Option Prices</h2>
		<p class="mb-4 text-sm text-muted-foreground">
			Prices are calculated by integrating the payoff function against your probability
			distribution.
		</p>
		<OptionsPricingTable {optionPrices} />
	</div>
</div>
