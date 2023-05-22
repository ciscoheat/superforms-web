<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import Flowchart from './Flowchart.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Events

<svelte:head><title>Events</title></svelte:head>

With `use:enhance` enabled, you get full control over the form submit process through a number of events.

## Event flowchart

Click on the event you want to know more about!

<Flowchart />

## Usage

```ts
const { form } = superForm(data.form, {
  onSubmit: ({ action, data, form, controller, cancel }) => void
  onResult: ({ result, formEl, cancel }) => void
  onUpdate: ({ form, cancel }) => void
  onUpdated: ({ form }) => void
  onError: (({ result, message }) => void) | 'apply'
})
```

### onSubmit

```ts
onSubmit: ({ action, data, form, controller, cancel }) => void;
```

The `onSubmit` event is the first one triggered, hooking you into SvelteKit's `use:enhance` function. See SvelteKit docs for the [SubmitFunction](https://kit.svelte.dev/docs/types#public-types-submitfunction) signature.

### onResult

```ts
onResult: ({ result, formEl, cancel }) => void
```

When you want detailed control, `onResult` gives you the [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) in `result`. You can modify it, changes will be applied further down the event chain.

- `formEl` is the `HTMLFormElement` of the form.
- `cancel()` is a function which will cancel the rest of the event chain and any form updates.

`onResult` is useful when you have set `applyAction = false` and still want to redirect, since the form doesn't do that automatically in that case. Then you can do:

```ts
const { form } = superForm(data.form, {
  applyAction: false,
  onResult({ result }) {
    if (result.type === 'redirect') {
      goto(result.location);
    }
  }
});
```

Also if `applyAction` is `false`, which means that `$page.status` won't update, you'll find the status code for the request in `result`.

**Note:** if you just want to check if the validation succeeded, use `onUpdated` instead of `onResult`, it's simpler.

### onUpdate

```ts
onUpdate: ({ form, formEl, cancel }) => void
```

If you don't care about the details of the `ActionResult`, rather the validation result, `onUpdate` is triggered just before the form update is being applied, and gives you the option to modify the validation result in `form`, or `cancel()` the update altogether. You have also access to the form's `HTMLFormElement` with `formEl`.

This is the event you should use with a single-page application (SPA) if you want to validate the data. see [the SPA page](/concepts/spa) for details.

### onUpdated

```ts
onUpdated: ({ form }) => void
```

If you just want the default behaviour and do something after a valid update, like showing a toast notification, `onUpdated` is the easiest way.

`form` contains the validation result, and is read-only here, since the stores have updated at this point.

**Example:**

```ts
const { form } = superForm(data.form, {
  onUpdated({ form }) {
    if (form.valid) {
      // Successful post! Do some more client-side stuff.
    }
  }
});
```

### onError

```ts
onError: (({ result, message }) => void) | 'apply'
```

Finally, the `onError` event allows you to act on `ActionResult` errors. You can use its `message` store parameter to set it to the error value here.

By setting onError to `apply`, the default `applyAction` behaviour will be used, effectively rendering the nearest `+error` boundary (and wiping out the form, so be careful).

**Tip:** If you're unsure what event to use, start with `onUpdated`. If your app is a [SPA](/concepts/spa), `onUpdate` is most likely the one you should be using.

<Next section={concepts} />
