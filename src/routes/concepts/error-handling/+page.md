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
  <input name="name" data-invalid={$errors.name} bind:value={$form.name} />
  {#if $errors.name}<span class="invalid">{$errors.name}</span>{/if}

  <div><button>Submit</button></div>
</form>
```

The `data-invalid` attribute is used to automatically focus on the first error field, see the `errorSelector` option further below.

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

If you have nested data, you'll use an array to specify where in the data structure the error is:

```ts
// Error in post.tags[3]
setError(form, ['post', 'tags', 3], 'Invalid tag name.');
```

## Usage (client)

As said, errors are available in the `$errors` store. It gives you a high flexibility, since you can place error messages anywhere on the page.

In larger forms, the submit button may be far away from the error, so it's nice showing the user where the first error is. There are a couple of options for that:

```ts
const { form, enhance, errors, allErrors } = superForm(data.form, {
  errorSelector: string | undefined = '[data-invalid]'
  scrollToError: 'smooth' | 'auto' | 'off' = 'smooth'
  autoFocusOnError: boolean | 'detect' = 'detect'
  stickyNavbar: string | undefined = undefined,
  onError: (({ result, message }) => void) | 'apply'
})
```

### errorSelector

This is the CSS selector used to locate the invalid input fields after form submission. The default is `[data-invalid]`, and the first one found on the page will be scrolled to and focused on, depending on the other settings. You usually set it on the input fields as such:

```svelte
<input
  type="email"
  name="email"
  bind:value={$form.email}
  data-invalid={$errors.email} />
```

### scrollToError

The `scrollToError` options determines how to scroll to the first error message in the form. `smooth` and `auto` are values from [Window.scroll()](https://developer.mozilla.org/en-US/docs/Web/API/Window/scroll).

### autoFocusOnError

When `autoFocusOnError` is set to its default value `detect`, it checks if the user is on a mobile device, **if not** it will automatically focus on the first error input field. It's prevented on mobile since auto-focusing will open the on-screen keyboard, most likely hiding the validation error.

### stickyNavbar

If you have a sticky navbar, set its selector here and it won't hide any errors due to its height and z-index.

### onError

This option is an event, explained more in detail [on the event page](/concepts/events#onerror), but it's mentioned here since you should usually implement this to display server errors in a user-friendly way. It can be as simple as this:

```ts
// result is an error ActionResult
// message is the form $message store
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

## Form-level errors

It's also possible to set form-level errors, either through refining the schema, or the `setError` function.

```ts
const refined = z
  .object({
    name: z.string().min(1)
  })
  .refine((data) => request.method == 'POST', 'Invalid request method.');

const form = await superValidate(request, refined);

return setError(form, null, 'Form-level problem.');
```

These can be accessed on the client through `$errors._errors`.

## Listing errors

You may also want to list the errors above the form. The `$allErrors` store can be used for this. It's an array that contains all errors and their field names:

```svelte
{#if $allErrors.length}
  <ul>
    {#each $allErrors as error}
      <li>
        <b>{error.path}:</b>
        {error.message}
      </li>
    {/each}
  </ul>
{/if}
```

This can also be useful to disable the submit button if there are any errors.

## Test it out

This form has `data-invalid` set on erroneous fields, and lists all errors on top of the form using `$allErrors`. Try to submit and see that the first error field gets focus automatically, unless on mobile.

<Form {data} />

<Next section={concepts} />
