<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Next from '$lib/Next.svelte'
  import { concepts } from '$lib/navigation/sections'
</script>

# File uploads

<Head title="File upload and validation" />

From version 2, Superforms has full support for file uploads. For that, you need a schema that can validate files. Zod has this possibility:

```ts
import { fail } from '@sveltejs/kit';
import { superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
  image: z
    .instanceof(File, { message: 'Please upload a file.'})
    .refine((f) => f.size < 100_000, 'Max 100 kB upload size.')
});

export const load = async () => {
  return { 
    form: await superValidate(zod(schema))
  }
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(schema));

    if (!form.valid) {
      return fail(400, withFiles({ form }));
    }

    // TODO: Do something with the image
    console.log(form.data.image);

    // See note about withFiles further down
    return withFiles({ form });
  }
};
```

Then you need a form with the proper [enctype](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/enctype) value on the form, and a file input field:

```svelte
<form method="POST" enctype="multipart/form-data">
  <input type="file" name="image" /> 
  <button>Submit</button>
</form>
```

## Examples

The examples show how to add file validation even on the client, with an `on:input` handler.

### Single file input

```ts
export const schema = z.object({
  image: z
    .instanceof(File, { message: 'Please upload a file.'})
    .refine((f) => f.size < 100_000, 'Max 100 kB upload size.')
});
```

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  import { zodClient } from 'sveltekit-superforms/adapters'
  import { schema } from './schema.js'

  export let data;

  const { form, enhance, errors } = superForm(data.form, {
    validators: zodClient(schema)
  })
</script>

<form method="POST" enctype="multipart/form-data" use:enhance>
  <input
    type="file"
    name="image"
    accept="image/png, image/jpeg"
    on:input={(e) => ($form.image = e.currentTarget.files?.item(0) ?? null)}
  />
  {#if $errors.image}<span>{$errors.image}</span>{/if}
  <button>Submit</button>
</form>
```

> To satisfy the compiler the field has to be `nullable`, as that is the default empty value, but then a non-existing file could pass through, so you may have to ignore that error in the component. If you want the file to be optional, set the field to `nullish` to allow `undefined` as well.

### Multiple files

We need an array to validate multiple files:

```ts
const schema = z.object({
  images: z
    .instanceof(File, { message: 'Please upload a file.'})
    .refine((f) => f.size < 100_000, 'Max 100 kB upload size.')
    .array()
});

const form = await superValidate(formData, zod(schema));
```

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  import { zodClient } from 'sveltekit-superforms/adapters'
  import { schema } from './schema.js'

  export let data;

  const { form, enhance, errors } = superForm(data.form, {
    validators: zodClient(schema)
  })
</script>

<form method="POST" enctype="multipart/form-data" use:enhance>
  <input
    type="file"
    multiple
    name="images"
    accept="image/png, image/jpeg"
    on:input={(e) => ($form.images = Array.from(e.currentTarget.files ?? []))}
  />
  {#if $errors.images}<span>{$errors.images}</span>{/if}
  <button>Submit</button>
</form>

```

## Form action caveat - withFiles

There's one important thing to be aware of: Because file objects cannot be serialized, you must use a `withFiles` helper function when you return a form containing files:

```ts
import { fail } from '@sveltejs/kit';
import { withFiles, message, setError } from 'sveltekit-superforms';

// When using fail
if (!form.valid) return fail(400, withFiles({ form }));

// When returning just the form:
return withFiles({ form })

// message and setError handles this automatically:
return message(form, 'Posted OK!');
return setError(form, 'image', 'Could not process file.');
```

This will remove the file objects from the form data before returning, so SvelteKit can serialize it properly.

## Validating files manually

If your validation library cannot validate files, you can obtain `FormData` from the request and extract the files from there, after validation:

```ts
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) return fail(400, withFiles({ form }));

    const image = formData.get('image');
    if (image instanceof File) {
      // Validate and process the image.
    }

    return withFiles({ form });
  }
};
```

If the file field isn't a part of the schema, but you still want errors for it, you can add an optional field to the schema with the same name, and use [setError](/concepts/error-handling#seterror) to set and display an error message.

## Preventing file uploads

To prevent file uploads, set the `{ allowFiles: false }` option in `superValidate`. This will set all files to `undefined`, so you don't have to use `withFiles`. 

This will also happen if you have migrated from version 1 and defined [SUPERFORMS_LEGACY](/migration-v2/#the-biggest-change-important). In that case, set `{ allowFiles: true }` to allow files.

<Next section={concepts} />
