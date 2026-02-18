import { redirect } from '@sveltejs/kit';
import { fetchPublicShowcaseConfig } from '$lib/showcaseRouting';

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	const config = await fetchPublicShowcaseConfig(fetch, false);
	if (config.default_showcase) {
		throw redirect(307, `/${config.default_showcase}`);
	}
	return {
		showcases: config.showcases
	};
}
