import { indexSite } from './src/lib/indexSite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type HmrContext } from 'vite';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';

export default defineConfig(async ({ mode }) => {
  if (mode == 'development') await indexSite();
  return {
    plugins: [
      sveltekit(),
      purgeCss(),
      {
        name: 'index-site',
        async handleHotUpdate(ctx : HmrContext) {
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
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  };
});
