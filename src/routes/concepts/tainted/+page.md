<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Tainted form check

When a form field is modified, that field, and in turn the form, is considered _tainted_. A Superforms feature is to help the user from losing inputted data, by preventing accidental navigation away from a tainted form.

## Options

```ts
const { form, enhance, tainted } = superForm(data.form, {
  taintedMessage: string | null = 'Do you want to leave this page? Changes you made may not be saved.'
})
```

Try to modify the form below, then close the tab or hit the back button. A confirmation dialog should prevent you from losing the changes.

## Untainting the form

When the page status changes to something between `200-299`, the form is automatically marked as untainted.

Try that by posting the form with valid values. The tainted message should not appear when browsing away from the page.

## Disabling the check

By setting `taintedMessage = null`, the form won't be checked for modifications.

## Store access

You can access the exact fields that are tainted through the `$tainted` store, returned from `superForm`. Try modifying the form fields and see how the `$tainted` store reacts:

<Form {data} />

<Next section={concepts} />
