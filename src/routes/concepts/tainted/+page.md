<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Tainted form check

```ts
const { form } = superForm(data.form, {
  taintedMessage: string | null = 'Do you want to leave this page? Changes you made may not be saved.'
})
```

Try to modify the form below, then close the tab or hit the back button. A confirmation dialog should prevent you from losing the changes.

<Form {data} />

When the page status changes to something between 200-299, the form is automatically marked as untainted.

Try that by posting the form with valid values. The tainted message should not appear when browsing away from the page.

<Next section={concepts} />
