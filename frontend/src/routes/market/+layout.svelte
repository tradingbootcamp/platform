<script lang="ts">
	let { children } = $props();
</script>

<div class="w-full py-4 overflow-visible">
	{@render children()}
</div>
