<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Client-side validation

<svelte:head><title>Client-side validation</title></svelte:head>

## Built-in browser validation

There is already a web standard for [client-side form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation), which is virtually effortless to use with Superforms. For more advanced cases, you can use a Zod schema or the Superforms validation object for a complete client-side validation.

## Usage

```ts
const { form, enhance, constraints, validate } = superForm(data.form, {
  validators: AnyZodObject | {
    field: (value) => string | string[] | null | undefined;
  },
  validationMethod: 'auto' | 'oninput' | 'onblur' | 'submit-only',
  defaultValidator: 'keep' | 'clear' = 'keep'
})
```

### constraints

To use the built-in browser constraints, simply spread the `$constraints` store for a field on its input field:

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

If you think the built-in browser validation is too constraining (pun intented), you can set the `validators` option to a Zod schema, which is the most convenient, but increases the size of the client bundle a bit. A more lightweight alternative is to use a custom validation object:

```ts
validators: AnyZodObject | {
  field: (value) => string | string[] | null | undefined;
}
```

It's an object with the same keys as the form, with a function that receives the field value and should return either a `string` or `string[]` as a validation failed message, or `null` or `undefined` if the field is valid.

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

### validationMethod

```ts
validationMethod: 'auto' | 'oninput' | 'onblur' | 'submit-only',
```

The default validation method is based on the "reward early, validate late" patttern, a [researched way](https://medium.com/wdstack/inline-validation-in-forms-designing-the-experience-123fb34088ce) of validating input data that makes for a high user satisfaction:

- If no field error, validate on `blur`
- If field error exists, validate on `input`

But you can also use the `oninput` or `onblur` setting to always validate on one of these events instead, or `submit-only` to only validate on submit.

### defaultValidator

There is one additional option for specifying the `on:input` behavior for fields with errors:

```ts
defaultValidator: 'keep' | 'clear' = 'keep'
```

The default value `keep` means that validation errors will be displayed until the form submits (and is set to clear errors). `clear` will remove the error as soon as that field value is modified.

### validate

The `validate` function gives you complete control over the validation process. Examples how to use it:

```ts
const { form, enhance, validate } = superForm(data.form)

// Simplest case, validate what's in the field right now
validate('name')

// Validate without updating, for error checking
const nameErrors = await validate('name', { update: false })

// Validate and update field with a custom value
validate('name', { value: 'Test' })

// Validate a custom value, update errors only
validate('name', { value: 'Test', update: 'errors' })

// Validate and update nested data, and also taint the field
validate(['tags', 1, 'name'], { value: 'Test', taint: true })
```

## Asynchronous validation and debouncing

All the validators are asynchronous, so you can return a `Promise` and it will work. But for round-trip validation like checking if a username is taken, you might want to delay the validation so a request is not sent for every keystroke. There is no built-in delay option, so this can be achieved with the `on:input` event and a `debounce` function from a package like [throttle-debounce](https://www.npmjs.com/package/throttle-debounce). 

Errors can be set by updating the `$errors` store:

```ts
// Needs to be a string[]
$errors.username = ['Username is already taken.']
```

## Test it out

This example demonstrates how validators are used to check if tags are of the correct length. It uses `defaultValidator = 'clear'` to remove the error when the field changes.

<Form {data} />

<Next section={concepts} />
