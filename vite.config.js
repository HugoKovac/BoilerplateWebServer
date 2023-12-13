import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import http from "https";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [sveltekit(), purgeCss()],
		server: {
			proxy: {
				'/api': {
					target: env.VITE_API_BASE_URL,
					changeOrigin: true,
					secure: false,
					agent: new http.Agent()
				}
			}
		}
	}
});

