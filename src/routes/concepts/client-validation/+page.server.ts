import { z } from 'zod';
import { echoLoad, echoActions } from '$lib/echo';

const schema = z.object({
  tags: z.string().min(2).array().default(['a', 'svelte'])
});

export const load = echoLoad(schema);
export const actions = echoActions(schema);
