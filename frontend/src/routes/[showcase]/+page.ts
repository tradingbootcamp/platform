import { redirect } from '@sveltejs/kit';
import { fetchPublicShowcaseConfig, normalizeShowcaseKey } from '$lib/showcaseRouting';

export async function load({
	params,
	url,
	fetch
}: {
	params: { showcase: string };
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

	const query = new URLSearchParams(url.searchParams);
	query.set('showcase', showcase);
	throw redirect(307, `/market?${query.toString()}`);
}
