import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:8080',
				changeOrigin: true,
				ws: true,
				timeout: 0, // No timeout
				proxyTimeout: 0,
				configure: (proxy) => {
					proxy.on('error', (err, req, res) => {
						console.error('Proxy error:', err.message);
					});
					proxy.on('proxyReq', (proxyReq, req) => {
						console.log('Proxying:', req.method, req.url);
					});
				}
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
