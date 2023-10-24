//import { searchEngine } from '$lib/indexSite';
import { search, type Orama } from '@orama/orama';
import { restore } from '@orama/plugin-data-persistence';
import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';

let engine: Orama;

export const GET = (async ({ url }) => {
  if (!engine) {
    const dbUrl = new URL('/oramadb.json', url)
    const data = await fetch(dbUrl.toString());
    engine = (await restore('json', await data.text())) as unknown as Orama;
  }

  const term = url.searchParams.get('q');
  if (!term || term.length == 1) return json({});
  const result = await search(engine, {
    term,
    properties: ['title', 'content', 'code'],
    tolerance: 1,
    limit: 8,
    boost: {
      title: 6,
      content: 3
    }
  });

  if (dev) {
    console.log(
      `----- ${term} ---------------------------------------------------`
    );
    console.log(result.hits.map((h) => ({ score: h.score, doc: h.document })));
  }

  return json(
    result.hits.map((h) => {
      const { title, hash, url } = h.document;
      return { title, hash, url };
    })
  );
})
