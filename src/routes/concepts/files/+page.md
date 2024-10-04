<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Next from '$lib/Next.svelte'
  import Examples from './Examples.svelte'
  import { concepts } from '$lib/navigation/sections'
</script>

# File uploads

<Head title="File upload and validation" />

From version 2, Superforms has full support for file uploads. For that, you need a schema that can validate files. Zod has this possibility:

```ts
// NOTE: Import fail from Superforms, not from @sveltejs/kit!
import { superValidate, fail, message } from 'sveltekit-superforms';
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
      return fail(400, { form });
    }

    // TODO: Do something with the image
    console.log(form.data.image);

    return message(form, 'You have uploaded a valid file!');
  }
};
```

## Returning files in form actions

**Important:** Because file objects cannot be serialized, you must return the form using `fail`, `message` or `setError` imported from Superforms:

```ts
import { message, setError, fail } from 'sveltekit-superforms';

// message, setError and the custom fail handles this automatically:
if (!form.valid) return fail(400, { form });
return message(form, 'Posted OK!');
return setError(form, 'image', 'Could not process file.');
```

Otherwise, a `withFiles` helper function is required:

```ts
// Importing the default fail
import { fail } from '@sveltejs/kit';
import { withFiles } from 'sveltekit-superforms';

// With the @sveltejs/kit fail:
if (!form.valid) {
  return fail(400, withFiles({ form }));
}

// When returning just the form:
return withFiles({ form })
```

This will remove the file objects from the form data, so SvelteKit can serialize it properly.

## Examples

The recommended way to bind the file input to the form data is through a `fileProxy` or `filesProxy`, but you can also do it with an `on:input` handler. Here are examples for both, which also shows how to add client-side validation for files, which can save plenty of bandwidth!

> Remember that you need to add `enctype="multipart/form-data"` on the form element for file uploads to work.

### Single file input

```ts
export const schema = z.object({
  image: z
    .instanceof(File, { message: 'Please upload a file.'})
    .refine((f) => f.size < 100_000, 'Max 100 kB upload size.')
});
```

<Examples>
<span slot="proxy">

```svelte
<script lang="ts">
  import { superForm, fileProxy } from 'sveltekit-superforms'
  import { zodClient } from 'sveltekit-superforms/adapters'
  import { schema } from './schema.js'

  export let data;

  const { form, enhance, errors } = superForm(data.form, {
    validators: zodClient(schema)
  })

  const file = fileProxy(form, 'image')
</script>

<form method="POST" enctype="multipart/form-data" use:enhance>
  <input
    type="file"
    name="image"
    accept="image/png, image/jpeg"
    bind:files={$file}
  />
  {#if $errors.image}<span>{$errors.image}</span>{/if}
  <button>Submit</button>
</form>
```

</span>
<span slot="input">

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
    on:input={(e) => ($form.image = e.currentTarget.files?.item(0) as File)}
  />
  {#if $errors.image}<span>{$errors.image}</span>{/if}
  <button>Submit</button>
</form>
```

> The `as File` casting is needed since `null` is the value for "no file", so be aware that `$form.image` may be `null` even though the schema type says otherwise. If you want the upload to be optional, set the field to `nullable` and it will be type-safe.

</span>
</Examples>

### Multiple files

We need an array to validate multiple files:

```ts
const schema = z.object({
  images: z
    .instanceof(File, { message: 'Please upload a file.'})
    .refine((f) => f.size < 100_000, 'Max 100 kB upload size.')
    .array()
});
```

<Examples>
<span slot="proxy">

```svelte
<script lang="ts">
  import { superForm, filesProxy } from 'sveltekit-superforms'
  import { zodClient } from 'sveltekit-superforms/adapters'
  import { schema } from './schema.js'

  export let data;

  const { form, enhance, errors } = superForm(data.form, {
    validators: zodClient(schema)
  })

  const files = filesProxy(form, 'images');
</script>

<form method="POST" enctype="multipart/form-data" use:enhance>
  <input
    type="file"
    multiple
    name="images"
    accept="image/png, image/jpeg"
    bind:files={$files}
  />
  {#if $errors.images}<span>{$errors.images}</span>{/if}
  <button>Submit</button>
</form>
```

</span>
<span slot="input">

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

> As there is no `bind:files` attribute on the input field, note that it cannot be hidden with an `{#if}` block. Use css instead to hide it.

</span>
</Examples>

> To use the file proxies in a component, `fileFieldProxy` and `filesFieldProxy` are available as a complement to `formFieldProxy`.

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

## Progress bar for uploads

If you'd like a progress bar for large file uploads, check out the [customRequest](/concepts/events#customrequest) option for the `onSubmit` event.

## Preventing file uploads

To prevent file uploads, set the `{ allowFiles: false }` option in `superValidate`. This will set all files to `undefined`, so you don't have to use `withFiles`. 

This will also happen if you have migrated from version 1 and defined [SUPERFORMS_LEGACY](/migration-v2/#the-biggest-change-important). In that case, set `{ allowFiles: true }` to allow files.

<Next section={concepts} />
