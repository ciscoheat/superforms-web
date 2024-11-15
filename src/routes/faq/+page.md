<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# FAQ

<Head title="FAQ" />

### I see the data in $form, but it's not posted to the server?

The most common mistake is to forget the `name` attribute on the input field. If you're not using `dataType: 'json'` (see [nested data](/concepts/nested-data)), the form is treated as a normal HTML form, which requires a name attribute for posting the form data.

---

### How can I prevent the form from being reset after it's submitted?

Use the `resetForm: false` option for `superForm`, as described on the [use:enhance](/concepts/enhance#resetform) page.

---

### Why do I need to call superValidate in the load function?

The object returned from `superValidate`, called [SuperValidated](/api#supervalidate-return-type), is used to instantiate a `superForm`, just like a required argument in a constructor. It contains [constraints](/concepts/client-validation#built-in-browser-validation), [form id](/concepts/multiple-forms) based on the schema, an internal structure for handling errors in [nested data](/concepts/nested-data), potential [initial errors](/concepts/error-handling#initial-form-errors), and more. Therefore you need to call `superValidate` in the load function, so its data can be sent to the client and used when calling `superForm` there.

In special cases you can send an object with just the form data to `superForm`, but that is only for:

- Simple forms with no nested data
- No constraints used
- No initial errors
- Only one form on the page (the [form id](/concepts/multiple-forms) has to be set manually otherwise).

Another reason is that when using a server load function (`+page.server.ts`) to populate the form, the page will work with [SSR](https://kit.svelte.dev/docs/page-options).

---

### How to handle file uploads?

From version 2, file uploads are handled by Superforms. Read all about it on the [file uploads](/concepts/files) page.

---

### Can I use endpoints instead of form actions?

Yes, there is a helper function for constructing an `ActionResult` that can be returned from SvelteKit [endpoints](https://kit.svelte.dev/docs/routing#server). See [the API reference](/api#actionresulttype-data-options--status) for more information.

---

### Can I post to an external API?

If the API doesn't return an [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) with the form data, you cannot post to it directly. Instead you can use the [SPA mode](/concepts/spa) of Superforms and call the API with [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) or similar in the `onUpdate` event.

---

### How to submit the form programmatically?

Use the `submit` method on the `superForm` object.

---

### Can a form be factored out into a separate component?

Yes - the answer has its own [article page here](/components).

---

### How can I return additional data together with the form?

You're not limited to just `return { form }` in load functions and form actions; you can return anything else together with the form variables (which can also be called anything you'd like).

#### From a load function

```ts
export const load = (async ({ locals }) => {
  const loginForm = await superValidate(zod(loginSchema));
  const userName = locals.currentUser.name;
  
  return { loginForm, userName };
})

```

It can then be accessed in `PageData` in `+page.svelte`:

```svelte
<script lang="ts">
  import type { PageData } from './$types.js';
  export let data: PageData;

  const { form, errors, enhance } = superForm(data.loginForm);
</script>

<p>Currently logged in as {data.userName}</p>
```

#### From a form action

Returning extra data from a form action is convenient with a [status message](/concepts/messages) if the data is simple, but for larger data structures you can also return it directly, in which case it can be accessed in the [onUpdate](/concepts/events#onupdate) event, or in `ActionData`:

```ts
export const actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(schema));

    if (!form.valid) return fail(400, { form });

    // Return the username as extra data:
    const userName = locals.currentUser.name;
    return { form, userName };
  }
};
```

**Using onUpdate**

```svelte
<script lang="ts">
  import { superForm, type FormResult } from 'sveltekit-superforms';
  import type { ActionData } from './$types.js';

  export let data;

  const { form, errors, message, enhance } = superForm(data.form, {
    onUpdate({ form, result }) {
      const action = result.data as FormResult<ActionData>;
      if (form.valid && action.userName) {
        // Do something with the extra data
      }
    }
  });
</script>
```

**Using ActionData**

```svelte
<script lang="ts">
  import type { PageData, ActionData } from './$types.js';
  import { superForm } from 'sveltekit-superforms/client'

  export let data: PageData;
  export let form: ActionData;

  // Need to rename form here, since it's used by ActionData.
  const { form: formData, errors, enhance } = superForm(data.form);
</script>

{#if form?.userName}
  <p>Currently logged in as {form.userName}</p>
{/if}
```

---

### What about the other way around, posting additional data to the server?

You can add additional input fields to the form that aren't part of the schema, including files (see the next question), to send extra data to the server. They can then be accessed with `request.formData()` in the form action:

```ts
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

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

    const form = await superValidate(formData, zod(schema));
    const form2 = await superValidate(formData, zod(anotherSchema));

    // Business as usual
  }
};
```

---

### Why does the form get tainted without any changes, when I use a select element?

If the schema field for the select menu doesn't have an empty string as default value, for example when it's optional, and you have an empty first option, like a "Please select item" text, the field will be set to that empty string, tainting the form.

It can be fixed by setting the option and the default schema value to an empty string, even if it's not its proper type. See [this section](/default-values#changing-a-default-value) for an example.

---

### How to customize error messages directly in the validation schema?

You can add them as parameters to most schema methods. [Here's an example](/concepts/error-handling#customizing-error-messages-in-the-schema).

---

### Can you use Superforms without any data, for example with a delete button on each row in a table?

That's possible with an empty schema, or using the `$formId` store with the button to set the form id dynamically. See [this SvelteLab project](https://sveltelab.dev/github.com/ciscoheat/superforms-examples/tree/list-actions-zod) for an example.

---

### I want to reuse common options, how to do that easily?

When you start to configure the library to suit your stack, you can create an object with default options that you will refer to instead of `superForm`:

```ts
import { superForm } from 'sveltekit-superforms';

export type Message = {
  status: 'success' | 'error' | 'warning';
  text: string;
};

// If no strongly type message is needed, leave out the M type parameter
export function mySuperForm<
  T extends Record<string, unknown>,
  M extends Message = Message,
  In extends Record<string, unknown> = T
>(...params: Parameters<typeof superForm<T, M, In>>) {
  return superForm<T, M, In>(params[0], {
    // Your defaults here
    errorSelector: '.has-error',
    delayMs: 300,
    ...params[1]
  });
}
```
