//import { indexSite } from './src/lib/indexSite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(async ({ command, mode }) => {
  //if (mode == 'development') await indexSite();
  return {
    plugins: [sveltekit()],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}']
    }
  };
});
