import { z } from 'zod';
import { echoLoad, echoActions } from '$lib/echo';

const _schema = z.object({
  date: z.date().min(new Date(), 'Must select a date after today.')
});

export const load = echoLoad(_schema);
export const actions = echoActions(_schema);
