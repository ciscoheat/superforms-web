<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# FAQ

<Head title="FAQ" />

### I see the data in $form, but it's not posted to the server?

The most common mistake is to forget the `name` attribute on the input field. If you're not using `dataType: 'json'` (see [nested data](/concepts/nested-data)), the form is treated as a normal HTML form, which requires a name attribute for posting the form data.

---

### How can I return additional data together with the form?

You're not limited to just `return { form }` in load functions and form actions; you can return anything else together with the form variables (which can also be called anything you'd like).

#### From a load function

```ts
export const load = (async ({ locals }) => {
  const loginForm = await superValidate(loginSchema);
  const userName = locals.currentUser.name;
  
  return { loginForm, userName };
})

```

It can then be accessed in `PageData` in `+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

  const { form, errors, enhance } = superForm(data.loginForm);
</script>

<p>Currently logged in as {data.userName}</p>
```

#### From a form action

Returning extra data from a form action is usually most convenient with a strongly typed status message. See the [status message](/concepts/messages) page for an example.

But you can also return it directly, in which case it can be accessed in `ActionData`:

```ts
export const actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, schema);

    if (!form.valid) return fail(400, { form });

    // TODO: Do something with the validated data

    const userName = locals.currentUser.name;
    return { form, userName };
  }
};
```

```svelte
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { superForm } from 'sveltekit-superforms/client'

  export let data: PageData;
  export let form: ActionData;

  // Need to rename form here, since it's used by ActionData.
  const { form: loginForm, errors, enhance } = superForm(data.loginForm);
</script>

{#if form?.userName}
  <p>Currently logged in as {form.userName}</p>
{/if}
```

Using a [status message](/concepts/messages) instead avoids having to import `ActionData` and rename the `form` store.

---

### What about the other way around, posting additional data to the server?

You can add additional input fields to the form that aren't part of the schema, including files (see the next question), to send extra data to the server. They can then be accessed with `request.formData()` in the form action:

```ts
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) return fail(400, { form });

    if (formData.has('extra')) {
      // Do something with the extra data
    }

    return { form };
  }
};
```

You can also add form data programmatically in the [onSubmit](/concepts/events#onsubmit) event:

```ts
const { form, errors, enhance } = superForm(data.loginForm, {
  onSubmit({ formData }) {
    formData.set('extra', 'value')
  }
})
```

The onSubmit event is also a good place to modify `$form`, in case you're using [nested data](/concepts/nested-data) with `dataType: 'json'`.

---

### How to handle file uploads?

File uploads are not directly handled by Superforms. They can be posted as usual, but schema fields containing files will be `undefined` in `form.data` after validation.

The recommended way to handle files is to grab `FormData` from the request and extract the files from there, after validation:

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
};
```

If you want errors for the file field, you can add an optional field to the schema with the same name, and use [setError](/concepts/error-handling#seterror) to set and display an error message.

---

### Can I use endpoints instead of form actions?

Yes, there is a helper function for constructing an `ActionResult` that can be returned from SvelteKit [endpoints](https://kit.svelte.dev/docs/routing#server). See [the API reference](/api#actionresulttype-data-options--status) for more information.

---

### Can I post to an external API?

If the API doesn't return an [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) with the form data, you cannot post to it directly. Instead you can use the [SPA mode](/concepts/spa) of Superforms and call the API with [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) in the `onUpdate` event.

---

### How to submit the form programmatically?

Use the [requestSubmit](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit) method on the form element.

---

### Can a form be factored out into a separate component?

Yes - this question now has its own [article page here](/components).

---

### I'm getting JSON.parse errors as response when submitting a form, why?

This is related to the previous question. You must always return an `ActionResult` as a response to a form submission, either through a form action, where it's done automatically, or by constructing one with the [actionResult](/api#actionresulttype-data-options--status) helper. 

If for some reason a html page or plain text is returned, for example when a proxy server fails to handle the request and returns its own error page, the parsing of the result will fail with the slightly cryptic JSON error message.

---

### Why am I'm getting TypeError: The body has already been consumed?

This happens if you access the form data of the request several times, which could happen when calling `superValidate` multiple times during the same request.

To fix that problem, extract the formData before calling superValidate, and use that as an argument instead of `request` or `event`:

```ts
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const form = await superValidate(formData, schema);
    const form2 = await superValidate(formData, anotherSchema);

    // Business as usual
  }
};
```

---

### Why does the form get tainted without any changes, when I use a select element?

If the schema field for the select menu doesn't have an empty string as default value, for example when it's optional, *and* you have an empty first option, like a "Please choose item" text, the field will be set to the empty string, tainting the form.

It can be fixed by setting the option and the default schema value to an empty string, even if it's not its proper type. See [this section](/default-values#changing-a-default-value) for an example.

---

### Can some other validation library than Zod be used?

Most other popular validation libraries don't allow schema introspection on Zod's level, which makes it difficult to generate default values and constraints. The issue is discussed [here](https://github.com/ciscoheat/sveltekit-superforms/issues/120).

---

### How to customize error messages directly in the Zod schema?

You can add them as parameters to most schema methods. [Here's an example](/concepts/error-handling#customizing-error-messages-in-the-schema).

---

### I want to reuse common options, how to do that easily?

When you start to configure the library to suit your stack, you can create an object with default options that you will refer to instead of `superForm`:

```ts
import type { ZodValidation } from 'sveltekit-superforms';
import { superForm as realSuperForm } from 'sveltekit-superforms/client';
import type { AnyZodObject } from 'zod';

export type Message = {
  status: 'success' | 'error' | 'warning';
  text: string;
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
