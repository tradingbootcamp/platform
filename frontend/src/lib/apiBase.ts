import { PUBLIC_SERVER_URL } from '$env/static/public';

// Derive HTTP base URL from the WebSocket PUBLIC_SERVER_URL
// e.g. "wss://host.fly.dev/api" → "https://host.fly.dev"
// e.g. "ws://localhost:8080" → "http://localhost:8080"
const wsUrl = new URL(PUBLIC_SERVER_URL);
const protocol = wsUrl.protocol === 'wss:' ? 'https:' : 'http:';
export const API_BASE = `${protocol}//${wsUrl.host}`;
