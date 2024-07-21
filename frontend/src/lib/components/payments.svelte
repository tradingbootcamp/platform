<script lang="ts">
	import { payments } from '$lib/websocket';
</script>

<h2 class="mt-12 text-2xl font-bold">Payments</h2>
<pre>{JSON.stringify($payments, null, 2)}</pre>
