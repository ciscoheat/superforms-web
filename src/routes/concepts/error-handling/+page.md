<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Error handling

In general, using the `$errors` store gives you high flexibility, since you can place error messages anywhere on the page. But there are more to errors than just displaying them.

On larger forms it's nice showing the user where the first error is. There are a couple of options for that:

## Options

```ts
const { form, enhance, errors, allErrors } = superForm(data.form, {
  scrollToError: 'smooth' | 'auto' | 'off' = 'smooth'
  autoFocusOnError: boolean | 'detect' = 'detect'
  errorSelector: string | undefined = '[data-invalid]'
  stickyNavbar: string | undefined = undefined
})
```

### scrollToError

The `scrollToError` options determines how to scroll to the first error message in the form. `smooth` and `auto` are values from [Window.scroll()](https://developer.mozilla.org/en-US/docs/Web/API/Window/scroll).

### autoFocusOnError

When `autoFocusOnError` is set to its default value `detect`, it checks if the user is on a mobile device, **if not** it will automatically focus on the first error input field. It's prevented on mobile since auto-focusing will open the on-screen keyboard, most likely hiding the validation error.

### errorSelector

This is the selector used to find the invalid input fields. The default is `[data-invalid]`, and the first one found on the page will be handled according to the two previous settings. You usually set it on the input fields as such:

```svelte
<input
  type="email"
  name="email"
  bind:value={$form.email}
  data-invalid={$errors.email}
/>
```

### stickyNavbar

If you have a sticky navbar, set its selector here and it won't hide any errors due to its height and z-index.

## Listing errors

You may also want to list the errors above the form. The `$allErrors` store can be used for this. It's an array that contains all errors and their field names:

```svelte
{#if $allErrors}
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

## Test it out

This form has `data-invalid` set on erroneous fields, and lists all errors on top of the form using `$allErrors`. Try to submit and see that the first error field gets focus automatically, unless on mobile.

<Form {data} />

<Next section={concepts} />
