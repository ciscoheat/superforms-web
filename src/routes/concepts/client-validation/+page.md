<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Client-side validation

<Head title="Client-side validation" />

## Built-in browser validation

There is already a web standard for [client-side form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation) that is virtually effortless to use with Superforms. For more advanced cases, you can use a Zod schema or the Superforms validation object, for a complete realtime client-side validation.

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
  step?: number | 'any'; // z.number().step(n)
  minlength?: number;    // z.string().min(n)
  maxlength?: number;    // z.string().max(n)
  min?: number | string; // number if z.number.min(n), ISO date string if z.date().min(d)
  max?: number | string; // number if z.number.max(n), ISO date string if z.date().max(d)
  required?: true;       // Not nullable(), nullish() or optional()
}
```

For some input fields like `date`, you need to modify some constraint fields. For example, if you want to limit the date to today or after:

```svelte
<input
  name="date"
  type="date"
  aria-invalid={$errors.date ? 'true' : undefined}
  bind:value={$form.date}
  {...$constraints.date}
  min={$constraints.date?.min?.toString().slice(0, 10)} />
```

Check the validation attributes and their valid values at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation#validation-related_attributes).

## Realtime validators

The built-in browser validation can be a bit constrained (pun intended); for example, you can't easily control the position and appearance of the error messages. Instead, you can set the `validators` option.

### validators

```ts
validators: AnyZodObject | {
  field: (value) => string | string[] | null | undefined;
}
```

Setting it to the same Zod schema as on the server is the most convenient and recommended, but it increases the size of the client bundle a bit. A lightweight alternative is to use a custom validation object.

It's an object with the same keys as the form, with a function that receives the field value and should return `string | string[]` as a validation failed message, or `null | undefined` if the field is valid.

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
const schema = z.object({
  name: z.string().min(3),
  tags: z.string().min(2).array()
});

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

The validation is triggered when **a value is changed**, not just when tabbing through a field. The default validation method is based on the "reward early, validate late" pattern, a [researched way](https://medium.com/wdstack/inline-validation-in-forms-designing-the-experience-123fb34088ce) of validating input data that makes for high user satisfaction:

- If no field error, validate on `blur`
- If field error exists, validate on `input`

But you can also use the `oninput` or `onblur` setting to always validate on one of these events instead, or `submit-only` to only validate on submit.

> If you're using a Zod schema as `validators`, be aware that the whole schema will be validated, not just the validator for the modified field.<br><br>This is because the effects can add errors to any field in the schema, so everything must be validated to know the final result.

### defaultValidator

There is one additional option for specifying the validation behavior for fields when no validation exists for a field:

```ts
defaultValidator: 'keep' | 'clear' = 'keep'
```

The default value `keep` means that validation errors will be displayed until the form submits (given that it is set to [clear errors on submit](/concepts/submit-behavior#clearonsubmit)).

The other option, `clear`, will remove the error as soon as the field value is modified.

### validate

The `validate` function, deconstructed from `superForm`, gives you complete control over the validation process. Examples of how to use it:

```ts
const { form, enhance, validate } = superForm(data.form);

// Simplest case, validate what's in the field right now
validate('name');

// Validate without updating, for error checking
const nameErrors = await validate('name', { update: false });

// Validate and update field with a custom value
validate('name', { value: 'Test' });

// Validate a custom value, update errors only
validate('name', { value: 'Test', update: 'errors' });

// Validate and update nested data, and also taint the field
validate('tags[1].name', { value: 'Test', taint: true });

// If called with no arguments, it validates the whole form and
// returns a result similar to superValidate
const result = await validate();

if (result.valid) {
  // ...
}
```

## Asynchronous validation and debouncing

All the validators are asynchronous, so you can return a `Promise` and it will work. But a slow validator will delay the others, so for a server round-trip validation like checking if a username is available, you might want to exclude that field from the schema and handle it manually, with `on:input` and a package like [throttle-debounce](https://www.npmjs.com/package/throttle-debounce).

Errors can also be set manually by updating the `$errors` store:

```ts
// Needs to be a string[]
$errors.username = ['Username is already taken.'];
```

## Test it out

This example demonstrates how validators are used to check if tags are of the correct length.

Set a tag name to blank and see that no errors show up until you move focus outside the field (blur). When you go back and correct the mistake, the error is removed as soon as you enter more than one character (input).

<Form {data} />

<Next section={concepts} />
