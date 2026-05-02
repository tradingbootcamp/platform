import readline from 'node:readline';
import WebSocket from 'ws';
import { websocket_api } from 'schema-js';

const { ClientMessage, ServerMessage, Side, MarketStatus } = websocket_api;

type SM = websocket_api.IServerMessage;
type Pending = {
	resolve: (msg: SM) => void;
	reject: (err: Error) => void;
	kind: string;
};

const WS_URL = process.env.WS_URL ?? `ws://localhost:8080/api/ws/${process.env.COHORT ?? 'main'}`;
const JWT = process.env.JWT ?? 'test::repl::REPL User::true';
const ACT_AS = process.env.ACT_AS ? Number(process.env.ACT_AS) : 0;

const ANSI = {
	dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
	bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
	red: (s: string) => `\x1b[31m${s}\x1b[0m`,
	yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
	green: (s: string) => `\x1b[32m${s}\x1b[0m`,
	cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
	magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
};

// --- state ---------------------------------------------------------
const state = {
	myUserId: 0,
	actingAs: 0,
	universeId: 0,
	isAdmin: false,
	auctionEnabled: false,
	sudoEnabled: false,
	accounts: new Map<number, websocket_api.IAccount>(),
	markets: new Map<number, websocket_api.IMarket>(),
	portfolios: new Map<number, websocket_api.IPortfolio>(),
	auctions: new Map<number, websocket_api.IAuction>(),
	books: new Map<number, Map<number, websocket_api.IOrder>>(), // market_id -> id -> order
};

const pending = new Map<string, Pending>();
let socket: WebSocket | null = null;
let rl: readline.Interface;

// --- send / await --------------------------------------------------
function newRequestId() {
	return Math.random().toString(36).slice(2, 12);
}

function sendRaw(msg: websocket_api.IClientMessage): string {
	const requestId = newRequestId();
	socket!.send(ClientMessage.encode(ClientMessage.create({ ...msg, requestId })).finish());
	return requestId;
}

function call(kind: string, msg: websocket_api.IClientMessage, timeoutMs = 5000): Promise<SM> {
	return new Promise((resolve, reject) => {
		const requestId = sendRaw(msg);
		const timer = setTimeout(() => {
			pending.delete(requestId);
			reject(new Error(`timeout waiting for ${kind} response`));
		}, timeoutMs);
		pending.set(requestId, {
			kind,
			resolve: (m) => {
				clearTimeout(timer);
				resolve(m);
			},
			reject: (e) => {
				clearTimeout(timer);
				reject(e);
			},
		});
	});
}

// --- printing ------------------------------------------------------
function logAbovePrompt(line: string) {
	if (rl) {
		readline.cursorTo(process.stdout, 0);
		readline.clearLine(process.stdout, 0);
	}
	process.stdout.write(line + '\n');
	if (rl) rl.prompt(true);
}

function eventLabel(msg: SM): string {
	const k = Object.keys(msg).find((k) => k !== 'requestId' && (msg as Record<string, unknown>)[k] !== undefined);
	return k ?? 'unknown';
}

function summarize(msg: SM): string {
	if (msg.orderCreated) {
		const oc = msg.orderCreated;
		const restingNote = oc.order ? `resting #${oc.order.id} ${oc.order.size}@${oc.order.price}` : 'no rest';
		const fills = oc.fills?.length ?? 0;
		const trades = oc.trades?.length ?? 0;
		return `OrderCreated mkt=${oc.marketId} acct=${oc.accountId} ${restingNote} fills=${fills} trades=${trades}`;
	}
	if (msg.ordersCancelled) {
		const oc = msg.ordersCancelled;
		return `OrdersCancelled mkt=${oc.marketId} ids=[${oc.orderIds?.join(',') ?? ''}]`;
	}
	if (msg.market) {
		const m = msg.market;
		const closed = m.closed ? ` settled@${m.closed.settlePrice}` : '';
		return `Market #${m.id} "${m.name}" status=${MarketStatus[m.status ?? 0]}${closed}`;
	}
	if (msg.marketSettled) return `MarketSettled #${msg.marketSettled.id}@${msg.marketSettled.settlePrice}`;
	if (msg.marketStatusChanges) {
		const x = msg.marketStatusChanges;
		return `MarketStatusChanges mkt=${x.marketId} changes=${x.changes?.length ?? 0}`;
	}
	if (msg.portfolioUpdated) {
		const p = msg.portfolioUpdated;
		return `PortfolioUpdated acct=${p.accountId} total=${p.totalBalance} avail=${p.availableBalance}`;
	}
	if (msg.transferCreated) {
		const t = msg.transferCreated;
		return `Transfer #${t.id} ${t.fromAccountId} -> ${t.toAccountId} amount=${t.amount}`;
	}
	if (msg.accountCreated) {
		const a = msg.accountCreated;
		return `AccountCreated #${a.id} "${a.name}" universe=${a.universeId}${a.isUser ? ' (user)' : ' (alt)'}`;
	}
	if (msg.auction) return `Auction #${msg.auction.id} "${msg.auction.name}"`;
	if (msg.auctionSettled) return `AuctionSettled #${msg.auctionSettled.id}`;
	if (msg.auctionDeleted) return `AuctionDeleted #${msg.auctionDeleted.auctionId}`;
	if (msg.redeemed) return `Redeemed acct=${msg.redeemed.accountId} fund=${msg.redeemed.fundId} amount=${msg.redeemed.amount}`;
	if (msg.optionExercised) return `OptionExercised #${msg.optionExercised.contractId}`;
	if (msg.universe) return `Universe #${msg.universe.id} "${msg.universe.name}"`;
	if (msg.marketType) return `MarketType #${msg.marketType.id} "${msg.marketType.name}"`;
	if (msg.marketGroup) return `MarketGroup #${msg.marketGroup.id} "${msg.marketGroup.name}"`;
	if (msg.requestFailed)
		return `RequestFailed kind=${msg.requestFailed.requestDetails?.kind} msg="${msg.requestFailed.errorDetails?.message}"`;
	return eventLabel(msg);
}

// --- state mutators -------------------------------------------------
function applyMessage(msg: SM) {
	if (msg.authenticated) {
		state.myUserId = Number(msg.authenticated.accountId);
		state.isAdmin = msg.authenticated.isAdmin ?? false;
		state.auctionEnabled = msg.authenticated.auctionEnabled ?? false;
	}
	if (msg.actingAs) {
		state.actingAs = Number(msg.actingAs.accountId);
		state.universeId = Number(msg.actingAs.universeId);
	}
	if (msg.sudoStatus) state.sudoEnabled = msg.sudoStatus.enabled ?? false;
	if (msg.accounts) {
		for (const a of msg.accounts.accounts ?? []) state.accounts.set(Number(a.id), a);
	}
	if (msg.accountCreated) state.accounts.set(Number(msg.accountCreated.id), msg.accountCreated);
	if (msg.market) state.markets.set(Number(msg.market.id), msg.market);
	if (msg.marketSettled) {
		const existing = state.markets.get(Number(msg.marketSettled.id));
		if (existing) {
			existing.closed = {
				settlePrice: msg.marketSettled.settlePrice,
				transactionId: msg.marketSettled.transactionId,
				transactionTimestamp: msg.marketSettled.transactionTimestamp,
			};
			existing.open = null;
		}
	}
	if (msg.portfolios) {
		for (const p of msg.portfolios.portfolios ?? []) state.portfolios.set(Number(p.accountId), p);
	}
	if (msg.portfolioUpdated) state.portfolios.set(Number(msg.portfolioUpdated.accountId), msg.portfolioUpdated);
	if (msg.auction) state.auctions.set(Number(msg.auction.id), msg.auction);
	if (msg.auctionSettled) {
		const a = state.auctions.get(Number(msg.auctionSettled.id));
		if (a) {
			a.closed = { settlePrice: msg.auctionSettled.settlePrice };
			a.open = null;
			a.buyerId = msg.auctionSettled.buyerId;
			a.buyers = msg.auctionSettled.buyers;
		}
	}
	if (msg.auctionDeleted) state.auctions.delete(Number(msg.auctionDeleted.auctionId));
	if (msg.orders) {
		const mid = Number(msg.orders.marketId);
		const book = new Map<number, websocket_api.IOrder>();
		for (const o of msg.orders.orders ?? []) book.set(Number(o.id), o);
		state.books.set(mid, book);
	}
	if (msg.orderCreated) {
		const mid = Number(msg.orderCreated.marketId);
		let book = state.books.get(mid);
		if (!book) {
			book = new Map();
			state.books.set(mid, book);
		}
		if (msg.orderCreated.order) book.set(Number(msg.orderCreated.order.id), msg.orderCreated.order);
		for (const f of msg.orderCreated.fills ?? []) {
			const id = Number(f.id);
			if ((f.sizeRemaining ?? 0) === 0) book.delete(id);
			else {
				const ex = book.get(id);
				if (ex) ex.size = f.sizeRemaining;
			}
		}
	}
	if (msg.ordersCancelled) {
		const book = state.books.get(Number(msg.ordersCancelled.marketId));
		if (book) for (const id of msg.ordersCancelled.orderIds ?? []) book.delete(Number(id));
	}
}

// --- connection ----------------------------------------------------
function connect(): Promise<void> {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(WS_URL);
		socket = ws;
		ws.on('open', () => {
			logAbovePrompt(ANSI.dim(`[connect] ${WS_URL}`));
			const requestId = newRequestId();
			ws.send(
				ClientMessage.encode(
					ClientMessage.create({
						requestId,
						authenticate: { jwt: JWT, actAs: ACT_AS || undefined },
					}),
				).finish(),
			);
			// Resolve once we get the corresponding ActingAs ("ready" signal).
			const onReady = (data: Buffer) => {
				const msg = ServerMessage.decode(data);
				applyMessage(msg);
				if (msg.actingAs) {
					ws.off('message', onReady);
					ws.on('message', onMessage);
					logAbovePrompt(
						ANSI.green(
							`[ready] user=${state.myUserId} actingAs=${state.actingAs} universe=${state.universeId} admin=${state.isAdmin} auction=${state.auctionEnabled}`,
						),
					);
					resolve();
				}
			};
			ws.on('message', onReady);
		});
		ws.on('error', (err) => {
			logAbovePrompt(ANSI.red(`[ws error] ${err.message}`));
			reject(err);
		});
		ws.on('close', (code, reason) => {
			logAbovePrompt(ANSI.yellow(`[ws closed] code=${code} reason="${reason.toString() || ''}"`));
		});
	});
}

function onMessage(data: Buffer) {
	const msg = ServerMessage.decode(data);
	applyMessage(msg);

	const requestId = msg.requestId ?? '';
	if (requestId && pending.has(requestId)) {
		const p = pending.get(requestId)!;
		pending.delete(requestId);
		if (msg.requestFailed) {
			p.reject(new Error(`${msg.requestFailed.requestDetails?.kind}: ${msg.requestFailed.errorDetails?.message}`));
		} else {
			p.resolve(msg);
		}
		return;
	}

	// Broadcast or unsolicited message.
	logAbovePrompt(ANSI.dim('< ') + summarize(msg));
}

// --- command handlers ---------------------------------------------
type Handler = (args: string[]) => Promise<void>;
const commands: Record<string, { help: string; run: Handler }> = {};

function register(name: string, help: string, run: Handler) {
	commands[name] = { help, run };
}

function parseSide(s: string): number {
	const u = s.toUpperCase();
	if (u === 'BID' || u === 'BUY' || u === 'B') return Side.BID;
	if (u === 'OFFER' || u === 'ASK' || u === 'SELL' || u === 'OFFER' || u === 'O' || u === 'S') return Side.OFFER;
	throw new Error(`unknown side "${s}" (use bid/offer)`);
}

function fmtPortfolio(p: websocket_api.IPortfolio | undefined) {
	if (!p) return ANSI.red('no portfolio');
	const lines: string[] = [];
	lines.push(`acct=${p.accountId} total=${p.totalBalance} avail=${p.availableBalance}`);
	for (const e of p.marketExposures ?? []) {
		if ((e.position ?? 0) === 0 && (e.totalBidSize ?? 0) === 0 && (e.totalOfferSize ?? 0) === 0) continue;
		const m = state.markets.get(Number(e.marketId));
		lines.push(
			`  mkt=${e.marketId}${m ? ` "${m.name}"` : ''} pos=${e.position} bids=${e.totalBidSize}@${e.totalBidValue} offers=${e.totalOfferSize}@${e.totalOfferValue}`,
		);
	}
	return lines.join('\n');
}

register('help', 'show this help', async () => {
	const lines = Object.entries(commands).map(([k, v]) => `  ${k.padEnd(18)} ${v.help}`);
	console.log(lines.join('\n'));
});

register('whoami', 'print your authentication state', async () => {
	console.log(
		`user=${state.myUserId} actingAs=${state.actingAs} universe=${state.universeId} admin=${state.isAdmin} sudo=${state.sudoEnabled} auctionEnabled=${state.auctionEnabled}`,
	);
});

register('act', 'act <account_id>  switch the acting account', async (args) => {
	const accountId = Number(args[0]);
	if (!accountId) throw new Error('usage: act <account_id>');
	const resp = await call('ActAs', { actAs: { accountId } });
	console.log(summarize(resp));
});

register('sudo', 'sudo <on|off>  toggle admin override', async (args) => {
	const enabled = args[0] === 'on' || args[0] === 'true';
	const resp = await call('SetSudo', { setSudo: { enabled } });
	console.log(summarize(resp));
});

register('accts', 'list known accounts', async () => {
	for (const [id, a] of [...state.accounts.entries()].sort(([a], [b]) => a - b)) {
		console.log(`#${id.toString().padStart(4)} ${a.isUser ? '(u)' : '(a)'} u${a.universeId}  ${a.name}`);
	}
});

register('mkts', 'list cached markets', async () => {
	for (const [id, m] of [...state.markets.entries()].sort(([a], [b]) => a - b)) {
		const status = m.closed ? `settled@${m.closed.settlePrice}` : MarketStatus[m.status ?? 0];
		console.log(`#${id.toString().padStart(4)} u${m.universeId} [${status}] "${m.name}" min=${m.minSettlement} max=${m.maxSettlement}`);
	}
});

register('mkt', 'mkt <id>  show one market in detail', async (args) => {
	const id = Number(args[0]);
	const m = state.markets.get(id);
	if (!m) return console.log(ANSI.red(`unknown market #${id}`));
	console.log(JSON.stringify(m, null, 2));
});

register('book', 'book <market_id>  show resting orders', async (args) => {
	const mid = Number(args[0]);
	const book = state.books.get(mid);
	if (!book || book.size === 0) return console.log(ANSI.dim('(empty)'));
	const bids: websocket_api.IOrder[] = [];
	const offers: websocket_api.IOrder[] = [];
	for (const o of book.values()) (o.side === Side.BID ? bids : offers).push(o);
	bids.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
	offers.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
	const max = Math.max(bids.length, offers.length);
	console.log('  BIDS                |  OFFERS');
	for (let i = 0; i < max; i++) {
		const b = bids[i];
		const o = offers[i];
		const bs = b ? `#${b.id} acct=${b.ownerId} ${b.size}@${b.price}` : '';
		const os = o ? `${o.size}@${o.price} acct=${o.ownerId} #${o.id}` : '';
		console.log(`  ${bs.padEnd(20)}|  ${os}`);
	}
});

register('order', 'order <market_id> <bid|offer> <price> <size>  place a limit order', async (args) => {
	if (args.length < 4) throw new Error('usage: order <market_id> <bid|offer> <price> <size>');
	const marketId = Number(args[0]);
	const side = parseSide(args[1]);
	const price = Number(args[2]);
	const size = Number(args[3]);
	const resp = await call('CreateOrder', { createOrder: { marketId, side, price, size } });
	console.log(summarize(resp));
});

register('cancel', 'cancel <order_id>  cancel one order', async (args) => {
	const id = Number(args[0]);
	if (!id) throw new Error('usage: cancel <order_id>');
	const resp = await call('CancelOrder', { cancelOrder: { id } });
	console.log(summarize(resp));
});

register('out', 'out [market_id] [bid|offer]  bulk-cancel acting account orders', async (args) => {
	const out: websocket_api.IOut = {};
	if (args[0]) out.marketId = Number(args[0]);
	if (args[1]) out.side = parseSide(args[1]);
	const resp = await call('Out', { out });
	console.log(summarize(resp));
});

register('xfer', 'xfer <from> <to> <amount> [note...]  MakeTransfer', async (args) => {
	if (args.length < 3) throw new Error('usage: xfer <from> <to> <amount> [note]');
	const fromAccountId = Number(args[0]);
	const toAccountId = Number(args[1]);
	const amount = Number(args[2]);
	const note = args.slice(3).join(' ');
	const resp = await call('MakeTransfer', { makeTransfer: { fromAccountId, toAccountId, amount, note } });
	console.log(summarize(resp));
});

register('gift', 'gift <to> <amount> [note...]  Gift (from = acting account)', async (args) => {
	if (args.length < 2) throw new Error('usage: gift <to> <amount> [note]');
	const toAccountId = Number(args[0]);
	const amount = Number(args[1]);
	const note = args.slice(2).join(' ');
	const resp = await call('Gift', { gift: { toAccountId, amount, note } });
	console.log(summarize(resp));
});

register('portfolio', 'show acting account portfolio', async () => {
	console.log(fmtPortfolio(state.portfolios.get(state.actingAs)));
});

register('portfolios', 'list all owned portfolios', async () => {
	for (const p of state.portfolios.values()) console.log(fmtPortfolio(p));
});

register('mkt-create', 'mkt-create <name> <min> <max> [description]  CreateMarket (admin)', async (args) => {
	if (args.length < 3) throw new Error('usage: mkt-create <name> <min> <max> [description]');
	const name = args[0];
	const minSettlement = Number(args[1]);
	const maxSettlement = Number(args[2]);
	const description = args.slice(3).join(' ') || `created via repl`;
	const resp = await call('CreateMarket', {
		createMarket: { name, description, minSettlement, maxSettlement },
	});
	console.log(summarize(resp));
});

register('mkt-settle', 'mkt-settle <market_id> <price>  SettleMarket (admin)', async (args) => {
	const marketId = Number(args[0]);
	const settlePrice = Number(args[1]);
	const resp = await call('SettleMarket', { settleMarket: { marketId, settlePrice } });
	console.log(summarize(resp));
});

register('mkt-status', 'mkt-status <market_id> <OPEN|SEMI_PAUSED|PAUSED>  EditMarket status', async (args) => {
	const id = Number(args[0]);
	const status = MarketStatus[args[1]?.toUpperCase() as keyof typeof MarketStatus];
	if (status === undefined) throw new Error('usage: mkt-status <id> <OPEN|SEMI_PAUSED|PAUSED>');
	const resp = await call('EditMarket', { editMarket: { id, status } });
	console.log(summarize(resp));
});

register('mkt-history', 'mkt-history <market_id>  GetFullTradeHistory + GetFullOrderHistory', async (args) => {
	const marketId = Number(args[0]);
	const trades = await call('GetFullTradeHistory', { getFullTradeHistory: { marketId } });
	console.log(`trades: ${trades.trades?.trades?.length ?? 0}`);
	const orders = await call('GetFullOrderHistory', { getFullOrderHistory: { marketId } });
	console.log(`orders: ${orders.orders?.orders?.length ?? 0}`);
});

register('auctions', 'list cached auctions', async () => {
	for (const [id, a] of state.auctions.entries()) {
		const status = a.closed ? `closed@${a.closed.settlePrice}` : 'open';
		console.log(`#${id} owner=${a.ownerId} bin=${a.binPrice ?? '-'} [${status}] "${a.name}"`);
	}
});

register('auction-buy', 'auction-buy <auction_id>  BuyAuction', async (args) => {
	const auctionId = Number(args[0]);
	const resp = await call('BuyAuction', { buyAuction: { auctionId } });
	console.log(summarize(resp));
});

register('redeem', 'redeem <fund_market_id> <amount>  Redeem', async (args) => {
	const fundId = Number(args[0]);
	const amount = Number(args[1]);
	const resp = await call('Redeem', { redeem: { fundId, amount } });
	console.log(summarize(resp));
});

register('code-create', 'code-create <amount>  mint a redeem code (admin)', async (args) => {
	const amount = Number(args[0]);
	const resp = await call('CreateRedeemCode', { createRedeemCode: { amount } });
	if (resp.redeemCodeCreated) console.log(`code: ${resp.redeemCodeCreated.code} amount=${resp.redeemCodeCreated.amount}`);
	else console.log(summarize(resp));
});

register('code-claim', 'code-claim <CODE>  claim a redeem code', async (args) => {
	const code = args[0]?.toUpperCase();
	const resp = await call('ClaimRedeemCode', { claimRedeemCode: { code } });
	console.log(summarize(resp));
});

register('acct-create', 'acct-create <name> [universe_id] [initial_balance]  CreateAccount (alt)', async (args) => {
	if (!args[0]) throw new Error('usage: acct-create <name> [universe_id] [initial_balance]');
	const ownerId = state.actingAs;
	const create: websocket_api.ICreateAccount = { ownerId, name: args[0] };
	if (args[1]) create.universeId = Number(args[1]);
	if (args[2]) create.initialBalance = Number(args[2]);
	const resp = await call('CreateAccount', { createAccount: create });
	console.log(summarize(resp));
});

register('raw', 'raw <json>  send arbitrary ClientMessage payload (escape hatch)', async (args) => {
	const json = args.join(' ').trim();
	if (!json) throw new Error('usage: raw <json> (e.g. raw {"createOrder":{"marketId":1,"side":1,"price":50,"size":1}})');
	let parsed: websocket_api.IClientMessage;
	try {
		parsed = JSON.parse(json);
	} catch (e) {
		throw new Error(`bad json: ${(e as Error).message}`);
	}
	const kind = Object.keys(parsed).find((k) => k !== 'requestId') ?? 'raw';
	const resp = await call(kind, parsed);
	console.log(JSON.stringify(resp, null, 2));
});

register('quit', 'exit the repl', async () => {
	socket?.close();
	process.exit(0);
});

// --- main loop -----------------------------------------------------
async function main() {
	console.log(ANSI.bold('arbor repl'));
	console.log(ANSI.dim(`url=${WS_URL} jwt=${JWT.startsWith('test::') ? JWT : '<jwt>'}`));
	await connect();

	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: ANSI.cyan('arbor> '),
		historySize: 500,
	});
	rl.prompt();

	rl.on('line', async (raw) => {
		const line = raw.trim();
		if (!line) {
			rl.prompt();
			return;
		}
		const tokens = tokenize(line);
		const cmd = tokens.shift()!;
		const handler = commands[cmd];
		if (!handler) {
			console.log(ANSI.red(`unknown command "${cmd}". try \`help\`.`));
			rl.prompt();
			return;
		}
		try {
			await handler.run(tokens);
		} catch (e) {
			console.log(ANSI.red(`error: ${(e as Error).message}`));
		}
		rl.prompt();
	});

	rl.on('close', () => {
		socket?.close();
		process.exit(0);
	});
}

// Tiny tokenizer that supports double-quoted strings.
function tokenize(line: string): string[] {
	const out: string[] = [];
	let cur = '';
	let inQuote = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (c === '"') {
			inQuote = !inQuote;
			continue;
		}
		if (!inQuote && c === ' ') {
			if (cur) {
				out.push(cur);
				cur = '';
			}
			continue;
		}
		cur += c;
	}
	if (cur) out.push(cur);
	return out;
}

main().catch((e) => {
	console.error(ANSI.red(`fatal: ${(e as Error).message}`));
	process.exit(1);
});
