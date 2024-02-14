<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'
  import { superForm } from 'sveltekit-superforms/client';

	export let data;

  const { form, errors, enhance, message, capture, restore, reset } = superForm(data.form, {
    taintedMessage: null
  });

  export const snapshot = { capture, restore }
</script>

# Snapshots

<Head title="Snapshots" />

A nice SvelteKit feature is [snapshots](https://kit.svelte.dev/docs/snapshots), which saves and restores data when the user navigates on the site. This is perfect for saving the form state, and with Superforms, you can take advantage of this in one line of code, as an alternative to a [tainted form message](/concepts/tainted). Note that it only works for browser history navigation though.

## Usage

```ts
const { form, capture, restore } = superForm(data.form);

export const snapshot = { capture, restore };
```

The export has to be on a `+page.svelte` page to work, it cannot be in a component.

> The `options` object contains functions and cannot be serialized for a snapshot. If you modify the options dynamically, make a custom version of the methods to handle the changes.

## Test it out

Modify the form below without submitting, then click the browser back button and then forward again. The form should be restored to its intermediate state.

<Form {form} {errors} {enhance} {message} {reset} />

<Next section={concepts} />
