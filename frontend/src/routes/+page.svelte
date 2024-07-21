<script lang="ts">
	import { kinde } from '$lib/auth';
	import CancelOrder from '$lib/components/forms/cancelOrder.svelte';
	import CreateMarket from '$lib/components/forms/createMarket.svelte';
	import CreateOrder from '$lib/components/forms/createOrder.svelte';
	import SettleMarket from '$lib/components/forms/settleMarket.svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { websocket_api } from 'schema-js';

	let messages: websocket_api.ServerMessage[] = [];
	const socket = new WebSocket('/api');
	socket.onmessage = async (event) => {
		const data = await event.data.arrayBuffer();
		const msg = websocket_api.ServerMessage.decode(new Uint8Array(data));
		messages = [...messages, msg];
	};

	const authenticate = async () => {
		const accessToken = await kinde.getToken();
		if (!accessToken) {
			console.log('no access token');
			return;
		}
		const authenticateMessage = websocket_api.ClientMessage.encode({
			authenticate: {
				jwt: accessToken
			}
		}).finish();
		socket.send(authenticateMessage);
	};
</script>

<main class="container">
	<Button class="my-8" on:click={authenticate}>Authenticate</Button>
	<div class="grid grid-cols-2 gap-12">
		<CreateMarket {socket} />
		<CreateOrder {socket} />
		<SettleMarket {socket} />
		<CancelOrder {socket} />
	</div>

	{#each messages as message}
		<pre class="my-2">{JSON.stringify(message)}</pre>
	{/each}
</main>
