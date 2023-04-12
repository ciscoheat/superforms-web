<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Tainted form check

<svelte:head><title>Tainted form check</title></svelte:head>

When form data is modified, that piece of data, and in turn the form, is considered _tainted_. A Superforms feature is to prevent the user from losing data, by accidentaly navigating away from a tainted form.

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

**Note:** Any modification to the `$form` store will taint the affected field(s)! The tainted check doesn't have anything to do with the html inputs themselves.

## Untainting the form

When a validation result is returned for the form with a status between `200-299`, the form is automatically marked as untainted by setting the `$tainted` store to `undefined`.

Try that by posting the form with valid values. The tainted message should not appear when browsing away from the page.

## Disabling the check

By setting `taintedMessage` to `null` in the options, the form won't be checked for modifications when navigating away from the page.

<Next section={concepts} />
