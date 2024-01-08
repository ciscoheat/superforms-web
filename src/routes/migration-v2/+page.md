<script lang="ts">
  import Head from '$lib/Head.svelte'
  import fileDebug from './file-debug.png'
</script>

# Superforms v2 - Alpha version

<Head title="Test out Superforms version 2!" />

The next major version of Superforms is now available in an alpha version! It's a huge upgrade, because it now has the potential to **support virtually every validation library out there**.

Not only that, the client validation part has been rewritten to be much more efficient. File uploads are now supported. And of course, Zod is still perfectly usable with just a small modification to the code.

## Test it out!

To update, change your `package.json` entry for `sveltekit-superforms` to `2.0.0-alpha.x`, where `x` is the latest version (see the [Github releases](https://github.com/ciscoheat/sveltekit-superforms/releases) for the latest version):

```json
{
  "devDependencies": {
    "sveltekit-superforms": "2.0.0-alpha.x"
  }
}
```

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

### superValidate

Instead of a Zod schema, you now use an adapter for your favorite validation library. The following are currently supported:

| Library            | Adapter        | Requires defaults |
| ------------------ | -------------- | ----------------- |
| Ajv      | `import { ajv } from 'sveltekit-superforms/adapters'` | No |
| Arktype  | `import { arktype } from 'sveltekit-superforms/adapters'` | Yes |
| Joi      | `import { joi } from 'sveltekit-superforms/adapters'` | No |
| TypeBox  | `import { typebox } from 'sveltekit-superforms/adapters'` | No |
| Valibot  | `import { valibot } from 'sveltekit-superforms/adapters'` | Yes |
| Zod      | `import { zod } from 'sveltekit-superforms/adapters'` | No |

Missing a library? No problem, writing new adapters is super-simple. Let me know on [Discord](https://discord.gg/AptebvVuhB) or [Twitter](https://twitter.com/encodeart).

With the adapter imported, all you do now is wrap the schema with it:

```ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

const form = await superValidate(zod(schema));
```

The libraries that requires defaults don't have full introspection capabilities (yet), in which case you need to supply the default values for the form data as an option:

```ts
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

In the example above, both the schema and the defaults are defined outside the load function, on the top level of the module. **This is very important to make caching work**. The adapter is memoized (cached) with its parameters, so they must be long-lived. Therefore, define the schema and options for the adapter on the top-level of a module.

#### Type parameters

If you have used type parameters for a call to `superValidate` before, or have been using the `SuperValidated` type, you now need to wrap the schema parameter with `Inferred`:

```ts
import type { Inferred } from 'sveltekit-superforms'

type Message = { status: 'success' | 'failure', text: string }

const form = await superValidate<Inferred<typeof schema>, Message>(zod(schema));
```

```ts
import { z } from 'zod';
import type { LoginSchema } from '$lib/schemas';
import type { Inferred } from 'sveltekit-superforms'

export let data: SuperValidated<Inferred<LoginSchema>>;
```

For client-side validation, remember to import an adapter for the `validators` option as well. For the `superform` validation schema, the input parameter can now be `undefined`, be sure to check for that case. 

```ts
import { superform } from 'sveltekit-superforms/adapters';

const { form, errors, enhance } = superForm(data.form, {
  validators: superform({
    id: (id?) => { if(id === undefined || isNaN(id) || id < 3) return 'Id must be larger than 2' },
    name: (name?) => { if(!name || name.length < 2) return 'Name must be at least two characters' }
  })
});
```

The superform adapter is only to be used on the client, it is **not** a replacement for any other validation library. Hopefully, you can switch to something better now.

### superValidateSync -> defaults

The quite popular `superValidateSync` function has changed, since it's not possible to make a synchronous validation anymore. So if you're validating data with `superValidateSync` (in the first parameter), be aware that **superValidateSync cannot do validation anymore**. You need to use a `+page.ts` to do proper validation, as described on the [SPA page](/concepts/spa#using-pagets-instead-of-pageserverts). 

> Since this is a bit of a security issue, `superValidateSync` has been renamed to `defaults`.

Fortunately though, a [quick Github search](https://github.com/search?q=superValidateSync%28&type=code) reveals that most of its usages are with the schema only, which requires no validation and no `+page.ts`. In that case, just call `defaults` with your adapter or default values, and you're good to go:

```ts
// Getting the default values from the schema:
const { form, errors, enhance } = superForm(defaults(zod(schema)), {
  SPA: true,
  validators: zod(schema),
  // ...
})
```

```ts
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

## Removed features

### superForm.fields is removed

The `fields` object returned from `superForm` was an inferior version of [formFieldProxy](/api#formfieldproxysuperform-fieldname-options), and has now been removed. Use `formFieldProxy` to create your own instead.

### superForm tainted option does not support specific fields anymore

You could previously choose what specific fields to untaint with a `fields` option, when updating `$form`. It was a rarely used feature that has now been removed.

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
import { removeFiles, failAndRemoveFiles } from 'sveltekit-superforms/server';

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

### Unions in schemas!

A requested feature is support for unions, which has always been a bit difficult to handle with `FormData` parsing and default values. It's one thing to have a type system that can define any kind of structure, and another to have a form validation library that is supposed to map a list of string values to the types! But unions can now be used in schemas, with a few compromises:

#### Unions must have a default value

If a schema field can be more than one type, it's not possible to know what default value should be set for it. Therefore, you must specify a default value for unions explicitly:

```ts
const schema = z.object({
  undecided: z.union([z.string(), z.number()]).default(0)
})
```

#### Unions can only be used when dataType is 'json'

As said, unions are also quite hard to make assumptions about in `FormData`. If `"123"` was posted (as all posted values are strings), should it be parsed as a string or a number, in the above case?

There is no obvious solution, so schemas with unions can only be used when the `dataType` option is set to `'json'`, which will bypass the whole `FormData` parsing.

### superForm.isTainted

A new `superForm` method is available, used to check whether any part of the form is tainted. Speaking of which, tainted now keeps track of the original data, so if you go back to a previous value, it's not considered tainted anymore.

### superForm.validate

The `validate` method is very useful for validating the whole form, or a specific field. You can now also call `validate({ update: true })` to trigger a full client-side validation.

## Testing help needed!

Even though this is considered an alpha version, all tests are passing from v1, so v2 is definitely not unstable. With your help, I'm certain that we can reach an official release quite soon. Please try it out, convert some old project or try your favorite validation library with it. Report any issues on [Github](https://github.com/ciscoheat/sveltekit-superforms) (preferrably) or on [Discord](https://discord.gg/AptebvVuhB).
