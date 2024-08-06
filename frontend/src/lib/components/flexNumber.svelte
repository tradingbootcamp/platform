<script lang="ts">
	export let value: string;

	$: split = value.split('.');
	$: parts = split.length === 2 ? [split[0], '.', split[1]] : [split[0], '', ''];
</script>

<div class="grid min-w-12 grid-cols-[1fr_auto_1fr]">
	<span class="text-right">{parts[0]}</span>
	<span class="w-1">{parts[1]}</span>
	<span class="text-left">{parts[2]}</span>
</div>
