import { PUBLIC_SERVER_URL } from '$env/static/public';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { websocket_api } from 'schema-js';
import { toast } from 'svelte-sonner';
import { SvelteMap } from 'svelte/reactivity';
import { kinde } from './auth.svelte';
import { notifyUser } from './notifications';
// const originalConsoleLog = console.log;

// // Override console.log
// console.log = function (...args) {
// 	// Get the stack trace
// 	// Creating a new Error object captures the current stack trace
// 	const stack = new Error().stack;

// 	// You might want to clean up the stack trace string a bit,
// 	// for example, remove the first line which is often the Error message itself.
// 	const stackLines = stack.split('\n');
// 	// Remove the first line (e.g., "Error") and potentially the override function's frame
// 	const cleanedStack = stackLines.slice(2).join('\n'); // Adjust slice number if needed based on environment

// 	// Log the original message followed by the cleaned stack trace
// 	originalConsoleLog.apply(console, [...args, '\n', 'Stack Trace:', cleanedStack]);

// 	// Alternatively, use console.trace() which might format better in some consoles:
// 	// originalConsoleLog.apply(console, args);
// 	// console.trace('Logged from:'); // This adds a stack trace at the point this line is called
// 	// which might be slightly different than the *original* call site
// 	// depending on how the override function affects the stack.
// 	// Using new Error().stack is generally more reliable for the original call site.
// };

const socket = new ReconnectingWebSocket(PUBLIC_SERVER_URL);
socket.binaryType = 'arraybuffer';

console.log('Connecting to', PUBLIC_SERVER_URL);

export class MarketData {
	definition: websocket_api.IMarket = $state({});
	orders: websocket_api.IOrder[] = $state([]);
	trades: websocket_api.ITrade[] = $state([]);
	redemptions: websocket_api.IRedeemed[] = $state([]);
	hasFullOrderHistory: boolean = $state(false);
	hasFullTradeHistory: boolean = $state(false);
}

export const serverState = $state({
	stale: true,
	userId: undefined as number | undefined,
	actingAs: undefined as number | undefined,
	currentUniverseId: 0 as number,
	isAdmin: false,
	sudoEnabled: false,
	portfolio: undefined as websocket_api.IPortfolio | undefined,
	portfolios: new SvelteMap<number, websocket_api.IPortfolio>(),
	transfers: [] as websocket_api.ITransfer[],
	accounts: new SvelteMap<number, websocket_api.IAccount>(),
	markets: new SvelteMap<number, MarketData>(),
	marketTypes: new SvelteMap<number, websocket_api.IMarketType>(),
	marketGroups: new SvelteMap<number, websocket_api.IMarketGroup>(),
	auctions: new SvelteMap<number, websocket_api.IAuction>(),
	universes: new SvelteMap<number, websocket_api.IUniverse>(),
	lastKnownTransactionId: 0,
	arborPixieAccountId: undefined as number | undefined
});

export const hasArborPixieTransfer = () => {
	if (!serverState.arborPixieAccountId) {
		return true; // Just to avoid weird behavior while connecting
	}
	return serverState.transfers.some(
		(t) =>
			t.fromAccountId === serverState.arborPixieAccountId &&
			t.toAccountId === (serverState.isAdmin ? serverState.actingAs : serverState.userId)
	);
};

let resolveConnectionToast: ((value: unknown) => void) | undefined;
const startConnectionToast = () => {
	if (resolveConnectionToast) {
		return;
	}
	toast.promise(
		() =>
			new Promise((resolve) => {
				resolveConnectionToast = resolve;
			}),
		{
			loading: 'Connecting...',
			success: 'Connected!',
			error: 'Error connecting'
		}
	);
};

let messageQueue: websocket_api.IClientMessage[] = [];
let hasAuthenticated = false;

export const sendClientMessage = (msg: websocket_api.IClientMessage) => {
	if (hasAuthenticated || 'authenticate' in msg) {
		const msgType = Object.keys(msg).find((key) => msg[key as keyof typeof msg]);
		console.log(`sending ${msgType} message`, msg[msgType as keyof typeof msg]);
		const data = websocket_api.ClientMessage.encode(msg).finish();
		socket.send(data);
		hasAuthenticated = true;
		for (const m of messageQueue) {
			sendClientMessage(m);
		}
		messageQueue = [];
	} else {
		messageQueue.push(msg);
	}
};

export const isAltAccount = (accountId: number | null | undefined): boolean => {
	const account = serverState.accounts.get(accountId ?? 0);
	return account ? !account.isUser : false;
};

export const accountName = (
	accountId: number | null | undefined,
	me?: string,
	options?: { raw?: boolean }
) => {
	const account = serverState.accounts.get(accountId ?? 0);
	const rawName = account?.name || 'Unnamed account';
	// Hide everything before __ (e.g., "UniverseName__AccountName" -> "AccountName")
	const formattedName = options?.raw ? rawName : rawName.replace(/^.*__/, '');
	return accountId === serverState.userId && me ? me : formattedName;
};

const authenticate = async () => {
	console.log('authenticating...');
	startConnectionToast();
	const accessToken = await kinde.getToken();
	const idToken = await kinde.getIdToken();
	const isAdmin = await kinde.isAdmin();
	serverState.isAdmin = isAdmin;

	if (!accessToken) {
		console.log('no access token');
		return;
	}
	if (!idToken) {
		console.log('no id token');
		return;
	}
	const actAs = Number(localStorage.getItem('actAs'));
	const authenticate = {
		jwt: accessToken,
		idJwt: idToken,
		actAs: Number.isNaN(actAs) ? undefined : actAs
	};
	console.log('Auth info:', authenticate);
	sendClientMessage({ authenticate });
};

socket.onopen = authenticate;

socket.onclose = () => {
	serverState.stale = true;
};

socket.onmessage = (event: MessageEvent) => {
	const data = event.data;
	const msg = websocket_api.ServerMessage.decode(new Uint8Array(data));

	notifyUser(msg);

	if (msg.authenticated) {
		serverState.userId = msg.authenticated.accountId;
		serverState.sudoEnabled = false;
	}

	if (msg.actingAs) {
		serverState.stale = false;
		if (resolveConnectionToast) {
			resolveConnectionToast('connected');
			resolveConnectionToast = undefined;
		}
		if (msg.actingAs.accountId) {
			localStorage.setItem('actAs', msg.actingAs.accountId.toString());
		}
		serverState.actingAs = msg.actingAs.accountId;
		const newUniverseId = msg.actingAs.universeId ?? 0;
		// Clear markets when universe changes - server will resend the correct ones
		if (newUniverseId !== serverState.currentUniverseId) {
			serverState.markets.clear();
			// Redirect to /market if on a specific market page (the market may not exist in the new universe)
			if (browser && window.location.pathname.match(/^\/market\/\d+/)) {
				goto('/market');
			}
		}
		serverState.currentUniverseId = newUniverseId;
		serverState.portfolio = serverState.portfolios.get(msg.actingAs.accountId);
		if (serverState.isAdmin && localStorage.getItem('sudoEnabled') === 'true') {
			sendClientMessage({ setSudo: { enabled: true } });
		}
	}

	if (msg.portfolioUpdated) {
		serverState.portfolios.set(msg.portfolioUpdated.accountId, msg.portfolioUpdated);
		if (msg.portfolioUpdated.accountId == serverState.actingAs) {
			serverState.portfolio = msg.portfolioUpdated;
		}
	}

	if (msg.portfolios) {
		if (!msg.portfolios.areNewOwnerships) {
			serverState.portfolios.clear();
		}
		for (const p of msg.portfolios.portfolios || []) {
			serverState.portfolios.set(p.accountId, p);
			if (p.accountId == serverState.actingAs) {
				serverState.portfolio = p;
			}
		}
	}

	if (msg.transfers) {
		for (const t of msg.transfers.transfers || []) {
			serverState.lastKnownTransactionId = Math.max(
				serverState.lastKnownTransactionId,
				t.transactionId
			);
			if (!serverState.transfers.find((p) => p.id === t.id)) {
				serverState.transfers.push(t);
			}
		}
	}

	const transferCreated = msg.transferCreated;
	if (transferCreated) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			transferCreated.transactionId
		);
		if (!serverState.transfers.find((p) => p.id === transferCreated.id)) {
			serverState.transfers.push(transferCreated);
		}
	}

	if (msg.accounts) {
		serverState.accounts.clear();
		for (const account of msg.accounts.accounts || []) {
			serverState.accounts.set(account.id, account);
			if (account.name === 'Arbor Pixie') {
				serverState.arborPixieAccountId = account.id;
			}
		}
	}

	const accountCreated = msg.accountCreated;
	if (accountCreated) {
		serverState.accounts.set(accountCreated.id, accountCreated);
	}

	if (msg.marketTypes) {
		serverState.marketTypes.clear();
		for (const mt of msg.marketTypes.marketTypes || []) {
			serverState.marketTypes.set(mt.id, mt);
		}
	}

	if (msg.marketType) {
		serverState.marketTypes.set(msg.marketType.id, msg.marketType);
	}

	if (msg.marketTypeDeleted) {
		serverState.marketTypes.delete(msg.marketTypeDeleted.marketTypeId);
	}

	if (msg.marketGroups) {
		serverState.marketGroups.clear();
		for (const mg of msg.marketGroups.marketGroups || []) {
			serverState.marketGroups.set(mg.id, mg);
		}
	}

	if (msg.marketGroup) {
		serverState.marketGroups.set(msg.marketGroup.id, msg.marketGroup);
	}

	if (msg.universes) {
		serverState.universes.clear();
		for (const u of msg.universes.universes || []) {
			serverState.universes.set(u.id, u);
		}
	}

	if (msg.universe) {
		serverState.universes.set(msg.universe.id, msg.universe);
	}

	const market = msg.market;
	if (market) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			market.transactionId
		);
		const marketData = serverState.markets.get(market.id) || new MarketData();
		serverState.markets.set(market.id, marketData);
		marketData.definition = websocket_api.Market.toObject(market as websocket_api.Market, {
			defaults: true
		});
	}

	const auction = msg.auction;
	if (auction) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			auction.transactionId
		);
		serverState.auctions.set(auction.id, auction);
	}

	const auctionDeleted = msg.auctionDeleted;
	if (auctionDeleted) {
		serverState.auctions.delete(auctionDeleted.auctionId);
	}

	const orders = msg.orders;
	if (orders) {
		const marketData = serverState.markets.get(orders.marketId) || new MarketData();
		serverState.markets.set(orders.marketId, marketData);
		marketData.orders = (orders.orders || []).map((order) =>
			websocket_api.Order.toObject(order as websocket_api.Order, { defaults: true })
		);
		marketData.hasFullOrderHistory = orders.hasFullHistory || false;
	}

	const trades = msg.trades;
	if (trades) {
		const marketData = serverState.markets.get(trades.marketId) || new MarketData();
		serverState.markets.set(trades.marketId, marketData);
		marketData.trades = (trades.trades ?? []).map((trade) =>
			websocket_api.Trade.toObject(trade as websocket_api.Trade, { defaults: true })
		);
		marketData.hasFullTradeHistory = trades.hasFullHistory ?? false;
	}

	const marketSettled = msg.marketSettled;
	if (marketSettled) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			marketSettled.transactionId
		);
		const marketData = serverState.markets.get(marketSettled.id);
		if (marketData) {
			marketData.definition.closed = {
				settlePrice: marketSettled.settlePrice,
				transactionId: marketSettled.transactionId,
				transactionTimestamp: marketSettled.transactionTimestamp
			};
			marketData.definition.open = undefined;
			marketData.orders = [];
		} else {
			console.error(`Market ${marketSettled.id} not already in state`);
		}
	}

	const auctionSettled = msg.auctionSettled;
	if (auctionSettled) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			auctionSettled.transactionId
		);
		const auctionData = serverState.auctions.get(auctionSettled.id);
		if (auctionData) {
			serverState.auctions.set(auctionSettled.id, {
				...auctionData,
				closed: { settlePrice: auctionSettled.settlePrice },
				open: null,
				buyerId: auctionSettled.buyerId
			});
			auctionData.open = null;
			console.log('Auction settled!');
			console.log(auctionData);
		} else {
			console.error(`Auction ${auctionSettled.id} not already in state`);
		}
	}

	const ordersCancelled = msg.ordersCancelled;
	if (ordersCancelled) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			ordersCancelled.transactionId
		);
		const marketData = serverState.markets.get(ordersCancelled.marketId);
		if (!marketData) {
			console.error(`Market ${ordersCancelled.marketId} not already in state`);
			return;
		}

		if (marketData.hasFullOrderHistory) {
			for (const order of marketData.orders) {
				if (ordersCancelled.orderIds?.includes(order.id)) {
					order.size = 0;
					order.sizes = order.sizes || [];
					order.sizes.push({
						transactionId: ordersCancelled.transactionId,
						transactionTimestamp: ordersCancelled.transactionTimestamp,
						size: 0
					});
				}
			}
		} else {
			marketData.orders = marketData.orders.filter(
				(order) => !ordersCancelled.orderIds?.includes(order.id)
			);
		}
	}

	const orderCreated = msg.orderCreated;
	if (orderCreated) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			orderCreated.transactionId
		);
		const marketData = serverState.markets.get(orderCreated.marketId);
		if (!marketData) {
			console.error(`Market ${orderCreated.marketId} not already in state`);
			return;
		}

		if (orderCreated.order) {
			marketData.orders.push(
				websocket_api.Order.toObject(orderCreated.order as websocket_api.Order, { defaults: true })
			);
		}

		const fills = orderCreated.fills;
		if (fills && fills.length) {
			if (marketData.hasFullOrderHistory) {
				for (const order of marketData.orders) {
					const fill = fills.find((f) => f.id === order.id);
					if (fill?.sizeRemaining !== undefined) {
						order.size = fill.sizeRemaining;
						order.sizes = order.sizes || [];
						order.sizes.push({
							transactionId: orderCreated.transactionId,
							transactionTimestamp: orderCreated.transactionTimestamp,
							size: fill.sizeRemaining
						});
					}
				}
			} else {
				const fullyFilledOrders = fills
					.filter((fill) => fill.sizeRemaining === 0)
					.map((fill) => fill.id);
				marketData.orders = marketData.orders.filter(
					(order) => !fullyFilledOrders.includes(order.id)
				);
				const partialFills = fills.filter((fill) => fill.sizeRemaining !== 0);
				for (const order of marketData.orders) {
					const fill = partialFills.find((f) => f.id === order.id);
					if (fill) {
						order.size = fill.sizeRemaining;
					}
				}
			}
		}

		if (orderCreated.trades) {
			marketData.trades.push(
				...orderCreated.trades.map((trade) =>
					websocket_api.Trade.toObject(trade as websocket_api.Trade, { defaults: true })
				)
			);
		}
	}

	if (msg.requestFailed && msg.requestFailed.requestDetails?.kind === 'Authenticate') {
		localStorage.removeItem('actAs');
		console.log('Authentication failed');
		authenticate();
	}

	const redeemed = msg.redeemed;
	if (redeemed) {
		serverState.lastKnownTransactionId = Math.max(
			serverState.lastKnownTransactionId,
			redeemed.transactionId
		);
		const marketData = serverState.markets.get(redeemed.fundId);
		if (marketData) {
			marketData.redemptions.push(redeemed);
		}
	}

	if (msg.sudoStatus) {
		const wasEnabled = serverState.sudoEnabled;
		serverState.sudoEnabled = msg.sudoStatus.enabled ?? false;
		localStorage.setItem('sudoEnabled', String(serverState.sudoEnabled));
		// Re-request full history for markets when sudo is enabled to get unhidden IDs
		if (serverState.sudoEnabled && !wasEnabled) {
			for (const [marketId, marketData] of serverState.markets) {
				if (marketData.hasFullTradeHistory) {
					sendClientMessage({ getFullTradeHistory: { marketId } });
				}
				if (marketData.hasFullOrderHistory) {
					sendClientMessage({ getFullOrderHistory: { marketId } });
				}
			}
		}
	}
};

export const setSudo = (enabled: boolean) => {
	sendClientMessage({ setSudo: { enabled } });
};

// Sync sudo status across tabs via localStorage storage event
if (browser) {
	window.addEventListener('storage', (e) => {
		if (e.key === 'sudoEnabled' && serverState.isAdmin) {
			const enabled = e.newValue === 'true';
			if (enabled !== serverState.sudoEnabled) {
				sendClientMessage({ setSudo: { enabled } });
			}
		}
	});
}

/** Force WebSocket to reconnect and re-authenticate (useful after login state changes) */
export const reconnect = () => {
	socket.reconnect();
};
