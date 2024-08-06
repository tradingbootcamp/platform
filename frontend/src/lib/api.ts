import { PUBLIC_SERVER_URL } from '$env/static/public';
import { user } from '$lib/auth';
import { websocket_api } from 'schema-js';
import { toast } from 'svelte-sonner';
import {
	derived,
	get,
	readable,
	readonly,
	writable,
	type Readable,
	type Writable
} from 'svelte/store';
import { kinde } from './auth';

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
	const authenticateMsg = {
		authenticate: {
			jwt: accessToken,
			idJwt: idToken
		}
	};
	console.info(authenticateMsg);
	sendClientMessage(authenticateMsg);
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
		case 'marketCreated': {
			const marketCreated = msg.marketCreated!;
			if (marketCreated.ownerId === get(user)?.id) {
				toast.success('Market created', { description: marketCreated.name! });
			}
			return;
		}
		case 'marketSettled': {
			const marketSettled = msg.marketSettled!;
			const currentMarkets = get(markets);
			const marketStore = currentMarkets[marketSettled.id];
			if (!marketStore) {
				console.error('Market not in state', { marketSettled });
				return;
			}
			const market = get(marketStore);
			const description = `${market.name} settled at ${marketSettled.settlePrice}`;
			if (market.ownerId === get(user).id) {
				toast.success('Market settled', { description });
			} else {
				toast.info('Market settled', { description });
			}
			return;
		}
		case 'orderCancelled': {
			const orderCancelled = msg.orderCancelled!;
			const market = get(get(markets)[orderCancelled.marketId]);
			const order = market.orders?.find((o) => o.id === orderCancelled.id);
			if (order?.ownerId === get(actingAs)) {
				toast.success('Order cancelled');
			}
			return;
		}
		case 'orderCreated': {
			const orderCreated = msg.orderCreated!;
			const fillSize = orderCreated.fills?.reduce((acc, fill) => acc + Number(fill.sizeFilled), 0);
			const fillPrice = orderCreated.fills?.reduce(
				(acc, fill) => acc + (Number(fill.price) * Number(fill.sizeFilled)) / fillSize!,
				0
			);
			const fillSizeString = String(fillSize || '').includes('.') ? fillSize?.toFixed(2) : fillSize;
			const fillPriceString = String(fillPrice || '').includes('.')
				? fillPrice?.toFixed(2)
				: fillPrice;
			const message = orderCreated.order
				? orderCreated.fills?.length
					? `Order partially filled`
					: 'Order created'
				: `Order filled`;
			const description = fillSize ? `filled ${fillSizeString} @ ${fillPriceString}` : undefined;
			if (orderCreated.userId === get(actingAs)) {
				toast.success(message, { description });
			}
			return;
		}
		case 'paymentCreated': {
			const paymentCreated = msg.paymentCreated!;
			const amount = paymentCreated.amount;
			const currentUsers = get(users);
			const payer = currentUsers.get(paymentCreated.payerId || '');
			const recipient = currentUsers.get(paymentCreated.recipientId || '');

			if (payer?.id === get(actingAs)) {
				toast.success('Payment created', { description: `You paid ${recipient?.name} ${amount}` });
			} else if (recipient?.id === get(actingAs)) {
				toast.info('Payment created', { description: `${payer?.name} paid you ${amount}` });
			} else {
				console.error('Bad paymentCreated message', { paymentCreated });
			}
			return;
		}
		case 'ownership': {
			const ownership = msg.ownership!;
			const currentUsers = get(users);
			const botName = currentUsers.get(ownership?.ofBotId || '')?.name;
			toast.info('Ownership recieved', { description: `You now own ${botName}` });
			return;
		}
		case 'out':
			toast.success('Orders cancelled');
			return;
		case 'ownershipGiven':
			toast.success('Ownership given');
			return;
		case 'requestFailed': {
			const requestFailed = msg.requestFailed!;
			toast.error(`${requestFailed.requestDetails?.kind} failed`, {
				description: `Reason: ${requestFailed.errorDetails?.message}`
			});
			return;
		}
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
