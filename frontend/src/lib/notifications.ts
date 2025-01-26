import type { websocket_api } from 'schema-js';
import { toast } from 'svelte-sonner';
import { accountName, serverState } from './api.svelte';

// Add batch notification tracking
interface BatchedNotifications {
	ordersCreated: number;
	ordersFilled: number;
	ordersCancelled: number;
	redeemed: number;
}

// Track batches by market ID
const batchesByMarket = new Map<
	number,
	{
		timeout: NodeJS.Timeout;
		batch: BatchedNotifications;
		marketName: string;
		lastSent: number; // Add timestamp of last notification
	}
>();

function sendBatchedNotification(marketId: number) {
	const batchData = batchesByMarket.get(marketId);
	if (!batchData) return;

	const { batch, marketName } = batchData;
	const messages: string[] = [];
	if (batch.ordersCreated) messages.push(`${batch.ordersCreated} orders created`);
	if (batch.ordersFilled) messages.push(`${batch.ordersFilled} orders filled`);
	if (batch.ordersCancelled) messages.push(`${batch.ordersCancelled} orders cancelled`);
	if (batch.redeemed) messages.push(`${batch.redeemed} redemptions`);

	if (messages.length > 0) {
		toast.success(`${marketName}: ${messages.join(', ')}`);
		batchData.lastSent = Date.now();
		// Reset the batch counts after sending
		batchData.batch = {
			ordersCreated: 0,
			ordersFilled: 0,
			ordersCancelled: 0,
			redeemed: 0
		};
	} else {
		batchesByMarket.delete(marketId);
	}
}

function queueBatchedNotification(marketId: number, marketName: string) {
	const existing = batchesByMarket.get(marketId);
	const now = Date.now();

	if (existing) {
		// If it's been more than 500ms since last notification, send immediately
		if (now - existing.lastSent >= 500) {
			sendBatchedNotification(marketId);
		}
		clearTimeout(existing.timeout);
		const timeout = setTimeout(() => sendBatchedNotification(marketId), 500);
		existing.timeout = timeout;
	} else {
		const timeout = setTimeout(() => sendBatchedNotification(marketId), 500);
		batchesByMarket.set(marketId, {
			timeout,
			marketName,
			lastSent: 0, // Never sent before
			batch: {
				ordersCreated: 0,
				ordersFilled: 0,
				ordersCancelled: 0,
				redeemed: 0
			}
		});
	}
}

export const notifyUser = (msg: websocket_api.ServerMessage | null): void => {
	if (!msg) return;
	console.log(`got ${msg.message} message`, msg.toJSON()[msg.message!]);

	switch (msg.message) {
		case 'actingAs': {
			const actingAs = msg.actingAs!;
			const name = serverState.accounts.get(actingAs.accountId || 0)?.name;
			toast.info(`Acting as ${name}`);
			return;
		}
		case 'market': {
			const market = msg.market!;
			// market messages that arrive before the first actingAs are just initial data
			if (serverState.actingAs && market.ownerId === serverState.userId) {
				toast.success('Market created', { description: market.name || '' });
			}
			return;
		}
		case 'marketSettled': {
			const marketSettled = msg.marketSettled!;
			const market = serverState.markets.get(marketSettled.id);
			if (!market) {
				console.error('Market not in state', { marketSettled });
				return;
			}
			const description = `${market.definition?.name} settled at ${marketSettled.settlePrice}`;
			if (market.definition?.ownerId === serverState.userId) {
				toast.success('Market settled', { description });
			} else {
				toast.info('Market settled', { description });
			}
			return;
		}
		case 'ordersCancelled': {
			const ordersCancelled = msg.ordersCancelled!;
			const market = serverState.markets.get(ordersCancelled.marketId);
			const firstOrder = market?.orders?.find((o) => o.id === (ordersCancelled.orderIds || [])[0]);
			if (firstOrder?.ownerId === serverState.actingAs && market) {
				const batchData =
					batchesByMarket.get(market.definition.id) ||
					batchesByMarket
						.set(market.definition.id, {
							timeout: setTimeout(() => {}, 0),
							batch: { ordersCreated: 0, ordersFilled: 0, ordersCancelled: 0, redeemed: 0 },
							marketName: market.definition?.name || 'Unknown Market',
							lastSent: 0
						})
						.get(market.definition.id)!;

				batchData.batch.ordersCancelled += ordersCancelled.orderIds?.length || 0;
				queueBatchedNotification(market.definition.id, batchData.marketName);
			}
			return;
		}
		case 'redeemed': {
			const redeemed = msg.redeemed!;
			const market = serverState.markets.get(redeemed.fundId);
			if (redeemed.accountId === serverState.actingAs && market) {
				const batchData =
					batchesByMarket.get(market.definition.id) ||
					batchesByMarket
						.set(market.definition.id, {
							timeout: setTimeout(() => {}, 0),
							batch: { ordersCreated: 0, ordersFilled: 0, ordersCancelled: 0, redeemed: 0 },
							marketName: market.definition?.name || 'Unknown Market',
							lastSent: 0
						})
						.get(market.definition.id)!;

				batchData.batch.redeemed += 1;
				queueBatchedNotification(market.definition.id, batchData.marketName);
			}
			return;
		}
		case 'orderCreated': {
			const orderCreated = msg.orderCreated!;
			if (orderCreated.accountId !== serverState.actingAs) {
				return;
			}

			const market = serverState.markets.get(orderCreated.order?.marketId || 0);
			if (!market) return;

			const batchData =
				batchesByMarket.get(market.definition.id) ||
				batchesByMarket
					.set(market.definition.id, {
						timeout: setTimeout(() => {}, 0),
						batch: { ordersCreated: 0, ordersFilled: 0, ordersCancelled: 0, redeemed: 0 },
						marketName: market.definition?.name || 'Unknown Market',
						lastSent: 0
					})
					.get(market.definition.id)!;

			const realFills =
				orderCreated.fills?.filter((fill) => fill.ownerId !== serverState.actingAs) ?? [];

			if (realFills.length > 0) {
				batchData.batch.ordersFilled += 1;
			} else if (orderCreated.order) {
				batchData.batch.ordersCreated += 1;
			}
			queueBatchedNotification(market.definition.id, batchData.marketName);
			return;
		}
		case 'transferCreated': {
			const transferCreated = msg.transferCreated!;
			const amount = transferCreated.amount;
			const initiator = serverState.accounts.get(transferCreated.initiatorId || 0);
			const fromAccount = serverState.accounts.get(transferCreated.fromAccountId || 0);
			const toAccount = serverState.accounts.get(transferCreated.toAccountId || 0);

			if (initiator?.id === serverState.userId) {
				toast.success('Transfer created', {
					description: `You transfered ${amount} from ${accountName(fromAccount?.id, 'Yourself')} to ${accountName(toAccount?.id, 'Yourself')}`
				});
			} else {
				toast.info('Transfer created', {
					description: `${accountName(initiator?.id)} transfered ${amount} from ${accountName(fromAccount?.id)} to ${accountName(toAccount?.id)}`
				});
			}
			return;
		}
		case 'portfolios': {
			if (!msg.portfolios?.areNewOwnerships) return;
			for (const portfolio of msg.portfolios.portfolios || []) {
				const name = accountName(portfolio.accountId);
				const owner = portfolio.ownerCredits?.find(({ ownerId }) =>
					serverState.portfolios.has(ownerId)
				);
				if (owner && owner.ownerId !== serverState.userId) {
					toast.info(`You now own ${name} through ${accountName(owner?.ownerId)}`);
				} else {
					toast.info(`You now own ${name}`);
				}
			}
			return;
		}
		case 'ownershipGiven':
			toast.success('Ownership shared');
			return;
		case 'requestFailed': {
			const requestFailed = msg.requestFailed!;
			toast.error(`${requestFailed.requestDetails?.kind} failed`, {
				description: `Reason: ${requestFailed.errorDetails?.message}`
			});
			return;
		}
	}
};
