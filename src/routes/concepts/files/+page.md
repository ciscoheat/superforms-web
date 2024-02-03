<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# File uploads

<Head title="File upload and validation" />

From version 2, Superforms has full support for file uploads. The basics is to use a form with the proper `enctype` setting, and a file input field:

```svelte
<form method="POST" enctype="multipart/form-data">
  <input type="file" name="image" />
  <button>Submit</button>
</form>
```

With this, you need a schema that can validate files. Zod has this possibility:

```ts
import { fail } from '@sveltejs/kit';
import { superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
  image: z
    .custom<File>()
    .refine((f) => f instanceof File && f.size < 100_000, 'Max 100 kB upload size.')
});

export const load = async () => {
  const form = await superValidate(user, zod(schema));
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(schema));

    if (!form.valid) {
      return fail(400, withFiles({ form }));
    }

    // TODO: Do something with the image
    console.log(form.data.image);

    return withFiles({ form });
  }
};
```

(Let me know if you have a file example with other libraries.)

## Client-side file validation

File validation even works on the client, with an `on:input` handler:

### Single file input

```svelte
<input
  type="file"
  name="image"
  accept="image/png, image/jpeg"
  on:input={(e) => ($form.image = e.currentTarget.files?.item(0) ?? null)}
/>
```

### Multiple files

We need an array schema field to validate multiple files:

```ts
const schema = z.object({
  images: z
    .custom<File>()
    .refine((f) => f instanceof File && f.size < 100_000, 'Max 100 kB upload size.')
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

## Form action caveat

There's one important thing to be aware of: Because file objects cannot be serialized, you must use a `withFiles` helper function when you return a form containing files:

```ts
import { fail } from '@sveltejs/kit';
import { withFiles } from 'sveltekit-superforms';

// When using fail
if (!form.valid) return fail(400, withFiles({ form }));

// Vhen returning just the form:
return withFiles({ form })

// message and setError does this automatically:
return message(form, 'Posted OK!');
return setError(form, 'image', 'Could not process file.');
```

This will remove the file objects from the form before returning it, so SvelteKit can serialize it properly.

## Validating files manually

If your validation library cannot validate files, you can obtain `FormData` from the request and extract the files from there, after validation:

```ts
export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) return fail(400, { form });

    const image = formData.get('image');
    if (image instanceof File) {
      // Validate and process the image.
    }

    return { form };
  }
};
```

If you want errors for such a field, you can add an optional field to the schema with the same name, and use [setError](/concepts/error-handling#seterror) to set and display an error message.

## Preventing file uploads

To prevent file uploads, set the `{ allowFiles: false }` option in `superValidate`. This will set all files to `undefined`, so you don't have to use `withFiles`. This will also be `true` by default if you have defined [SUPERFORMS_LEGACY](/migration-v2/#the-biggest-change-important). In that case, set `{ allowFiles: true }` to allow files.
