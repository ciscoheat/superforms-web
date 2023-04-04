# FAQ

### I want to reuse common options, how to do that easily?

When you start to configure the library to suit your stack, it's recommended to create an object with default options that you will refer to instead:

```ts
import { superForm } from 'sveltekit-superforms/client';
import type { AnyZodObject } from 'zod';

export type Message = { status: 'success' | 'error'; text: string };

export function yourSuperForm<T extends AnyZodObject>(
  ...params: Parameters<typeof superForm<T>>
) {
  return superForm<T, Message>(params[0], {
    // Your defaults here
    errorSelector: '.has-error',
    delayMs: 300,
    ...params[1]
  });
}
```

---

### How to handle file uploads?

Currently, file uploads are not handled with Superforms. The recommended way to do it is to grab the `FormData` and extract the files from there, after validation:

```ts
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) return fail(400, { form });

    const file = formData.get('file');
    if (file instanceof File) {
      // Do something with the file.
    }

    return { form };
  }
} satisfies Actions;
```

---

### Can I use endpoints instead of form actions?

Yes, there is a helper function for constructing an `ActionResult` that can be returned from [endpoints](https://kit.svelte.dev/docs/routing#server). See [the API reference](/api#actionresulttype-data-status) for more information!

---

### Can a form be factored out into a separate component?

A separate component for each form can be useful, in modal components for example, and if you have more than a couple of forms on the same page, since then you have to deconstruct a lot of properties for each one.

To do this, you need the type of the schema, which can be defined as such:

```ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: ...
});

export type LoginSchema = typeof loginSchema;
```

Now you can import and use this type in a separate component:

**LoginForm.svelte**

```svelte
<script lang="ts">
  import type { Validation } from 'sveltekit-superforms';
  import type { UserSchema } from '$lib/schemas';
  import { superForm } from 'sveltekit-superforms/client'

  export let data: Validation<LoginSchema>;

  const { form, errors, enhance, ... } = superForm(data);
</script>

<form method="POST" use:enhance>
  <!-- Business as usual -->
</form>
```

Use it by passing the data from `+page.svelte` to the component:

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<LoginForm data={data.loginForm} />
```
