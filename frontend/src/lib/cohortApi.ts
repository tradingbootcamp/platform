import { kinde } from './auth.svelte';
import { API_BASE } from './apiBase';

export interface CohortInfo {
	id: number;
	name: string;
	display_name: string;
	is_read_only: boolean;
}

export interface CohortsResponse {
	cohorts: CohortInfo[];
}

export async function fetchCohorts(): Promise<CohortsResponse> {
	const token = await kinde.getToken();
	const res = await fetch(`${API_BASE}/api/cohorts`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!res.ok) {
		throw new Error(`Failed to fetch cohorts: ${res.statusText}`);
	}
	return res.json();
}
