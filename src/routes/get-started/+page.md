<script lang="ts">
	import Form from './Form.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'

	export let data;
	
	let formComponent
	$: form = formComponent && formComponent.formData()
</script>

<svelte:head><title>Get started - Tutorial for Superforms</title></svelte:head>

## Installation

Install Superforms with `npm` or `pnpm`:

```
npm i -D sveltekit-superforms zod
```

```
pnpm i -D sveltekit-superforms zod
```

## Following along

The easiest way is to open [the Stackblitz project](https://stackblitz.com/edit/sveltekit-superforms-1-tutorial?file=src%2Froutes%2F%2Bpage.server.ts,src%2Froutes%2F%2Bpage.svelte) for this tutorial.

Otherwise, you can create a new SvelteKit project with `npm create svelte@latest` and copy/paste the code as you go along, or add it to an existing project.

## Creating a Superform

Let's gradually build up a Superform containing a name and an email address.

### Creating a validation schema

The main thing required to create a Superform is a Zod validation schema. It has a quite simple syntax:

```ts
import { z } from 'zod';

// Name has a default value just to display something in the form.
const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});
```

This schema represents the form data. It should always start with `z.object({ ... })`, encapsulating a single form.

The [Zod documentation](https://zod.dev/?id=primitives) has all the details for creating schemas, but this is all you need to know for now.

### Initializing the form in the load function

Let's use this schema with Superforms on the start page of the site:

**src/routes/+page.server.ts**

```ts
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = async () => {
  // Server API:
  const form = await superValidate(schema);

  // Always return { form } in load and form actions.
  return { form };
};
```

The Superform server API is called `superValidate`. You can call it in two ways in the load function:

**1. Empty form**

If you want to the form to be initially empty, just pass the schema as in the example above, and it will be filled with default values based on the schema. For example, a `z.string()` field results in an empty string, unless you have set a default.

**2. Populate from database**

If you want to populate the form, you can call the database and send the data to the form as the first parameter, schema second, like this:

```ts
export const load = async ({ params }) => {
  const user = db.users.findUnique({
    where: { id: params.id }
  });

  if (!user) throw error(404, 'Not found');

  const form = await superValidate(user, schema);

  // Always return { form } in load and form actions.
  return { form };
};
```

As long as the data partially matches the schema, you can pass it directly to `superValidate`. This is very useful for backend interfaces, where the form usually should be populated based on an url like `/users/123`.

### Important note about return values

At the end of the load function we return `{ form }`. Unless you redirect or throw an error, you should **always** return the validation object to the client in this manner, either directly or through a helper function. The name of the variable doesn't matter, you can call it `{ loginForm }` or anything else, but it needs to be returned in all code paths, both in load functions and form actions, encapsulated in an object.

### Displaying the form

Now when we have sent the validation data to the client, we will retrieve it using the client part of the API:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';

  export let data: PageData;

  // Client API:
  const { form } = superForm(data.form);
</script>

<form method="POST">
  <label for="name">Name</label>
  <input type="text" name="name" bind:value={$form.name} />

  <label for="email">E-mail</label>
  <input type="email" name="email" bind:value={$form.email} />

  <div><button>Submit</button></div>
</form>
```

> Don't forget the `name` attribute on the form fields! Unless you are using [nested data](/concepts/nested-data), they are required.

`superForm` is used on the client to display the data, that we just sent from the server in `data.form`.

This is what the form should look like now:

<Form {data} bind:this={formComponent} />

### Debugging

Now we can see that the form is populated. But to get deeper insight, let's add the Superform Debugging Svelte Component called `SuperDebug`:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
</script>

<SuperDebug data={$form} />
```

This should be displayed:

<SuperDebug data={$form} />

Edit the form fields and see how the data is automatically updated. The component also displays the current page status in the right corner.

### Posting data

In form actions, we'll use the same `superValidate` function, but now it should be populated with `FormData`. This can be done in several ways:

- Use `request` parameter (which contains `FormData`)
- Use the `event` object (which contains the request)
- Use `FormData` directly.

Let's use `request` in a minimal form action, so we can post the form back to the server:

**src/routes/+page.server.ts**

```ts
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';

const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);
    console.log('POST', form);

    // Convenient validation check:
    if (!form.valid) {
      // Again, always return { form } and things will just work.
      return fail(400, { form });
    }

    // TODO: Do something with the validated data

    // Yep, return { form } here too
    return { form };
  }
};
```

Submit the form, and see what's happening on the server:

```ts
POST {
  id: 'a3g9kke',
  valid: false,
  posted: true,
  data: { name: 'Hello world!', email: '' },
  errors: { email: [ 'Invalid email' ] },
  message: undefined,
  constraints: {
    name: { required: true },
    email: { required: true }
  }
}
```

This is the validation object returned from `superValidate`, containing all you need to handle the rest of the logic:

| Field              | Purpose                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **id**             | Id for the schema, to handle [multiple forms](/concepts/multiple-forms) on the same page.                                                          |
| **valid**          | Tells you whether the validation succeeded or not, used mostly in [events](/concepts/events). |
| **posted**         | Tells you if the data was posted (in a form action) or not (in a load function).                                                                                                                |
| **data**           | The posted data, which should be returned to the client using `fail` if not valid. |
| **errors**         | An object with all validation errors, in a structure reflecting the data.                                                  |
| **message**        | A field that can be set as a [status message](/concepts/messages).  |
| **constraints**    | An object with [html validation constraints](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation), that can be spread on input fields. |

There is nothing magical about this data structure, you can modify any of its values, and they will be updated on the client when you `return { form }`. There are a couple of helper functions for making this more convenient, like [message](/concepts/messages) and [setError](/concepts/error-handling).

### Displaying errors

Now we know that validation has failed, and there are some errors being sent to the client. So how do we display them?

We do that by adding properties to the destructuring assignment of `superForm`:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  const { form, errors, constraints } = superForm(data.form);
  //            ^^^^^^  ^^^^^^^^^^^
</script>

<form method="POST">
  <label for="name">Name</label>
  <input
    type="text"
    name="name"
    aria-invalid={$errors.name ? 'true' : undefined}
    bind:value={$form.name}
    {...$constraints.name} />
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <label for="email">E-mail</label>
  <input
    type="email"
    name="email"
    aria-invalid={$errors.email ? 'true' : undefined}
    bind:value={$form.email}
    {...$constraints.email} />
  {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

  <div><button>Submit</button></div>
</form>

<style>
  .invalid {
    color: red;
  }
</style>
```

As you see, by including `errors` we can display errors where it's appropriate, and through `constraints` we get browser validation even without javascript enabled. The `aria-invalid` attribute is used to [automatically focus](/concepts/error-handling#errorselector) on the first error field.

We now have a fully working form, with convenient handling of data and validation both on client and server! 

There are no hidden DOM manipulations or other behind the scenes secrets, it's just html attributes and Svelte stores.

## Next steps

This concludes the tutorial (full source code below), but you'd probably want to enable client-side functionality, to take full advantage of the features and enhancements that Superforms bring.

To do that, take a look at [use:enhance](/concepts/enhance) under the Concepts section in the navigation. Most pages there contain interactive examples that helps you use the library to its fullest.

> If you plan to use nested data (objects and arrays within the schema), read the [nested data](/concepts/nested-data) section carefully.

If you're ready for a more advanced tutorial, check out [Designing a CRUD interface](/crud), which shows how to make a fully working backend in about 150 lines of code.

## Complete example code

Also available [on Stackblitz](https://stackblitz.com/edit/sveltekit-superforms-1-tutorial?file=src%2Froutes%2F%2Bpage.server.ts,src%2Froutes%2F%2Bpage.svelte).

**src/routes/+page.server.ts**

```ts
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = async () => {
  // Server API:
  const form = await superValidate(schema);

  // Always return { form } in load and form actions.
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);
    console.log('POST', form);

    if (!form.valid) {
      return fail(400, { form });
    }

    // TODO: Do something with the validated data

    return { form };
  }
};
```

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  export let data: PageData;

  // Client API:
  const { form, errors, constraints } = superForm(data.form);
</script>

<SuperDebug data={$form} />

<form method="POST">
  <label for="name">Name</label>
  <input
    type="text"
    name="name"
    aria-invalid={$errors.name ? 'true' : undefined}
    bind:value={$form.name}
    {...$constraints.name} />
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <label for="email">E-mail</label>
  <input
    type="email"
    name="email"
    aria-invalid={$errors.email ? 'true' : undefined}
    bind:value={$form.email}
    {...$constraints.email} />
  {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

  <div><button>Submit</button></div>
</form>

<style>
  .invalid {
    color: red;
  }
</style>
```
