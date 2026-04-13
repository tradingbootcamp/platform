import { redirect } from '@sveltejs/kit';

export function load({ params }) {
	redirect(307, `/${params.cohort_name}/market`);
}
