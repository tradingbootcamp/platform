import { goto } from '$app/navigation';

export interface TestUser {
	name: string;
	kindeId: string;
	isAdmin: boolean;
}

let currentUser = $state<TestUser | null>(null);

export const testAuthState = {
	get currentUser() {
		return currentUser;
	},
	login(user: TestUser) {
		currentUser = user;
	},
	logout() {
		currentUser = null;
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
