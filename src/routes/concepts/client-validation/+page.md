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

There are three ways of handling client-side validation with Superforms: 

* The built-in browser validation, that doesn't require JavaScript
* Using a Zod schema, usually the same one as on the server
* Using a Superforms validators object.

The last two are mutually exclusive, but the browser validation can be combined with any of them.

## Built-in browser validation

There is a web standard for [client-side form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation), which is virtually effortless to use with Superforms:

### constraints

To use the built-in browser constraints, just spread the `$constraints` store for a schema field on its input field:

```svelte
<script lang="ts">
  export let data;
  const { form, constraints } = superForm(data.form);
</script>

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
  required?: true;       // true if not nullable(), nullish() or optional()
}
```

For some input types, you'll need to modify the constraints to be in the correct format. For example with `date` fields, if you want to limit the date to today or after, it needs to be in `YYYY-MM-DD` format. By adding attributes after the constraints spread, they will take precedence:

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

## Usage

The built-in browser validation can be a bit constrained (pun intended); for example, you can't easily control the position and appearance of the error messages. Instead, you can set some options for custom real-time validation.

```ts
const { form, enhance, constraints, validate } = superForm(data.form, {
  validators: AnyZodObject | {
    field: (value) => string | string[] | null | undefined;
  },
  validationMethod: 'auto' | 'oninput' | 'onblur' | 'submit-only' = 'auto',
  defaultValidator: 'keep' | 'clear' = 'keep',
  customValidity: boolean = false
})
```

### validators

```ts
validators: AnyZodObject | {
  field: (value) => string | string[] | null | undefined;
}
```

Setting the `validators` option to the same Zod schema as on the server is the most convenient and recommended way. Just put the schema in a shared directory, `$lib/schemas` for example, and import it on the client as well as on the server. 

This will increase the size of the client bundle a bit however, since Zod now has to be imported on the client. If you're highly concerned about a few extra kilobytes, a lightweight alternative is to use a Superforms validation object. 

It's an object with the same keys as the form, with a function that receives the field value and should return `string | string[]` as an error message, or `null | undefined` if the field is valid. 

Here's how to validate a string length, for example:

```ts
const { form, errors, enhance } = superForm(data.form, {
  validators: {
    name: (name) =>
      name.length < 3 ? 'Name must be at least 3 characters' : null
  }
});
```

For nested data, just keep building on the `validators` structure. Note that arrays have a single validator that will be applied to each value in the array:

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

The validation is triggered when **a value is changed**, not just when focusing on, or tabbing through a field. The default validation method is based on the "reward early, validate late" pattern, a [researched way](https://medium.com/wdstack/inline-validation-in-forms-designing-the-experience-123fb34088ce) of validating input data that makes for a high user satisfaction:

- If entering data in a field that has or previously had errors, validate on `input`
- Otherwise, validate on `blur`.

But you can instead use the `oninput` or `onblur` setting to always validate on one of these respective events, or `submit-only` to validate only on submit.

> If you're using a Zod schema in the [validators](/concepts/client-validation#validators) option, be aware that the whole schema will be validated, not just the validator for the modified field.<br><br>This is because errors can be added to any field in the schema during validation, so the whole schema must be validated to know the final result.

### defaultValidator

This is an option for specifying the validation behavior for fields when no validation exists for a specific field. In other words, if [validators](/concepts/client-validation#validators) is set, this option won't have any effect for any fields included there.

```ts
defaultValidator: 'keep' | 'clear' = 'keep'
```

The default value `keep` means that validation errors will be displayed until the form submits. The other option, `clear`, will remove the error as soon as the field value is modified.

### customValidity

This option uses the browser built-in "tooltip" to display validation errors, so neither `$errors` nor `$constraints` are required on the form. See the [error handling page](/concepts/error-handling#customvalidity) for details and an example.

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
