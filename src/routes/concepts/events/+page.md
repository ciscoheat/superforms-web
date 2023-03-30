<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import Flowchart from './Flowchart.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Events

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

The `onSubmit` event is the first one triggered, that hooks you in to SvelteKit's `use:enhance` function. See SvelteKit docs for the [SubmitFunction](https://kit.svelte.dev/docs/types#public-types-submitfunction) signature.

### onResult

```ts
onResult: ({ result, formEl, cancel }) => void
```

When you want detailed control, `onResult` gives you the [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult) in `result`. You can modify it, which will be used further down the event chain.

- `formEl` is the `HTMLFormElement` of the form.
- `cancel()` is a function which will cancel the rest of the event chain and any form updates.

### onUpdate

```ts
onUpdate: ({ form, cancel }) => void
```

If you don't care about the specifics of the `ActionResult`, `onUpdate`, is triggered just before the form update is being applied, and gives you the option to modify the validation result in `form`, or `cancel()` the update altogether.

### onUpdated

```ts
onUpdated: ({ form }) => void
```

If you just want the default behaviour and act on the validation success or its data, `onUpdated` is the easiest way. `form` is the validation result, and should be considered read-only here.

### onError

```ts
onError: (({ result, message }) => void) | 'apply'
```

Finally, the `onError` event allows you to act on `ActionResult` errors. You can use its `message` store parameter to set it to the error value here.

By setting onError to `apply`, the default `applyAction` behaviour will be used, effectively rendering the nearest `+error` boundary (and wiping out the form, so be careful).

**Tip:** If you're unsure what event to use, try onUpdated.

<Next section={concepts} />
