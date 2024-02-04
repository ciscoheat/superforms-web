import { fail, type RequestEvent } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters'
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
    const form = await superValidate(event, zod(schema));

    if (debug) console.log('POST', form);

    if (!form.valid) {
      return fail(400, { form });
    }

    return message(form, 'Form posted successfully!');
  };
}

export function echoLoad<T extends AnyZodObject, S extends ZodValidation<T>>(
  schema: S
) {
  return async function load() {
    const form = await superValidate(zod(schema))
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
