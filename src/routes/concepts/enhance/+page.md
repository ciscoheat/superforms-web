<script lang="ts">
  import Next from '$lib/Next.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Progressive enhancement

By using `enhance` returned from `superForm` on a form, we'll get the client-side enhancement expected from a modern webpage:

```svelte
<script lang="ts">
  const { form, enhance } = superForm(data.form);
  //            ^^^^^^^
</script>

<form method="POST" use:enhance>
```

Now all form submissions will happen on the client, and we unlock a ton of extra features, that will be explained here and in the rest of this section.

## Options

```ts
const { form, enhance } = superForm(data.form, {
  applyAction: boolean = true;
  invalidateAll: boolean = true;
  resetForm: boolean = false;
})
```

These options are the most boring ones, we'll get to the fun stuff soon!

### applyAction

When `applyAction` is `true` the form will have the default SvelteKit behavior of updating and reacting on `$page.form` and `$page.status`. Turning this behavior off can be useful when other sources are invalidating the page.

### invalidateAll

When `invalidateAll` is `true` and a successful result is returned from the server, the page will be invalidated and the load function will run.

### resetForm

Since we're binding the fields to `$form`, a html form reset (clearing all fields) won't have any effect, so in Superforms, resetting means _going back to the initial state of the form data_, usually the contents of `form` in `PageData`. This may not be exactly what you needed, in which case you can use [an event](/concepts/events) to clear the form instead.

## When to change the defaults?

Quite rarely! If you have a single form on the page and nothing else is causing the page to invalidate, you'll probably be fine as it is. For multiple forms on the same page, you can use `options.id` to prevent forms from reacting on `$page`, instead of setting `applyAction` to `false`.

## Other differences from SvelteKit's use:enhance

The biggest difference is that any [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) with status `error` is transformed into `failure` to avoid form data loss, since when the nearest `+error.svelte` page is rendered, it will wipe out the form and all data that was just entered.

The [onError event](/concepts/events) is a more user-friendly way of handling server errors.

As described above, the form isn't resetted by default either. This should be opt-in to avoid data loss, and this isn't always wanted, especially in backend interfaces, where the form data should be persisted.

<Next section={concepts} />
