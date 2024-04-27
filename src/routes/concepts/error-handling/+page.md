<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import CustomValidity from './CustomValidity.svelte'
  import Next from '$lib/Next.svelte'
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

  export let data;
</script>

# Error handling

<Head title="Error handling" />

By deconstructing `errors` from `superForm`, you'll get an object with form errors that you can display where it's appropriate:

```svelte
<script lang="ts">
  const { form, errors } = superForm(data.form);
</script>

<form method="POST">
  <label for="name">Name</label>
  <input
    name="name"
    aria-invalid={$errors.name ? 'true' : undefined}
    bind:value={$form.name}
  />
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <div><button>Submit</button></div>
</form>
```

The `aria-invalid` attribute is used to automatically focus on the first error field; see the [errorSelector](/concepts/error-handling#errorselector) option further below.

## setError

Most errors will be set automatically when the data is validated, but you may want to add errors after determining that the data is valid. This is easily done with the `setError` helper function.

```ts
import { setError, superValidate, fail } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }

    if (db.users.find({ where: { email: form.data.email } })) {
      return setError(form, 'email', 'E-mail already exists.');
    }

    return { form };
  }
};
```

`setError` returns a `fail(400, { form })` so it can be returned immediately, or more errors can be added by calling it multiple times before returning. Check [the API](/api#seterrorform-field-error-options) for additional options.

If you're using [nested data](/concepts/nested-data), a string path is used to specify where in the data structure the error is:

```ts
setError(form, `post.tags[${i}].name`, 'Invalid tag name.');
```

> Errors added with `setError` will be removed when a schema is used in [client-side validation](/concepts/client-validation) and the first validation occurs (such as modifying a field).

## Server errors

In the case of a server error, Superforms will normalize the different kind of server errors that can occur:

| Error type | Example   |
| ---------- | --------- |
| [Expected error](https://kit.svelte.dev/docs/errors#expected-errors) | `error(404, { code: 'user_not_found', message: 'Not found' })` |
| Exception              | `throw new Error("Database connection error")` |
| JSON response          | `return json({ code: 'rate_limited', status: 429 }, { status: 429 })` |
| Other response         | `<!doctype html><html lang="en"><head><meta charset=...` |

These can be handled with the [onError](/concepts/events#onerror) event, assuming the Superforms [use:enhance](/concepts/enhance) action is applied to the form. If it isn't, the nearest `+error.svelte` page will be rendered.

In general, returning a [status message](/concepts/messages) is recommended instead of calling `error` or throwing exceptions, as this will make even the non-JS users keep their form data.

## Initial form errors

The default data in an empty form is usually invalid, but displaying lots of errors upon page load doesn't look good. Superforms handles it like this:

If no data was posted or sent to `superValidate`, **no errors will be returned** unless the `errors` option in `superValidate` is `true`. This is what happens in load functions when the only the schema is sent to `superValidate`:

```ts
export const load = async () => {
  // No errors set, since no data is sent to superValidate
  const form = await superValidate(zod(schema));

  // No data, but errors can still be added with an option
  const form2 = await superValidate(zod(schema), { errors: true });
};
```

If data was sent to `superValidate`, either posted or populated with data, **errors will be returned** unless the `errors` option is `false`.

```ts
export const load = async () => {
  const initialData = { test: 123 };

  // Form is populated, so errors will be set if validation fails
  const form = await superValidate(initialData, zod(schema));

  // No errors will be set, even if validation fails
  const form2 = await superValidate(initialData, zod(schema), { errors: false });
};

export const actions = {
  default: async ({ request }) => {
    // Data is posted, so form.errors will be populated
    const form = await superValidate(request, zod(schema));

    // Unless we turn them off (which is rare in form actions)
    const form2 = await superValidate(request, zod(schema), { errors: false });
  }
};
```

> The `errors` option does not affect the `valid` property of the `SuperValidated` object, which always indicates whether validation succeeded or not.

## Usage (client)

As said, errors are available in the `$errors` store. It gives you high flexibility, since you can place error messages anywhere on the page.

In larger forms, the submit button may be far away from the error, so it's nice to show the user where the first error is. There are a couple of options for that:

```ts
const { form, enhance, errors, allErrors } = superForm(data.form, {
  errorSelector: string | undefined = '[aria-invalid="true"],[data-invalid]',
  scrollToError: 'auto' | 'smooth' | 'off' | boolean | ScrollIntoViewOptions = 'smooth',
  autoFocusOnError: boolean | 'detect' = 'detect',
  stickyNavbar: string | undefined = undefined,
  customValidity: boolean = false
})
```

### errorSelector

This is the CSS selector used to locate the invalid input fields after form submission. The default is `[aria-invalid="true"],[data-invalid]`, and the first one found in the form will be scrolled to and focused on, depending on the other settings. You usually set it on the input fields as such:

```svelte
<input
  type="email"
  name="email"
  bind:value={$form.email}
  aria-invalid={$errors.email ? 'true' : undefined} />
```

### scrollToError

The `scrollToError` option determines how to scroll to the first error message in the form. `smooth` and `auto` are values from [Window.scroll](https://developer.mozilla.org/en-US/docs/Web/API/Window/scroll). If the non-string options are used, [Element.scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) will be called with the option. This is mostly used with nested scrollbars, in which case Window.scroll won't work.

### autoFocusOnError

When `autoFocusOnError` is set to its default value `detect`, it checks if the user is on a mobile device; **if not**, it will automatically focus on the first error input field. It's prevented on mobile devices since focusing will open the on-screen keyboard, causing the viewport to shift, which could hide the validation error.

### stickyNavbar

If you have a sticky navbar, set its CSS selector here and it won't hide any errors due to its height and z-index.

### customValidity

This option uses the [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#the_constraint_validation_api) to display validation errors. By enabling this, with [use:enhance](/concepts/enhance) added to the form, instead of the standard messages, the Zod validation errors will now be displayed in the browser validation tooltip. Submit the following form without entering any data to see it in action:

<CustomValidity {data} />

Since validation is handled by Superforms, there is no need for spreading `$constraints` on the field. But the biggest win is that there is no need to display `$errors`, making for a minimal html:

```ts
const { form, enhance } = superForm(data.form, {
  customValidity: true,
  // Not required, but will use client-side validation for real-time error display:
  validators: schema
});
```
```svelte
<input type="text" name="name" bind:value={$form.name} />
```

The `name` attribute is required on the input fields. If you want to exclude a field from displaying the tooltip, add a `data-no-custom-validity` attribute to it.

> Just be aware that since `use:enhance` is needed, `customValidity` requires JavaScript to be enabled, unlike browser [constraints](/concepts/client-validation#built-in-browser-validation).

## Form-level and array errors

It's possible to set form-level errors by refining the schema, which works better together with [client-side validation](/concepts/client-validation), as errors added with [setError](/api#seterrorform-field-error-options) won't persist longer than the first validation of the schema on the client.

```ts
const refined = z.object({
  tags: z.string().array().max(3)
  password: z.string().min(8),
  confirm: z.string().min(8)
})
.refine((data) => data.password == data.confirm, "Passwords didn't match.");
```

These can be accessed on the client through `$errors?._errors`. The same goes for array errors, which in the above case can be accessed through `$errors.tags?._errors` (alternatively, use an [arrayProxy](/api#arrayproxysuperform-fieldname-options)).

### Setting field errors with refine

You may want to set the error on the password or the confirm field instead of a form-level error. In that case you can add a path to the Zod [refine](https://zod.dev/?id=refine) option:

```ts
const refined = z.object({
  tags: z.string().array().max(3)
  password: z.string().min(8),
  confirm: z.string().min(8)
})
.refine((data) => data.password == data.confirm, {
  message: "Passwords didn't match",
  path: ["confirm"]
});
```

For nested data, use multiple elements like `["user", "email"]`, which corresponds to `user.email` in the schema.

As said, setting errors on the schema like this is preferred, but it may not always be possible. When you need to set errors after validation, use the [setError](/api#seterrorform-field-error-options) function.

> If you would like a message to persist until the next form submission regardless of validation, use a [status message](/concepts/messages) instead.

## Listing errors

You may also want to list the errors above the form. The `$allErrors` store can be used for this. It's an array that contains all errors and their field names:

```svelte
{#if $allErrors.length}
  <ul>
    {#each $allErrors as error}
      <li>
        <b>{error.path}:</b>
        {error.messages.join('. ')}
      </li>
    {/each}
  </ul>
{/if}
```

`$allErrors.length` can also be useful to disable the submit button if there are any errors.

## Customizing error messages in the schema

Most methods in the validation schema has a parameter for a custom error message, so you can just add them there. For example with Zod:

```ts
const schema = z.object({
  name: z.string().min(2, "Name is too short."),
  email: z.string().email("That's a strange email.")
});
```

This is also a good place for translation strings.

## Test it out

This form has `aria-invalid` set on erroneous fields, and lists all errors on top of the form using `$allErrors`. Try to submit and see that the first error field gets focus automatically (unless on mobile).

<Form {data} />

<Next section={concepts} />
