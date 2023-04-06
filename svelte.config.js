import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
//import addClasses from 'rehype-add-classes';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  extensions: ['.svelte', '.md', '.svx', '.svelte.md'],

  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md', '.svx', '.svelte.md'],
      layout: './src/lib/mdsvex/MarkdownLayout.svelte',
      rehypePlugins: [
        [
          rehypeExternalLinks,
          {
            target: (el) => {
              return el.properties?.href?.startsWith('http')
                ? '_blank'
                : undefined;
            }
          }
        ],
        [rehypeSlug, {}]
      ]
    })
  ],

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter()
  }
};

export default config;
