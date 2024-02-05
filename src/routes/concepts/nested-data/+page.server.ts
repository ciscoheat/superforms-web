import { echoLoad, echoActions } from '$lib/echo';
import { schema } from './schema.js';

export const load = echoLoad(schema);
export const actions = echoActions(schema);
