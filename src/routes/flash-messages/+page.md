# Flash messages

<svelte:head><title>Integrate Superforms with sveltekit-flash-message</title></svelte:head>

[Status messages](/concepts/messages) are useful, but redirects will cause them to be lost, because they need to be returned in `{ form }`, usually as a response from a POST request.

Since it's common to redirect after a successful post, especially in backend interfaces, the `form.message` property isn't a general solution for displaying status messages.

The sister library to Superforms is called [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message), a useful addon that handles temporary messages sent with redirects. Follow the installation and configuration instructions at its repo, then you can add it to Superforms, and it will work without any extra calls to `updateFlash`.

## Usage

```ts
import * as flashModule from 'sveltekit-flash-message/client';

const { form, errors, enhance } = superForm(data.form, {
  syncFlashMessage: false,
  flashMessage: {
    module: flashModule,
    onError?: ({error, message}) => {
      // Error handling for the flash message
    }
  }
}
```

### syncFlashMessage

If set to `true`, the flash message will be synchronized with `form.message`.

### flashMessage.onError

The flash message is set automatically for every `ActionResult` except `error`, so the `onError` callback is needed to transform errors into your flash message type, or leave it out to disregard them.
