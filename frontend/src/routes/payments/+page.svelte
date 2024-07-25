<script lang="ts">
	import { payments, users } from '$lib/api';
	import { user } from '$lib/auth';
	import MakePayment from '$lib/components/forms/makePayment.svelte';
</script>

<h2 class="text-xl font-bold">Payments</h2>
{#each $payments as { amount, payerId, recipientId, note, id } (id)}
	<div class="my-4 flex items-center gap-4">
		<p>
			payer: {payerId === $user?.id ? 'You' : $users.get(payerId ?? '')?.name || 'Unnamed user'}
		</p>
		<p>
			recipient: {recipientId === $user?.id
				? 'You'
				: $users.get(recipientId ?? '')?.name || 'Unnamed user'}
		</p>
		<p>amount: {amount}</p>
		<p>note: {note}</p>
	</div>
{/each}

<MakePayment />
