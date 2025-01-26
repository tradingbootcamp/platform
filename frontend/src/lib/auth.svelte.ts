import {
	PUBLIC_KINDE_CLIENT_ID,
	PUBLIC_KINDE_DOMAIN,
	PUBLIC_KINDE_REDIRECT_URI
} from '$env/static/public';
import createKindeClient from '@kinde-oss/kinde-auth-pkce-js';

const kindePromise = createKindeClient({
	audience: 'trading-server-api',
	client_id: PUBLIC_KINDE_CLIENT_ID,
	domain: PUBLIC_KINDE_DOMAIN,
	redirect_uri: PUBLIC_KINDE_REDIRECT_URI || `${window.location.protocol}//${window.location.host}`
});

export const kinde = {
	async login() {
		const kinde = await kindePromise;
		kinde.login();
	},
	async logout() {
		const kinde = await kindePromise;
		kinde.logout();
	},
	async isAuthenticated() {
		const kinde = await kindePromise;
		return kinde.isAuthenticated();
	},
	async getToken() {
		const kinde = await kindePromise;
		return kinde.getToken();
	},
	async getIdToken() {
		const kinde = await kindePromise;
		return kinde.getIdToken();
	},
	async getUser() {
		const kinde = await kindePromise;
		return kinde.getUser();
	},
	async isAdmin() {
		const kinde = await kindePromise;
		const roles = kinde.getClaim('roles');
		// @ts-expect-error not bothering to validate roles
		return !!roles?.value?.find(({ key }) => key === 'admin');
	},
	async getUserName() {
		const kinde = await kindePromise;
		const claim = kinde.getClaim('name', 'id_token');
		return claim?.value as string | undefined;
	}
};
