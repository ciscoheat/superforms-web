<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Tainted fields

<Head title="Tainted form fields" />

When the form data is modified, that piece of data, and in turn the form, is considered _tainted_, also known as "dirty" in other form libraries.

A Superforms feature is to prevent the user from losing data when accidentally navigating away from a tainted form.

## Usage

```ts
const { form, enhance, tainted } = superForm(data.form, {
  taintedMessage: string | null = 'Do you want to leave this page? Changes you made may not be saved.'
})
```

> For the user's sake, the tainted message is set by default, but if you're certain you don't want an alert to appear for a particular form, set the option to `null`. This can be necessary for login and registration forms, where password managers can taint the form when inserting saved usernames and passwords.

## Example

Try to modify the form below, then close the tab or hit the back button. A confirmation dialog should prevent you from losing the changes.

<Form {data} />

## Tainted store

You can access the exact fields that are tainted through the `$tainted` store returned from `superForm`. When you modify the form fields above, you'll see how the `$tainted` store reacts.

> Any direct assignment to `$form` will taint the affected field(s)! The tainted check is made on the `form` store, not the HTML input fields. In general, don't modify the `$tainted` store directly; instead, see below for how to set form data without tainting the form.

## Untainting the form

When a validation result is returned for the form with a `valid` status set to `true`, the form is automatically marked as untainted by setting the `$tainted` store to `undefined`.

Try that by posting the form with valid values. The tainted message should not appear when browsing away from the page.

If you're assigning to `$form` and don't want it to be tainted, you can instead update it with an extra option:

```ts
const { form } = superForm(data.form);

form.update(
  ($form) => {
    $form.name = data.name;
    return $form;
  },
  { taint: false }
); // boolean | 'untaint' | 'untaint-all'
```

<Next section={concepts} />
