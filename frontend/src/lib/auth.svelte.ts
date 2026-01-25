import { env } from '$env/dynamic/public';
import { testKinde } from './testAuth.svelte';

const isTestAuth = env.PUBLIC_TEST_AUTH === 'true';

// Only create the real Kinde client when not in test mode
const realKinde = await (async () => {
	if (isTestAuth) {
		// Return a dummy object that won't be used
		return null;
	}

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

	const kindeClient = await createKindeClient({
		audience: 'trading-server-api',
		client_id: PUBLIC_KINDE_CLIENT_ID,
		domain: PUBLIC_KINDE_DOMAIN,
		redirect_uri:
			PUBLIC_KINDE_REDIRECT_URI || `${window.location.protocol}//${window.location.host}`
	});

	return {
		async login() {
			console.log('Logging in...');
			kindeClient.login();
			console.log('Login completed');
		},
		async register() {
			console.log('Registering...');
			kindeClient.register();
		},
		async logout() {
			console.log('Logging out...');
			kindeClient.logout();
		},
		async isAuthenticated() {
			console.trace('Checking authentication...');
			return kindeClient.isAuthenticated();
		},
		async getToken() {
			console.log('Getting token...');
			console.log('got token...');
			console.log(kindeClient);
			console.log(await kindeClient.getToken());
			return kindeClient.getToken();
		},
		async getIdToken() {
			console.log('Getting ID token...');
			return kindeClient.getIdToken();
		},
		async getUser() {
			console.log('Getting user...');
			return kindeClient.getUser();
		},
		async isAdmin() {
			console.log('Checking admin status...');
			const roles = kindeClient.getClaim('roles');
			// @ts-expect-error not bothering to validate roles
			return Boolean(roles?.value?.find(({ key }) => key === 'admin'));
		}
	};
})();

export const kinde = isTestAuth ? testKinde : realKinde!;
