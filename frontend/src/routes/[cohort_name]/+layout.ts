import { error } from '@sveltejs/kit';
import type { CohortsResponse } from '$lib/cohortApi';

// `ssr = false` is inherited from the root layout, but set it explicitly so
// the static adapter does not try to evaluate this load during prerender.
export const ssr = false;

export async function load({ params }) {
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
	if (response.public_auction_enabled && response.active_auction_cohort) {
		// Guests reach the public-auction cohort even though it isn't in their list.
		allowed.add(response.active_auction_cohort);
	}

	if (!allowed.has(params.cohort_name)) {
		throw error(404, `Cohort "${params.cohort_name}" not found`);
	}

	return {
		cohortName: params.cohort_name,
		cohortsResponse: response
	};
}
