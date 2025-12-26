import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const exchangeUrl = process.env.EXCHANGE_URL || 'ws://127.0.0.1:8080';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: exchangeUrl,
				ws: true
			}
		}
	},
	ssr: {
		noExternal: ['@kinde-oss/kinde-auth-pkce-js']
	},
	optimizeDeps: { include: ['schema-js'] },
	build: {
		commonjsOptions: {
			include: [/schema-js/, /node_modules/]
		}
	}
});
