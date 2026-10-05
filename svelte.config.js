import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/site-v1.01' : ''
		},
		prerender: {
			handleHttpError: ({ path, message }) => {
				if (path === '/' || path.startsWith('/')) return;
				throw new Error(message);
			}
		}
	}
};

export default config;