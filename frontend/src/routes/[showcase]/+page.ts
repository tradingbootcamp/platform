import { redirect } from '@sveltejs/kit';

function normalizeShowcaseKey(value: string): string {
	return value.trim().toLowerCase();
}

export function load({ params, url }: { params: { showcase: string }; url: URL }) {
	const showcase = normalizeShowcaseKey(params.showcase);
	if (!showcase) {
		throw redirect(307, '/market');
	}

	const query = new URLSearchParams(url.searchParams);
	query.set('showcase', showcase);
	throw redirect(307, `/market?${query.toString()}`);
}
