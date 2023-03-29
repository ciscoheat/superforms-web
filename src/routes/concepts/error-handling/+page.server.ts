import { z } from 'zod';
import { echoLoad, echoActions } from '$lib/echo';

const _schema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

export const load = echoLoad(_schema);
export const actions = echoActions(_schema);
