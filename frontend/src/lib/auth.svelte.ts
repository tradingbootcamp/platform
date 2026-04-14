import { env } from '$env/dynamic/public';
import { testKinde } from './testAuth.svelte';

const isTestAuth = env.PUBLIC_TEST_AUTH === 'true';

// Only create the real Kinde client when not in test mode
const kindePromise = isTestAuth
	? null
	: (async () => {
			const envModule = await import('$env/static/public');
			const PUBLIC_KINDE_CLIENT_ID = envModule.PUBLIC_KINDE_CLIENT_ID;
			const PUBLIC_KINDE_DOMAIN = envModule.PUBLIC_KINDE_DOMAIN;
			const PUBLIC_KINDE_REDIRECT_URI = envModule.PUBLIC_KINDE_REDIRECT_URI;
			const { default: createKindeClient } = await import('@kinde-oss/kinde-auth-pkce-js');

			console.log({
				audience: 'trading-server-api',
				client_id: PUBLIC_KINDE_CLIENT_ID,
				domain: PUBLIC_KINDE_DOMAIN,
				redirect_uri:
					PUBLIC_KINDE_REDIRECT_URI || `${window.location.protocol}//${window.location.host}`
			});

			return createKindeClient({
				audience: 'trading-server-api',
				client_id: PUBLIC_KINDE_CLIENT_ID,
				domain: PUBLIC_KINDE_DOMAIN,
				redirect_uri:
					PUBLIC_KINDE_REDIRECT_URI || `${window.location.protocol}//${window.location.host}`,
				is_dangerously_use_local_storage: true
			});
		})();

const realKinde = {
	async login() {
		console.log('Logging in...');
		const kindeClient = await kindePromise!;
		kindeClient.login();
		console.log('Login completed');
	},
	async register() {
		console.log('Registering...');
		const kindeClient = await kindePromise!;
		kindeClient.register();
	},
	async logout() {
		localStorage.removeItem('actAs');
		localStorage.removeItem('sudoEnabled');
		console.log('Logging out...');
		const kindeClient = await kindePromise!;
		kindeClient.logout();
	},
	async isAuthenticated() {
		console.trace('Checking authentication...');
		const kindeClient = await kindePromise!;
		return kindeClient.isAuthenticated();
	},
	async getToken() {
		console.log('Getting token...');
		const kindeClient = await kindePromise!;
		console.log('got token...');
		console.log(kindeClient);
		console.log(await kindeClient.getToken());
		return kindeClient.getToken();
	},
	async getIdToken() {
		console.log('Getting ID token...');
		const kindeClient = await kindePromise!;
		return kindeClient.getIdToken();
	},
	async getUser() {
		console.log('Getting user...');
		const kindeClient = await kindePromise!;
		return kindeClient.getUser();
	},
	async isAdmin() {
		console.log('Checking admin status...');
		const kindeClient = await kindePromise!;
		const roles = kindeClient.getClaim('roles');
		// @ts-expect-error not bothering to validate roles
		return Boolean(roles?.value?.find(({ key }) => key === 'admin'));
	}
};

export const kinde = isTestAuth ? testKinde : realKinde;
