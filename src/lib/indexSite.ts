import { create, insert } from '@orama/orama';
import fg from 'fast-glob';
import fs from 'fs/promises';
import { normalizePath } from 'vite';
import { restore } from '@orama/plugin-data-persistence';
import { persistToFile } from '@orama/plugin-data-persistence/server';
import { marked } from 'marked';
import path, { dirname } from 'path';
import GithubSlugger from 'github-slugger';

type Schema = {
  title: string;
  hash: string;
  //depth: number;
  url: string;
  content: string;
  code: string;
};

async function siteSchema() {
  return await create({
    schema: {
      title: 'string',
      hash: 'string',
      //depth: 'number',
      url: 'string',
      content: 'string',
      code: 'string'
    }
  });
}

const file = '/oramadb.json';
const persistedDB = 'static' + file;

let _search = await siteSchema();

export async function searchEngine(load?: typeof fetch) {
  if (load) {
    const data = await load(file);
    _search = (await restore(
      'json',
      await data.text()
    )) as unknown as typeof _search;
  }
  return _search;
}

let currentUrl: string;
let currentSection: Schema | undefined;
//let sectionCount = 0;

async function insertCurrentSection() {
  if (!currentSection) return;

  currentSection.content = currentSection.content.trim();
  if (currentSection.content) {
    /*
    console.log('🚀 ~ NEW SECTION ~', currentSection.title + ':');
    console.log(currentSection.content);
    console.log('---------------------------------------------');
    */

    currentSection.title = currentSection.title.trim();
    await insert(_search, currentSection);
    //sectionCount++;
  }

  currentSection = undefined;
}

async function index(file: string) {
  file = normalizePath(file);
  //console.log('[orama] Indexing', file);

  let fileContent = await fs.readFile(file, { encoding: 'utf-8' });

  const parsedTitle = fileContent.match(
    /<Head.*title="([^"]+)"/
  );

  if (!parsedTitle) {
    throw new Error(
      file +
        ' does not have a title. Add with <svelte:head><title></title></svelte:head>'
    );
  } else {
    fileContent = fileContent
      .replace(parsedTitle[0], '\n')
      .replace(/<script.*?<\/script>/, '');

    currentUrl = path.dirname(file.replace(/^src\/routes\//, '/'));

    newSection(parsedTitle[1]);
    //sectionCount = 0;

    marked.parse(fileContent);

    await insertCurrentSection();
  }

  //console.log('[orama] added', sectionCount, 'sections.');
}

function newSection(title: string) {
  currentSection = {
    title,
    hash: new GithubSlugger().slug(title),
    url: currentUrl,
    content: '',
    code: ''
    //depth: token.depth,
  };
}

let skip = 0;

marked.use({
  walkTokens: (token) => {
    if (skip > 0) {
      skip--;
      return;
    }

    if (token.type === 'heading' && !/^\d\./.test(token.text)) {
      insertCurrentSection();
      newSection(token.text.trim());
      skip = 1;
    } else if (
      currentSection &&
      ['text', 'space', 'codespan'].includes(token.type)
    ) {
      currentSection.content += token.raw.replaceAll(/```\w*[\r\n]/g, '');
    } else if (currentSection && token.type == 'code') {
      currentSection.code += token.text + '\n';
    }
  }
});

export async function indexSite() {
  console.log('Indexing site...');
  _search = await siteSchema();
  await fs.mkdir(dirname(persistedDB), { recursive: true });
  try {
    await fs.rm(persistedDB);
  } catch {
    //
  }
  await indexSitePath(persistedDB);
}

export async function indexSitePath(persistTo?: string) {
  for (const file of await fg('**/+page.md')) {
    // Skip start page
    if (file === 'src/routes/+page.md') continue;
    await index(file);
  }

  if (persistTo) await persistToFile(_search, 'json', persistTo);
}
