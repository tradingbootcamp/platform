import { kinde } from './auth.svelte';
import { API_BASE } from './apiBase';

export interface CohortInfo {
	id: number;
	name: string;
	display_name: string;
	is_read_only: boolean;
	auctions_enabled: boolean;
}

export interface CohortsResponse {
	cohorts: CohortInfo[];
	/** Names of cohorts the user isn't a member of but can still hit /auction for. */
	public_auction_cohorts: string[];
	default_cohort: string | null;
}

export async function fetchCohorts(): Promise<CohortsResponse> {
	const token = await kinde.getToken();
	const idToken = await kinde.getIdToken();
	const headers: HeadersInit = {
		Authorization: `Bearer ${token}`
	};
	if (idToken) {
		headers['X-ID-Token'] = idToken;
	}
	const res = await fetch(`${API_BASE}/api/cohorts`, {
		headers
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch cohorts: ${res.statusText}`);
	}
	return res.json();
}
