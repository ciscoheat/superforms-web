<script lang="ts">
	import Form from './Form.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
	import { writable } from 'svelte/store';
	import { setContext, getContext } from 'svelte';
	import { onMount } from 'svelte';

	export let data;
	
	let formComponent
	$: form = formComponent && formComponent.fd()
</script>

## Installation

Install Superforms with `npm` or `pnpm`:

```
npm i -D sveltekit-superforms zod
```

```
pnpm i -D sveltekit-superforms zod
```

## Following along the tutorial

The easiest way is to open [the Stackblitz project](https://stackblitz.com/edit/sveltekit-superforms-tutorial?file=src%2Froutes%2F%2Bpage.server.ts,src%2Froutes%2F%2Bpage.svelte) for this tutorial.

Otherwise, you can create a new SvelteKit project with `npm create svelte@latest` and copy/paste the code as you go along.

## Creating a Superform

Let's gradually build up a Superform, containing a name and an email address.

The only thing required to create a Superform is a Zod validation schema. It has a quite simple syntax:

### Creating a validation schema

```ts
// Name has a default value just to show something.
const schema = z.object({
	name: z.string().default('Hello world!'),
	email: z.string().email()
});
```

The [Zod documentation](https://zod.dev/?id=primitives) has all the details for creating schemas, but this is all you need to know for now.

### Adding a load function

Let's use this schema with Superforms on the start page of the site:

**src/routes/+page.server.ts**

```ts
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

const schema = z.object({
	name: z.string().default('Hello world!'),
	email: z.string().email()
});

export const load = (async (event) => {
	// Server API:
	const form = await superValidate(event, schema);

	// Always return { form } in load and form actions.
	return { form };
}) satisfies PageServerLoad;
```

The Superform server API is called `superValidate`. Its first parameter is the data that should be sent to the form. It can come from `FormData` in a POST request, from a database (using route parameters in the load function), or be empty.

If empty, any required fields will be filled with default values based on the schema. `z.string()` results in an empty string, for example.

In our case, the form should be empty as default, so we can use the `RequestEvent`, which then looks for `FormData`, but as this is a `GET` request, it won't find any and will return the default values for the schema.

Also note that in the end of the load function we return `{ form }`. As a rule, you should always return the validation object to the client in this manner.

### Displaying the form

Now when we have sent the validation data to the client, we will use it with the client part of the API:

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

`superForm` is used on the client to display the data, conveniently supplied from `data.form`.

This is what the form should look like now:

<Form {data} bind:this={formComponent} />

You can try to submit this form, it's interactive!

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

Edit the fields above and see how the data is automatically updated. The component also displays the current page status in the right corner.

### Posting data

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

```ts
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

- `valid` - Tells you whether the validation succeeded or not.
- `errors` - An object with all validation errors.
- `data` - The posted data, in this case not valid, so it should be returned to the client as a `failure`.
- `empty` - Tells you if the data passed to `superValidate` was empty, as it was in the load function.
- `message` - A property that can be set as a general information message.
- `constraints` - An object with [html validation constraints](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation) than can be spread on input fields.

As you see in the example above, the logic for checking validation status is as simple as it gets:

```ts
if (!form.valid) {
	return fail(400, { form });
}
```

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
		data-invalid={$errors.name}
		bind:value={$form.name}
		{...$constraints.name}
	/>
	{#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

	<label for="email">E-mail</label>
	<input
		type="email"
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

This concludes the tutorial. We now have a fully working form, no JavaScript needed, with convenient handling of data and validation on both client and server!

There are no hidden DOM manipulations or other secrets, it's just html attributes and Svelte stores.

## What's next?

You'd probably want to enable client-side functionality, to take full advantage of the enhancements that Superforms bring. Take a look under "Concepts" in the navigation, they can be read in order.

Also, check the [API reference](/api) for a full list of properties returned from `superForm`, and options that you can use.

If you want to take a more advanced tutorial, check out the Designing a CRUD app.
