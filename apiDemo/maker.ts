import WebSocket from 'ws';
import { websocket_api } from 'schema-js';

const { ClientMessage, ServerMessage, Side } = websocket_api;

const WS_URL = process.env.WS_URL!;
const JWT = process.env.JWT!;
const ACT_AS = Number(process.env.ACT_AS);
const MARKET_ID = Number(process.env.MARKET_ID);
const FV_INIT = process.env.FV_INIT ? Number(process.env.FV_INIT) : null;

const TICK_MS = 5000;
const FV_STEP = 0.5;       // price increment between ladder rungs
const RUNG_SIZE = 0.5;     // share size posted at each rung
const RUNGS = 5;           // rungs per side

// Each share filled against us shifts fv by this much (positive when our offer
// lifts, negative when our bid is hit). With STEP == RUNG_SIZE this is 1.0,
// so a single rung being fully taken moves fv by exactly FV_STEP.
const FV_SHIFT_PER_SHARE = FV_STEP / RUNG_SIZE;

let myAccountId: number | null = null;
let fv: number | null = null;
let marketMin: number | null = null;
let marketMax: number | null = null;

type Order = { id: number; side: number; price: number; size: number; ownerId: number };
const book = new Map<number, Order>();

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
	if (msg.market && Number(msg.market.id) === MARKET_ID) {
		marketMin = msg.market.minSettlement ?? null;
		marketMax = msg.market.maxSettlement ?? null;
	}
	if (msg.orders && Number(msg.orders.marketId) === MARKET_ID) {
		book.clear();
		for (const o of msg.orders.orders ?? []) book.set(Number(o.id), toOrder(o));
		if (fv === null) {
			fv = FV_INIT ?? estimateMid();
			if (fv !== null) console.log('[fv-init]', fv.toFixed(2));
		}
	}
	if (msg.orderCreated && Number(msg.orderCreated.marketId) === MARKET_ID) {
		handleOrderCreated(msg.orderCreated);
	}
	if (msg.ordersCancelled && Number(msg.ordersCancelled.marketId) === MARKET_ID) {
		for (const id of msg.ordersCancelled.orderIds ?? []) book.delete(Number(id));
	}
});

function toOrder(o: websocket_api.IOrder): Order {
	return { id: Number(o.id), side: o.side ?? 0, price: o.price ?? 0, size: o.size ?? 0, ownerId: Number(o.ownerId) };
}

function estimateMid(): number | null {
	let bb = -Infinity, bo = Infinity;
	for (const o of book.values()) {
		if (o.side === Side.BID && o.price > bb) bb = o.price;
		if (o.side === Side.OFFER && o.price < bo) bo = o.price;
	}
	if (bb > -Infinity && bo < Infinity) return (bb + bo) / 2;
	if (marketMin !== null && marketMax !== null) return (marketMin + marketMax) / 2;
	return null;
}

function handleOrderCreated(oc: websocket_api.IOrderCreated) {
	if (oc.order) {
		const info = toOrder(oc.order);
		book.set(info.id, info);
	}
	for (const fill of oc.fills ?? []) {
		const id = Number(fill.id);
		const existing = book.get(id);
		if (!existing) continue;
		const filled = existing.size - (fill.sizeRemaining ?? 0);

		// fv only shifts when WE are the maker getting hit
		if (existing.ownerId === myAccountId && filled > 0 && fv !== null) {
			const sign = existing.side === Side.OFFER ? +1 : -1;
			const before = fv;
			fv += sign * filled * FV_SHIFT_PER_SHARE;
			console.log(`[hit] our ${existing.side === Side.OFFER ? 'offer' : 'bid'} @ ${existing.price} filled ${filled} → fv ${before.toFixed(2)} → ${fv.toFixed(2)}`);
		}

		if (fill.sizeRemaining === 0) book.delete(id);
		else existing.size = fill.sizeRemaining ?? 0;
	}
}

function myOrders() {
	return [...book.values()].filter((o) => o.ownerId === myAccountId);
}

function tick() {
	if (fv === null || myAccountId === null) {
		console.log('[tick] waiting for fv init');
		return;
	}

	type Rung = { side: number; price: number };
	const desired = new Map<string, Rung>();
	for (let i = 1; i <= RUNGS; i++) {
		const bid = round(fv - i * FV_STEP);
		const offer = round(fv + i * FV_STEP);
		if (marketMin === null || bid >= marketMin) desired.set(`bid:${bid}`, { side: Side.BID, price: bid });
		if (marketMax === null || offer <= marketMax) desired.set(`offer:${offer}`, { side: Side.OFFER, price: offer });
	}

	const have = new Set<string>();
	for (const o of myOrders()) {
		const key = (o.side === Side.BID ? 'bid' : 'offer') + ':' + round(o.price);
		if (desired.has(key) && o.size === RUNG_SIZE) {
			have.add(key);
		} else {
			send({ cancelOrder: { id: o.id } });
		}
	}

	let placed = 0;
	for (const [key, { side, price }] of desired) {
		if (have.has(key)) continue;
		send({ createOrder: { marketId: MARKET_ID, side, price, size: RUNG_SIZE } });
		placed++;
	}

	console.log(`[tick] fv=${fv.toFixed(2)} kept=${have.size} placed=${placed} canceled=${myOrders().length - have.size}`);
}

function round(x: number) {
	return Math.round(x * 100) / 100;
}

socket.on('close', () => { console.log('[disconnect]'); process.exit(1); });
socket.on('error', (e) => console.error('[ws error]', e.message));
