<script lang="ts">
  import Head from '$lib/Head.svelte'
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Multiple forms on the same page

<Head title="Multiple forms on the same page" />

Since there is only one `$page` store per route, multiple forms on the same page, like a register and login form, can cause problems since both form actions will update `$page.form`, possibly affecting the other form.

With Superforms, multiple forms on the same page are handled automatically **if you are using `use:enhance`, and the forms have different schema types**. When using the same schema for multiple forms, you need to set the `id` option:

```ts
const form = await superValidate(zod(schema), {
  id: string | undefined
});
```

By setting an id on the server, you'll ensure that only forms with the matching id on the client will react to the updates.

> "Different schema types" means "different fields and types", so just copying a schema and giving it a different variable name will still count as the same schema. The contents of the schemas have to differ.

Here's an example of how to handle a login and registration form on the same page:

**+page.server.ts**

```ts
import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string.min(8),
  confirmPassword: z.string.min(8)
});

export const load = async () => {
  // Different schemas, no id required.
  const loginForm = await superValidate(zod(loginSchema));
  const registerForm = await superValidate(zod(registerSchema));

  // Return them both
  return { loginForm, registerForm };
};

export const actions = {
  login: async ({ request }) => {
    const loginForm = await superValidate(request, zod(loginSchema));

    if (!loginForm.valid) return fail(400, { loginForm });

    // TODO: Login user
    return message(loginForm, 'Login form submitted');
  },

  register: async ({ request }) => {
    const registerForm = await superValidate(request, zod(registerSchema));

    if (!registerForm.valid) return fail(400, { registerForm });

    // TODO: Register user
    return message(registerForm, 'Register form submitted');
  }
};
```

The code above uses [named form actions](https://kit.svelte.dev/docs/form-actions#named-actions) to determine which form was posted. On the client, you'll post to these different form actions for the respective form:

**+page.svelte**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types.js';

  export let data: PageData;

  const { form, errors, enhance, message } = superForm(data.loginForm, {
    resetForm: true
  });

  const {
    form: registerForm,
    errors: registerErrors,
    enhance: registerEnhance,
    message: registerMessage
  } = superForm(data.registerForm, {
    resetForm: true
  });
</script>

{#if $message}<h3>{$message}</h3>{/if}

<form method="POST" action="?/login" use:enhance>
  E-mail: <input name="email" type="email" bind:value={$form.email} />
  Password:
  <input name="password" type="password" bind:value={$form.password} />
  <button>Submit</button>
</form>

<hr />

{#if $registerMessage}<h3>{$registerMessage}</h3>{/if}

<form method="POST" action="?/register" use:registerEnhance>
  E-mail: <input name="email" type="email" bind:value={$registerForm.email} />
  Password:
  <input name="password" type="password" bind:value={$registerForm.password} />
  Confirm password:
  <input
    name="confirmPassword"
    type="password"
    bind:value={$registerForm.confirmPassword} />
  <button>Submit</button>
</form>
```

> Note that there is a separate `use:enhance` for each form - you cannot share the enhance action between forms.

The above works well with forms that posts to a dedicated form action. But for more dynamic scenarios, let's say a database table where rows can be edited, the form id should correspond to the row id, and you'd want to communicate to the server which id was sent. This can be done by modifying the `$formId` store, to let the server know what `id` was posted, and what it should respond with.

## Setting id on the client

On the client, the id is picked up automatically when you pass `data.form` to `superForm`, so in general, you don't have to add it on the client.

```ts
// Default behavior: The id is sent along with the form data
// sent from the load function.
const { form, enhance, formId } = superForm(data.loginForm);

// In advanced cases, you can set the id as an option
// and it will take precedence.
const { form, enhance, formId } = superForm(data.form, {
  id: 'custom-id'
});
```

You can also change the id dynamically with the `$formId` store, or set it directly in the form with the following method:

### Without use:enhance

Multiple forms also work without `use:enhance`, though in this case you must add a hidden form field called `__superform_id` with the `$formId` value:

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types.js';

  export let data: PageData;

  const { form, errors, formId } = superForm(data.form);
</script>

<form method="POST" action="?/login">
  <input type="hidden" name="__superform_id" bind:value={$formId} />
</form>
```

This is also required if you're changing schemas in a form action, as can happen in [multi-step forms](/examples#multi-step-forms).

## Returning multiple forms

If you have a use case where the data in one form should update another, you can return both forms in the form action: `return { loginForm, registerForm }`, but be aware that you may need `resetForm: false` on the second form, as it will reset and clear the updated changes, if it's valid and a successful response is returned.

## Configuration and troubleshooting

Due to the many different use cases, it's hard to set sensible default options for multiple forms. A common issue is that when one form is submitted, the other forms' data are lost. This is due to the page being invalidated by default on a successful response.

If you want to preserve their data, you'd almost certainly want to set `invalidateAll: false` or `applyAction: false` on them, as in the example above. The [use:enhance](/concepts/enhance) option explains the differences between them.

Also check out the [componentization](/components) page for ideas on how to place the forms into separate components, to make `+page.svelte` less cluttered.

## Test it out

Here we have two forms, with separate id's and their `invalidateAll` option set to `false`, to prevent page invalidation, which would otherwise clear the other form when the load function executes again.

<Form {data} />

<Next section={concepts} />
