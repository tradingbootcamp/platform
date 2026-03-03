import { kinde } from './auth.svelte';

export interface CohortInfo {
	id: number;
	name: string;
	display_name: string;
	db_path: string;
	is_read_only: boolean;
}

export interface CohortMember {
	id: number;
	cohort_id: number;
	global_user_id: number | null;
	email: string | null;
	display_name: string | null;
}

export interface GlobalConfig {
	active_auction_cohort_id: number | null;
	public_auction_enabled: boolean;
}

async function authHeaders(): Promise<HeadersInit> {
	const token = await kinde.getToken();
	return {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json'
	};
}

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	return res.json();
}

export async function fetchAllCohorts(): Promise<CohortInfo[]> {
	const res = await fetch('/api/admin/cohorts', { headers: await authHeaders() });
	return handleResponse(res);
}

export async function createCohort(
	name: string,
	displayName: string,
	dbPath: string
): Promise<CohortInfo> {
	const res = await fetch('/api/admin/cohorts', {
		method: 'POST',
		headers: await authHeaders(),
		body: JSON.stringify({ name, display_name: displayName, db_path: dbPath })
	});
	return handleResponse(res);
}

export async function updateCohort(
	name: string,
	displayName?: string,
	isReadOnly?: boolean
): Promise<void> {
	const res = await fetch(`/api/admin/cohorts/${name}`, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify({ display_name: displayName, is_read_only: isReadOnly })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function fetchMembers(cohortName: string): Promise<CohortMember[]> {
	const res = await fetch(`/api/admin/cohorts/${cohortName}/members`, {
		headers: await authHeaders()
	});
	return handleResponse(res);
}

export async function batchAddMembers(
	cohortName: string,
	emails: string[]
): Promise<{ added: number; already_existing: number }> {
	const res = await fetch(`/api/admin/cohorts/${cohortName}/members`, {
		method: 'POST',
		headers: await authHeaders(),
		body: JSON.stringify({ emails })
	});
	return handleResponse(res);
}

export async function removeMember(cohortName: string, memberId: number): Promise<void> {
	const res = await fetch(`/api/admin/cohorts/${cohortName}/members/${memberId}`, {
		method: 'DELETE',
		headers: await authHeaders()
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function fetchConfig(): Promise<GlobalConfig> {
	const res = await fetch('/api/admin/config', { headers: await authHeaders() });
	return handleResponse(res);
}

export async function updateConfig(config: {
	active_auction_cohort_id?: number;
	public_auction_enabled?: boolean;
}): Promise<void> {
	const res = await fetch('/api/admin/config', {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify(config)
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function toggleAdmin(userId: number, isAdmin: boolean): Promise<void> {
	const res = await fetch(`/api/admin/users/${userId}/admin`, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify({ is_admin: isAdmin })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}
