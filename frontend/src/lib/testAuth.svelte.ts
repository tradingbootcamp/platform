import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export interface TestUser {
	name: string;
	kindeId: string;
	isAdmin: boolean;
}

const STORAGE_KEY = 'testAuthUser';

function loadUser(): TestUser | null {
	if (!browser) return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return null;
	try {
		return JSON.parse(stored);
	} catch {
		return null;
	}
}

function saveUser(user: TestUser | null) {
	if (!browser) return;
	if (user) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}
}

let currentUser = $state<TestUser | null>(loadUser());

export const testAuthState = {
	get currentUser() {
		return currentUser;
	},
	login(user: TestUser) {
		currentUser = user;
		saveUser(user);
	},
	logout() {
		currentUser = null;
		saveUser(null);
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
		localStorage.removeItem('actAs');
		localStorage.removeItem('sudoEnabled');
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
		if (!testAuthState.currentUser) return null;
		return generateTestToken(testAuthState.currentUser);
	},
	async getUser() {
		if (!testAuthState.currentUser) return null;
		return { given_name: testAuthState.currentUser.name };
	},
	async isAdmin() {
		return testAuthState.currentUser?.isAdmin ?? false;
	}
};
