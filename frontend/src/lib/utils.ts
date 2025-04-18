import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { websocket_api } from 'schema-js';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Determines if a market should display with a wavy border
 * @param market The market definition or name to check
 * @returns boolean indicating if the market should have a wavy border
 */
export function shouldShowWavyBorder(market: websocket_api.IMarket | undefined | null): boolean {
	if (!market) return false;

	// If we have a full market object
	return market.name === 'ASCII';
}
