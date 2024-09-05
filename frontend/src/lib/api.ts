import { PUBLIC_SERVER_URL } from '$env/static/public';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { websocket_api } from 'schema-js';
import { toast } from 'svelte-sonner';
import { derived, readable, readonly, writable, type Readable, type Writable } from 'svelte/store';
import { kinde } from './auth';
import { notifyUser } from './notifications';

export const redeemables = [
	[87, 77],
	[87, 78],
	[87, 79],
	[87, 80],
	[88, 77],
	[88, 81],
	[88, 82],
	[88, 83],
	[89, 77],
	[89, 84],
	[89, 85],
	[89, 86],
	[90, 78],
	[90, 79],
	[90, 80],
	[90, 81],
	[90, 82],
	[90, 83],
	[90, 84],
	[90, 85],
	[90, 86],
	[103, 92],
	[103, 93],
	[103, 94],
	[103, 95],
	[104, 92],
	[104, 96],
	[104, 97],
	[104, 98],
	[105, 92],
	[105, 99],
	[105, 101],
	[105, 102],
	[106, 93],
	[106, 94],
	[106, 95],
	[106, 96],
	[106, 97],
	[106, 98],
	[106, 99],
	[106, 101],
	[106, 102]
];

const socket = new ReconnectingWebSocket(PUBLIC_SERVER_URL);
socket.binaryType = 'arraybuffer';

const stalePrivate = writable(true);
export const stale = readonly(stalePrivate);

stale.subscribe((isStale) => {
	if (isStale) {
		toast.promise(
			() =>
				new Promise((resolve) => {
					const unsubscribe = stale.subscribe((isStale) => {
						if (!isStale) {
							resolve('connected');
							unsubscribe();
						}
					});
				}),
			{
				loading: 'Connecting...',
				success: 'Connected!',
				// should never actually happen
				error: 'Error connecting'
			}
		);
	}
});

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
	const actAs = localStorage.getItem('actAs');
	const authenticate = {
		jwt: accessToken,
		idJwt: idToken,
		actAs
	};
	console.log('Auth info:', authenticate);
	sendClientMessage({ authenticate });
};

socket.onclose = () => {
	stalePrivate.set(true);
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

lastServerMessage.subscribe(notifyUser);

export const actingAs: Readable<string | undefined> = derived(lastServerMessage, (msg, set) => {
	if (msg?.actingAs) {
		// This is the last message in the sequence of initial data
		stalePrivate.set(false);
		localStorage.setItem('actAs', msg.actingAs.userId!);
		set(msg.actingAs.userId!);
	}
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
		const ownership = msg?.ownershipReceived;
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
		const user = msg?.userCreated;
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
				market.orders?.forEach((order) => {
					if (order.id === orderCancelled.id) {
						order.size = 0;
					}
				});
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
				const orders = market.orders || [];
				if (orderCreated.order) {
					orders.push(orderCreated.order);
				}
				const fills = orderCreated.fills;
				if (fills && fills.length) {
					orders.forEach((order) => {
						const fill = fills.find((fill) => fill.id === order.id);
						if (fill) {
							order.size = fill.sizeRemaining;
						}
					});
				}
				market.orders = orders;
				const trades = orderCreated.trades;
				if (trades && trades.length) {
					market.trades = [...(market.trades || []), ...trades];
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
