<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

  export let data;
</script>

<Head title="Single-page application (SPA) mode" />

# Single-page applications (SPA)

It's possible to use the whole Superforms library on the client, for example in single page applications or when you want to call an external API instead of the SvelteKit form actions. A SPA is easy to create with SvelteKit, [documented here](https://kit.svelte.dev/docs/single-page-apps).

## Usage

```ts
const { form, enhance } = superForm(data, {
  SPA: true | { failStatus: number }
  validators: false | ClientValidationAdapter<S>
})
```

By setting the `SPA` option to `true`, the form won't be sent to the server when submitted. Instead, the client-side [validators](/concepts/client-validation#validators) option will determine if the form is valid, and you can then use the [onUpdate](/concepts/events#onupdate) event as a submit handler, for example to call an external API with the form data.

> Remember that the Superforms [use:enhance](/concepts/enhance) must be added to the form for SPA to work.

## Using +page.ts instead of +page.server.ts

Since SPA pages don't have a server representation, you can use [+page.ts](https://kit.svelte.dev/docs/routing#page-page-js) to load initial data. Combined with a route parameter, we can make a CRUD-like page in a straightforward manner:

**src/routes/user/[id]/+page.ts**

```ts
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

export const _userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email()
});

export const load = async ({ params, fetch }) => {
  const id = parseInt(params.id);

  const request = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  if (request.status >= 400) throw error(request.status);

  const userData = await request.json();
  const form = await superValidate(userData, zod(_userSchema));

  return { form };
};
```

> If no data should be loaded from `+page.ts`, read further down about the `defaults` function.

## Displaying the form

We display the form in `+page.svelte` like before, but with the `SPA` option added, and the `onUpdate` event now being used to validate the form data, instead of on the server:

**src/routes/user/[id]/+page.svelte**

```svelte
<script lang="ts">
  import { superForm, setMessage, setError } from 'sveltekit-superforms';
  import { _userSchema } from './+page.js';
  import { zod } from 'sveltekit-superforms/adapters';

  export let data;

  const { form, errors, message, constraints, enhance } = superForm(
    data.form,
    {
      SPA: true,
      validators: zod(_userSchema),
      onUpdate({ form }) {
        // Form validation
        if (form.data.email.includes('spam')) {
          setError(form, 'email', 'Suspicious email address.');
        } else if (form.valid) {
          // TODO: Call an external API with form.data, await the result and update form
          setMessage(form, 'Valid data!');
        }
      }
    }
  );
</script>

<h1>Edit user</h1>

{#if $message}<h3>{$message}</h3>{/if}

<form method="POST" use:enhance>
  <label>
    Name<br />
    <input
      aria-invalid={$errors.name ? 'true' : undefined}
      bind:value={$form.name}
      {...$constraints.name} />
  </label>
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <label>
    E-mail<br />
    <input
      type="email"
      aria-invalid={$errors.email ? 'true' : undefined}
      bind:value={$form.email}
      {...$constraints.email} />
  </label>
  {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

  <button>Submit</button>
</form>
```

The validation in `onUpdate` is almost the same as validating in a form action on the server. Nothing needs to be returned at the end since all modifications to the `form` parameter in `onUpdate` will update the form.

> Of course, since this validation is done on the client, it's easy to tamper with. See it as a convenient way of collecting the form data before doing a proper server validation through an external API.

## Without a +page.ts file

Since you can't use top-level await in Svelte components, you can't use `superValidate` directly in `+page.svelte`, as it is async. But if you want the default values only for the schema, you can import `defaults` to avoid having a `+page.ts`.

```svelte
<script lang="ts">
  import { superForm, defaults } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { loginSchema } from '$lib/schemas';

  const { form, errors, enhance } = superForm(defaults(zod(loginSchema)), {
    SPA: true,
    validators: zod(loginSchema),
    onUpdate({ form }) {
      if (form.valid) {
        // TODO: Call an external API with form.data, await the result and update form
      }
    }
  });
</script>
```

### With initial top-level data

If you have initial data in the top level of the component, you can pass it as a first parameter to `defaults`, **but remember that it won't be validated**. There's a trick though; if you want to show errors for the initial data, you can call `validate` directly after `superForm`. The `validators` option must be set for this to work:

```ts
const initialData = { name: 'New user' };

const { form, errors, enhance, validate } = superForm(
  defaults(initialData, zod(loginSchema)), {
    SPA: true,
    validators: zod(loginSchema)
    // ...
  }
);

validate({ update: true });
```

## Test it out

The following form has `SPA: true` set, and is using `+page.ts` for loading the initial data. Take a look in the browser devtools and see that nothing is posted to the server on submit.

<Form {data} />

<Next section={concepts} />
