import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseAltName(name: string | undefined): { name: string; isAlt: boolean } {
	if (!name) return { name: '', isAlt: false };
	if (name.toLowerCase().startsWith('alt:')) {
		return { name: name.slice(4).trimStart(), isAlt: true };
	}
	return { name, isAlt: false };
}

/**
 * Formats a username based on context
 * - 'compact': strips everything before __ (for order book/trade log)
 * - 'full': replaces __ with a space (for elsewhere)
 */
export function formatUsername(name: string, mode: 'compact' | 'full'): string {
	if (!name) return name;
	const idx = name.indexOf('__');
	if (idx === -1) return name;
	if (mode === 'compact') {
		return name.slice(idx + 2);
	}
	return name.replace(/__/g, ' ');
}

/**
 * Formats a number with commas and up to `maxDecimals` decimal places.
 * Trailing zeros are stripped. Returns '0' for nullish values.
 */
export function formatNumber(value: number | null | undefined, maxDecimals: number = 2): string {
	return (value ?? 0).toLocaleString(undefined, {
		minimumFractionDigits: 0,
		maximumFractionDigits: maxDecimals
	});
}

/**
 * Parses a market name into suffix and group parts.
 * ABC__DEF => { suffix: "DEF", group: "ABC" }
 */
export function parseMarketName(name: string | null | undefined): { suffix: string; group: string | null } {
	if (!name) return { suffix: '', group: null };
	const idx = name.indexOf('__');
	if (idx === -1) return { suffix: name, group: null };
	return { suffix: name.slice(idx + 2), group: name.slice(0, idx) };
}

/**
 * Formats a market name for plain-text contexts: ABC__DEF becomes "DEF / ABC"
 */
export function formatMarketName(name: string | null | undefined): string {
	const { suffix, group } = parseMarketName(name);
	if (!suffix) return '';
	if (!group) return suffix;
	return `${suffix} / ${group}`;
}
