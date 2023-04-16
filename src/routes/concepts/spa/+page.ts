import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';

export const _userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email()
});

export const load = async () => {
  const form = await superValidate(
    {
      id: 1,
      name: 'SPA user',
      email: 'spa@spam.web'
    },
    _userSchema
  );

  return { form };
};
