import type { websocket_api } from 'schema-js';
import { toast } from 'svelte-sonner';
import { serverState } from './api.svelte';

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
			if (firstOrder?.ownerId === serverState.actingAs) {
				toast.success(
					`${ordersCancelled.orderIds?.length === 1 ? 'Order' : `${ordersCancelled.orderIds?.length} orders`} cancelled`
				);
			}
			return;
		}
		case 'redeemed': {
			const redeemed = msg.redeemed!;
			const market = serverState.markets.get(redeemed.fundId);

			if (redeemed.accountId === serverState.actingAs) {
				toast.success(`Redeemed ${redeemed.amount} contracts of ${market?.definition?.name}`);
			}
			return;
		}
		case 'orderCreated': {
			const orderCreated = msg.orderCreated!;
			if (orderCreated.accountId !== serverState.actingAs) {
				return;
			}
			const realFills =
				orderCreated.fills?.filter((fill) => fill.ownerId !== serverState.actingAs) ?? [];
			const fillSize = realFills.reduce((acc, fill) => acc + (fill.sizeFilled ?? 0), 0);
			const fillPrice = realFills.reduce(
				(acc, fill) => acc + ((fill.price ?? 0) * (fill.sizeFilled ?? 0)) / fillSize!,
				0
			);
			const fillSizeString = String(fillSize || '').includes('.') ? fillSize.toFixed(2) : fillSize;
			const fillPriceString = String(fillPrice || '').includes('.')
				? fillPrice.toFixed(2)
				: fillPrice;
			const message = orderCreated.order
				? realFills.length
					? `Order partially filled`
					: 'Order created'
				: realFills.length
					? `Order filled`
					: 'Order self-filled';
			const description = fillSize ? `filled ${fillSizeString} @ ${fillPriceString}` : undefined;
			toast.success(message, { description });
			return;
		}
		case 'transferCreated': {
			const transferCreated = msg.transferCreated!;
			const amount = transferCreated.amount;
			const initiator = serverState.accounts.get(transferCreated.initiatorId || 0);
			const fromAccount = serverState.accounts.get(transferCreated.fromAccountId || 0);
			const toAccount = serverState.accounts.get(transferCreated.toAccountId || 0);
			const namePretty = (account: websocket_api.IAccount | undefined) => {
				return account?.id === serverState.userId ? 'You' : account?.name || 'Unknown';
			};

			if (initiator?.id === serverState.userId) {
				toast.success('Transfer created', {
					description: `You transfered ${amount} from ${namePretty(fromAccount)} to ${namePretty(toAccount)}`
				});
			} else {
				toast.info('Transfer created', {
					description: `${namePretty(initiator)} transfered ${amount} from ${namePretty(fromAccount)} to ${namePretty(toAccount)}`
				});
			}
			return;
		}
		case 'portfolios': {
			if (!msg.portfolios?.areNewOwnerships) return;
			for (const portfolio of msg.portfolios.portfolios || []) {
				const name = serverState.accounts.get(portfolio.accountId || 0)?.name;
				// TODO: say subaccount of who
				toast.info(`You now own ${name}`);
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
