import { browser } from '$app/environment';

export interface PublicShowcaseItem {
	key: string;
	display_name: string;
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
						display_name: showcase.display_name ?? key
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
