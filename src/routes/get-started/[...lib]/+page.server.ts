import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { echo } from '$lib/echo';

export const _schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = (async ({ params }) => {
  const form = await superValidate(_schema);
  return { form, lib: params.lib };
})

export const actions = {
  default: echo(_schema)
} 
