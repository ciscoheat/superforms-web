import { searchEngine } from '$lib/indexSite';
import { search, type Orama } from '@orama/orama';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

let engine: Orama;

export const GET = (async ({ url }) => {
  if (!engine) engine = await searchEngine(true);

  const term = url.searchParams.get('q');
  if (!term || term.length == 1) return json({});
  const result = await search(engine, {
    term,
    tolerance: 2,
    limit: 8,
    boost: {
      title: 2
    }
  });
  return json(
    result.hits.map((h) => {
      const { title, hash, url } = h.document;
      return { title, hash, url };
    })
  );
}) satisfies RequestHandler;
