<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import Installer from './Installer.svelte'
  import { getSettings } from '$lib/settings';

	export let data;

  const settings = getSettings();

  if(data.lib) {
    $settings.lib = data.lib;
  }
	
	let formComponent
	$: form = formComponent && formComponent.formData()
</script>

<Head title="Get started - Tutorial for Superforms" />

# Get started

<Installer />

Select your environment above and run the install command in your project folder.

If you're starting from scratch, create a new SvelteKit project with `npm create svelte@latest`. Alternatively, open [the Stackblitz project](https://stackblitz.com/edit/sveltekit-superforms-1-tutorial?file=src%2Froutes%2F%2Bpage.server.ts,src%2Froutes%2F%2Bpage.svelte) to follow along in the browser.

{#if ['', 'ajv', 'superstruct'].includes($settings.lib)}

> Please select a validation library above before continuing, as the tutorial changes depending on that.

{/if}

## Creating a Superform

This tutorial will create a Superform containing a name and an email address, ready to be expanded with more form data.

### Creating a validation schema

The main thing required to create a Superform is a validation schema, representing the form data for a single form.

{#if $settings.lib == 'zod'}
```ts
import { z } from 'zod';

const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});
```
{:else if $settings.lib == 'arktype'}
```ts
import { type } from 'arktype';

const schema = type({
  name: 'string',
  email: 'email'
});
```
{:else}
<p>*Under construction*</p>
{/if}

#### Schema caching

The schema should be defined outside the load function, in this case on the top level of the module. **This is very important to make caching work.** The adapter is memoized (cached) with its arguments, so they must be kept in memory. Therefore, define the schema, its options and eventual defaults on the top level of a module, so they always refer to the same object.

### Initializing the form in the load function

To initialize the form, the schema should be used in a load function with the `superValidate` function:

**src/routes/+page.server.ts**

{#if $settings.lib == 'zod'}
```ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

// Define outside the load function so the adapter can be cached
const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = (async () => {
  const form = await superValidate(zod(schema));

  // Always return { form } in load functions and form actions.
  return { form };
});
```
{:else if $settings.lib == 'arktype'}
```ts
import { superValidate } from 'sveltekit-superforms';
import { arktype } from 'sveltekit-superforms/adapters';
import { type } from 'arktype';

// Define outside the load function so the adapter can be cached
const schema = type({
  name: 'string',
  email: 'email'
});

// Defaults should also be defined outside the load function
const defaults = { name: 'Hello world!', email: '' }

export const load = (async () => {
  // Arktype requires explicit default values for now
  const form = await superValidate(arktype(schema, { defaults }));

  // Always return { form } in load functions and form actions.
  return { form };
});
```
{:else}
<p>*Under construction*</p>
{/if}

The Superform server API is called `superValidate`. You can call it in two ways in the load function:

### Empty form

If you want the form to be initially empty, just pass the schema as in the example above, and it will be filled with default values based on the schema. For example, a `string` field results in an empty string, unless you have set a default.

### Populate form from database

If you want to populate the form, you can send data to the form as the first parameter, schema second, like this:

```ts
export const load = async ({ params }) => {
  const user = db.users.findUnique({
    where: { id: params.id }
  });

  if (!user) error(404, 'Not found');

  const form = await superValidate(user, zod(schema));

  // Always return { form } in load functions and form actions.
  return { form };
};
```

As long as the data partially matches the schema, you can pass it directly to `superValidate`. This is especially useful for backend interfaces, where the form usually should be populated based on a url like `/users/123`.

> Errors will be displayed as default when the form is populated, but not when empty. You can modify this behavior [with an option](/concepts/error-handling#initial-form-errors).

### Important note about return values

Unless you call `redirect` or `error`, you should **always** return the form object to the client, either directly or through a helper function. The name of the variable doesn't matter; you can call it `{ loginForm }` or anything else, but it needs to be returned like this in all code paths that returns, both in load functions and form actions.

### Displaying the form

The `superValidate` function returns the data required to instantiate a form on the client, which is now available in `+page.svelte` as `data.form`, as we did `return { form }`. There, we'll use the client part of the API:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';

  export let data;

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

The `superForm` function is used to create a form on the client.

> Two notes: There should be only one `superForm` instance per form - its methods cannot be used in multiple forms. And don't forget the `name` attribute on the form fields! Unless you are using [nested data](/concepts/nested-data), they are required.

This is what the form should look like now:

<Form {data} bind:this={formComponent} />

### Debugging

We can see that the form has been populated with the default values. However, let's add the Superform debugging component called [SuperDebug](/super-debug) to gain more insight:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import SuperDebug from 'sveltekit-superforms';
</script>

<SuperDebug data={$form} />
```

This should be displayed:

<SuperDebug data={$form} />

When editing the form fields (try in the form above), the data is automatically updated. The component also displays the current page status in the right corner.

### Posting data

In the form actions, defined in `+page.server.ts`, we'll use the `superValidate` function again, but now it should handle `FormData`. This can be done in several ways:

- Use the `request` parameter (which contains `FormData`)
- Use the `event` object (which contains the request)
- Use `FormData` directly, if you need to access it before calling `superValidate`.

The most common is to use `request`:

**src/routes/+page.server.ts**

```ts
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);
    console.log(form);

    if (!form.valid) {
      // Again, return { form } and things will just work.
      return fail(400, { form });
    }

    // TODO: Do something with the validated form.data

    // Yep, return { form } here too
    return { form };
  }
};
```

Now we can post the form back to the server. Submit the form, and see what's happening on the server:

```ts
{
  id: 'a3g9kke',
  valid: false,
  posted: true,
  data: { name: 'Hello world!', email: '' },
  errors: { email: [ 'Invalid email' ] },
}
```

This is the validation object returned from `superValidate`, containing the data needed to update the form:

| Property           | Purpose                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **id**          | Id for the schema, to handle [multiple forms](/concepts/multiple-forms) on the same page.                                                                                              |
| **valid**       | Tells you whether the validation succeeded or not. Used on the server and in [events](/concepts/events).                                                                                |
| **posted**      | Tells you if the data was posted (in a form action) or not (in a load function).                                                                                                       |
| **data**        | The posted data, which should be returned to the client using `fail` if not valid.                                                                                                     |
| **errors**      | An object with all validation errors, in a structure reflecting the data.                                                                                                              |

There are some optional properties as well, only being sent in the load function:

| Property           | Purpose |
| ------------------ | ------- |
| **message**     | Can be set as a [status message](/concepts/messages). |
| **constraints** | An object with [HTML validation constraints](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation), that can be spread on input fields. |
| **shape**       | Used internally in error handling. |

You can modify any of these, and they will be updated on the client when you `return { form }`. There are a couple of helper functions for making this more convenient, like [message](/concepts/messages) and [setError](/concepts/error-handling).

### Displaying errors

Now we know that validation has failed and there are errors being sent to the client. We display these by adding properties to the destructuring assignment of `superForm`:

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

As you see, by including `errors`, we can display errors where it's appropriate, and through `constraints` (already provided by the load function), we get browser validation even without JavaScript enabled. The `aria-invalid` attribute is used to [automatically focus](/concepts/error-handling#errorselector) on the first error field.

We now have a fully working form, with convenient handling of data and validation both on the client and server!

There are no hidden DOM manipulations or other secrets; it's just HTML attributes and Svelte stores. No JavaScript needed for the basics.

### Adding progressive enhancement

As a last step, let's add progressive enhancement, so the JS users will have a better experience. It is required to use for example client-side validation and events, and of course to avoid reloading the page when the form is posted.

This is simply added with `enhance`, returned from `superForm`:

```svelte
<script lang="ts">
  const { form, errors, constraints, enhance } = superForm(data.form);
  //                                 ^^^^^^^
</script>

<!-- Add to the form element: -->
<form method="POST" use:enhance>
```

Now the page won't reload when submitting, and we unlock lots of client-side features like events, timers, auto error focus, etc, that you can read about under the Concepts section in the navigation.

The `use:enhance` action takes no arguments; instead, events are used to hook into the SvelteKit use:enhance parameters and more. Check out the [events page](/concepts/events) for details.

## Next steps

This concludes the tutorial (full source code [on Stackblitz]((https://stackblitz.com/edit/sveltekit-superforms-1-tutorial?file=src%2Froutes%2F%2Bpage.server.ts,src%2Froutes%2F%2Bpage.svelte))). To learn the details, keep reading under the Concepts section in the navigation. Especially, if you plan to use nested data (objects and arrays within the schema), read the [nested data](/concepts/nested-data) page carefully. The same goes for having [multiple forms on the same page](/concepts/multiple-forms).

When you're ready for something more advanced, check out the [CRUD tutorial](/crud), which shows how to make a fully working backend in about 150 lines of code.
