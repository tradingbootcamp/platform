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
 * Formats a market name: ABC__DEF becomes "DEF, ABC"
 */
export function formatMarketName(name: string | null | undefined): string {
	if (!name) return '';
	const idx = name.indexOf('__');
	if (idx === -1) return name;
	return `${name.slice(idx + 2)}, ${name.slice(0, idx)}`;
}
