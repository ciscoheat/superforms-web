<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Client-side validation

<svelte:head><title>Client-side validation</title></svelte:head>

There is already a web standard for [client-side form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation), which is virtually effortless to use with Superforms. For more advanced cases, you can use either a Zod schema or the built-in validation object for an exhaustive client-side validation.

## Usage

```ts
const { form, enhance, constraints } = superForm(data.form, {
  validators: AnyZodObject | {
    field: (value) => string | string[] | null | undefined;
  },
  defaultValidator: 'keep' | 'clear' = 'keep'
})
```

### constraints

To use the web standard constraints, simply spread the `$constraints` store for a field on its input field:

```svelte
<input
  name="email"
  type="email"
  bind:value={$form.email}
  {...$constraints.email} />
```

The constraints is an object with validation properties mapped from the schema:

```ts
{
  pattern?: string;      // z.string().regex(r)
  step?: number;         // z.number().step(n)
  minlength?: number;    // z.string().min(n)
  maxlength?: number;    // z.string().max(n)
  min?: number | string; // number if z.number.min(n), ISO date string if z.date().min(d)
  max?: number | string; // number if z.number.max(n), ISO date string if z.date().max(d)
  required?: true;       // Not nullable(), nullish() or optional()
}
```

### validators

If you think the built-in browser validation is too constraining (pun intented), you can set the `validators` option to a Zod schema, or a custom validation object:

```ts
validators: AnyZodObject | {
  field: (value) => string | string[] | null | undefined;
}
```

It takes an object with the same keys as the form, with a function that receives the field value and should return either a `string` or `string[]` as a "validation failed" message, or `null` or `undefined` if the field is valid.

Here's how to validate a string length, for example:

```ts
const { form, errors, enhance } = superForm(data.form, {
  validators: {
    name: (value) =>
      value.length < 3 ? 'Name must be at least 3 characters' : null
  }
});
```

For nested data, just keep building on the `validators` structure. Note that arrays have a single validator for the whole array:

```ts
// On the server
const schema = z.object({
  name: z.string().min(3),
  tags: z.string().min(2).array()
});
```

```ts
// On the client
const { form, errors, enhance } = superForm(data.form, {
  validators: {
    name: (name) =>
      name.length < 3 ? 'Name must be at least 3 characters' : null,
    tags: (tag) => (tag.length < 2 ? 'Tag must be at least 2 characters' : null)
  }
});
```

### defaultValidator

There is one additional option for specifying the `on:input` behavior for fields with errors:

```ts
defaultValidator: 'keep' | 'clear' = 'keep'
```

The default value `keep` means that validation errors will be displayed until the form submits (and is set to clear errors). `clear` will remove the error as soon as that field value is modified.

In a future version, the `validators` will be run `on:input` as well.

## Test it out

This example demonstrates how validators are used to check if tags are of the correct length. It uses `defaultValidator = 'clear'` to remove the error when the field changes.

<Form {data} />

<Next section={concepts} />
