<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Nested data

When your schema contains arrays or objects, you can access them through the `$form` as an ordinary object. But how does it work with errors and constraints?

`$errors` and `$constraints` actually mirrors the `$form` data, but with every field or "leaf" in the object replaced with `string[]` and `InputConstraints` respectively.

## Options

```ts
const { form, errors, constraints } = superForm(data.form, {
  dataType: 'form' | 'json' = 'form'
})
```

### dataType

You probably know of the annoyance that everything becomes a `string` when we are posting forms. Nested data must be serialized, data must be coerced, etc... But this is finally over!

By simply setting `dataType` to `json`, you can store any data structure allowed by [devalue](https://github.com/Rich-Harris/devalue) in the form, and you don't have to worry about failed coercion, converting arrays to strings, etc! You don't even have to set names for the form fields anymore, since the `$form` store data is now posted, not the fields in the html. They are now merely placeholders for the data.

Of course, the requirement for this is that **JavaScript is enabled in the browser, and that the form have use:enhance applied**.

## Example

Given the following schema that describes a set of tag objects:

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
```

You can build up a html form for these tags using an `{#each}` loop:

```svelte
<script lang="ts">
  const { form, enhance } = superForm(data.form, {
    // This is a requirement when the schema contains nested objects.
    dataType: 'json'
  });
</script>

<form method="POST" use:enhance>
  {#each $form.tags as _, i}
    <div>
      Id:
      <input
        type="number"
        data-invalid={$errors.tags?.[i]?.id}
        bind:value={$form.tags[i].id}
      />
      Name:
      <input
        data-invalid={$errors.tags?.[i]?.name}
        bind:value={$form.tags[i].name}
      />
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

We're using the index of the loop, so the value can be bound directly to `$form`. This is what it looks like:

<Form {data} />

## Requirements

As mentioned before, JavaScript and `use:enhance` is a requirement for nested data to work. `superForm` will try to detect nested objects, and will throw an error unless `dataType = 'json'`.

## An exception: Primitive arrays

Since you can post multiple html elements with the same name, you can use `dataType = 'form'` for arrays of primitive values like numbers and strings, but not objects. Superforms will handle the type coercion automatically.

<Next section={concepts} />
