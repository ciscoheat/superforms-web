import { fail, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { ZodEffects, AnyZodObject } from 'zod';

type ZodValidation<T extends AnyZodObject> =
  | T
  | ZodEffects<T>
  | ZodEffects<ZodEffects<T>>;

export function echo<
  T extends AnyZodObject,
  S extends ZodValidation<T>,
  E extends RequestEvent
>(schema: S, debug = false) {
  return async (event: E) => {
    const form = await superValidate(event, schema);

    if (debug) console.log('POST', form);

    if (!form.valid) {
      return fail(400, { form });
    }

    return message(form, 'Form posted!');
  };
}

export function echoLoad<T extends AnyZodObject, S extends ZodValidation<T>>(
  schema: S
) {
  return async function load(event: ServerLoadEvent) {
    const form = await superValidate(event, schema);
    return { form };
  };
}

export function echoActions<T extends AnyZodObject, S extends ZodValidation<T>>(
  schema: S,
  debug = false
) {
  return {
    default: echo(schema, debug)
  };
}

export function echoPage<T extends AnyZodObject, S extends ZodValidation<T>>(
  schema: S
) {
  return {
    load: echoLoad(schema),
    actions: echoActions(schema)
  };
}
