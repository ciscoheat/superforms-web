import { echoActions } from '$lib/echo';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { schema } from './schema.js';

export const load = (async () => {
  const form = await superValidate(zod(schema))
  const customValidity = await superValidate(zod(schema), {
    id: 'customValidity'
  })

  return {form, customValidity}
});

export const actions = echoActions(schema);
