<script lang="ts">
	import { payments } from '$lib/api';
	import { user } from '$lib/auth';
	import MakePayment from '$lib/components/forms/makePayment.svelte';
</script>

<h2 class="text-xl font-bold">Payments</h2>
<p class="my-4">Your user id: {$user?.id}</p>
{#each $payments as { amount, payerId, recipientId, note, id } (id)}
	<div class="my-4 flex items-center gap-4">
		<p>recipient: {recipientId === $user.id ? 'You' : recipientId}</p>
		<p>payer: {payerId === $user.id ? 'You' : payerId}</p>
		<p>amount: {amount}</p>
		<p>note: {note}</p>
	</div>
{/each}

<MakePayment />
