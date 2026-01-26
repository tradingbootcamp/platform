<script lang="ts">
	import { accountName, isAltAccount } from '$lib/api.svelte';

	let { accountId, me = undefined }: { accountId: number | null | undefined; me?: string } =
		$props();

	let name = $derived(accountName(accountId, me));
	let isAlt = $derived(isAltAccount(accountId));
</script>

<span class:italic={isAlt}>{name}</span>
