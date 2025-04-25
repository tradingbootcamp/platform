import { LocalStore, localStore } from './localStore.svelte';

let starredMarkets: LocalStore<number[]> | undefined = undefined;

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
