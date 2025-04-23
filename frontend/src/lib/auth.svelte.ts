import {
	PUBLIC_KINDE_CLIENT_ID,
	PUBLIC_KINDE_DOMAIN,
	PUBLIC_KINDE_REDIRECT_URI
} from '$env/static/public';
import createKindeClient from '@kinde-oss/kinde-auth-pkce-js';
import { cn } from './utils';

console.log({
	audience: 'trading-server-api',
	client_id: PUBLIC_KINDE_CLIENT_ID,
	domain: PUBLIC_KINDE_DOMAIN,
	redirect_uri: PUBLIC_KINDE_REDIRECT_URI || `${window.location.protocol}//${window.location.host}`
});

const kindePromise = createKindeClient({
	audience: 'trading-server-api',
	client_id: PUBLIC_KINDE_CLIENT_ID,
	domain: PUBLIC_KINDE_DOMAIN,
	redirect_uri: PUBLIC_KINDE_REDIRECT_URI || `${window.location.protocol}//${window.location.host}`
});
// console.log('Kinde client created', await kindePromise);

export const kinde = {
	async login() {
		console.log('Logging in...');
		const kinde = await kindePromise;
		kinde.login();
		console.log('Login completed');
	},
	async register() {
		console.log('Registering...');
		const kinde = await kindePromise;
		kinde.register();
	},
	async logout() {
		console.log('Logging out...');
		const kinde = await kindePromise;
		kinde.logout();
	},
	async isAuthenticated() {
		console.trace('Checking authentication...');
		const kinde = await kindePromise;
		return kinde.isAuthenticated();
	},
	async getToken() {
		console.log('Getting token...');
		const kinde = await kindePromise;
		console.log('got token...');
		console.log(kinde);
		debugger;
		console.log(await kinde.getToken());
		return kinde.getToken();
	},
	async getIdToken() {
		console.log('Getting ID token...');
		const kinde = await kindePromise;
		return kinde.getIdToken();
	},
	async getUser() {
		console.log('Getting user...');
		const kinde = await kindePromise;
		return kinde.getUser();
	},
	async isAdmin() {
		console.log('Checking admin status...');
		const kinde = await kindePromise;
		const roles = kinde.getClaim('roles');
		// @ts-expect-error not bothering to validate roles
		return !!roles?.value?.find(({ key }) => key === 'admin');
	}
};
