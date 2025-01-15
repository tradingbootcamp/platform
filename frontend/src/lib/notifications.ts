import type { websocket_api } from 'schema-js';
import { toast } from 'svelte-sonner';
import { serverState } from './api.svelte';
import { user } from './auth.svelte';

export const notifyUser = (msg: websocket_api.ServerMessage | null): void => {
	if (!msg) return;
	console.log(`got ${msg.message} message`, msg.toJSON()[msg.message!]);

	switch (msg.message) {
		case 'actingAs': {
			const actingAs = msg.actingAs!;
			const name = serverState.users[actingAs.userId || '']?.name;
			toast.info(`Acting as ${name}`);
			return;
		}
		case 'market': {
			const market = msg.market!;
			// market messages that arrive before the first actingAs are just initial data
			if (serverState.actingAs && market.ownerId === user()?.id) {
				toast.success('Market created', { description: market.name || '' });
			}
			return;
		}
		case 'marketSettled': {
			const marketSettled = msg.marketSettled!;
			const market = serverState.markets[marketSettled.id];
			if (!market) {
				console.error('Market not in state', { marketSettled });
				return;
			}
			const description = `${market.definition?.name} settled at ${marketSettled.settlePrice}`;
			if (market.definition?.ownerId === user()?.id) {
				toast.success('Market settled', { description });
			} else {
				toast.info('Market settled', { description });
			}
			return;
		}
		case 'ordersCancelled': {
			const ordersCancelled = msg.ordersCancelled!;
			const market = serverState.markets[ordersCancelled.marketId];
			const firstOrder = market.orders?.find((o) => o.id === (ordersCancelled.orderIds || [])[0]);
			if (firstOrder?.ownerId === serverState.actingAs) {
				toast.success(
					`${ordersCancelled.orderIds?.length === 1 ? 'Order' : `${ordersCancelled.orderIds?.length} orders`} cancelled`
				);
			}
			return;
		}
		case 'redeemed': {
			const redeemed = msg.redeemed!;
			const market = serverState.markets[redeemed.fundId];

			if (redeemed.userId === serverState.actingAs) {
				toast.success(`Redeemed ${redeemed.amount} contracts of ${market.definition?.name}`);
			}
			return;
		}
		case 'orderCreated': {
			const orderCreated = msg.orderCreated!;
			if (orderCreated.userId !== serverState.actingAs) {
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
		case 'paymentCreated': {
			const paymentCreated = msg.paymentCreated!;
			const amount = paymentCreated.amount;
			const payer = serverState.users[paymentCreated.payerId || ''];
			const recipient = serverState.users[paymentCreated.recipientId || ''];

			if (payer?.id === serverState.actingAs) {
				toast.success('Payment created', { description: `You paid ${recipient?.name} ${amount}` });
			} else if (recipient?.id === serverState.actingAs) {
				toast.info('Payment created', { description: `${payer?.name} paid you ${amount}` });
			} else {
				console.error('Bad paymentCreated message', { paymentCreated });
			}
			return;
		}
		case 'ownershipReceived': {
			const ownership = msg.ownershipReceived!;
			const botName = serverState.users[ownership?.ofBotId || '']?.name;
			toast.info('Ownership received', { description: `You now own ${botName}` });
			return;
		}
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
};
