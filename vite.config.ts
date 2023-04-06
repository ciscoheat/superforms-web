import { indexSite } from './src/lib/indexSite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(async ({ command }) => {
  if (command == 'build') {
    await indexSite('./static/orama.db');
  }
  return {
    plugins: [sveltekit()],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}']
    }
  };
});
