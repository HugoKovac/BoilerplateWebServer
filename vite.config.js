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
				'/dev': {
					target: 'http://localhost:3000',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/dev/, ''),
				},
			}
		}
	}
});

