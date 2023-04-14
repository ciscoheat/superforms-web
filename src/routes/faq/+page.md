# FAQ

<svelte:head><title>FAQ</title></svelte:head>

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

Currently, file uploads are not handled with Superforms. Fields containing files will be `undefined` in `form.data` after validation. The recommended way to handle files is to grab the `FormData` and extract the files from there, after validation:

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
}
```

---

### Can I use endpoints instead of form actions?

Yes, there is a helper function for constructing an `ActionResult` that can be returned from [endpoints](https://kit.svelte.dev/docs/routing#server). See [the API reference](/api#actionresulttype-data-options--status) for more information!

---

### Can a form be factored out into a separate component?

This question now has its own [article page here](/components).
