import { z } from 'zod';
import { echoActions } from '$lib/echo';
import { superValidate } from 'sveltekit-superforms/server';

const _schema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

export const load = (async () => {
  const form = await superValidate(_schema)
  const customValidity = await superValidate(_schema, {
    id: 'customValidity'
  })

  return {form, customValidity}
});

export const actions = echoActions(_schema);
