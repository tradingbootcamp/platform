import { PUBLIC_SERVER_URL } from '$env/static/public';

// Derive HTTP base URL from the WebSocket PUBLIC_SERVER_URL
// e.g. "wss://host.fly.dev/api" → "https://host.fly.dev"
// e.g. "ws://localhost:8080" → "http://localhost:8080"
// e.g. "/api" (dev mode) → "" (relative, Vite proxy handles it)
function deriveApiBase(serverUrl: string): string {
	try {
		const wsUrl = new URL(serverUrl);
		const protocol = wsUrl.protocol === 'wss:' ? 'https:' : 'http:';
		return `${protocol}//${wsUrl.host}`;
	} catch {
		// Relative URL (e.g. "/api" in dev mode) — use empty base for relative fetch
		return '';
	}
}
export const API_BASE = deriveApiBase(PUBLIC_SERVER_URL);
