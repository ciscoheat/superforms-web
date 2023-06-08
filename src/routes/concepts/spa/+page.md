<script lang="ts">
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

  export let data;
</script>

<svelte:head><title>Single-page application (SPA) mode</title></svelte:head>

# Single-page applications (SPA)

Even though validation has its place on the server, it's possible to use the whole Superforms library on the client in single page applications. A SPA is easy to create with SvelteKit, [fully documented here](https://kit.svelte.dev/docs/single-page-apps).

## Usage

```ts
const { form, enhance } = superForm(data, {
  SPA: true | { failStatus: number }
  validators: false | AnyZodObject | {
    field: (value) => string | string[] | null | undefined;
  }
})
```

By setting the `SPA` option to `true`, the form will not send anything to the server. Instead the client-side [validators](/concepts/client-validation) option will determine the success or failure of the "client-posted" form, which will trigger the [event chain](/concepts/events), and the result will be most conveniently consumed in `onUpdate`.

> Remember that `use:enhance` must be added to the form for SPA to work!

## Using +page.ts instead of +page.server.ts

Since SPA pages don't have a server representation, you can use [+page.ts](https://kit.svelte.dev/docs/routing#page-page-js) to load initial data. Combined with a route parameter, we can make a CRUD-like page in a straightforward manner:

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

> If no data should be loaded from `+page.ts`, or you simply don't want to have such a page, see further down on how to use `superValidate` in a page or component.

## Displaying the form

We display the form in `+page.svelte` like before, but with the `SPA` option added, and the `onUpdate` event is used to validate the form data, instead of on the server:

**src/routes/user/[id]/+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { superForm, setMessage, setError } from 'sveltekit-superforms/client';
  import { _userSchema } from './+page';

  export let data: PageData;

  const { form, errors, message, constraints, enhance } = superForm(
    data.form,
    {
      SPA: true,
      validators: _userSchema,
      onUpdate({ form }) {
        // Form validation
        if (form.data.email.includes('spam')) {
          setError(form, 'email', 'Suspicious email address.');
        } else if (form.valid) {
          // TODO: Do something with the validated data
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

The validation in `onUpdate` is almost the same as validating in a form action on the server. Nothing needs to be returned at the end since all modifications to `form` will reflect in the view after the `onUpdate` event is done.

## Using superValidate in +page.svelte

Since you can't use top-level await in Svelte components, you can't use `superValidate` directly in `+page.svelte`, but you can import `superValidateSync` instead, to avoid having a `+page.ts` if you just want the default values for a schema:

```svelte
<script lang="ts">
  import { superForm, superValidateSync } from 'sveltekit-superforms/client';
  import { loginSchema } from '$lib/schemas';

  const { form, errors, enhance } = superForm(
    superValidateSync(loginSchema), {
      SPA: true,
      validators: loginSchema,
      onUpdate({ form }) {
        // TODO: Form validation
      }
    }
  );
</script>
```

## Test it out

The following form has `SPA: true` set, and is using `+page.ts` for loading the initial data. Take a look in the browser devtools and see that nothing is posted to the server on submit.

<Form {data} />

## Trimming down the bundle size

In the above example, we're adding both Zod and the Superforms server part to the client. This adds about 65 Kb to the client output size, which hopefully is negligible, but if you're hunting bytes, you can optimize by skipping the `superValidate` part in `+page.ts`, and in `+page.svelte`, construct your own `SuperValidated` response and use the Superforms validators:

**src/lib/schemas.ts**

```ts
import { z } from 'zod';

export const _userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email()
});

export type UserSchema = typeof _userSchema;
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
  import type { PageData } from './$types';
  import type { SuperValidated } from 'sveltekit-superforms';
  import { superForm } from 'sveltekit-superforms/client';
  import type { UserSchema } from '$lib/schemas';

  export let data: PageData;

  const validated : SuperValidated<UserSchema> = {
    valid: false, // Or true, if you trust the data
    posted: false,
    data: data.user,
    errors: {},
    constraints: {}
  }

  const { form, errors, enhance } = superForm(validated, {
    SPA: true,
    validators: {
      name: (name) => (name.length <= 2 ? 'Name is too short' : null),
      email: (email) =>
        email.includes('spam') ? 'Suspicious email address.' : null
    },
    onUpdate({ form }) {
      if (form.valid) {
        form.message = 'Valid data!';
      }
    }
  });
</script>
```

This will reduce the added size to just the client-side part of Superforms, around 25 Kb. The downside is that you won't get any [constraints](/concepts/client-validation#constraints), the initial data won't be validated, and you have to rely on the Superforms validator scheme, compared to the much more powerful Zod.

<Next section={concepts} />
