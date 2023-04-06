import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  pwd: z.string().min(5, 'Password must be at least 5 characters.')
});

const loginSchema = registerSchema.omit({ name: true });

export const load = (async () => {
  // Server API:
  const registerForm = await superValidate(registerSchema, {
    id: 'register'
  });
  const loginForm = await superValidate(loginSchema, { id: 'login' });

  return { registerForm, loginForm };
}) satisfies PageServerLoad;

export const actions = {
  login: async ({ request }) => {
    const form = await superValidate(request, loginSchema, { id: 'login' });

    if (!form.valid) {
      return fail(400, { form });
    }

    return message(form, 'Login successful!');
  },

  register: async ({ request }) => {
    const form = await superValidate(request, registerSchema, { id: 'register' });

    if (!form.valid) {
      return fail(400, { form });
    }

    return message(form, 'Registration successful!');
  }
} satisfies Actions;
