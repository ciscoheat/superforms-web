<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import Flowchart from './Flowchart.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Events

<Head title="Events" />

A number of events give you full control over the submit process. They are triggered every time the form is submitted.

> Events are only available when JavaScript is enabled in the browser and the custom [use:enhance](/concepts/enhance) is added to the form.

## Event flowchart

<Flowchart />

> In a [single-page application](/concepts/spa), or if [client-side validation](/concepts/client-validation) fails, the validation happens entirely on the client, instead of being returned from the server between `onSubmit` and `onResult`.

## Usage

```ts
const { form, enhance } = superForm(data.form, {
  onSubmit: ({ action, formData, formElement, controller, submitter, cancel }) => void
  onResult: ({ result, formEl, cancel }) => void
  onUpdate: ({ form, cancel }) => void
  onUpdated: ({ form }) => void
  onError: (({ result, message }) => void) | 'apply'
})
```

### onSubmit

```ts
onSubmit: ({
  action,
  formData,
  formElement,
  controller,
  submitter,
  cancel
}) => void;
```

The `onSubmit` event is the first one triggered, being essentially the same as SvelteKit's own `use:enhance` function. It gives you a chance to cancel the submission altogether. See the SvelteKit docs for the [SubmitFunction](https://kit.svelte.dev/docs/types#public-types-submitfunction) signature.

### onResult

```ts
onResult: ({ result, formElement, cancel }) => void
```

If the submission isn't cancelled and [client-side validation](/concepts/client-validation) succeeds, the form is posted to the server. It then responds with a SvelteKit [ActionResult](https://kit.svelte.dev/docs/types#public-types-actionresult), triggering the `onResult` event.

`result` contains the ActionResult. You can modify it; changes will be applied further down the event chain. `formElement` is the `HTMLFormElement` of the form. `cancel()` is a function which will cancel the rest of the event chain and any form updates.

> In most cases, you don't have to care about the `ActionResult`. To check if the form validation succeeded, use [onUpdated](/concepts/events#onupdated), or [onUpdate](/concepts/events#onupdate) if you want to modify or cancel the result before it's displayed.

#### Common usage

`onResult` is useful when you have set `applyAction = false` and still want to redirect, since the form doesn't do that automatically in that case. Then you can do:

```ts
const { form, enhance } = superForm(data.form, {
  applyAction: false,
  onResult({ result }) {
    if (result.type === 'redirect') {
      goto(result.location);
    }
  }
});
```

Also, if `applyAction` is `false`, which means that `$page.status` won't update, you'll find the status code for the request in `result.status`.

#### Strongly typed ActionResult

Usually, you check the ActionResult status in `onResult`, not the form validation result, which is more conveniently handled in `onUpdate` (see below). But if you return additional data in the form action, there is a helper type called `FormResult`, that you can use to make the ActionResult data strongly typed:

```svelte
<script lang="ts">
  import { superForm, type FormResult } from 'sveltekit-superforms';
  import type { ActionData } from './$types';

  export let data;

  const { form, enhance } = superForm(data.form, {
    onResult: (event) => {
      const result = event.result as FormResult<ActionData>;
      if (result.type == 'failure') {
        // Strongly typed now (but quite unreadable,
        // prefer to use onUpdate or onUpdated)
        console.log(result.data?.form.data.name);
      }
    }
  });
</script>
```

### onUpdate

```ts
onUpdate: ({ form, formElement, cancel }) => void
```

The `onUpdate` event is triggered right before the form update is being applied, giving you the option to modify the validation result in `form`, or use `cancel()` to negate the update altogether. You also have access to the form's `HTMLFormElement` with `formElement`.

> If your app is a single-page application, use `onUpdate` to process the form data. See the [SPA](/concepts/spa) page for more details.

When you don't need to modify or cancel the validation result, the last event is the most convenient to use:

### onUpdated

```ts
onUpdated: ({ form }) => void
```

When you just want to ensure that the form is validated and do something extra afterwards, like showing a toast notification, `onUpdated` is the easiest way.

The `form` parameter contains the validation result, and should be considered read-only here, since the stores have updated at this point.

**Example**

```ts
const { form, enhance } = superForm(data.form, {
  onUpdated({ form }) {
    if (form.valid) {
      // Successful post! Do some more client-side stuff,
      // like showing a toast notification.
      toast(form.message, { icon: '✅' });
    }
  }
});
```

### onError

```ts
onError: (({ result }) => void) | 'apply'
```

When the SvelteKit [error](https://kit.svelte.dev/docs/errors#expected-errors) function is called on the server, you can use the `onError` event to catch it.

`result` is the error ActionResult, with the `error` property casted to [App.Error](https://kit.svelte.dev/docs/types#app-error). In this simple example, the message store is set to the error:

```ts
const { form, enhance, message } = superForm(data.form, {
  onError({ result }) {
    $message = result.error.message;
  }
});
```

You can also set `onError` to the string value `'apply'`, in which case the SvelteKit `applyAction` error behaviour will be used, which is to render the nearest [+error](https://kit.svelte.dev/docs/routing#error) page, also wiping out the form. To avoid data loss even for non-JavaScript users, returning a [status message](/concepts/messages) instead of throwing an error is recommended.

> If you're unsure what event to use, start with `onUpdated`; unless your app is a [SPA](/concepts/spa), then `onUpdate` should be used to validate the form data.

## Non-submit events 

### onChange

The `onChange` event is not triggered when submitting, but every time `$form` is modified, both as a html event (when modified with `bind:value`) and programmatically (direct assignment to `$form`). 

The event is a discriminated union that you can distinguish between using the `target` property:

```ts
const { form, errors, enhance } = superForm(data.form, {
  onChange(event) {
    if(event.target) {
      // Form input event
      console.log(
        event.path, 'was changed from', event.target, 
        'in form', event.formElement
      );
    } else {
      // Programmatic event
      console.log('Fields updated:', event.paths)
    }
  }
})
```

If you only want to handle programmatic events, you can access `event.paths` without distinguishing.

<Next section={concepts} />
