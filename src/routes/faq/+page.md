# FAQ

<svelte:head><title>FAQ</title></svelte:head>

### I see the data in $form, but it's not posted to the server?

The most common mistake is to forget the `name` attribute on the input field. If you're not using `dataType: 'json'` (see [nested data](/concepts/nested-data)), the form is treated as a normal HTML form, which requires a name attribute for posting the form data.

---

### How to handle file uploads?

File uploads are not handled by Superforms. Fields containing files will be `undefined` in `form.data` after validation. The recommended way to handle files is to grab the `FormData` and extract the files from there, after validation:

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

---

### I want to reuse common options, how to do that easily?

When you start to configure the library to suit your stack, you can create an object with default options that you will refer to instead of `superForm`:

```ts
import type { ZodValidation } from 'sveltekit-superforms';
import { superForm as realSuperForm } from 'sveltekit-superforms/client';
import type { AnyZodObject } from 'zod';

export type Message = { 
  status: 'success' | 'error' | 'warning'; 
  text: string 
};

export function superForm<T extends ZodValidation<AnyZodObject>>(
  ...params: Parameters<typeof realSuperForm<T, Message>>
) {
  return realSuperForm<T, Message>(params[0], {
    // Your defaults here
    errorSelector: '.has-error',
    delayMs: 300,
    ...params[1]
  });
}
```
