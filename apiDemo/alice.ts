import WebSocket from 'ws';
import { websocket_api } from 'schema-js';

const { ClientMessage, ServerMessage, Side } = websocket_api;

const WS_URL = process.env.WS_URL!;
const JWT = process.env.JWT!;
const ACT_AS = Number(process.env.ACT_AS);
const MARKET_ID = Number(process.env.MARKET_ID);
const TICK_MS = 5000;
const TRADE_SIZE = 1;

let myAccountId: number | null = null;
const book = new Map<number, { side: number; price: number; size: number }>();

const socket = new WebSocket(WS_URL);

const send = (message: websocket_api.IClientMessage) => {
	const requestId = Math.random().toString(36).slice(2);
	socket.send(ClientMessage.encode(ClientMessage.create({ ...message, requestId })).finish());
};

socket.on('open', () => {
	console.log('[connect]');
	send({ authenticate: { jwt: JWT, actAs: ACT_AS } });
});

socket.on('message', (data: Buffer) => {
	const msg = ServerMessage.decode(data);

	if (msg.requestFailed) {
		console.error('[err]', msg.requestFailed.requestDetails?.kind, '-', msg.requestFailed.errorDetails?.message);
		return;
	}
	if (msg.actingAs && myAccountId === null) {
		myAccountId = Number(msg.actingAs.accountId);
		console.log('[acting-as]', myAccountId);
		setInterval(tick, TICK_MS);
	}
	if (msg.orders && Number(msg.orders.marketId) === MARKET_ID) {
		book.clear();
		for (const o of msg.orders.orders ?? []) book.set(Number(o.id), { side: o.side ?? 0, price: o.price ?? 0, size: o.size ?? 0 });
	}
	if (msg.orderCreated && Number(msg.orderCreated.marketId) === MARKET_ID) {
		if (msg.orderCreated.order) {
			const o = msg.orderCreated.order;
			book.set(Number(o.id), { side: o.side ?? 0, price: o.price ?? 0, size: o.size ?? 0 });
		}
		for (const fill of msg.orderCreated.fills ?? []) {
			const id = Number(fill.id);
			if (fill.sizeRemaining === 0) book.delete(id);
			else if (book.has(id)) book.get(id)!.size = fill.sizeRemaining ?? 0;
		}
	}
	if (msg.ordersCancelled && Number(msg.ordersCancelled.marketId) === MARKET_ID) {
		for (const id of msg.ordersCancelled.orderIds ?? []) book.delete(Number(id));
	}
});

function bestBid() {
	let best: { price: number } | null = null;
	for (const o of book.values()) if (o.side === Side.BID && (!best || o.price > best.price)) best = o;
	return best;
}
function bestOffer() {
	let best: { price: number } | null = null;
	for (const o of book.values()) if (o.side === Side.OFFER && (!best || o.price < best.price)) best = o;
	return best;
}

function tick() {
	const buy = Math.random() < 0.5;
	if (buy) {
		const offer = bestOffer();
		if (!offer) return console.log('[skip] no offer to lift');
		console.log(`[buy] lift offer @ ${offer.price} size ${TRADE_SIZE}`);
		send({ createOrder: { marketId: MARKET_ID, side: Side.BID, price: offer.price, size: TRADE_SIZE } });
	} else {
		const bid = bestBid();
		if (!bid) return console.log('[skip] no bid to hit');
		console.log(`[sell] hit bid @ ${bid.price} size ${TRADE_SIZE}`);
		send({ createOrder: { marketId: MARKET_ID, side: Side.OFFER, price: bid.price, size: TRADE_SIZE } });
	}
}

socket.on('close', () => { console.log('[disconnect]'); process.exit(1); });
socket.on('error', (e) => console.error('[ws error]', e.message));
