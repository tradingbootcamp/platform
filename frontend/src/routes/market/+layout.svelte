<script lang="ts">
	let { children } = $props();
</script>

<div class="w-full overflow-visible py-4">
	{@render children()}
</div>
