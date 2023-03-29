import { fail, type RequestEvent } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import type { ZodEffects, AnyZodObject } from 'zod';

type ZodValidation<T extends AnyZodObject> = T | ZodEffects<T> | ZodEffects<ZodEffects<T>>;

export function echo<T extends AnyZodObject, S extends ZodValidation<T>, E extends RequestEvent>(
	schema: S
) {
	return async (event: E) => {
		const form = await superValidate(event, schema);

		if (!form.valid) {
			return fail(400, { form });
		}

		return { form };
	};
}
