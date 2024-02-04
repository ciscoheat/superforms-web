import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  pwd: z.string().min(5, 'Password must be at least 5 characters.')
});

const loginSchema = registerSchema.omit({ name: true });

export const load = (async () => {
  // Server API:
  const registerForm = await superValidate(zod(registerSchema), {
    id: 'register'
  });
  const loginForm = await superValidate(zod(loginSchema), { id: 'login' });

  return { registerForm, loginForm };
})

export const actions = {
  login: async ({ request }) => {
    const form = await superValidate(request, zod(loginSchema), { id: 'login' });

    if (!form.valid) {
      return fail(400, { form });
    }

    return message(form, 'Login successful!');
  },

  register: async ({ request }) => {
    const form = await superValidate(request, zod(registerSchema), { id: 'register' });

    if (!form.valid) {
      return fail(400, { form });
    }

    return message(form, 'Registration successful!');
  }
}
