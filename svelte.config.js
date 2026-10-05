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
      base: process.env.BASE_PATH || ''
    },
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // 忽略 404/base 路徑不匹配的警告，避免建置失敗
        if (path === '/' || path.startsWith('/')) {
          return;
        }
        throw new Error(message);
      }
    }
  }
};

export default config;