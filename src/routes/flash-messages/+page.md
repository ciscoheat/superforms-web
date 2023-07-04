# Flash messages

<svelte:head><title>Integrate Superforms with sveltekit-flash-message</title></svelte:head>

[Status messages](/concepts/messages) are useful, but redirects will cause them to be lost, because they need to be returned in `{ form }`, usually as a response from a POST request.

Since it's common to redirect after a successful post, especially in backend interfaces, the `form.message` property isn't a general solution for displaying status messages.

The sister library to Superforms is called [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message), a useful addon that handles temporary messages sent with redirects. Just follow the installation and configuration instructions at its repo. Note that at least version 1.0 is required!

## Usage

If you want to integrate the flash message more closely with a form, you can do that by importing its module when calling `superForm`:

```ts
import * as flashModule from 'sveltekit-flash-message/client';

const { form, errors, enhance } = superForm(data.form, {
  flashMessage: {
    module: flashModule,
    onError?: ({result, message}) => {
      // Error handling for the flash message
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

If set to `true`, when `form.message` is updated, the flash message will be synchronized with it. In this case it's important that the flash and form message types are matching.

### flashMessage.onError

If a form error occurs, which happens when `throw error(...)` is thrown in a form action, which results in an `ActionResult` returned with type `error`, the `flashMessage.onError` callback can be used to transform it into your flash message type, so you can display the error at the flash message instead of in `form.message`.
