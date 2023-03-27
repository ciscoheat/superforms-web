## Get started

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
