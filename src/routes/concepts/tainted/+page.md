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

When the form data is modified, through modifying `$form`, the modified data (and in turn the form), is considered _tainted_, also known as "dirty" in other form libraries.

A Superforms feature is to prevent the user from losing data when navigating away from a tainted form.

## Usage

```ts
const { form, enhance } = superForm(data.form, {
  taintedMessage: string | (() => Promise<boolean>) | boolean = false
})
```

You can set the option to `true` to have a default message (in english) shown when navigating away from a tainted form, or set your own message with a `string` value. Note that this message will only be displayed when navigating to a page within the same site. When closing the tab or reloading the page, a browser default message will be shown instead.

Alternatively, you can set `taintedMessage` to a `() => Promise<boolean>` function that should resolve to `true` if navigating away is ok. This enables you to provide your own dialog:

```ts
const { form, enhance } = superForm(data.form, {
  taintedMessage: () => {
    return new Promise((resolve) => {
      modalStore.trigger({
        type: 'confirm',
        title: 'Do you want to leave?',
        body: 'Changes you made may not be saved.',
        response: resolve
      });
    });
  }
});
```

The code demonstrates the custom dialog with a [Skeleton modal](https://www.skeleton.dev/utilities/modals). Try it out below! Modify the form, then click the back button. A modal should pop up, preventing you from losing the changes:

<Form {data} />

## Untainting the form

When a successful validation result is returned for the form, with a `valid` status set to `true`, the form is automatically marked as untainted.

Try that by posting the form with valid values. The tainted message should not appear when browsing away from the page.

## Check if the form is tainted

An `isTainted` method is available on `superForm`, to check whether any part of the form is tainted:

```svelte
<script lang="ts">
  const { form, enhance, tainted, isTainted } = superForm(form.data);

  // Check the whole form
  if(isTainted()) {
    console.log('The form is tainted')
  }

  // Check a part of the form
  if(isTainted('name')) {
    console.log('The name field is tainted')
  }
</script>

<!-- Make the function reactive by passing the $tainted store -->
<button disabled={!isTainted($tainted)}>Submit</button>

<!-- It even works with individual fields -->
<button disabled={!isTainted($tainted.name)}>Submit name</button>
```

## Preventing tainting the form

If you want to modify the `form` store without tainting any fields, you can update it with an extra option:

```ts
const { form } = superForm(data.form);

form.update(
  ($form) => {
    $form.name = "New name";
    return $form;
  },
  { taint: false }
);
```

The `taint` options are:

```ts
{ taint: boolean | 'untaint' | 'untaint-form' }
```

Which can be used to not only prevent tainting, but also untaint the modified field(s), or untainting the whole form.

> For login and registration forms, password managers could automatically taint the form when inserting saved usernames and passwords.

<Next section={concepts} />
