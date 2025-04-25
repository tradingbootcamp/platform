<script lang="ts">
	let { class: className = '', ...props } = $props();
</script>

<div class={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`} {...props}>
	<slot />
</div>