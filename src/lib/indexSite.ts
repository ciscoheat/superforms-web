import { create, insert } from '@orama/orama';
import fg from 'fast-glob';
import fs from 'fs/promises';
import { normalizePath } from 'vite';
import { persistToFile } from '@orama/plugin-data-persistence';
import { marked } from 'marked';
import path from 'path';
import GithubSlugger from 'github-slugger';

type Schema = {
  title: string;
  hash: string;
  //depth: number;
  url: string;
  content: string;
};

function siteSchema() {
  return create({
    schema: {
      title: 'string',
      hash: 'string',
      //depth: 'number',
      url: 'string',
      content: 'string'
    }
  });
}

let _search: Awaited<ReturnType<typeof siteSchema>>;

export async function searchEngine() {
  if (!_search) {
    _search = await siteSchema();
    /*
    try {
      await fs.mkdir('./db');
    } catch {
      //
    }
    await indexSite('./db/searchIndex.json');
    */
    await indexSite();
  }
  return _search;
}

let currentUrl: string;
let currentSection: Schema | undefined;

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
  }

  currentSection = undefined;
}

async function index(file: string) {
  file = normalizePath(file);
  //console.log('🚀 ~ file: indexSite.ts:48 ~ index ~ file:', file);

  let fileContent = await fs.readFile(file, { encoding: 'utf-8' });

  const parsedTitle = fileContent.match(
    /<svelte:head>.*<title>([^<]+)<\/title>.*<\/svelte:head>/
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

    marked.parse(fileContent);

    insertCurrentSection();
  }
}

function newSection(title: string) {
  currentSection = {
    title,
    hash: new GithubSlugger().slug(title),
    url: currentUrl,
    content: ''
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
      ['text', 'space', 'code', 'codespan'].includes(token.type)
    ) {
      currentSection.content += token.raw.replaceAll(/```\w*[\r\n]/g, '');
    }
  }
});

async function indexSite(persistTo?: string) {
  for (const file of await fg('**/+page.md')) {
    if (file === 'src/routes/+page.md') continue;
    await index(file);
  }

  if (persistTo) await persistToFile(_search, 'json', persistTo);
}
