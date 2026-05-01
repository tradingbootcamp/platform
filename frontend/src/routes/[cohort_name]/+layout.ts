import { error, redirect } from '@sveltejs/kit';
import type { CohortsResponse } from '$lib/cohortApi';

// `ssr = false` is inherited from the root layout, but set it explicitly so
// the static adapter does not try to evaluate this load during prerender.
export const ssr = false;

export async function load({ params, url }) {
	// TODO: remove once the misprinted `fir-26` posters are out of circulation.
	if (params.cohort_name === 'fir-26') {
		throw redirect(307, url.pathname.replace(/^\/fir-26\b/, '/fir-apr26') + url.search);
	}

	// Dynamic import so the build's prerender pass never pulls in the Kinde
	// auth module (which references `location` at module-init time).
	const { fetchCohorts } = await import('$lib/cohortApi');

	let response: CohortsResponse;
	try {
		response = await fetchCohorts();
	} catch (e) {
		throw error(500, e instanceof Error ? e.message : 'Failed to load cohorts');
	}

	const allowed = new Set(response.cohorts.map((c) => c.name));
	for (const name of response.public_auction_cohorts) {
		// Non-members can reach a cohort whose `auctions_enabled` flag is on.
		allowed.add(name);
	}

	if (!allowed.has(params.cohort_name)) {
		throw error(404, `Cohort "${params.cohort_name}" not found`);
	}

	return {
		cohortName: params.cohort_name,
		cohortsResponse: response
	};
}
