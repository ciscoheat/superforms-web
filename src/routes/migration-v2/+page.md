<script lang="ts">
  import Head from '$lib/Head.svelte'
  import fileDebug from './file-debug.png'
  import Installer from './Installer.svelte'
</script>

# Superforms v2 - Migration guide

<Head title="Superforms v2 - Migration guide" />

Version 2 is a big upgrade, because it now has the potential to **support virtually every validation library out there**. Of course, Zod is still perfectly usable with just a small modification to the code.

## Changes

Here's a brief list of the changes, keep reading further down for details.

### The biggest change (IMPORTANT)

The biggest breaking change is that two options now follow the SvelteKit defaults more closely:

- resetForm is now `true` as default
- taintedMessage is now `false` as default

But don't worry, there's no need to change these options on every form to migrate. Instead, add the following define in `vite.config.ts` to keep the original behavior:

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

> When legacy mode is set and you want to use the new [file uploads](/concepts/files) feature, you need to add `{ allowFiles: true }` as an option to `superValidate` in form actions.

### superValidate

Instead of a Zod schema, you now use an adapter for your favorite validation library. The following are currently supported:

| Library  | Adapter                                                   | Requires defaults |
| -------- | --------------------------------------------------------- | ----------------- |
| Arktype  | `import { arktype } from 'sveltekit-superforms/adapters'` | Yes |
| Joi      | `import { joi } from 'sveltekit-superforms/adapters'`     | No  |
| TypeBox  | `import { typebox } from 'sveltekit-superforms/adapters'` | No  |
| Valibot  | `import { valibot } from 'sveltekit-superforms/adapters'` | No  |
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

In the example above, both the schema and the defaults are defined outside the load function, on the top level of the module. **This is very important to make caching work.** The adapter is memoized (cached) with its arguments, so they must be kept in memory. Therefore, define the schema, options and eventual default values for the adapter on the top level of a module, so they always refer to the same object.

#### Optimized client-side validation

The client-side validation is using the smallest possible part of the adapter, to minimize the bundle size for the client. To use it, append `Client` to the adapter import, for example:

```ts
import { valibotClient } from 'sveltekit-superforms/adapters';
import { schema } from './schema';

const { form, errors, enhance, options } = superForm(data.form, {
  validators: valibotClient(schema)
});
```

> This works with the same schema as the one used on the server. If you need to switch schemas on the client (with `options.validators`), you need the full adapter.

The built-in Superforms validator is now deprecated, since it requires you to do much of the type checking yourself. To keep using it, import `superformClient` and use the new `Infer` type to type it correctly with the schema, as in the following example. The input parameter can now be `undefined` as well, be sure to check for that case.

```ts
import type { Infer } from 'sveltekit-superforms';
import type { schema } from './schema';
import { superformClient } from 'sveltekit-superforms/adapters';

const { form, errors, enhance } = superForm(data.form, {
  validators: superformClient<Infer<typeof schema>>({
    name: (name?) => { 
      if(!name || name.length < 2) return 'Name must be at least two characters' 
    }
  })
});
```

As said, this adapter requires you to do much of the error-prone type checking manually, so in general it is **not** a replacement for the other validation libraries. Use it only for a very good reason!

### SuperValidated type parameters have changed

If you have used type parameters for a call to `superValidate` before, or have been using the `SuperValidated` type, you now need to wrap the schema parameter with `Infer`:

```ts
import type { Infer } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { schema } from './schema'

type Message = { status: 'success' | 'failure', text: string }

const form = await superValidate<Infer<typeof schema>, Message>(zod(schema));
```

```ts
import type { LoginSchema } from '$lib/schemas';
import type { Infer } from 'sveltekit-superforms'

export let data: SuperValidated<Infer<LoginSchema>>;
```

If your schema uses transformations or pipes, so the input and output types are different, there's an `InferIn` type and a third type parameter that can be used.

```ts
import type { Infer, InferIn } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { schema } from './schema'

type Message = { status: 'success' | 'failure', text: string }
type Validated = SuperValidated<Infer<typeof schema>, Message, InferIn<typeof schema>>;

const form : Validated = await superValidate(zod(schema));
```

Also, `constraints` are now optional in the `SuperValidated` type, since they won't be returned when posting data anymore, only when loading data, to save some bandwidth. This is only relevant if you're changing the constraints before calling `superForm`.

### superValidateSync is renamed to defaults

The quite popular `superValidateSync` function has changed, since it's not possible to make a synchronous validation anymore (not all validation libaries are synchronous). So if you've validated data with `superValidateSync` (in its first parameter), be aware that **superValidateSync cannot do validation anymore**. You need to use a `+page.ts` to do proper validation, as described on the [SPA page](/concepts/spa#using-pagets-instead-of-pageserverts).

Since this is a bit of a security issue, `superValidateSync` has been renamed to `defaults`.

Fortunately though, a [quick Github search](https://github.com/search?q=superValidateSync%28&type=code) reveals that most of its usages are with the schema only, which requires no validation and no `+page.ts`. In that case, just call `defaults` with your adapter and eventual initial data, and you're good to go:

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

// Supplying initial data (can be partial, won't be validated)
const initialData = { name: 'New user' }
const { form, errors, enhance } = superForm(defaults(initialData, zod(schema)), {
  SPA: true,
  validators: zod(schema),
  // ...
})
```

Note that `superValidate` can be used anywhere but on the top-level of Svelte components, so it's not completely removed from the client and SPA usage. But client-side validation is more of a convenience than ensuring data integrity. Always let an external API or a server request do a proper validation of the data before it's stored or used somewhere.

### validate method with no arguments is renamed to validateForm

Previously, you could do `const result = await validate()` to get a validation result for the whole form. This overload caused a lot of typing issues, so it has now been split into `validate` for fields, and `validateForm` for the whole form. Just replace the calls to `validate()` with `validateForm()` to fix this.

### id option must be a string

It's not possible to set the `id` option to `undefined` anymore, which is very rare anyway. By default, the id is automatically set to a string hash of the schema. It's only for multiple forms on the same page, or dynamically generated schemas, that you may want to change it.

### arrayProxy

A simple change: `fieldErrors` is renamed to `valueErrors`.

### intProxy and numberProxy

The `emptyIfZero` setting is removed from `numberProxy` and `intProxy`.

### The defaultValidators option has moved

Another simple change: If you've been using `defaultValidators`, set the value `'clear'` on the `validators` option instead.

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

#### Enums must have an explicit default value

Enums don't have a default "empty" value unlike other types, so it's not certain what the default value should be. To be able to set an enum as required, the first enum value will be used, unless there is an explicit default.

```ts
export enum Foo {
  A = 2,
  B = 3
}

const schema = z.object({
  foo: z.nativeEnum(Foo), // Default is Foo.A, field is required
  zodEnum: z.enum(['a', 'b', 'c']).default('b') // Explicit default 'b', field is optional
})
```

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

#### Fields with default values aren't required anymore

In hindsight, this should have been the default, given the forgiving nature of the data coercion and parsing. When a default value exists, the field is not required anymore. If that field isn't posted, its default value will be added to `form.data`.

### Components

Generic components were previously using Zod types for type safety. It is simpler now:

**TextInput.svelte**

```svelte
<script lang="ts" context="module">
  type T = Record<string, unknown>;
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
  import { formFieldProxy, type SuperForm, type FormPathLeaves } from 'sveltekit-superforms';

  export let form: SuperForm<T>;
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

### superForm does not support untainting specific fields anymore

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

Of course, there are also new features, so the migration will be worthwhile. Check the [what's new](/whats-new-v2) page for more information.
