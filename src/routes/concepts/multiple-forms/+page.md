<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Multiple forms on the same page

<svelte:head><title>Multiple forms on the same page</title></svelte:head>

Since there is only one `page` store, multiple forms on the same page, for example a register and login form, can cause problems since form actions will update the single `$page.form`, and possibly affecting both forms.

With Superforms though, multiple forms on the same page are handled transparently **if you are using `use:enhance`, and the forms have different schema types**. If you're using the same schema for the forms, you need to use the `id` option:

```ts
const form = await superValidate(schema, {
  id: string | undefined
});
```

By setting an id on the server, you'll ensure that only forms with the matching id on the client will react on the updates.

> "Different schema types" means "different fields and types", so just copying a schema and giving it a different variable name will still count as the same schema. The contents of the schemas have to differ.

Here's an example of how to handle a login and register form on the same page:

**+page.server.ts**

```ts
import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';

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
  // Different schemas, so no id required.
  const loginForm = await superValidate(loginSchema);
  const registerForm = await superValidate(registerSchema);

  // Return them both
  return { loginForm, registerForm };
};

export const actions = {
  login: async ({ request }) => {
    const loginForm = await superValidate(request, loginSchema);

    if (!loginForm.valid) return fail(400, { loginForm });

    // TODO: Login user
    return message(loginForm, 'Login form submitted');
  },
  register: async ({ request }) => {
    const registerForm = await superValidate(request, registerSchema);

    if (!registerForm.valid) return fail(400, { registerForm });

    // TODO: Register user
    return message(registerForm, 'Register form submitted');
  }
};
```

The code above is using [named form actions](https://kit.svelte.dev/docs/form-actions#named-actions) to determine which form was posted. On the client, you'll post to these different form actions for the respective form:

**+page.svelte**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';

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
  Password: <input name="password" type="password" bind:value={$form.password} />
  <button>Submit</button>
</form>

<hr />

{#if $registerMessage}<h3>{$registerMessage}</h3>{/if}

<form method="POST" action="?/register" use:registerEnhance>
  E-mail: <input name="email" type="email" bind:value={$form.email} />
  Password: <input name="password" type="password" bind:value={$form.password} />
  Confirm password: <input name="confirmPassword" type="password" bind:value={$form.confirmPassword} />
  <button>Submit</button>
</form>
```

This works well with forms that only post to its dedicated form action. But for more dynamic scenarios, let's say a database table where rows can be editable, the form id should correspond to the row id, and you'd want to communicate to the server which id was sent. This can be done with a hidden form field or a query parameter, to let the server know what `id` was posting, and what it should respond with.

### Setting id on the client

On the client, the id is picked up automatically when you pass `data.form` to `superForm`, so in general you don't have to add it on the client.

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

You can also change the id dynamically with the `$formId` store.

### Without use:enhance

Multiple forms works without `use:enhance`, though in this case you must add a hidden form field called `__superform_id` with the `$formId` value:

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form, errors, formId } = superForm(data.form);
</script>

<form method="POST" action="?/login">
  <input type="hidden" name="__superform_id" bind:value={$formId}>
</form>
```

## Configuration and troubleshooting

Due to the many different use cases, it's hard to set sensible default options for multiple forms. A common issue is that when one form is submitted, the other forms' data are lost. This is due to the page being invalidated as default on a successful response.

If you want to preserve their data, you'd almost certainly want to set `invalidateAll: false` or `applyAction: false` on them, as in the example above. The [use:enhance](/concepts/enhance) options explains the differences between them.

Also check out the [componentization](/components) page for ideas on how to place the forms into separate components, to make `+page.svelte` less cluttered.

## Test it out

Here we have two forms, with separate id's and some extra options:

```ts
{
  // Clear form on success.
  resetForm: true,
  // Prevent page invalidation, which would otherwise
  // clear the other form when the load function executes again.
  invalidateAll: false,
  // Disable tainted message check, since password
  // managers can taint the field when automatically
  // filling in the fields.
  taintedMessage: null
}
```

Submit them and see that they are acting independently.

<Form {data} />

<Next section={concepts} />
