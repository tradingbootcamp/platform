import { redirect } from '@sveltejs/kit';
import { fetchPublicShowcaseConfig, normalizeShowcaseKey } from '$lib/showcaseRouting';

function normalizePath(rest: string): string {
	const cleaned = rest
		.split('/')
		.map((segment) => segment.trim())
		.filter(Boolean)
		.join('/');
	return cleaned ? `/${cleaned}` : '/market';
}

export async function load({
	params,
	url,
	fetch
}: {
	params: { showcase: string; rest: string };
	url: URL;
	fetch: typeof globalThis.fetch;
}) {
	const showcase = normalizeShowcaseKey(params.showcase);
	if (!showcase) {
		throw redirect(307, '/');
	}

	const publicConfig = await fetchPublicShowcaseConfig(fetch, false);
	if (!publicConfig.showcases.some((item) => item.key === showcase)) {
		throw redirect(307, '/');
	}

	const targetPath = normalizePath(params.rest);
	const query = new URLSearchParams(url.searchParams);
	query.set('showcase', showcase);
	throw redirect(307, `${targetPath}?${query.toString()}`);
}
