import { kinde } from './auth.svelte';
import { API_BASE } from './apiBase';

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
	initial_balance: string | null;
	balance: number | null;
}

export interface GlobalConfig {
	active_auction_cohort_id: number | null;
	default_cohort_id: number | null;
	public_auction_enabled: boolean;
}

export interface GlobalUser {
	id: number;
	kinde_id: string;
	display_name: string;
	is_admin: boolean;
	email: string | null;
}

export interface UserCohortDetail {
	cohort_name: string;
	cohort_display_name: string;
	balance: number | null;
}

export interface UserWithCohorts extends GlobalUser {
	cohorts: UserCohortDetail[];
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
	const res = await fetch(`${API_BASE}/api/admin/cohorts`, { headers: await authHeaders() });
	return handleResponse(res);
}

export async function createCohort(
	name: string,
	displayName: string,
	existingDb?: boolean
): Promise<CohortInfo> {
	const res = await fetch(`${API_BASE}/api/admin/cohorts`, {
		method: 'POST',
		headers: await authHeaders(),
		body: JSON.stringify({ name, display_name: displayName, existing_db: existingDb ?? false })
	});
	return handleResponse(res);
}

export async function updateCohort(
	name: string,
	displayName?: string,
	isReadOnly?: boolean
): Promise<void> {
	const res = await fetch(`${API_BASE}/api/admin/cohorts/${name}`, {
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
	const res = await fetch(`${API_BASE}/api/admin/cohorts/${cohortName}/members`, {
		headers: await authHeaders()
	});
	return handleResponse(res);
}

export async function fetchGlobalUsers(): Promise<GlobalUser[]> {
	const res = await fetch(`${API_BASE}/api/admin/users`, { headers: await authHeaders() });
	return handleResponse(res);
}

export async function fetchUsersDetailed(): Promise<UserWithCohorts[]> {
	const res = await fetch(`${API_BASE}/api/admin/users/details`, { headers: await authHeaders() });
	return handleResponse(res);
}

export async function batchAddMembers(
	cohortName: string,
	opts: { emails?: string[]; user_ids?: number[]; initial_balance?: string }
): Promise<{ added: number; already_existing: number }> {
	const res = await fetch(`${API_BASE}/api/admin/cohorts/${cohortName}/members`, {
		method: 'POST',
		headers: await authHeaders(),
		body: JSON.stringify(opts)
	});
	return handleResponse(res);
}

export async function removeMember(cohortName: string, memberId: number): Promise<void> {
	const res = await fetch(`${API_BASE}/api/admin/cohorts/${cohortName}/members/${memberId}`, {
		method: 'DELETE',
		headers: await authHeaders()
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function fetchConfig(): Promise<GlobalConfig> {
	const res = await fetch(`${API_BASE}/api/admin/config`, { headers: await authHeaders() });
	return handleResponse(res);
}

export async function checkAdminAccess(): Promise<boolean> {
	try {
		const res = await fetch(`${API_BASE}/api/admin/config`, { headers: await authHeaders() });
		return res.ok;
	} catch {
		return false;
	}
}

export async function updateConfig(config: {
	active_auction_cohort_id?: number | null;
	default_cohort_id?: number | null;
	public_auction_enabled?: boolean;
}): Promise<void> {
	const res = await fetch(`${API_BASE}/api/admin/config`, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify(config)
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function fetchAvailableDbs(): Promise<string[]> {
	const res = await fetch(`${API_BASE}/api/admin/available-dbs`, { headers: await authHeaders() });
	return handleResponse(res);
}

export async function toggleAdmin(userId: number, isAdmin: boolean): Promise<void> {
	const res = await fetch(`${API_BASE}/api/admin/users/${userId}/admin`, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify({ is_admin: isAdmin })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function updateDisplayName(userId: number, displayName: string): Promise<void> {
	const res = await fetch(`${API_BASE}/api/admin/users/${userId}/display-name`, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify({ display_name: displayName })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function deleteUser(userId: number): Promise<void> {
	const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
		method: 'DELETE',
		headers: await authHeaders()
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function updateMyDisplayName(displayName: string): Promise<void> {
	const res = await fetch(`${API_BASE}/api/users/me/display-name`, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify({ display_name: displayName })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}

export async function updateMemberInitialBalance(
	cohortName: string,
	memberId: number,
	initialBalance: string | null
): Promise<void> {
	const res = await fetch(`${API_BASE}/api/admin/cohorts/${cohortName}/members/${memberId}`, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify({ initial_balance: initialBalance })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
}
