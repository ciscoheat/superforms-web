import { z } from 'zod';
import { echoLoad } from '$lib/echo';
import type { Actions } from './$types';
import { superValidate, message } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';

const _schema = z.object({
  delay: z.number().int().nonnegative().max(15000).default(1900)
});

export const load = echoLoad(_schema);
export const actions = {
  default: async (event) => {
    const form = await superValidate(event, _schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    await new Promise((resolve) => setTimeout(resolve, form.data.delay));

    return message(form, 'Form posted!');
  }
} satisfies Actions;
