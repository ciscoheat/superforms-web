<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# Flash messages

<Head title="Integrate Superforms with sveltekit-flash-message" />

[Status messages](/concepts/messages) are useful, but redirects will cause them to be lost, because they need to be returned in `{ form }`, usually as a response from a POST request.

Since it's common to redirect after a successful post, especially in backend interfaces, the `form.message` property isn't a general solution for displaying status messages.

The sister library to Superforms is called [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message), a useful addon that handles temporary messages sent with redirects. Note that at least version 1.0 is required!

## Usage

The library works together with Superforms without any extra configuration, but if you want to integrate the flash message more closely with a form, you can do that by importing its module when calling `superForm`:

```ts
import * as flashModule from 'sveltekit-flash-message/client';

const { form, errors, enhance } = superForm(data.form, {
  flashMessage: {
    module: flashModule,
    onError?: ({result, message}) => {
      // Error handling for the flash message:
      // - result is the ActionResult
      // - message is the flash store (not the status message store)
      const errorMessage = result.error.message
      message.set(/* Your flash message type */);
    }
  },
  syncFlashMessage: false
}
```

Then the following options are available:

### syncFlashMessage

If set to `true`, when `form.message` is updated, the flash message will be synchronized with it, including honoring the [clearOnSubmit](/concepts/submit-behavior#clearonsubmit) option. 

It's important that the flash and form message types are matching, in this case. See [this section](/concepts/messages#strongly-typed-message) on how to make the form message strongly typed.

### flashMessage.onError

If a form error occurs, which happens when `throw error(...)` is thrown in a form action (and use:enhance is added to the form), the `flashMessage.onError` callback can be used to transform it into your flash message type, so you can display the error at the flash message instead of in `form.message`.
