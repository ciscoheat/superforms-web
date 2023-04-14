<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Multiple forms on the same page

<svelte:head><title>Multiple forms on the same page</title></svelte:head>

Since there is only one `$page.form` per page, having multiple forms, for example a register and login form on the same page, can cause trouble since an update with the built-in `use:enhance` will affect both forms.

Fortunately Superforms has a solution for this! Multiple forms on the same page are possible by setting `options.id` for each form (one can have the default id, `undefined`). This prevents them from interfering with with each other, which can happen since they all update the same `$page.status` and `$page.form`.

## Usage

```ts
const form = await superValidate(schema, {
  id: string | undefined
});
```

By setting an id like this on the server, you'll ensure that only forms with the matching id on the client will react on the updates:

**+page.server.ts**

```ts
import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';

const loginSchema = z.object({
  name: z.string().min(1)
});

const registerSchema = z.object({
  name: z.string().min(1)
});

export const load = async () => {
  const loginForm = await superValidate(loginSchema, {
    id: 'loginForm'
  });

  const registerForm = await superValidate(registerSchema, {
    id: 'registerForm'
  });

  return { loginForm, registerForm };
};

export const actions = {
  login: async ({ request }) => {
    const loginForm = await superValidate(request, loginSchema, {
      id: 'loginForm'
    });

    if (!loginForm.valid) return fail(400, { loginForm });
    return message(loginForm, 'Login form submitted');
  },
  register: async ({ request }) => {
    const registerForm = await superValidate(request, registerSchema, {
      id: 'registerForm'
    });

    if (!registerForm.valid) return fail(400, { registerForm });
    return message(registerForm, 'Register form submitted');
  }
};
```

## Server-client communication

This is only the **server-to-client** part however. You can still post to this form action from anywhere, and the server knows nothing about who sent the form.

The example above is using [named form actions](https://kit.svelte.dev/docs/form-actions#named-actions) to determine which form was posted. On the client, you'll post to different form actions for the respective forms:

**+page.svelte**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form, errors, enhance, message } = superForm(data.loginForm, {
    invalidateAll: false
  });

  const {
    form: registerForm,
    errors: registerErrors,
    enhance: registerEnhance,
    message: registerMessage
  } = superForm(data.registerForm, {
    invalidateAll: false
  });
</script>

{#if $message}<h3>{$message}</h3>{/if}

<form method="POST" action="?/login" use:enhance>
  Name: <input type="text" name="name" bind:value={$form.name} />
  <button>Submit</button>
  {#if $errors.name}
    <br /><span class="invalid">{$errors.name}</span>
  {/if}
</form>

<hr />

{#if $registerMessage}<h3>{$registerMessage}</h3>{/if}

<form method="POST" action="?/register" use:registerEnhance>
  Name: <input type="text" name="name" bind:value={$registerForm.name} />
  <button>Submit</button>
  {#if $registerErrors.name}
    <br /><span class="invalid">{$registerErrors.name}</span>
  {/if}
</form>
```

This works well with forms that only posts to its dedicated form action. But for more dynamic scenarios, let's say a database table where rows can be editable, you want to communicate to the server which form id was sent. This can be done with a hidden form field or a query parameter, to let the server know what `id` was posting, and what it should respond with.

### Setting id on the client

On the client, the id is picked up automatically when you pass `data.form` to `superForm`. But if you don't send any data to the form initially, you can set the `id` directly in the first argument to `superForm`:

```ts
// The default: If data is used, the id is sent along with it.
const { form, enhance } = superForm(data.loginForm, schema);

// If no data is sent (for empty forms), the id can be used directly.
const { form, enhance } = superForm('loginForm', schema);

// In advanced cases, you can set the id as an option.
// It will take precedence over data.form.id.
const { form, enhance } = superForm(data.form, schema, {
  id: 'special-id'
});
```

## Configuration and troubleshooting

Due to the many different use cases, it's hard to set sensible defaults for multiple forms. A common issue is that the other forms' data are lost when one is submitted. This is due to the page being invalidated as default on a successful response. If you want to preserve their data, you'd almost certainly want to set `invalidateAll: false` on them, as in the example above.

If you experience unwanted behavior with multiple forms, experiment with the [use:enhance](/enhance) options.

Also check out the [componentization](/components) page for ideas how to place the forms into separate components, to make `+page.svelte` less cluttered.

## Test it out

Here we have two forms, with separate id's and two extra options:

```ts
{
  // Clear form on success.
  resetForm: true,
  // Prevent page invalidation, which would clear the
  // other form when the load function executes again.
  invalidateAll: false
}
```

Submit them and see that they are acting independently.

<Form {data} />

<Next section={concepts} />
