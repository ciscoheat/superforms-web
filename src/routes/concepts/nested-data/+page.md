<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Nested data

<svelte:head><title>Nested data</title></svelte:head>

Html forms are inherently one-dimensional, in the sense that the input fields can only handle string values. There is no native way to represent a nested data structure or more complex values like dates. Fortunately, this can be handled by Superforms!

## Usage

```ts
const { form, errors, constraints } = superForm(data.form, {
  dataType: 'form' | 'json' = 'form'
})
```

### dataType

By simply setting `dataType` to `'json'`, you can store any data structure allowed by [devalue](https://github.com/Rich-Harris/devalue) in the form, and you don't have to worry about failed coercion, converting arrays to strings and back, etc! You don't even have to set names for the form fields anymore, since the data in the `$form` store is now posted, not the fields in the html. They are now just UI components for modifying a data model.

> As a precaution, `superForm` will try to detect nested objects, and if found, an error is thrown unless `dataType` is set to `'json'`.

## Requirements

The requirements for nested data to work, is that

1. **JavaScript is enabled in the browser**
2. **The form has use:enhance applied.**

## Nested errors and constraints

When your schema contains arrays or objects, you can access them through `$form` as an ordinary object. But how does it work with errors and constraints?

`$errors` and `$constraints` actually mirrors the `$form` data, but with every field or "leaf" in the object replaced with `string[]` and `InputConstraints` respectively.

### Example

Given the following schema, that describes an array of tag objects:

```ts
import { z } from 'zod';

export const schema = z.object({
  tags: z
    .object({
      id: z.number().int().min(1),
      name: z.string().min(2)
    })
    .array()
});

const tags = [{ id: 1, name: 'test' }];

export const load = async () => {
  const form = await superValidate({ tags }, schema);
  return { form };
};
```

You can build up a html form for these tags using an `{#each}` loop:

```svelte
<script lang="ts">
  const { form, errors, enhance } = superForm(data.form, {
    // This is a requirement when the schema contains nested objects:
    dataType: 'json'
  });
</script>

<form method="POST" use:enhance>
  {#each $form.tags as _, i}
    <div>
      Id
      <input
        type="number"
        data-invalid={$errors.tags?.[i]?.id}
        bind:value={$form.tags[i].id} />
      Name
      <input
        data-invalid={$errors.tags?.[i]?.name}
        bind:value={$form.tags[i].name} />
      {#if $errors.tags?.[i]?.id}
        <br />
        <span class="invalid">{$errors.tags[i].id}</span>
      {/if}
      {#if $errors.tags?.[i]?.name}
        <br />
        <span class="invalid">{$errors.tags[i].name}</span>
      {/if}
    </div>
  {/each}
  <button>Submit</button>
</form>
```

Note that we're using the index of the loop, so the value can be bound directly to `$form`. This is what it looks like:

<Form {data} />

## An exception: Primitive arrays

Since you can post multiple html elements with the same name, you don't have to use `dataType = 'json'` for arrays of primitive values like numbers and strings. Just add the input fields, all with the same name as the schema field. Superforms will handle the type coercion to array automatically.

<Next section={concepts} />
