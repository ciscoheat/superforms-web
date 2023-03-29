<script lang="ts">
	import Form from './Form.svelte'

	export let data;
</script>

## Installation

Install Superforms with `npm` or `pnpm`:

```
npm i -D sveltekit-superforms zod
```

```
pnpm i -D sveltekit-superforms zod
```

## Get started

<Form {data} />

Let's gradually build up a Superform, with the data for a name and an email address.

**src/routes/+page.server.ts**

```ts
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

// See https://zod.dev/?id=primitives for schema syntax
const schema = z.object({
	name: z.string().default('Hello world!'), // A default value just to show something
	email: z.string().email()
});

export const load = (async (event) => {
	// Server API:
	const form = await superValidate(event, schema);

	// Always return { form } in load and form actions.
	return { form };
}) satisfies PageServerLoad;
```

`superValidate` takes the data as the first parameter, which could be either:

- the `RequestEvent` in this case
- a `Request`
- `FormData` (usually from the request)
- `null` or `undefined`
- or an entity partially matching the schema.

**src/routes/+page.svelte**

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms/client';

	export let data: PageData;

	// Client API:
	const { form } = superForm(data.form);
</script>

<h1>sveltekit-superforms</h1>

<form method="POST">
	<label for="name">Name</label>
	<input type="text" name="name" bind:value={$form.name} />

	<label for="email">E-mail</label>
	<input type="text" name="email" bind:value={$form.email} />

	<div><button>Submit</button></div>
</form>
```

`superForm` is used on the client to display the data, conveniently supplied from `data.form`.

With this, we can at least see that the form is populated. But to get deeper insight, let's add the Super Form Debugging Svelte Component called `SuperDebug`:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
</script>

<SuperDebug data={$form} />
```

Edit the fields and see how the `$form` store is automatically updated. The component also displays the current page status in the right corner.

**Optional:** If you're starting from scratch, add this to `<head>` for a much nicer visual experience:

**src/app.html**

```html
<link rel="stylesheet" href="https://unpkg.com/normalize.css@8.0.1/normalize.css" />
<link rel="stylesheet" href="https://unpkg.com/sakura.css/css/sakura.css" />
```

## Posting

Let's add a minimal form action, to be able to post the data back to the server:

**src/routes/+page.server.ts**

```ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';

export const actions = {
	default: async (event) => {
		// Same syntax as in the load function
		const form = await superValidate(event, schema);
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
} satisfies Actions;
```

Submit the form, and see what's happening on the server:

```js
POST {
  valid: false,
  errors: { email: [ 'Invalid email' ] },
  data: { name: 'Hello world!', email: '' },
  empty: false,
  message: undefined,
  constraints: {
    name: { required: true },
    email: { required: true }
  }
}
```

This is the validation object returned from `superValidate`, containing all you need to handle the rest of the logic:

- `valid` - A `boolean` which tells you whether the validation succeeded or not.
- `errors` - A `Record<string, string[]>` of all validation errors.
- `data` - The coerced posted data, in this case not valid, so it should be promptly returned to the client.
- `empty` - A `boolean` which tells you if the data passed to `superValidate` was empty, as in the load function.
- `message` - A property that can be set as a general information message.
- `constraints` - An object with [html validation constraints](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation) than can be spread on input fields.

And as you see in the example above, the logic for checking validation status is as simple as it gets:

```ts
if (!form.valid) {
	return fail(400, { form });
}
```

If you submit the form now, you'll see that the Super Form Debugging Svelte Component shows a `400` status, and we know that there are some errors being sent to the client, so how do we display them?

We do that by adding variables to the destructuring assignment of `superForm`:

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
		data-invalid={$errors.name}
		bind:value={$form.name}
		{...$constraints.name}
	/>
	{#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

	<label for="email">E-mail</label>
	<input
		type="text"
		name="email"
		data-invalid={$errors.email}
		bind:value={$form.email}
		{...$constraints.email}
	/>
	{#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

	<div><button>Submit</button></div>
</form>

<style>
	.invalid {
		color: red;
	}
</style>
```

And with that, we have a fully working form, no JavaScript needed, with convenient handling of data and validation on both client and server! Check the [API reference](https://github.com/ciscoheat/sveltekit-superforms/wiki/API-reference#superform-return-type) for a full list of properties returned from `superForm`.
