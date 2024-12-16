import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { echo } from '$lib/echo';
import { redirect, type ServerLoad } from '@sveltejs/kit';

export const _schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load: ServerLoad = (async ({ params }) => {
  const form = await superValidate(zod(_schema));

  if (params.lib === "@effect/schema") {
    throw redirect(308, '/get-started/effect');
  }

  return { form, lib: params.lib };
})

export const actions = {
  default: echo(_schema)
} 
