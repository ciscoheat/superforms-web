import { indexSite } from './src/lib/indexSite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

export default defineConfig(async ({ mode }) => {
  if (mode == 'development') await indexSite();
  return {
    plugins: [
      sveltekit(),
      purgeCss(),
      {
        name: 'index-site',
        async handleHotUpdate(ctx) {
          if (ctx.file.endsWith('+page.md')) {
            await indexSite();
          }
        }
      }
    ],
    build: {
      sourcemap: true
    },
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}']
    }
  };
});
