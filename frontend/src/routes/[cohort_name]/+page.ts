import { redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const { cohortsResponse } = await parent();
	// Members land on /market by default. Non-members reaching this URL are
	// here only because the cohort has auctions_enabled, so send them to /auction.
	const isMember = cohortsResponse.cohorts.some(
		(c: { name: string }) => c.name === params.cohort_name
	);
	redirect(307, `/${params.cohort_name}/${isMember ? 'market' : 'auction'}`);
}
