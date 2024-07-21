<script lang="ts">
	import { portfolio } from '$lib/websocket';
</script>

<h2 class="mt-12 text-2xl font-bold">Portfolio</h2>
<pre>{JSON.stringify($portfolio, null, 2)}</pre>
