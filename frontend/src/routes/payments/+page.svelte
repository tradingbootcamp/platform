<script lang="ts">
	import { actingAs, payments, users } from '$lib/api';
	import MakePayment from '$lib/components/forms/makePayment.svelte';
</script>

<h2 class="mb-4 text-xl font-bold">Payments</h2>
<MakePayment />
{#each $payments as { amount, payerId, recipientId, note, id } (id)}
	<div class="my-4 flex items-center gap-4">
		<p>
			payer: {payerId === $actingAs ? 'You' : $users.get(payerId ?? '')?.name || 'Unnamed user'}
		</p>
		<p>
			recipient: {recipientId === $actingAs
				? 'You'
				: $users.get(recipientId ?? '')?.name || 'Unnamed user'}
		</p>
		<p>amount: {amount}</p>
		<p>note: {note}</p>
	</div>
{/each}
