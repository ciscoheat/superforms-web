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

There are two client-side validation options with Superforms: 

* The built-in browser validation, which doesn't require JavaScript to be enabled in the browser.
* Using a validation schema, usually the same one as on the server. Requires JavaScript and [use:enhance](/concepts/enhance).

## Built-in browser validation

There is a web standard for [form input](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation), which doesn't require JavaScript and is virtually effortless to use with Superforms:

### constraints

To use the built-in browser validation, just spread the `$constraints` store for a schema field on its input field:

```svelte
<script lang="ts">
  let { data } = $props();
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
  pattern?: string;      // The *first* string validator with a RegExp pattern
  step?: number | 'any'; // number with a step validator
  minlength?: number;    // string with a minimum length
  maxlength?: number;    // string with a maximum length
  min?: number | string; // number if number validator, ISO date string if date validator
  max?: number | string; // number if number validator, ISO date string if date validator
  required?: true;       // true if not nullable, nullish or optional
}
```

#### Special input formats

For some input types, a certain format is required. For example with `date` fields, both the underlying data and the constraint needs to be in `yyyy-mm-dd` format, which can be handled by [using a proxy](/concepts/proxy-objects#date-input-issues) and adding attributes after the constraints spread, in which case they will take precedence:

```svelte
<input
  name="date"
  type="date"
  aria-invalid={$errors.date ? 'true' : undefined}
  bind:value={$proxyDate}
  {...$constraints.date}
  min={$constraints.date?.min?.toString().slice(0, 10)} 
/>
```

Check the validation attributes and their valid values at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation#validation-related_attributes).

## Using a validation schema

The built-in browser validation can be a bit constrained; for example, you can't easily control the position and appearance of the error messages. Instead (or supplementary), you can use a validation schema and customize the validation with a number of options, so the form errors will be displayed in real-time.

> As with most client-side functionality, [use:enhance](/concepts/enhance) is required for real-time validation.

```ts
const { form, enhance, constraints, validate, validateForm } = superForm(data.form, {
  validators: ClientValidationAdapter<S> | 'clear' | false,
  validationMethod: 'auto' | 'oninput' | 'onblur' | 'onsubmit' = 'auto',
  customValidity: boolean = false
})
```

### validators

```ts
validators: ClientValidationAdapter<S> | 'clear' | false
```

Setting the `validators` option to an adapter with the same schema as on the server, is the most convenient and recommended way. Just put the schema in a shared directory, `$lib/schemas` for example, and import it on the client as well as on the server.

Adding a adapter on the client will increase the client bundle size a bit, since the validation library now has to be imported there too. But the client-side adapter is optimized to be as small as possible, so it shouldn't be too much of an issue. To use it, append `Client` to the adapter import, for example:

```ts
import { valibotClient } from 'sveltekit-superforms/adapters';
import { schema } from './schema.js';

const { form, errors, enhance } = superForm(data.form, {
  validators: valibotClient(schema)
});
```

> This works only with the same schema as the one used on the server. If you need to switch schemas on the client, you need the full adapter (for example `zod` instead of `zodClient`).

As a super-simple alternative to an adapter, you can also set the option to `'clear'`, to remove errors for a field as soon as it's modified.

#### Switching schemas

You can even switch schemas dynamically, with the `options` object. `options.validators` accepts a partial validator, which can be very useful for multi-step forms:

```ts
import { valibot } from 'sveltekit-superforms/adapters';
import { schema, partialSchema } from './schema.js';

const { form, errors, enhance, options } = superForm(data.form, {
  // Validate the first step of the form
  validators: valibot(partialSchema)
});

// When moving to the last step of the form
options.validators = valibot(schema)
```

As mentioned, you need the full adapter to switch schemas dynamically. An exception will be thrown if a client adapter is detected different from the initial `validators` option.

### validationMethod

```ts
validationMethod: 'auto' | 'oninput' | 'onblur' | 'onsubmit',
```

The validation is triggered when **a value is changed**, not just when focusing on, or tabbing through a field. The default validation method is based on the "reward early, validate late" pattern, [a researched way](https://medium.com/wdstack/inline-validation-in-forms-designing-the-experience-123fb34088ce) of validating input data that makes for a high user satisfaction:

- If entering data in a field that has or previously had errors, validate on `input`
- Otherwise, validate on `blur`.

But you can instead use the `oninput` or `onblur` settings to always validate on one of these respective events, or `onsubmit` to validate only on submit.

> Be aware that the whole schema will be validated, not just the modified field, because errors can be added to any field in the schema during validation with Zod's [refine](https://zod.dev/?id=customize-error-path) or similar, so the whole schema must be validated to know the final result.

### customValidity

This option uses the browser built-in tooltip to display validation errors, so neither `$errors` nor `$constraints` are required on the form. See the [error handling page](/concepts/error-handling#customvalidity) for details and an example.

### validate

The `validate` function, deconstructed from `superForm`, gives you complete control over the validation process for specific fields. Examples of how to use it:

```ts
const { form, enhance, validate } = superForm(data.form, {
  validators: zod(schema) // Required option for validate to work
});

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
```

### validateForm

Similar to `validate`, `validateForm` lets you validate the whole form and return a `SuperValidated` result:

```ts
const { form, enhance, validateForm } = superForm(data.form, {
  validators: zod(schema) // Required option for validate to work
});

const result = await validateForm();

if (result.valid) {
  // ...
}

// You can use the update option to trigger a client-side validation
await validateForm({ update: true });

// Or the schema option to validate the form partially
const result2 = await validateForm({ schema: zod(partialSchema) });
```

## Asynchronous validation and debouncing

The validation is asynchronous, but a slow validator will delay the final result, so for a server round-trip validation, like checking if a username is available, you might want to consider a [SPA action form](/concepts/spa#spa-action-form), or handle it with `on:input` and a package like [throttle-debounce](https://www.npmjs.com/package/throttle-debounce). Errors can be set manually by updating the `$errors` store:

```ts
// Needs to be a string[]
$errors.username = ['Username is already taken.'];
```

## Test it out

This example demonstrates how validators are used to check if tags are of the correct length.

Set a tag name to blank and see that no errors show up until you move focus outside the field (blur). When you go back and correct the mistake, the error is removed as soon as you enter more than one character (input).

<Form {data} />

<Next section={concepts} />
