import { goto } from '$app/navigation';

const STORAGE_KEY = 'testAuth';

export interface TestUser {
	name: string;
	kindeId: string;
	isAdmin: boolean;
}

interface TestAuthStorage {
	currentUser: TestUser | null;
	recentUsers: TestUser[];
}

function loadFromStorage(): TestAuthStorage {
	if (typeof localStorage === 'undefined') {
		return { currentUser: null, recentUsers: [] };
	}
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch {
		// Ignore parse errors
	}
	return { currentUser: null, recentUsers: [] };
}

function saveToStorage(state: TestAuthStorage) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initialState = loadFromStorage();

let currentUser = $state<TestUser | null>(initialState.currentUser);
let recentUsers = $state<TestUser[]>(initialState.recentUsers);

function persistState() {
	saveToStorage({ currentUser, recentUsers });
}

export const testAuthState = {
	get currentUser() {
		return currentUser;
	},
	get recentUsers() {
		return recentUsers;
	},
	login(user: TestUser) {
		currentUser = user;
		// Add to recent users if not already there (by kindeId)
		const existingIndex = recentUsers.findIndex((u) => u.kindeId === user.kindeId);
		if (existingIndex >= 0) {
			// Update existing entry and move to front
			recentUsers.splice(existingIndex, 1);
		}
		recentUsers = [user, ...recentUsers].slice(0, 10); // Keep max 10 recent users
		persistState();
	},
	logout() {
		currentUser = null;
		persistState();
	},
	removeRecent(kindeId: string) {
		recentUsers = recentUsers.filter((u) => u.kindeId !== kindeId);
		persistState();
	}
};

export function generateKindeId(name: string): string {
	return name.toLowerCase().replace(/\s+/g, '-');
}

export function generateTestToken(user: TestUser): string {
	return `test::${user.kindeId}::${user.name}::${user.isAdmin}`;
}

export const testKinde = {
	async login() {
		await goto('/login');
	},
	async register() {
		await goto('/login');
	},
	async logout() {
		testAuthState.logout();
		await goto('/login');
	},
	async isAuthenticated() {
		return testAuthState.currentUser !== null;
	},
	async getToken() {
		if (!testAuthState.currentUser) return undefined;
		return generateTestToken(testAuthState.currentUser);
	},
	async getIdToken() {
		return null;
	},
	async getUser() {
		if (!testAuthState.currentUser) return null;
		return { given_name: testAuthState.currentUser.name };
	},
	async isAdmin() {
		return testAuthState.currentUser?.isAdmin ?? false;
	}
};
