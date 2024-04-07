<script lang="ts">
  import Head from '$lib/Head.svelte'
  import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
  import Flowchart from './Flowchart.svelte'
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'
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

## onSubmit

```ts
onSubmit: ({
  action, formData, formElement, controller, submitter, cancel,
  jsonData, validators
}) => void;
```

The `onSubmit` event is the first one triggered, being essentially the same as SvelteKit's own `use:enhance` function. It gives you a chance to cancel the submission altogether. See the SvelteKit docs for most of the [SubmitFunction](https://kit.svelte.dev/docs/types#public-types-submitfunction) signature. There are two extra properties in the Superforms `onSubmit` event:

#### jsonData

If you're using [nested data](/concepts/nested-data), the `formData` property cannot be used to modify the posted data, since `$form` is serialized and posted instead. If you want to post something else than `$form`, you can do it with the `jsonData` function:

```ts
import { superForm, type FormPath } from 'sveltekit-superforms'

const { form, enhance, isTainted } = superForm(data.form, {
  dataType: 'json',
  onSubmit({ jsonData }) {
    // Only post tainted (top-level) fields
    const taintedData = Object.fromEntries(
      Object.entries($form).filter(([key]) => {
        return isTainted(key as FormPath<typeof $form>)
      })
    )
    // Set data to be posted
    jsonData(taintedData);
  }
});
```

Note that if [client-side validation](/concepts/client-validation) is enabled, it's always `$form` that will be validated. Only if it passes validation, the data sent with `jsonData` will be used. It does not work in [SPA mode](/concepts/spa) either, as data transformation can be handled in `onUpdate` in that case.

#### validators

For advanced validation, you can change client-side validators for the current form submission with this function.

```ts
import { superForm } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { customSchema } from './schemas.js';

let step = 1;
const lastStep = 5;

const { form, enhance } = superForm(data.form, {
  onSubmit({ validators }) {
    if(step == 1) validators(zod(customSchema));
    else if(step == lastStep) validators(false);
  }
});
```

## onResult

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

## onUpdate

```ts
onUpdate: ({ form, formElement, cancel, result }) => void
```

The `onUpdate` event is triggered right before the form update is being applied, giving you the option to modify the validation result in `form`, or use `cancel()` to negate the update altogether. You also have access to the form's `HTMLFormElement` with `formElement`. 

If your app is a single-page application, `onUpdate` is the most convenient to process the form data. See the [SPA](/concepts/spa) page for more details.

> The `form` parameter is deliberately named "form", to avoid using the `$form` store, as changes to the form parameter are applied to `$form` and the other stores, when the event is completed.

You can also access the `ActionResult` in `result`, which is narrowed to type `'success'` or `'failure'` here. You can use it together with the `FormResult` helper type to more conventiently access any additional form action data:

```ts
import { superForm, type FormResult } from 'sveltekit-superforms';
import type { ActionData, PageData } from './$types.js';

export let data: PageData;

const { form, errors, message, enhance } = superForm(data.form, {
  onUpdate({ form, result }) {
    const action = result.data as FormResult<ActionData>;
    // If you've returned from the form action:
    // return { form, extra: 123 }
    if (action.extra) {
      // Do something with the extra data
    }
  }
});
```

## onUpdated

```ts
onUpdated: ({ form }) => void
```

If you just want to ensure that the form is validated and do something extra afterwards, like showing a toast notification, `onUpdated` is the easiest way.

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

## onError

```ts
onError: (({ result }) => void) | 'apply'
```

When the SvelteKit [error](https://kit.svelte.dev/docs/errors#expected-errors) function is called on the server, you can use the `onError` event to catch it. `result` is the error ActionResult, with its `error` property:

```ts
App.Error | Error | { message: string }
```

Depending on what kind of error occurs, it will have a different shape.

| Error type | Shape |
| ---------- | ----- |
| [Expected error](https://kit.svelte.dev/docs/errors#expected-errors) | `App.Error` |
| Server exception   | `{ message: string }` |
| JSON response      | Unexpected JSON responses, such as from a proxy server, should be included in `App.Error` to be type-safe. |
| Other response     | If a fetch fails, or HTML is returned for example, result.error will be of type `Error` ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)), usually with a JSON parse error. It has a `message` property. |

In this simple example, the message store is set to the error message or a fallback:

```ts
const { form, enhance, message } = superForm(data.form, {
  onError({ result }) {
    $message = result.error.message || "Unknown error";
  }
});
```

If JSON is returned, the HTTP status code will be taken from its `status` property, instead of the default status `500` for [unexpected errors](https://kit.svelte.dev/docs/errors#unexpected-errors).

You can also set `onError` to the string value `'apply'`, in which case the default SvelteKit error behaviour will be used, which is to render the nearest [+error](https://kit.svelte.dev/docs/routing#error) page, also wiping out the form. To avoid data loss even for non-JavaScript users, returning a [status message](/concepts/messages) instead of throwing an error is recommended.

## Non-submit events 

## onChange

The `onChange` event is not triggered when submitting, but every time `$form` is modified, both as a html event (when modified with `bind:value`) and programmatically (direct assignment to `$form`). 

The event is a discriminated union that you can distinguish between using the `target` property:

```ts
const { form, errors, enhance } = superForm(data.form, {
  onChange(event) {
    if(event.target) {
      // Form input event
      console.log(
        event.path, 'was changed with', event.target, 
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
