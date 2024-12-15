<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

  export let data;
</script>

# Nested data

<Head title="Nested data" />

HTML forms can only handle string values, and the `<form>` element cannot nest other forms, so there is no standardized way to represent a nested data structure or more complex values like dates. Fortunately, Superforms has a solution for this!

## Usage

```ts
const { form, enhance } = superForm(data.form, {
  dataType: 'form' | 'json' = 'form'
})
```

### dataType

By simply setting `dataType` to `'json'`, you can store any data structure allowed by [devalue](https://github.com/Rich-Harris/devalue) in the `$form` store, and you don't have to worry about failed coercion, converting strings to objects and arrays, etc.

You don't even have to set a name on the form fields anymore, since the actual data in `$form` is now posted, not the input fields in the HTML. They are now simply UI components for modifying a data model, [as they should be](https://blog.encodeart.dev/rediscovering-mvc). (Name attributes can still be useful for the browser to pre-fill fields though.)

> When `dataType` is set to `'json'`, the `onSubmit` event will contain `FormData`, but it cannot be used to modify the posted data. You need to set or update `$form`, or in special cases, use [jsonData in onSubmit](/concepts/events#jsondata).<br><br>This also means that the `disabled` attribute, which normally prevents input fields from being submitted, will not have that effect. Everything in `$form` will be posted when `dataType` is set to `'json'`.

Modifying the `form` store programmatically is easy, you can assign `$form.field = ...` directly, but note that this will taint the affected fields. If you want to prevent the form from being tainted, you can use `form.update` with an extra option:

```ts
form.update(
  ($form) => {
    $form.name = "New name";
    return $form;
  },
  { taint: false }
);
```

The `taint` options are:

```ts
{ taint: boolean | 'untaint' | 'untaint-form' }
```

Which can be used to not only prevent tainting, but also untaint the modified field(s), or the whole form.

## Requirements

The requirements for nested data to work are as follows:

1. **JavaScript is enabled in the browser.**
2. **The form has the Superforms [use:enhance](/concepts/enhance) applied.**

## Nested errors and constraints

When your schema contains arrays or objects, you can access them through `$form` as an ordinary object. But how does it work with errors and constraints?

`$errors` and `$constraints` mirror the `$form` data, but with every field or "leaf" in the object replaced with `string[]` and `InputConstraints`, respectively.

### Example

Given the following schema, which describes an array of tag objects:

```ts
const schema = z.object({
  tags: z
    .object({
      id: z.number().int().min(1),
      name: z.string().min(2)
    })
    .array()
});

const tags = [{ id: 1, name: 'test' }];

export const load = async () => {
  const form = await superValidate({ tags }, zod(schema));
  return { form };
};
```

You can build a HTML form for these tags using an `{#each}` loop:

```svelte
<script lang="ts">
  const { form, errors, enhance } = superForm(data.form, {
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

> You can't use the loop variable directly, as the value must be bound directly to `$form`, hence the usage of the loop index `i`.

> Take extra care with the [optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) `?.`, it's easy to miss a question mark, which will lead to confusing errors.

### The result

<Form {data} />

## Arbitrary types in the form

Using the [transport](https://svelte.dev/docs/kit/hooks#Universal-hooks-transport) feature of SvelteKit, it's possible to use any type of value in the form and send it back and forth between server and client. To do this, you use the `transport` export from `hooks.ts` and its corresponding option for both `superValidate` and `superForm`. Here's an example with the [decimal.js](https://mikemcl.github.io/decimal.js/) library.

**src/hooks.ts**

```ts
import type { Transport } from '@sveltejs/kit';
import { Decimal } from 'decimal.js';

export const transport: Transport = {
	Decimal: {
		encode: (value) => value instanceof Decimal && value.toString(),
		decode: (str) => new Decimal(str)
	}
};
```

When calling `superValidate`:

```ts
import { transport } from '../../hooks.js';

const form = await superValidate(formData, zod(schema), { transport });
```

When calling `superForm`:

```ts
import { transport } from '../../hooks.js';

const { form, errors, enhance } = superForm(data.form, {
  dataType: 'json',
  transport
});
```

> The transport feature requires at least version `2.11` of SvelteKit!

## Arrays with primitive values

It's possible to post multiple HTML elements with the same name, so you don't have to use `dataType: 'json'` for arrays of primitive values like numbers and strings. Just add the input fields, **all with the same name as the schema field**, which can only be at the top level of the schema. Superforms will handle the type coercion to array automatically, as long as the fields have the same name attribute:

```ts
export const schema = z.object({
  tags: z.string().min(2).array().max(3)
});
```

```svelte
<script lang="ts">
  const { form, errors } = superForm(data.form);
</script>

<form method="POST">
  <div>Tags</div>
  {#if $errors.tags?._errors}
    <div class="invalid">{$errors.tags._errors}</div>
  {/if}

  {#each $form.tags as _, i}
    <div>
      <input name="tags" bind:value={$form.tags[i]} />
      {#if $errors.tags?.[i]}
        <span class="invalid">{$errors.tags[i]}</span>
      {/if}
    </div>
  {/each}

  <button>Submit</button>
</form>
```

To summarize, the index `i` of the `#each` loop is used to access `$form.tags`, where the current values are (you cannot use the loop variable), and then the `name` attribute is set to the schema field `tags`, so its array will be populated when posted.

This example, having a `max(3)` limitation of the number of tags, also shows how to display array-level errors with the `$errors.tags._errors` field.

## Validation schemas and nested paths

Validation libraries like Zod can refine the validation, the classic example is to check if two password fields are identical when updating a password. Usually there's a `path` specifier for setting errors on those fields in the refine function:

```ts
const confirmPassword = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"], // path of error
  });
  ```

  This works fine for top-level properties, but for nested data you must usually specify that path as an **array**, each segment in its own element, not as a string path as you can do in the `FormPathLeaves` type!

  ```ts
  // OK:
  path: ['form', 'tags', 3]
  // Will not work with Zod refine and superRefine:
  path ['form.tags[3]']
  ```

<Next section={concepts} />
