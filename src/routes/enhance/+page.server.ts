import { z } from 'zod';
import { echoLoad, echoActions } from '$lib/echo';

export const _schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = echoLoad(_schema);
export const actions = echoActions(_schema);
