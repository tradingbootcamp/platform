<script lang="ts">
	let { class: className = '', ...props } = $props();
</script>

<div class={`p-6 pt-0 ${className}`} {...props}>
	<slot />
</div>