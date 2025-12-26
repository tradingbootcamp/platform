import createClient from 'openapi-fetch';
import type { paths } from './api.generated';
import { PUBLIC_SERVER_URL } from '$env/static/public';

// Convert WebSocket URL to HTTP URL
const httpUrl = PUBLIC_SERVER_URL.replace(/^ws/, 'http');

export const scenariosApi = createClient<paths>({ baseUrl: httpUrl });
