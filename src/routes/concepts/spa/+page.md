<script lang="ts">
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

  export let data;
</script>

<svelte:head><title>Single-page application (SPA) mode</title></svelte:head>

# Single-page applications (SPA)

It's possible to use the whole Superforms library on the client, enabling the powerful validation capabilities even in single page applications, aka SPA. They are easy to create with SvelteKit, [fully documented here](https://kit.svelte.dev/docs/single-page-apps).

## Usage

```ts
const { form, enhance } = superForm(data, {
  SPA: true | { failStatus: number }
  validators: false | AnyZodObject | {
    field: (value) => string | string[] | null | undefined;
  }
})
```

The SPA capabilities of Superforms is enabled simply by setting the `SPA` option to `true`, and no request will be sent to the server. Instead the client-side [validators](/concepts/client-validation) option will determine the success or failure of the posted form, which will trigger the [event chain](/concepts/events) as usual.

Of course, `use:enhance` also needs to be added to the form!

## Using +page.ts instead of +page.server.ts

Since SPA pages don't have a server representation, you'll use [+page.ts](https://kit.svelte.dev/docs/routing#page-page-js) to load initial data. Combined with a route parameter, we can make a CRUD-like page in a very simple manner:

**src/routes/user/[id]/+page.ts**

```ts
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
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
  const form = await superValidate(userData, _userSchema);

  return { form };
};
```

Displaying the form is just like with server-side validation, but with the `SPA` option added:

**src/routes/user/[id]/+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import {
    superForm,
    setMessage,
    setError
  } from 'sveltekit-superforms/client';
  import { _userSchema } from './+page';

  export let data: PageData;

  const { form, errors, message, constraints, enhance, delayed } = superForm(data.form, {
    SPA: true,
    validators: _userSchema,
    onUpdate({ form }) {
      if (form.data.email.includes('spam')) {
        setError(form, 'email', 'Suspicious email address.');
      } else if (form.valid) {
        setMessage(form, 'Valid data!');
        // TODO: Do something with the validated data
      }
    },
    onError({ result, message }) {
      message.set(result.error.message);
    }
  });
</script>

<h1>Edit user</h1>

{#if $message}<h3>{$message}</h3>{/if}

<form method="POST" use:enhance>
  <input type="hidden" name="id" bind:value={$form.id} />

  <label>
    Name<br />
    <input
      name="name"
      data-invalid={$errors.name}
      bind:value={$form.name}
      {...$constraints.name} />
  </label>
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <label>
    E-mail<br />
    <input
      name="email"
      type="email"
      data-invalid={$errors.email}
      bind:value={$form.email}
      {...$constraints.email} />
  </label>
  {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

  <button>Submit</button>
</form>
```

The validation is now handled in the `onUpdate` event, and it's pretty much the same as validating on the server. Nothing needs to be returned since all modifications to `form` will reflect in the view after the `onUpdate` event is done.

## Test it out

The following form has `SPA: true` set, and is using `+page.ts` for loading the initial data. Take a look in the browser devtools and see that nothing is posted to the server on submit.

<Form {data} />

## Trimming down the bundle size

In the above example, we're adding both Zod and the Superforms server part to the client. This adds about 90 Kb to the client output size, which hopefully is negligible, but if you're hunting bytes, you can optimize by skipping the `superValidate` part in `+page.ts`, and use only the built-in validators in `+page.svelte`.

**src/lib/schemas.ts**

```ts
import { z } from 'zod';

export const _userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email()
});

export type UserSchema = typeof _userSchema
```

**src/routes/user/[id]/+page.ts**

```ts
import { error } from '@sveltejs/kit';

export const load = async ({ params, fetch }) => {
  const id = parseInt(params.id);

  const request = await fetch(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  if (request.status >= 400) throw error(request.status);

  // No validation, just return the data.
  const user = await request.json();
  return { user };
};
```

**src/routes/user/[id]/+page.svelte**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { UserSchema } from '$lib/schemas';

  export let data: PageData;

  const { form, errors, enhance } = superForm<UserSchema>(data.user, {
    SPA: true,
    validators: {
      name: (name) => (name.length <= 2 ? 'Name is too short' : null)
    },
    onUpdated({ form }) {
      // As before
    }
  });
</script>
```

This will reduce the added size to a mere 25 Kb. The downside is that you won't get any [constraints](/concepts/client-validation#constraints), the initial data won't be validated, and you have to rely on the Superforms validator scheme, compared to the much more powerful Zod.

<Next section={concepts} />
