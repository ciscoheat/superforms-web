import { z } from 'zod';
import { echoLoad } from '$lib/echo';
import { superValidate, message } from 'sveltekit-superforms/server';
import { error, fail } from '@sveltejs/kit';

const _schema = z.object({
  delay: z.number().int().nonnegative().max(15000).default(1900)
});

export const load = echoLoad(_schema);
export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, _schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(form.data.delay, 9900))
    );

    if (form.data.delay >= 10000) throw error(504, 'Request timeout');

    return message(form, 'Form posted successfully!');
  }
}
