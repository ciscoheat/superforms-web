import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import traverse from 'traverse-fs';
import path from 'path';
import fs from 'fs/promises';

export default defineConfig(({ command }) => ({
  plugins: [sveltekit(), indexSite(command)],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
}));

const src = 'src/routes';

function indexSite(command: string) {
  return {
    name: 'index-site',

    async buildStart() {
      if (command == 'serve') return;
      return traverse.dir(
        src,
        true,
        async (dir: string, file: { name: string }) => {
          if (file.name.includes('+page.md')) {
            const fileName = path.normalize(path.join(dir, file.name));
            const route = fileName.slice(src.length + 1);

            this.emitFile({
              type: 'asset',
              fileName: path.join('orama', route),
              source: await fs.readFile(fileName)
            });
            //console.log(fileName, route);
          }
          //else console.log('No match', dir, file.name);
        }
      );
    }
  } as Plugin;
}
