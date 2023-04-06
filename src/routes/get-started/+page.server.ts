import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { echo } from '$lib/echo';

export const _schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = (async () => {
  const form = await superValidate(_schema);
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  default: echo(_schema)
} satisfies Actions;
