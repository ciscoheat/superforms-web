<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Next from '$lib/Next.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Progressive enhancement

<Head title="Progressive enhancement with use:enhance" />

By using `enhance` returned from `superForm`, we'll get the client-side enhancement expected from a modern website:

```svelte
<script lang="ts">
  const { form, enhance } = superForm(data.form);
  //            ^^^^^^^
</script>

<form method="POST" use:enhance>
```

The `use:enhance` action takes no arguments; instead, events are used to hook into the default SvelteKit use:enhance parameters and more. Check out the [events page](/concepts/events) for details.

> Without `use:enhance`, the form will be static. No events, loading timers, auto-focus, etc. The only things that will work are [constraints](/concepts/client-validation#constraints). Also note that SvelteKit's own `use:enhance` cannot be used; you must use the one returned from `superForm`, and it should only be used on a single form element - you cannot share it between forms.

## Modifying the use:enhance behavior

The default `use:enhance` behavior can be modified, here are the options available along with the default values; you don't need to add them unless you want to change a value.

```ts
const { form, enhance, reset } = superForm(data.form, {
  applyAction: true,
  invalidateAll: true,
  resetForm: true
});
```

### applyAction

When `applyAction` is `true`, the form will have the default SvelteKit behavior of both updating and reacting on `$page.form` and `$page.status`, and also redirecting automatically.

Turning this behavior off can be useful when you want to isolate the form from other sources updating the page, for example Supabase events, a known source of confusing form behavior. Read more about `applyAction` [in the SvelteKit docs](https://kit.svelte.dev/docs/form-actions#progressive-enhancement-applyaction).

### invalidateAll

When `invalidateAll` is `true` (the default) and a successful validation result is returned from the server, the page will be invalidated and the load functions will run again. A login form takes advantage of this to update user information on the page.

### resetForm

When `true`, reset the form upon a successful validation result.

Note however, that since we're using `bind:value` on the input fields, a HTML form reset (clearing all fields in the DOM) won't have any effect. So in Superforms, **resetting means going back to the initial state of the form data**, basically setting `$form` to what was initially sent to `superForm`.

For a custom reset, you can instead modify the `data` field returned from `superValidate` on the server, or use the [events](/concepts/events) together with the [reset](/api#superform-return-type) function on the client.

## When to change the defaults?

Quite rarely! If you have a single form on the page and nothing else is causing the page to invalidate, you'll probably be fine as it is. For multiple forms on the same page, you have to experiment with these three options. Read more on the [multiple forms](/concepts/multiple-forms) page.

`applyAction` and `invalidateAll` are the most technical ones; if you're dealing with a single form per page, you can most likely skip them.

## Making the form behave like the SvelteKit default

Any [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) with status `error` is transformed into `failure` by Superforms to avoid form data loss. The SvelteKit default is to render the nearest `+error.svelte` page, which will wipe out the form and all data that was just entered. Returning `fail` with a [status message](/concepts/messages) or using the [onError event](/concepts/events#onerror) is a more user-friendly way of handling server errors.

You can prevent this by setting the following option. Use with care, since the purpose of the change is to protect the user from data loss.

```ts
const { form, enhance } = superForm(data.form, {
  // On ActionResult error, render the nearest +error.svelte page
  onError: 'apply',
});
```

<Next section={concepts} />
