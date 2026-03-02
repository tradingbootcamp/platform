import { browser } from '$app/environment';

export interface PublicShowcaseItem {
	key: string;
	display_name: string;
	password_protected: boolean;
}

export interface PublicShowcaseConfig {
	default_showcase: string | null;
	showcases: PublicShowcaseItem[];
}

let publicConfigCache: PublicShowcaseConfig | undefined;
let publicConfigPromise: Promise<PublicShowcaseConfig> | undefined;

export function normalizeShowcaseKey(value: string | null | undefined): string | undefined {
	if (!value) return undefined;
	const trimmed = value.trim().toLowerCase();
	if (!trimmed) return undefined;
	return /^[a-z0-9_-]+$/.test(trimmed) ? trimmed : undefined;
}

export function showcaseFromSearchParams(searchParams: URLSearchParams): string | undefined {
	return normalizeShowcaseKey(searchParams.get('showcase'));
}

export function showcaseFromUrl(url: URL): string | undefined {
	return showcaseFromSearchParams(url.searchParams);
}

export function currentShowcaseFromWindow(): string | undefined {
	if (!browser) return undefined;
	return showcaseFromSearchParams(new URLSearchParams(window.location.search));
}

export function withShowcaseQuery(path: string, showcaseKey: string | undefined): string {
	const [pathname, query = ''] = path.split('?', 2);
	const params = new URLSearchParams(query);
	if (showcaseKey) {
		params.set('showcase', showcaseKey);
	} else {
		params.delete('showcase');
	}
	const encodedQuery = params.toString();
	return encodedQuery ? `${pathname}?${encodedQuery}` : pathname;
}

export async function fetchPublicShowcaseConfig(
	fetcher: typeof fetch = fetch,
	useCache = true
): Promise<PublicShowcaseConfig> {
	if (useCache && publicConfigCache) return publicConfigCache;
	if (useCache && publicConfigPromise) return publicConfigPromise;

	const request = (async () => {
		try {
			const res = await fetcher('/api/showcase/public');
			if (!res.ok) {
				return { default_showcase: null, showcases: [] };
			}
			const data = (await res.json()) as PublicShowcaseConfig;
			const showcases = (data.showcases ?? [])
				.map((showcase) => {
					const key = normalizeShowcaseKey(showcase.key);
					if (!key) return null;
					return {
						key,
						display_name: showcase.display_name ?? key,
						password_protected: showcase.password_protected ?? false
					};
				})
				.filter((item): item is PublicShowcaseItem => Boolean(item));
			const defaultShowcase = normalizeShowcaseKey(data.default_showcase) ?? null;
			const safeDefault = showcases.some((showcase) => showcase.key === defaultShowcase)
				? defaultShowcase
				: null;
			return {
				default_showcase: safeDefault,
				showcases
			};
		} catch {
			return { default_showcase: null, showcases: [] };
		}
	})();

	if (useCache) {
		publicConfigPromise = request;
	}

	const data = await request;
	if (useCache) {
		publicConfigCache = data;
		publicConfigPromise = undefined;
	}
	return data;
}

export function clearPublicShowcaseConfigCache() {
	publicConfigCache = undefined;
	publicConfigPromise = undefined;
}

const VERIFIED_PREFIX = 'showcase_pw_verified:';

export function showcasePasswordVerified(key: string): boolean {
	if (!browser) return false;
	return sessionStorage.getItem(`${VERIFIED_PREFIX}${key}`) === 'true';
}

export function setShowcasePasswordVerified(key: string): void {
	if (!browser) return;
	sessionStorage.setItem(`${VERIFIED_PREFIX}${key}`, 'true');
}

export function clearShowcasePasswordVerified(key: string): void {
	if (!browser) return;
	sessionStorage.removeItem(`${VERIFIED_PREFIX}${key}`);
}

export async function verifyShowcasePassword(
	key: string,
	password: string,
	fetcher: typeof fetch = fetch
): Promise<boolean> {
	try {
		const res = await fetcher('/api/showcase/verify-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ showcase: key, password }),
			credentials: 'same-origin'
		});
		if (!res.ok) return false;
		const data = (await res.json()) as { valid: boolean };
		return data.valid;
	} catch {
		return false;
	}
}
