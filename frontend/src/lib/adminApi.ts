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

export interface UserBalance {
	global_user_id: number;
	display_name: string;
	email: string | null;
	balance: number;
}

export interface CohortBalances {
	cohort_name: string;
	cohort_display_name: string;
	members: UserBalance[];
	guests: UserBalance[];
}

export interface AllBalancesResponse {
	cohorts: CohortBalances[];
}

export interface GlobalUser {
	id: number;
	kinde_id: string;
	display_name: string;
	/** Effective admin status — `is_kinde_admin || admin_grant`. */
	is_admin: boolean;
	/** True if the user's last-known Kinde JWT carried the admin role. */
	is_kinde_admin: boolean;
	/** True if an existing admin has granted admin via the Admin page. */
	admin_grant: boolean;
	email: string | null;
}

export interface UserCohortDetail {
	cohort_name: string;
	cohort_display_name: string;
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

export interface AdminOverview {
	cohorts: CohortInfo[];
	config: GlobalConfig;
	available_dbs: string[];
	users: UserWithCohorts[];
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
	const res = await fetch(`${API_BASE}/api/admin/overview`, { headers: await authHeaders() });
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

export async function fetchAllBalances(): Promise<AllBalancesResponse> {
	const res = await fetch(`${API_BASE}/api/admin/balances`, {
		headers: await authHeaders()
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

export interface RenameConflict {
	cohort_name: string;
	cohort_display_name: string;
	suggested_name: string;
}

export type RenameResult =
	| { status: 'ok'; display_name: string }
	| { status: 'needs_confirmation'; conflicts: RenameConflict[] };

export interface MyUser {
	id: number;
	display_name: string;
	email: string | null;
	is_admin: boolean;
}

export async function fetchMyUser(): Promise<MyUser> {
	const res = await fetch(`${API_BASE}/api/users/me`, {
		headers: await authHeaders()
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	return res.json();
}

async function submitDisplayName(
	url: string,
	displayName: string,
	confirmedOverrides: Record<string, string>
): Promise<RenameResult> {
	const res = await fetch(url, {
		method: 'PUT',
		headers: await authHeaders(),
		body: JSON.stringify({
			display_name: displayName,
			confirmed_overrides: confirmedOverrides
		})
	});
	if (res.status === 409) {
		const body = await res.json();
		if (body?.status === 'needs_confirmation') {
			return body as RenameResult;
		}
		// Non-confirmation 409 (e.g. TOCTOU race) — bubble up as an error.
		throw new Error(typeof body === 'string' ? body : (body?.message ?? res.statusText));
	}
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	return res.json();
}

export async function updateDisplayName(
	userId: number,
	displayName: string,
	confirmedOverrides: Record<string, string> = {}
): Promise<RenameResult> {
	return submitDisplayName(
		`${API_BASE}/api/admin/users/${userId}/display-name`,
		displayName,
		confirmedOverrides
	);
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

export async function updateMyDisplayName(
	displayName: string,
	confirmedOverrides: Record<string, string> = {}
): Promise<RenameResult> {
	return submitDisplayName(
		`${API_BASE}/api/users/me/display-name`,
		displayName,
		confirmedOverrides
	);
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
