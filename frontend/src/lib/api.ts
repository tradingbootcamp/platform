import { PUBLIC_SERVER_URL } from '$env/static/public';
import { websocket_api } from 'schema-js';
import { derived, readable, readonly, writable, type Readable, type Writable } from 'svelte/store';
import { kinde } from './auth';
import { toast } from "svelte-sonner";
import { get } from 'svelte/store';
import { user } from '$lib/auth';



const socket = new WebSocket(PUBLIC_SERVER_URL);
socket.binaryType = 'arraybuffer';

export const sendClientMessage = (msg: websocket_api.IClientMessage) => {
	const data = websocket_api.ClientMessage.encode(msg).finish();
	socket.send(data);
};

socket.onopen = async () => {
	const accessToken = await kinde.getToken();
	const idToken = await kinde.getIdToken();
	if (!accessToken) {
		console.log('no access token');
		return;
	}
	if (!idToken) {
		console.log('no id token');
		return;
	}
	sendClientMessage({
		authenticate: {
			jwt: accessToken,
			idJwt: idToken
		}
	});
};

const lastServerMessage = readable<websocket_api.ServerMessage | null>(null, (set) => {
	const listener = (event: MessageEvent) => {
		const data = event.data;
		const msg = websocket_api.ServerMessage.decode(new Uint8Array(data));
		set(msg);
	};
	socket.addEventListener('message', listener);
	return () => {
		socket.removeEventListener('message', listener);
	};
});

lastServerMessage.subscribe((msg) => {
	console.log('got server message', msg?.toJSON());

	switch (msg?.message) {
		case 'marketCreated':
			toast('Market created!');
			break;
		case 'marketSettled':
			toast('Market settled!');
			break;
		case 'orderCancelled':
			toast('Order cancelled!');
			break;
		case 'orderCreated':
			toast('Order created!');
			break;
		case 'portfolio':
			toast('Portfolio updated!');
			break;
		case 'user':
			toast('User updated!');
			break;
		case 'paymentCreated': {
			const paymentCreated = msg.paymentCreated!;
			const amount = paymentCreated.amount;
			const currentUsers = get(users);
			const payer = currentUsers.get(paymentCreated.payerId || "");
			const recipient = currentUsers.get(paymentCreated.recipientId || "");

			if (payer && recipient) {
				const currentUser = get(user);
				if (payer.id === currentUser.id) {
					toast(`You paid ${recipient.name} $${amount}`);
				} else if (recipient.id === currentUser.id) {
					toast(`${payer.name} paid you $${amount}`);
				} else {
					// should this not ever be reached?
					toast(`${payer.name} paid ${recipient.name} $${amount}`);
				}
			}
			break;
		}
		case 'users':
			toast('Users updated!');
			break;
		case 'ownership':
			toast('Ownership updated!');
			break;
		case 'ownerships':
			toast('Ownerships updated!');
			break;
		case 'payments':
			toast('Payments updated!');
			break;
		case 'actingAs':
			toast('Acting as updated!');
			break;
		case 'out':
			toast('Order cancelled!');
			break;
		case 'authenticated':
			toast('Authenticated!');
			break;
		case 'marketData':
			toast('Market data updated!');
			break;
		case 'ownershipGiven':
			toast('Ownership given!');
			break;
		case 'requestFailed':
			toast('Request failed!');
			break;
	}



});

export const actingAs: Readable<string | undefined> = derived(lastServerMessage, (msg, set) => {
	if (msg?.actingAs?.userId) set(msg.actingAs.userId);
});
actingAs.subscribe(noop);

export const portfolio: Readable<websocket_api.IPortfolio | undefined> = derived(
	lastServerMessage,
	(msg, set) => {
		if (msg?.portfolio) set(msg.portfolio);
	}
);
portfolio.subscribe(noop);

export const payments = derived(
	lastServerMessage,
	(msg, set, update) => {
		if (msg?.payments) set(msg.payments.payments || []);
		const paymentCreated = msg?.paymentCreated;
		if (paymentCreated)
			update((payments) => {
				if (payments.find((p) => p.id === paymentCreated.id)) {
					return payments;
				}
				return [...payments, paymentCreated];
			});
	},
	[] as websocket_api.IPayment[]
);
payments.subscribe(noop);

export const ownerships = derived(
	lastServerMessage,
	(msg, set, update) => {
		if (msg?.ownerships) set(msg.ownerships.ownerships || []);
		const ownership = msg?.ownership;
		if (ownership)
			update((ownerships) => {
				if (ownerships.find((o) => o.ofBotId === ownership.ofBotId)) {
					return ownerships;
				}
				return [...ownerships, ownership];
			});
	},
	[] as websocket_api.IOwnership[]
);
ownerships.subscribe(noop);

export const users = derived(
	lastServerMessage,
	(msg, set, update) => {
		if (msg?.users) set(new Map(msg.users.users?.map((user) => [user.id!, user]) || []));
		const user = msg?.user;
		if (user) update((users) => users.set(user.id!, user));
	},
	new Map() as Map<string, websocket_api.IUser>
);
users.subscribe(noop);

const marketsPrivate: Record<number, Writable<websocket_api.IMarket>> = {};

export const markets = derived(
	lastServerMessage,
	(msg, _set, update) => {
		const market = msg?.marketData || msg?.marketCreated;
		if (market) {
			const existingWritable = marketsPrivate[market.id];
			if (existingWritable) {
				existingWritable.set(market);
				return;
			}
			const newWritable = writable(market);
			marketsPrivate[market.id] = newWritable;
			update((markets) => {
				markets[market.id] = readonly(newWritable);
				return markets;
			});
			return;
		}
		const marketSettled = msg?.marketSettled;
		if (marketSettled) {
			const existingWritable = marketsPrivate[marketSettled.id];
			if (existingWritable) {
				existingWritable.update((market) => {
					delete market.open;
					market.closed = {
						settlePrice: marketSettled.settlePrice
					};
					market.orders = [];
					return market;
				});
			} else {
				console.error(`Market ${marketSettled.id} not already in state`);
			}
			return;
		}
		const orderCancelled = msg?.orderCancelled;
		if (orderCancelled) {
			const existingWritable = marketsPrivate[orderCancelled.marketId];
			if (!existingWritable) {
				console.error(`Market ${orderCancelled.marketId} not already in state`);
				return;
			}
			existingWritable.update((market) => {
				market.orders = (market.orders || []).filter((order) => order.id !== orderCancelled.id);
				return market;
			});
			return;
		}
		const orderCreated = msg?.orderCreated;
		if (orderCreated) {
			const existingWritable = marketsPrivate[orderCreated.marketId];
			if (!existingWritable) {
				console.error(`Market ${orderCreated.marketId} not already in state`);
				return;
			}
			existingWritable.update((market) => {
				let orders = market.orders || [];
				if (orderCreated.order) {
					orders.push(orderCreated.order);
				}
				const fills = orderCreated.fills;
				if (fills && fills.length) {
					orders = orders.filter((order) => {
						const fill = fills.find((fill) => fill.id === order.id);
						if (fill) {
							order.size = fill.sizeRemaining;
						}
						return Number(order.size) > 0;
					});
				}
				market.orders = orders;
				const trades = orderCreated.trades;
				if (trades && trades.length) {
					market.trades = [...(market.trades || []), ...trades];
					toast("Trade executed!");

				}
				return market;
			});
			return;
		}
	},
	{} as Record<number, Readable<websocket_api.IMarket>>
);
markets.subscribe(noop);

function noop() {
	// used to make sure suscriptions work as intended
}
