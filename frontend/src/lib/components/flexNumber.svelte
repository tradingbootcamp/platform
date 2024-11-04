<script lang="ts">
	interface Props {
		value: string;
	}

	let { value }: Props = $props();

	let split = $derived(value.split('.'));
	let parts = $derived(split.length === 2 ? [split[0], '.', split[1]] : [split[0], '', '']);
</script>

<div class="grid min-w-12 grid-cols-[1fr_auto_1fr]">
	<span class="text-right">{parts[0]}</span>
	<span class="w-1">{parts[1]}</span>
	<span class="text-left">{parts[2]}</span>
</div>
