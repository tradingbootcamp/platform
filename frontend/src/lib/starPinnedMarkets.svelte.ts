import { LocalStore, localStore } from './localStore.svelte';
let starredMarkets: LocalStore<number[]> | undefined = undefined;
let starredMarketsCohort: string | null = null;
import { getCurrentCohort, sendClientMessage, serverState } from '$lib/api.svelte';
import { websocket_api } from 'schema-js';

export const useStarredMarkets = () => {
	const cohort = getCurrentCohort();
	if (!starredMarkets || starredMarketsCohort !== cohort) {
		const key = cohort ? `${cohort}:starredMarkets` : 'starredMarkets';
		starredMarkets = localStore<number[]>(key, []);
		starredMarketsCohort = cohort;
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
		allStarredMarkets: () => {
			// Only return markets that still exist
			return starredMarkets!.value.filter((id) => serverState.markets.has(id));
		},
		cleanupStarredMarkets: () => {
			// This function should be called in an effect or event handler
			const existingStarredMarkets = starredMarkets!.value.filter((id) =>
				serverState.markets.has(id)
			);
			if (existingStarredMarkets.length !== starredMarkets!.value.length) {
				starredMarkets!.value = existingStarredMarkets;
			}
		}
	};
};

export const usePinnedMarkets = () => {
	return {
		isPinned: (marketId: number) => {
			return serverState.markets.get(marketId)?.definition?.pinned;
		},
		togglePinned: (marketId: number) => {
			const currentPinned = serverState.markets.get(marketId)?.definition?.pinned;
			const marketStatus =
				serverState.markets.get(marketId)?.definition?.status ??
				websocket_api.MarketStatus.MARKET_STATUS_OPEN;
			sendClientMessage({
				editMarket: {
					id: marketId,
					pinned: !currentPinned,
					status: marketStatus
				}
			});
		},
		allPinnedMarkets: () =>
			[...serverState.markets.values()].filter((market) => market.definition.pinned)
	};
};
