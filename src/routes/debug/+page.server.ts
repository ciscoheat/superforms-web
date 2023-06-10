import { lstatSync, readdirSync } from 'fs';
import path from 'path';

type Dir = {
  path: string;
  files: string[];
  dirs: string[];
  sep: '\\' | '/';
};

function file(path: string, isDir: boolean) {
  try {
    const stat = lstatSync(path);
    if (isDir && stat.isDirectory()) return true;
    if (!isDir && !stat.isDirectory()) return true;
  } catch (e) {
    console.log(e);
  }
  return false;
}

function dir(directory: string): Dir {
  try {
    const files = readdirSync(directory);
    return {
      path: path.resolve(directory),
      files: files.filter((f) => file(path.join(directory, f), false)),
      dirs: ['..'].concat(
        files.filter((f) => file(path.join(directory, f), true))
      ),
      sep: path.sep
    };
  } catch (e) {
    return { path: directory, files: [String(e)], dirs: [], sep: path.sep };
  }
}

export const load = (async ({ url, fetch }) => {
  const data = await fetch('/oramadb.json');
  return {
    db: (await data.text()).length,
    browser: dir(url.searchParams.get('dir') ?? process.cwd())
  };
})
