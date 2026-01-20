import createClient from 'openapi-fetch';
import type { paths } from './api.generated';
import { PUBLIC_SCENARIOS_SERVER_URL } from '$env/static/public';
import { kinde } from './auth.svelte';

export const scenariosApi = createClient<paths>({ baseUrl: PUBLIC_SCENARIOS_SERVER_URL });

// Add JWT to all requests as query parameter
scenariosApi.use({
	async onRequest({ request }) {
		const token = await kinde.getToken();
		if (token) {
			const url = new URL(request.url);
			url.searchParams.set('token', token);
			return new Request(url, request);
		}
		return request;
	}
});
