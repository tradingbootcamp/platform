import { LocalStore, localStore } from './localStore.svelte';
let starredMarkets: LocalStore<number[]> | undefined = undefined;
import { sendClientMessage, serverState } from '$lib/api.svelte';
import { websocket_api } from 'schema-js';

export const useStarredMarkets = () => {
	if (!starredMarkets) {
		starredMarkets = localStore<number[]>('starredMarkets', []);
	}
	return {
		isStarred: (marketId: number) => {
			return starredMarkets!.value.includes(marketId);
		},
		toggleStarred: (marketId: number) => {
			starredMarkets!.value = starredMarkets!.value.includes(marketId)
				? starredMarkets!.value.filter((id) => id !== marketId)
				: [...starredMarkets!.value, marketId];
		},
		allStarredMarkets: () => starredMarkets!.value
	};
};

export const usePinnedMarkets = () => {
	return {
		isPinned: (marketId: number) => {
			return serverState.markets.get(marketId)?.definition?.pinned;
		},
		togglePinned: (marketId: number) => {
			const currentPinned = serverState.markets.get(marketId)?.definition?.pinned;
			sendClientMessage({
				editMarket: {
					id: marketId,
					pinned: !currentPinned
				}
			});
		},
		allPinnedMarkets: () => serverState.markets.filter(market => market.definition.pinned)
	};
};
