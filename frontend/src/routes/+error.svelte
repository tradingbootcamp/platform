<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1 class="mb-8 pt-8 text-xl font-bold">Error</h1>
<p class="text-lg">{$page.error?.message}</p>
