<script lang="ts">
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

<svelte:head><title>Snapshots</title></svelte:head>

A quite recent SvelteKit feature is [snapshots](https://kit.svelte.dev/docs/snapshots), which saves and restores data when the user navigates in the browser history. This is perfect for saving the form state, and with Superforms you can take advantage of this in one line of code.

## Usage

```ts
const { form, capture, restore } = superForm(data.form);

export const snapshot = { capture, restore };
```

## Test it out

Modify the form below without submitting, then click the browser back button and then forward again. The form should be restored to its intermediate state. (`taintedMessage` is set to `null` for this example.)

<Form {form} {errors} {enhance} {message} {reset} />

<Next section={concepts} />
