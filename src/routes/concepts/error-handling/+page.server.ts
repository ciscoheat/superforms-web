import { echoActions } from '$lib/echo';
import { superValidate } from 'sveltekit-superforms/server';
import { schema } from './schema.js';

export const load = (async () => {
  const form = await superValidate(schema)
  const customValidity = await superValidate(schema, {
    id: 'customValidity'
  })

  return {form, customValidity}
});

export const actions = echoActions(schema);
