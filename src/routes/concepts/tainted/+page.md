<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Tainted fields

<svelte:head><title>Tainted form fields</title></svelte:head>

When the form data is modified, that piece of data, and in turn the form, is considered _tainted_. A Superforms feature is to prevent the user from losing data, when accidentaly navigating away from a tainted form.

## Usage

```ts
const { form, enhance, tainted } = superForm(data.form, {
  taintedMessage: string | null = 'Do you want to leave this page? Changes you made may not be saved.'
})
```

Try to modify the form below, then close the tab or hit the back button. A confirmation dialog should prevent you from losing the changes.

<Form {data} />

## Tainted store

You can access the exact fields that are tainted through the `$tainted` store, returned from `superForm`. When you modify the form fields above you'll see how the `$tainted` store reacts.

**Note:** Any direct assignment `$form` will taint the affected field(s)! The tainted check is made on the `form` store, not the html input fields themselves. See below for how to set data without tainting the form.

## Untainting the form

When a validation result is returned for the form with a status between `200-299`, the form is automatically marked as untainted by setting the `$tainted` store to `undefined`.

Try that by posting the form with valid values. The tainted message should not appear when browsing away from the page.

You can also modify the `$tainted` store directly, but the recommended way is to set an option when modifying `form`:

```ts
const { form } = superForm(data.form)

form.update($form => {
  $form.name = data.name
  return $form
}, { taint: false }) // boolean | 'untaint' | 'untaint-all'
```

## Disabling the check

By setting `taintedMessage` to `null` in the options, the form won't be checked for modifications when navigating away from the page. Especially useful for forms like login and registration, where password managers can taint the form when inserting saved usernames and passwords.

<Next section={concepts} />
