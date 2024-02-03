<script lang="ts">
  import Head from '$lib/Head.svelte'
  import fileDebug from './file-debug.png'
</script>

# Version 2 - What's new?

<Head title="What's new in Superforms version 2" />

Superforms 2 has finally been released! Here's a presentation of the new features and improvements:

## File upload support!

Finally, it's possible to handle files with Superforms. Validation even works on the client, with an `on:input` handler:

### Single file input

```ts
const schema = z.object({
  image: z
    .custom<File>()
    .refine((f) => f instanceof File && f.size < 10000, 'Max 10Kb upload size.')
});

const form = await superValidate(formData, zod(schema));
```

```svelte
<input
  type="file"
  name="image"
  accept="image/png, image/jpeg"
  on:input={(e) => ($form.image = e.currentTarget.files?.item(0) ?? null)}
/>
```

### Multiple files

```ts
const schema = z.object({
  images: z
    .custom<File>()
    .refine((f) => f instanceof File && f.size < 10000, 'Max 10Kb upload size.')
    .array()
});

const form = await superValidate(formData, zod(schema));
```

```svelte
<input
  type="file"
  multiple
  name="images"
  accept="image/png, image/jpeg"
  on:input={(e) => ($form.images = Array.from(e.currentTarget.files ?? []))}
/>
```

The only caveat is that in form actions, you must use a special `removeFiles` function when you return a form containing files. This is because file objects cannot be serialized, so they must be removed before returning the form data to the client. It's not a big change:

```ts
import { fail } from '@sveltejs/kit';
import { removeFiles } from 'sveltekit-superforms';

// When using fail
if (!form.valid) return fail(400, removeFiles({ form }));

// Vhen returning just the form:
return removeFiles({ form })

// message and setError works as usual:
return message(form, 'Posted OK!');
```

If you want to prevent file uploads, you can do that with the `{ allowFiles: false }` option in `superValidate`. This will set all files to `undefined`, which will also happen if you have defined [SUPERFORMS_LEGACY](/migration-v2/#the-biggest-change-important). In that case, set `{ allowFiles: true }` to allow files.

## SuperDebug

Now that file uploads is a feature, SuperDebug displays file objects properly:

<img src={fileDebug} alt="SuperDebug displaying a File" />

## Union support!

A requested feature is support for unions, which has always been a bit difficult to handle with `FormData` parsing and default values. It's one thing to have a type system that can define any kind of structure, another to have a form validation library that is supposed to map a list of string values to these types! But unions can now be used in schemas, with a few compromises:

### Unions must have an explicit default value

If a schema field can be more than one type, it's not possible to know what default value should be set for it. Therefore, you must specify a default value for unions explicitly:

```ts
const schema = z.object({
  undecided: z.union([z.string(), z.number()]).default(0)
})
```

### Multi-type unions can only be used when dataType is 'json'

As said, unions are also quite hard to make assumptions about in `FormData`. If `"123"` was posted (as all posted values are strings), should it be parsed as a string or a number, in the above case?

There is no obvious solution, so schemas with unions **that have more than one type** can only be used when the `dataType` option is set to `'json'` (which will bypass the whole `FormData` parsing, as the form data is serialized instead).

## superForm.validate

The `validate` method is very useful for validating the whole form, or a specific field. You can now also call `validate({ update: true })` to trigger a full client-side validation.

## Simplified imports

You may have noticed in the examples that `/client` and `/server` isn't needed anymore, just import everything except adapters from `sveltekit-superforms`. The same goes for `SuperDebug`, which is now the default export of the library:

```ts
import { superForm, superValidate, dateProxy } from 'sveltekit-superforms';
import SuperDebug from 'sveltekit-superforms';
```

The [2.0 release notes](https://github.com/ciscoheat/sveltekit-superforms/releases/tag/v2.0.0) have a full list of changes, and as usual, let me know on Github or Discord if something is unclear or not working.
