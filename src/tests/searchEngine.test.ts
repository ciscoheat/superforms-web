import { assert, expect, test } from 'vitest';
import { searchEngine } from '$lib/indexSite';
import { search } from '@orama/orama';

const engine = await searchEngine();

test('Search engine', async () => {
  const term = 'event';
  const result = await search(engine, {
    term,
    tolerance: 1,
    limit: 8,
    boost: {
      title: 2
    }
  });
  console.dir(result, { depth: 5 });
});
