import { redirect } from '@sveltejs/kit';

function normalizeShowcaseKey(value: string): string {
	return value.trim().toLowerCase();
}

function normalizePath(rest: string): string {
	const cleaned = rest
		.split('/')
		.map((segment) => segment.trim())
		.filter(Boolean)
		.join('/');
	return cleaned ? `/${cleaned}` : '/market';
}

export function load({ params, url }: { params: { showcase: string; rest: string }; url: URL }) {
	const showcase = normalizeShowcaseKey(params.showcase);
	const targetPath = normalizePath(params.rest);
	const query = new URLSearchParams(url.searchParams);
	if (showcase) {
		query.set('showcase', showcase);
	}
	throw redirect(307, `${targetPath}?${query.toString()}`);
}
