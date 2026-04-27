import { redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { cohortsResponse } = await parent();
	const target =
		cohortsResponse.public_auction_enabled &&
		cohortsResponse.active_auction_cohort === params.cohort_name
			? 'auction'
			: 'market';
	redirect(307, `/${params.cohort_name}/${target}`);
}
