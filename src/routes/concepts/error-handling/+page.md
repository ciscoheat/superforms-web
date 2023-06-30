<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Error handling

<svelte:head><title>Error handling</title></svelte:head>

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
    bind:value={$form.name} />
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <div><button>Submit</button></div>
</form>
```

The `aria-invalid` attribute is used to automatically focus on the first error field, see the [errorSelector](/concepts/error-handling#errorselector) option further below.

> To track touched fields, the `$errors` object doesn't remove any fields from itself when there are no errors, it sets them to `undefined`. A truthy/falsy check should be made for each field when checking for errors.

## setError

Most errors will be set automatically when the data is validated, but you may want to add errors after determining that the data is valid. This is easily done with the `setError` helper function.

```ts
import { setError, superValidate } from 'sveltekit-superforms/server';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);

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

`setError` returns a `fail(400, { form })` so it can be returned immediately, or more errors can be added by calling it multiple times before returning. See [the API](/api#seterrorform-field-error-options) for more options.

If you have nested data, a string path is used to specify where in the data structure the error is:

```ts
setError(form, `post.tags[${i}].name`, 'Invalid tag name.');
```

## Initial form errors

The default data in an empty form is usually invalid, but displaying lots of errors upon page load doesn't look good. Superforms handles it like this:

If no data was posted or sent to `superValidate`, **no errors will be returned** unless the `errors` option in `superValidate` is `true`. This is what happens in load functions, when the only parameter sent to `superValidate` is the schema.

```ts
export const load = async () => {
  // No errors set, since no data is sent to superValidate
  const form = await superValidate(schema);

  // No data, but errors can still be added
  const form2 = await superValidate(schema, { errors: true });
}
```

If data was sent to `superValidate`, either posted or populated with data, **errors will be returned** unless the `errors` option is `false`. This happens in form actions or when the form is initially populated.

```ts
export const load = async () => {
  const initialData = { test: 123 }

  // Form is populated, so errors will be set if validation fails
  const form = await superValidate(initialData, schema);

  // No errors will be set, even if validation fails
  const form2 = await superValidate(initialData, schema, { errors: false });
}

export const actions = {
  default: async ({ request }) => {
    // Data is posted, so form.errors will be populated
    const form = await superValidate(request, schema);

    // Unless we turn them off (which is rare in form actions)
    const form2 = await superValidate(request, schema, { errors: false });
  }
};
```

> The `errors` option does not affect the `valid` property of the `SuperValidated` object, which always indicates whether validation succeeded or not.

## Usage (client)

As said, errors are available in the `$errors` store. It gives you a high flexibility, since you can place error messages anywhere on the page.

In larger forms, the submit button may be far away from the error, so it's nice showing the user where the first error is. There are a couple of options for that:

```ts
const { form, enhance, errors, allErrors } = superForm(data.form, {
  errorSelector: string | undefined = '[aria-invalid="true"],[data-invalid]'
  scrollToError: 'smooth' | 'auto' | 'off' = 'smooth'
  autoFocusOnError: boolean | 'detect' = 'detect'
  stickyNavbar: string | undefined = undefined,
  onError: (({ result, message }) => void) | 'apply'
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

The `scrollToError` options determines how to scroll to the first error message in the form. `smooth` and `auto` are values from [Window.scroll()](https://developer.mozilla.org/en-US/docs/Web/API/Window/scroll).

### autoFocusOnError

When `autoFocusOnError` is set to its default value `detect`, it checks if the user is on a mobile device, **if not** it will automatically focus on the first error input field. It's prevented on mobile devices since focusing will open the on-screen keyboard, causing the viewport to shift and could also hide the validation error.

### stickyNavbar

If you have a sticky navbar, set its selector here and it won't hide any errors due to its height and z-index.

### onError

This option is an event, explained more in detail [on the event page](/concepts/events#onerror), but it's mentioned here since you should usually implement this to display server errors in a user-friendly way. It can be as simple as this:

```ts
/**
 * result is an ActionResult with type error
 * message is the $message store
 */
onError({ result, message }) {
  message.set(result.error.message);
}
```

Errors can be thrown server-side with the SvelteKit `error` helper:

```ts
import { error } from '@sveltejs/kit';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);

    try {
      db.insert(form.data);
    } catch (e) {
      throw error(500, 'Something went wrong, please try again.');
    }
  }
};
```

## Form-level and array errors

It's possible to set form-level errors by refining the schema:

```ts
const refined = z.object({
  tags: z.string().array().max(3)
  password: z.string().min(8),
  confirm: z.string().min(8)
})
.refine((data) => data.password == data.confirm, "Passwords didn't match.");
```

These can be accessed on the client through `$errors?._errors`. The same goes for array errors, which in the above case can be accessed through `$errors.tags?._errors`.

> The form-level and array errors will be added and removed during [client-side validation](/concepts/client-validation). If you would like a message to persist until the next submission, use a [status message](/concepts/messages) instead.

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

`$allErrors` can also be useful to disable the submit button if there are any errors.

## Test it out

This form has `aria-invalid` set on erroneous fields, and lists all errors on top of the form using `$allErrors`. Try to submit and see that the first error field gets focus automatically, unless on mobile.

<Form {data} />

<Next section={concepts} />
