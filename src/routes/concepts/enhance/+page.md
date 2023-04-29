<script lang="ts">
  import Next from '$lib/Next.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Progressive enhancement

<svelte:head><title>Progressive enhancement with use:enhance</title></svelte:head>

By using `enhance` returned from `superForm`, we'll get the client-side enhancement expected from a modern webpage:

```svelte
<script lang="ts">
  const { form, enhance } = superForm(data.form);
  //            ^^^^^^^
</script>

<form method="POST" use:enhance>
```

Now all form submissions will happen on the client, and we unlock a ton of extra features, that will be explained here and in the rest of this section.

As a general rule, without `use:enhance` on the form, **not much will work**. You'll get no events, no timers, no client-side validation except for `constraints`, etc.

## Usage

The default values are shown in the example, you don't need to add them unless you want to change a value.

```ts
const { form, enhance, reset } = superForm(data.form, {
  applyAction: true;
  invalidateAll: true;
  resetForm: false;
})
```

These three options are the most boring ones, we'll get to the fun stuff soon!

### applyAction

When `applyAction` is `true` the form will have the default SvelteKit behavior of updating and reacting on `$page.form` and `$page.status`, and also redirecting automatically.

Turning this behavior off can be useful when you want to isolate the form from other sources updating the page, for example Supabase events, a known source of confusing form behavior. Read more about `applyAction` [in the SvelteKit docs](https://kit.svelte.dev/docs/form-actions#progressive-enhancement-applyaction).

### invalidateAll

When `invalidateAll` is `true` (the default) and a successful validation result is returned from the server, the page will be invalidated and the load functions will run again. A login form takes advantage of this, directly updating user information on the page.

### resetForm

Since we're binding the fields to `$form`, a html form reset (clearing all fields in DOM) won't have any effect, so in Superforms, resetting means _going back to the initial state of the form data_, which usually is what you initially sent to the client in `PageData`. If this isn't what you want, you can use [an event](/concepts/events) to set `$form` and `$tainted` directly.

Without `use:enhance`, you can reset the form by modifying the data returned from `superValidate` before it is sent to the client.

## When to change the defaults?

Quite rarely! If you have a single form on the page and nothing else is causing the page to invalidate, you'll probably be fine as it is.

For <a href="/concepts/multiple-forms">multiple forms</a> on the same page, use `options.id` to prevent forms from reacting on `$page`, instead of setting `applyAction` to `false`, though if you have events triggered that will invalidate the page, it may be the solution.

## Differences from SvelteKit's use:enhance

The biggest difference is that any [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) with status `error` is transformed into `failure` to avoid form data loss, since when the nearest `+error.svelte` page is rendered, it will wipe out the form and all data that was just entered.

The [onError event](/concepts/events#onerror) is a more user-friendly way of handling server errors.

As described above, the form isn't resetted by default either. This should be opt-in to avoid data loss, and isn't always wanted, especially in backend interfaces, where the form data should be kept after updating. For manual resets, you can use the `reset` method returned from `superForm`.

<Next section={concepts} />
