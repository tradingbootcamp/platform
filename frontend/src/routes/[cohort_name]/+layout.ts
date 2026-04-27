import { error } from '@sveltejs/kit';
import { fetchCohorts, type CohortsResponse } from '$lib/cohortApi';

export async function load({ params }) {
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
