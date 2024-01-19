<script lang="ts">
  import Head from '$lib/Head.svelte'
  import fileDebug from './file-debug.png'
</script>

# Superforms v2 - Next version

<Head title="Test out Superforms version 2!" />

The next major version of Superforms is now available in an alpha version! It's a huge upgrade, because it now has the potential to **support virtually every validation library out there**.

Not only that, the client validation part has been rewritten to be much more efficient. File uploads are now supported. And of course, Zod is still perfectly usable with just a small modification to the code.

## Test it out!

Install `sveltekit-superforms@alpha` with `npm` or `pnpm`:

```bash
pnpm i -D sveltekit-superforms@alpha
```

```bash
npm i -D sveltekit-superforms@alpha
```

Then, with the same command, you need to install your validation library of choice and their eventual dependencies:

| Library  | Install these libraries
| -------- | --------------------------------------------------------- |
| Arktype  | `arktype` |
| Joi      | `joi` |
| TypeBox  | `@sinclair/typebox` |
| Valibot  | `valibot` |
| Yup      | `yup @sodaru/yup-to-json-schema` |
| Zod      | `zod zod-to-json-schema` |

Missing a library? No problem, writing new adapters is super-simple. Let me know on [Discord](https://discord.gg/AptebvVuhB) or [Twitter](https://twitter.com/encodeart).

## Migration and getting started

The headlines show what has changed, so look for them and make the necessary changes in the code.

## Changes

### The biggest change (IMPORTANT)

The biggest breaking change is that the options now follow the SvelteKit defaults more closely:

- resetForm is now `true` as default
- taintedMessage is now `false` as default

But don't worry, there's no need to change the options on every form to migrate. Instead, add the following define in `vite.config.ts` to keep the original behavior:

```diff
export default defineConfig({
   plugins: [sveltekit()],
   test: {
     include: ['src/**/*.{test,spec}.{js,ts}']
   },
+  define: {
+    SUPERFORMS_LEGACY: true
+  }
});
```

You can do the same on a form-by-form basis by setting the `legacy` option on `superForm` to `true` as well.

### superValidate

Instead of a Zod schema, you now use an adapter for your favorite validation library. The following are currently supported:

| Library  | Adapter                                                   | Requires defaults |
| -------- | --------------------------------------------------------- | ----------------- |
| Arktype  | `import { arktype } from 'sveltekit-superforms/adapters'` | Yes |
| Joi      | `import { joi } from 'sveltekit-superforms/adapters'`     | No  |
| TypeBox  | `import { typebox } from 'sveltekit-superforms/adapters'` | No  |
| Valibot  | `import { valibot } from 'sveltekit-superforms/adapters'` | Yes |
| Yup      | `import { yup } from 'sveltekit-superforms/adapters'`     | No  |
| Zod      | `import { zod } from 'sveltekit-superforms/adapters'`     | No  |

With the library installed and the adapter imported, all you need to do is wrap the schema with it:

```ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const form = await superValidate(zod(schema));
```

The libraries in the list that requires defaults don't have full introspection capabilities (yet), in which case you need to supply the default values for the form data as an option:

```ts
import { type } from 'arktype';

// Arktype schema, powerful stuff
const schema = type({
  name: 'string',
  email: 'email',
  tags: '(string>=2)[]>=3',
  score: 'integer>=0'
});

const defaults = { name: '', email: '', tags: [], score: 0 };

export const load = async () => {
  const form = await superValidate(arktype(schema, { defaults }));
  return { form };
};
```

#### Schema caching

In the example above, both the schema and the defaults are defined outside the load function, on the top level of the module. **This is very important to make caching work.** The adapter is memoized (cached) with its arguments, so they must be long-lived. Therefore, define the schema and options for the adapter on the top level of a module, so they always refer to the same object.

#### Type parameters

If you have used type parameters for a call to `superValidate` before, or have been using the `SuperValidated` type, you now need to wrap the schema parameter with `Infer`:

```ts
import type { Infer } from 'sveltekit-superforms'

type Message = { status: 'success' | 'failure', text: string }

const form = await superValidate<Infer<typeof schema>, Message>(zod(schema));
```

```ts
import { z } from 'zod';
import type { LoginSchema } from '$lib/schemas';
import type { Infer } from 'sveltekit-superforms'

export let data: SuperValidated<Infer<LoginSchema>>;
```

#### Optimized client-side validation

The client-side validation is using the smallest possible part of the adapter, to minimize the bundle size for the client. To use it, append `Client` to the adapter import, for example:

```ts
import { valibotClient } from 'sveltekit-superforms/adapters';
import { schema } from './schema.js';

const { form, errors, enhance } = superForm(data.form, {
  validators: valibotClient(schema)
});
```

> This works with the same schema as the one used on the server. If you need to switch schemas, you need the full adapter.

For the built-in Superforms validation, import `superform` (note the lower case). The input parameter can now be `undefined`, be sure to check for that case:

```ts
import { superform } from 'sveltekit-superforms/adapters';

const { form, errors, enhance } = superForm(data.form, {
  validators: superform({
    id: (id?) => { if(id === undefined || isNaN(id) || id < 3) return 'Id must be larger than 2' },
    name: (name?) => { if(!name || name.length < 2) return 'Name must be at least two characters' }
  })
});
```

The superform adapter can only to be used on the client, and is in general **not** a replacement for any other validation library. Hopefully, you can switch to something better now.

### superValidateSync is renamed to defaults

The quite popular `superValidateSync` function has changed, since it's not possible to make a synchronous validation anymore. So if you're validating data with `superValidateSync` (in the first parameter), be aware that **superValidateSync cannot do validation anymore**. You need to use a `+page.ts` to do proper validation, as described on the [SPA page](/concepts/spa#using-pagets-instead-of-pageserverts). 

> Since this is a bit of a security issue, `superValidateSync` has been renamed to `defaults`.

Fortunately though, a [quick Github search](https://github.com/search?q=superValidateSync%28&type=code) reveals that most of its usages are with the schema only, which requires no validation and no `+page.ts`. In that case, just call `defaults` with your adapter or default values, and you're good to go:

```ts
import { defaults } from 'sveltekit-superforms'

// Getting the default values from the schema:
const { form, errors, enhance } = superForm(defaults(zod(schema)), {
  SPA: true,
  validators: zod(schema),
  // ...
})
```

```ts
import { defaults } from 'sveltekit-superforms'

// Supplying your own default values
const { form, errors, enhance } = superForm(defaults({ name: 'New user', email: '' }), {
  SPA: true,
  validators: zod(schema),
  // ...
})
```

#### The id option

It's not possible to set the `id` option to `undefined` anymore, which is very rare anyway. The id is set automatically to a string hash of the schema by default.

### arrayProxy

A simple change: `fieldErrors` is renamed to `valueErrors`.

### Enums in schemas

Previously, it was possible to post the name of the enum as a string, even if it was a numeric enum. That's not possible anymore:

```ts
// Cannot post the string "Delayed" and expect it to be parsed as 2 anymore.
enum FetchStatus {
  Idle = 0,
  Submitting = 1,
  Delayed = 2,
  Timeout = 3
}
```

For string enums, it works to post strings, of course.

### Use isTainted to check tainted status

A new `superForm.isTainted` method is available, to check whether any part of the form is tainted. Use it instead of checking the `$tainted` store, which may give unexpected results.

```ts
const { form, enhance, isTainted } = superForm(form.data);

// Check the whole form
if(isTainted())

// Check a part of the form
if(isTainted('name'))
```

Speaking of tainted, it now keeps track of the original data, so if you go back to a previous value, it's not considered tainted anymore.

### Schema/validation changes

The underlying data model for Superforms is now [JSON Schema](https://json-schema.org/), which is what makes it possible to support all the validation libraries. Some changes had to be made for this to work:

#### No side-effects for default values.

If no data is sent to `superValidate`, and no errors should be displayed, as is default in the load function:

```ts
const form = await superValidate(zod(schema));
```

Then the default values won't be parsed with the schema. In other words, no side-effects like `z.refine` will be executed. If you need initial validation of even the default data, set the `errors` option to `true`, and optionally clear the errors after validation:

```ts
const form = await superValidate(zod(schema), { errors: true });
form.errors = {}
```

#### Default values aren't required fields anymore

In hindsight, this should have been the default, given the forgiving nature of the data coercion and parsing. When a default value exists, the field is not required anymore. If that field isn't posted, the default value will be added to `form.data`.

### Components

Generic components were previously using Zod types for type safety. It is simpler now:

**TextInput.svelte**

```svelte
<script lang="ts" context="module">
  type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

  export let form: SuperForm<T, unknown>;
  export let field: FormPathLeaves<T>;
  export let label = '';

  const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<label>
  {#if label}{label}<br />{/if}
  <input
    name={field}
    type="text"
    aria-invalid={$errors ? 'true' : undefined}
    bind:value={$value}
    {...$constraints}
    {...$$restProps}
  />
  {#if $errors}<span class="invalid">{$errors}</span>{/if}
</label>
```

**+page.svelte**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import TextInput from './TextInput.svelte';

  export let data;

  const supForm = superForm(data.form);
  const { form, enhance } = supForm;
</script>

<form method="POST" use:enhance>
  <TextInput form={supForm} field="name" />
  <button>Submit</button>
</form>
```

## Removed features

### superForm.fields is removed

The `fields` object returned from `superForm` was an inferior version of [formFieldProxy](/api#formfieldproxysuperform-fieldname-options), and has now been removed. Use `formFieldProxy` to create your own instead.

### superForm tainted option does not support specific fields anymore

You could previously choose what specific fields to untaint with a `fields` option, when updating `$form`. It was a rarely used feature that has now been removed.

### onError "message" parameter is removed

Previously, there was a `message` parameter in the onError event. It's gone now, since it was pointing to the message store, and you might as well just assign it directly:

```ts
const { form, message, enhance } = superForm(data.form, {
  onError({ result }) {
    $message = result.error.message
  }
})
```

### flashMessage.onError "message" parameter renamed to "flashMessage"

To be more consistent with the message parameter, the rarely used `flashMessage` option in `superForm` has an `onError` event with a `message` parameter, but it is now renamed to `flashMessage` to signify which message can actually be updated.

## New features

Of course, there are some new features, so the migration will be worthwhile.

### File upload support!

Finally, it's possible to handle files with Superforms. By setting the `allowFiles` option, they can be validated like any other value:

```ts
const schema = z.object({
  image: z
    .custom<File>()
    .refine((f) => f instanceof File && f.size < 10000, 'Max 10Kb upload size.')
});

const form = await superValidate(formData, zod(schema), { allowFiles: true });
```

Validation even works on the client, with an `on:input` handler:

```svelte
<input
  type="file"
  name="image"
  accept="image/png, image/jpeg"
  on:input={(e) => ($form.image = e.currentTarget.files?.item(0) ?? null)}
/>
```

The only caveat is that in form actions, you must use a special `failAndRemoveFiles` function instead of SvelteKit's `fail`, when you return a form containing files, or `removeFiles` when returning the form directly. This is because file objects cannot be serialized, so they must be removed before returning the form data to the client. But it's not a big change:

```ts
import { removeFiles, failAndRemoveFiles } from 'sveltekit-superforms';

// Instead of fail:
if (!form.valid) return failAndRemoveFiles(400, { form });

// message and setError works as usual:
return message(form, 'Posted OK!');

// Need removeFiles when returning just the form:
return removeFiles({ form })
```

### SuperDebug

Now that files are a feature, SuperDebug displays file objects properly:

<img src={fileDebug} alt="SuperDebug displaying a File" />

### Union support!

A requested feature is support for unions, which has always been a bit difficult to handle with `FormData` parsing and default values. It's one thing to have a type system that can define any kind of structure, but another to have a form validation library that is supposed to map a list of string values to the types! But unions can now be used in schemas, with a few compromises:

#### Unions must have a default value

If a schema field can be more than one type, it's not possible to know what default value should be set for it. Therefore, you must specify a default value for unions explicitly:

```ts
const schema = z.object({
  undecided: z.union([z.string(), z.number()]).default(0)
})
```

#### Unions can only be used when dataType is 'json'

As said, unions are also quite hard to make assumptions about in `FormData`. If `"123"` was posted (as all posted values are strings), should it be parsed as a string or a number, in the above case?

There is no obvious solution, so schemas with unions can only be used when the `dataType` option is set to `'json'`, which will bypass the whole `FormData` parsing, as the form data is serialized instead.

### superForm.validate

The `validate` method is very useful for validating the whole form, or a specific field. You can now also call `validate({ update: true })` to trigger a full client-side validation.

### Simplified imports

You may have noticed in the examples that `/client` and `/server` isn't needed anymore, just import everything except adapters from `sveltekit-superforms`. The same goes for `SuperDebug`, which is now the default export of the library:

```ts
import { superForm, superValidate, dateProxy } from 'sveltekit-superforms';
import SuperDebug from 'sveltekit-superforms';
```

## Testing help needed!

Even though this is considered an alpha version, all tests are passing from v1, so v2 is definitely not unstable. With your help, I'm certain that we can reach an official release quite soon. Please try it out, convert some old project or try your favorite validation library with it. Report any issues on [Github](https://github.com/ciscoheat/sveltekit-superforms) (preferrably) or on [Discord](https://discord.gg/AptebvVuhB).
