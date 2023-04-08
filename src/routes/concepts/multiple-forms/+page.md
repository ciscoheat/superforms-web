<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Multiple forms

<svelte:head><title>Multiple forms</title></svelte:head>

Since there is only one `$page.form` per page, having multiple forms, for example a register and login form on the same page, can cause trouble since an update with the built-in `use:enhance` will affect both forms.

Fortunately Superforms has a solution for this! Multiple forms on the same page are possible by setting `options.id` for each form (one can have the default id, `undefined`). This prevents them from interfering with with each other, which can happen since they all update the same `$page.status` and `$page.form`.

## Usage

```ts
// Server-side
const form = await superValidate(data.form, schema, {
  id: string | undefined
});
```

By setting an id like this on the server, you'll ensure that only forms with the matching id on the client will react on the updates:

```ts
export const load = (async () => {
  const loginForm = await superValidate(loginSchema, { id: 'loginForm' });
  const registerForm = await superValidate(registerSchema, {
    id: 'registerForm'
  });
  return { loginForm, registerForm };
}) satisfies PageServerLoad;

export const actions = {
  login: async ({ request }) => {
    const loginForm = await superValidate(request, loginSchema, {
      id: 'loginForm'
    });
    return { loginForm };
  },
  register: async ({ request }) => {
    const registerForm = await superValidate(request, registerSchema, {
      id: 'registerForm'
    });
    return { registerForm };
  }
} satisfies Actions;
```

## Server-client communication

This is only the **server-to-client** part however. You can still post to this form action from anywhere, and the server knows nothing about who sent the form.

The example above is using [named form actions](https://kit.svelte.dev/docs/form-actions#named-actions) to determine which form was posted. The form element will look something like this:

```svelte
<form method="POST" action="?/login" use:enhance>
```

This works well with forms that only posts to its dedicated form action. But for more dynamic scenarios, let's say a database table where rows can be editable, you want to communicate to the server which form id was sent. This can be done with a hidden form field or a query parameter, to let the server know what `id` was posting, and what it should respond with.

### Setting id on the client

On the client, the id is picked up automatically when you pass `data.form` to `superForm`. But if you don't send any data to the form initially, you can set the `id` directly in the first argument to `superForm`:

```ts
// The default: If data is used, the id is sent along with it.
const { form, errors } = superForm(data.loginForm, schema);

// If no data is sent (for empty forms), the id can be used directly.
const { form, errors } = superForm('loginForm', schema);

// In advanced cases, you can set the id as an option.
// It will take precedence over data.form.id.
const { form, errors } = superForm(data.form, schema, {
  id: 'special-id'
});
```

## Configuration and troubleshooting

Due to the many different use cases, it's hard to set sensible defaults for multiple forms. If you experience unwanted behavior, experiment with the [use:enhance](/enhance) options.

## Test it out

Here we have two forms, with separate id's and two extra options:

```ts
{
  // Clear form on success.
  resetForm: true,
  // Prevent page invalidation, which would clear the other form
  // when the load function executes again.
  invalidateAll: false
}
```

Submit them and see that they are acting independently.

<Form {data} />

<Next section={concepts} />
