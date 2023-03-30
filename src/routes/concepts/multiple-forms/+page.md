<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Multiple forms

Since SvelteKit has only one `$page.form`, having multiple forms on the same page, for example a login form always present in the navigation, can cause trouble since any form update with the built-in `use:enhance` will overwrite the other.

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
export const load = (async (event) => {
  const form = await superValidate(event, loginSchema, { id: 'login-form' });
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  default: async (event) => {
    const loginForm = await superValidate(event, loginSchema, {
      id: 'login-form'
    });
    return { loginForm };
  }
} satisfies Actions;
```

## Server-client communication

This is only the **server-to-client** part however. You can still post to this form action from anywhere, and the server knows nothing about who sent the form.

This may work well like the example above, a login form that is the only form that posts to its form action or endpoint. But for more dynamic scenarios you want to communicate to the server which form id was sent.

It could be as simple as using [named form actions](https://kit.svelte.dev/docs/form-actions#named-actions), or in a more dynamic fashion, using a hidden form field or a query parameter, to let the server know what `id` was posting.

### Setting id on the client

On the client, the id is picked up automatically when you pass `data.form` to `superForm`. But if you don't send any data to the form initially, you can set the `id` directly in the first argument to `superForm`:

```ts
// The default: If data is used, the id is sent along with it.
const { form, errors } = superForm(data.loginForm, schema);

// If no data is sent (for empty forms), the id can be used directly.
const { form, errors } = superForm('login-form', schema);

// In advanced cases, you can set the id as an option.
// It will take precedence over data.form.id.
const { form, errors } = superForm(data.form, schema, {
  id: 'special-id'
});
```

## Test it out

Here we have two forms, with separate id's and two extra options:

```ts
{
  // Clear form on success.
  resetForm: true,
  // Prevent page invalidation, which would clear the other form
  // when the load function executes again.
  invalidateAll: true
}
```

Submit them and see that they are acting independently.

<Form {data} />

<Next section={concepts} />
