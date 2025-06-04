<script lang="ts">
  import Head from '$lib/Head.svelte';
  import Form from './Form.svelte';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import Installer from './Installer.svelte';
  import SvelteLab from './SvelteLab.svelte';
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

{#if $settings.lib == 'json-schema'}

If you're using JSON Schema on the client, you also need to modify **vite.config.ts**:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ['@exodus/schemasafe'] // Add this to make client-side validation work
  }
});
```

{/if}

If you're starting from scratch, create a new SvelteKit project:

{#if $settings.pm == 'npm i -D'}

```npm
npx sv create my-app
```

{:else if $settings.pm == 'pnpm i -D'}

```npm
pnpx sv create my-app
```

{:else if $settings.pm == 'yarn add --dev'}

```npm
npx sv create my-app
```

{/if}

<SvelteLab lib={$settings.lib} />

{#if ['', 'ajv', 'n/a'].includes($settings.lib)}

> Please select a validation library above before continuing, as the tutorial changes depending on that.

{/if}

## Creating a Superform

This tutorial will create a Superform with a name and email address, ready to be expanded with more form data.

### Creating a validation schema

The main thing required to create a Superform is a validation schema, representing the form data for a single form:

{#if $settings.lib == 'arktype'}

```ts
import { type } from 'arktype';

const schema = type({
  name: 'string',
  email: 'email'
});
```

{:else if $settings.lib == 'class-validator'}

```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

class ClassValidatorSchema {
  @IsString()
  @MinLength(2)
  name: string = '';

  @IsString()
  @IsEmail()
  email: string = '';
}

export const schema = ClassValidatorSchema;
```

{:else if $settings.lib == 'effect'}

```ts
import { Schema } from 'effect';

// effect deliberately does not provide email parsing out of the box
// https://github.com/Effect-TS/schema/issues/294
// here is a simple email regex that does the job
const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

const schema = Schema.Struct({
  name: Schema.String.annotations({ default: 'Hello world!' }),
  email: Schema.String.pipe(
    Schema.filter((s) => emailRegex.test(s) || 'must be a valid email', {
      jsonSchema: { format: 'email' }
    })
  )
});
```

{:else if $settings.lib == 'joi'}

```ts
import Joi from 'joi';

const schema = Joi.object({
  name: Joi.string().default('Hello world!'),
  email: Joi.string().email().required()
});
```

{:else if $settings.lib == 'json-schema'}

```ts
import type { JSONSchema } from 'sveltekit-superforms';

export const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, default: 'Hello world!' },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email'],
  additionalProperties: false,
  $schema: 'http://json-schema.org/draft-07/schema#'
} as const satisfies JSONSchema; // Define as const to get type inference
```

> Currently, definitions and references ($ref properties in the JSON Schema) aren't supported. You need to resolve the references yourself before using the adapter.

{:else if $settings.lib == 'superstruct'}

```ts
import { object, string, defaulted, define } from 'superstruct';

const email = () => define<string>('email', (value) => String(value).includes('@'));

export const schema = object({
  name: defaulted(string(), 'Hello world!'),
  email: email()
});
```

{:else if $settings.lib == '@sinclair/typebox'}

```ts
import { Type } from '@sinclair/typebox';

const schema = Type.Object({
  name: Type.String({ default: 'Hello world!' }),
  email: Type.String({ format: 'email' })
});
```

{:else if $settings.lib == 'valibot'}

```ts
import { object, string, email, optional, pipe, minLength } from 'valibot';

export const schema = object({
  name: pipe(optional(string(), 'Hello world!'), minLength(2)),
  email: pipe(string(), email())
});
```

{:else if $settings.lib == '@vinejs/vine'}

```ts
import Vine from '@vinejs/vine';

const schema = Vine.object({
  name: Vine.string(),
  email: Vine.string().email()
});
```

{:else if $settings.lib == 'yup'}

```ts
import { object, string } from 'yup';

const schema = object({
  name: string().default('Hello world!'),
  email: string().email().required()
});
```

{:else if $settings.lib == 'zod'}

```ts
import { z } from 'zod';

const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});
```

{:else if $settings.lib == 'zod4'}

```ts
import { z } from 'zod/v4';

const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.email()
});
```

{:else if $settings.lib == 'zodmini'}

```ts
import { z } from 'zod/v4-mini';

const schema = z.object({
  name: z._default(z.string(), 'Hello world!'),
  email: z.email('Invalid email')
});
```

{:else}

> Select a validation library at the top of the page to see the example code.

{/if}

#### Schema caching

Define the schema *outside* the load function, on the top level of the module. **This is very important to make caching work.** The adapter is memoized (cached) with its arguments, so they must be kept in memory. 

Therefore, define the schema, its options and potential defaults on the top level of a module, so they always refer to the same object.

### Initializing the form in the load function

To initialize the form, you import `superValidate` and an adapter for your validation library of choice in a load function:

**src/routes/+page.server.ts**

{#if $settings.lib == 'arktype'}

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
const defaults = { name: 'Hello world!', email: '' };

export const load = async () => {
  // Arktype requires explicit default values for now
  const form = await superValidate(arktype(schema, { defaults }));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'class-validator'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { classvalidator } from 'sveltekit-superforms/adapters';
import { IsEmail, IsString, MinLength } from 'class-validator';

// Define outside the load function so the adapter can be cached
class ClassValidatorSchema {
  @IsString()
  @MinLength(2)
  name: string = '';

  @IsString()
  @IsEmail()
  email: string = '';
}

const schema = ClassValidatorSchema;

// Defaults should also be defined outside the load function
const defaults = new schema();

export const load = async () => {
  // class-validator requires explicit default values for now
  const form = await superValidate(classvalidator(schema, { defaults }));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'effect'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { effect } from 'sveltekit-superforms/adapters';
import { Schema } from 'effect';

const emailRegex = /^[^@]+@[^@]+.[^@]+$/;

const schema = Schema.Struct({
  name: Schema.String.annotations({ default: 'Hello world!' }),
  email: Schema.String.pipe(
    Schema.filter((s) => emailRegex.test(s) || 'must be a valid email', {
      jsonSchema: { format: 'email' }
    })
  )
});

export const load = async () => {
  const form = await superValidate(effect(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'joi'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { joi } from 'sveltekit-superforms/adapters';
import Joi from 'joi';

// Define outside the load function so the adapter can be cached
const schema = Joi.object({
  name: Joi.string().default('Hello world!'),
  email: Joi.string().email().required()
});

export const load = async () => {
  const form = await superValidate(joi(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'json-schema'}

```ts
import { superValidate, type JSONSchema } from 'sveltekit-superforms';
import { schemasafe } from 'sveltekit-superforms/adapters';

export const schema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 2, default: 'Hello world!' },
    email: { type: 'string', format: 'email' }
  },
  required: ['name', 'email'],
  additionalProperties: false,
  $schema: 'http://json-schema.org/draft-07/schema#'
} as const satisfies JSONSchema;

export const load = async () => {
  // The adapter must be defined before superValidate for JSON Schema.
  const adapter = schemasafe(schema);
  const form = await superValidate(request, adapter);

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'superstruct'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { superstruct } from 'sveltekit-superforms/adapters';
import { object, string, defaulted, define } from 'superstruct';

const email = () => define<string>('email', (value) => String(value).includes('@'));

// Define outside the load function so the adapter can be cached
const schema = object({
  name: defaulted(string(), 'Hello world!'),
  email: email()
});

// Defaults should also be defined outside the load function
const defaults = { name: 'Hello world!', email: '' };

export const load = async () => {
  const form = await superValidate(superstruct(schema, { defaults }));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == '@sinclair/typebox'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { typebox } from 'sveltekit-superforms/adapters';
import { Type } from '@sinclair/typebox';

// Define outside the load function so the adapter can be cached
const schema = Type.Object({
  name: Type.String({ default: 'Hello world!' }),
  email: Type.String({ format: 'email' })
});

export const load = async () => {
  const form = await superValidate(typebox(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'valibot'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { object, string, email, optional, pipe, minLength } from 'valibot';

// Define outside the load function so the adapter can be cached
const schema = object({
  name: pipe(optional(string(), 'Hello world!'), minLength(2)),
  email: pipe(string(), email())
});

export const load = async () => {
  const form = await superValidate(valibot(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == '@vinejs/vine'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { vine } from 'sveltekit-superforms/adapters';
import Vine from '@vinejs/vine';

// Define outside the load function so the adapter can be cached
const schema = Vine.object({
  name: Vine.string(),
  email: Vine.string().email()
});

// Defaults should also be defined outside the load function
const defaults = { name: 'Hello world!', email: '' };

export const load = async () => {
  const form = await superValidate(vine(schema, { defaults }));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'yup'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { yup } from 'sveltekit-superforms/adapters';
import { object, string } from 'yup';

// Define outside the load function so the adapter can be cached
const schema = object({
  name: string().default('Hello world!'),
  email: string().email().required()
});

export const load = async () => {
  const form = await superValidate(yup(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'zod'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

// Define outside the load function so the adapter can be cached
const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.string().email()
});

export const load = async () => {
  const form = await superValidate(zod(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'zod4'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod/v4';

// Define outside the load function so the adapter can be cached
const schema = z.object({
  name: z.string().default('Hello world!'),
  email: z.email()
});

export const load = async () => {
  const form = await superValidate(zod4(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else if $settings.lib == 'zodmini'}

```ts
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod/v4-mini';

// Define outside the load function so the adapter can be cached
const schema = z.object({
	name: z._default(z.string(), 'Hello world!'),
	email: z.email('Invalid email')
});

export const load = async () => {
  const form = await superValidate(zod4(schema));

  // Always return { form } in load functions
  return { form };
};
```

{:else}

> Select a validation library at the top of the page to see the example code.

{/if}

The Superforms server API is called `superValidate`. You can call it in two ways in the load function:

### Empty form

If you want the form to be initially empty, just pass the adapter as in the example above, and the form will be filled with default values based on the schema. For example, a `string` field results in an empty string, unless you have specified a default.

### Populate form from database

If you want to populate the form, usually from a database, you can send data to `superValidate` as the first parameter, adapter second, like this:

```ts
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  // Replace with your database
  const user = db.users.findUnique({
    where: { id: params.id }
  });

  if (!user) error(404, 'Not found');

  const form = await superValidate(user, your_adapter(schema));

  // Always return { form } in load functions
  return { form };
};
```

As long as the data partially matches the schema, you can pass it directly to `superValidate`. This is useful for backend interfaces, where the form should usually be populated based on a url like `/users/123`.

> Errors will be displayed when the form is populated, but not when empty. You can modify this behavior [with an option](/concepts/error-handling#initial-form-errors).

### Important note about return values

Unless you call the SvelteKit `redirect` or `error` functions, you should **always** return the form object to the client, either directly or through a helper function. The name of the variable doesn't matter; you can call it `{ loginForm }` or anything else, but it needs to be returned like this in all code paths that returns, both in load functions and form actions. If you don't, the form won't be updated with new data (like errors) on the client.

## Posting data

In the form actions, also defined in `+page.server.ts`, we'll use `superValidate` again, but now it should handle `FormData`. This can be done in several ways:

- Use the `request` parameter (which contains `FormData`)
- Use the `event` object (which contains the request)
- Use `FormData` directly, if you need to access it before calling `superValidate`.

The most common is to use `request`:

**src/routes/+page.server.ts**

{#if $settings.lib == 'json-schema'}

```ts
import { message } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    // The adapter must be defined before superValidate for JSON Schema.
    const adapter = schemasafe(schema);
    const form = await superValidate(request, adapter);

    console.log(form);

    if (!form.valid) {
      // Return { form } and things will just work.
      return fail(400, { form });
    }

    // TODO: Do something with the validated form.data

    // Return the form with a status message
    return message(form, 'Form posted successfully!');
  }
};
```

{:else if $settings.lib == 'class-validator' || $settings.lib == 'superstruct' || $settings.lib == 'arktype' || $settings.lib == '@vinejs/vine'}

```ts
import { message } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, your_adapter(schema, { defaults }));
    console.log(form);

    if (!form.valid) {
      // Return { form } and things will just work.
      return fail(400, { form });
    }

    // TODO: Do something with the validated form.data

    // Return the form with a status message
    return message(form, 'Form posted successfully!');
  }
};
```

{:else}

```ts
import { message } from 'sveltekit-superforms';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, your_adapter(schema));
    console.log(form);

    if (!form.valid) {
      // Return { form } and things will just work.
      return fail(400, { form });
    }

    // TODO: Do something with the validated form.data

    // Return the form with a status message
    return message(form, 'Form posted successfully!');
  }
};
```

{/if}

## For simple forms

If you have a very simple form and no intentions to use any client-side functionality like events, loading spinners, nested data, etc, then you don't have to include the client part, which the rest of the tutorial is about. There's a small example on how to display errors and messages without the client [here](/examples?tag=runes). Enjoy the simplicity! But if you're curious about the numerous client-side features, keep reading:

## Displaying the form

The data from `superValidate` is now available in `+page.svelte` as `data.form`, as we did a `return { form }`. Now we can use the client part of the API:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();

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

The `superForm` function is used to create a form on the client, and `bind:value` is used to create a two-way binding between the form data and the input fields.

> Two notes: There should be only one `superForm` instance per form - its methods cannot be used in multiple forms. And don't forget the `name` attribute on the input fields! Unless you are using [nested data](/concepts/nested-data), they are required.

This is what the form should look like now:

<Form {data} bind:this={formComponent} />

### Debugging

We can see that the form has been populated with the default values from the schema. But let's add the debugging component [SuperDebug](/super-debug) to look behind the scenes:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import SuperDebug from 'sveltekit-superforms';
</script>

<SuperDebug data={$form} />
```

This should be displayed:

<SuperDebug data={$form} />

When editing the form fields (try in the form above), the data is automatically updated. 

SuperDebug also displays a copy button and the current page status in the right corner. There are many [configuration options](/super-debug) available.

## Posting the form

Now we can post the form back to the server. Submit the form, and see what's happening on the server:

```ts
{
  id: 'a3g9kke',
  valid: false,
  posted: true,
  data: { name: 'Hello world!', email: '' },
  errors: { email: [ 'Invalid email' ] }
}
```

This is the validation object returned from `superValidate`, containing the data needed to update the form:

| Property    | Purpose                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| **id**      | Id for the schema, to handle [multiple forms](/concepts/multiple-forms) on the same page.                |
| **valid**   | Tells you whether the validation succeeded or not. Used on the server and in [events](/concepts/events). |
| **posted**  | Tells you if the data was posted (in a form action) or not (in a load function).                         |
| **data**    | The posted data, which should be returned to the client using `fail` if not valid.                       |
| **errors**  | An object with all validation errors, in a structure reflecting the data.                                |
| **message** | (optional) Can be set as a [status message](/concepts/messages).                                         |

There are some other properties as well, only being sent in the load function:

| Property        | Purpose                                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **constraints** | An object with [HTML validation constraints](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation), that can be spread on input fields. |
| **shape**       | Used internally in error handling.                                                                                                                                                     |

You can modify any of these, and they will be updated on the client when you `return { form }`. There are a couple of helper functions for making this more convenient, like [message](/concepts/messages) and [setError](/concepts/error-handling).

### Displaying errors

Now we know that validation has failed and there are errors being sent to the client. We display these by adding properties to the destructuring assignment of `superForm`:

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  const { form, errors, constraints, message } = superForm(data.form);
  //            ^^^^^^  ^^^^^^^^^^^  ^^^^^^^
</script>

{#if $message}<h3>{$message}</h3>{/if}

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

By including the `errors` store, we can display errors where appropriate, and through `constraints` we'll get browser validation even without JavaScript enabled. 

The `aria-invalid` attribute is used to [automatically focus](/concepts/error-handling#errorselector) on the first error field. And finally, we included the [status message](/concepts/messages) above the form to show if it was posted successfully.

We now have a fully working form, with convenient handling of data and validation both on the client and server!

There are no hidden DOM manipulations or other secrets; it's just HTML attributes and Svelte stores, which means it works perfectly with server-side rendering. No JavaScript is required for the basics.

### Adding progressive enhancement

As a last step, let's add progressive enhancement, so JavaScript users will have a nicer experience. We also need it for enabling [client-side validation](/concepts/client-validation) and [events](/concepts/events), and of course to avoid reloading the page when the form is posted.

This is simply done with `enhance`, returned from `superForm`:

```svelte
<script lang="ts">
  const { form, errors, constraints, message, enhance } = superForm(data.form);
  //                                          ^^^^^^^
</script>

<!-- Add to the form element: -->
<form method="POST" use:enhance>
```

Now the page won't fully reload when submitting, and we unlock lots of client-side features like timers for [loading spinners](/concepts/timers), [auto error focus](/concepts/error-handling#errorselector), [tainted fields](/concepts/tainted), etc, which you can read about under the Concepts section in the navigation.

The `use:enhance` action takes no arguments; instead, events are used to hook into the SvelteKit use:enhance parameters and more. Check out the [events page](/concepts/events) for details.

## Next steps

This concludes the tutorial! To learn the details, keep reading under the Concepts section in the navigation. A [status message](/concepts/messages) is very common to add, for example. Also, if you plan to use nested data (objects and arrays within the schema), read the [nested data](/concepts/nested-data) page carefully. The same goes for having [multiple forms on the same page](/concepts/multiple-forms).

When you're ready for something more advanced, check out the [CRUD tutorial](/crud), which shows how to make a fully working backend in about 150 lines of code.

Enjoy your Superforms!
