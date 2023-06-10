# Flash messages

<svelte:head><title>Integrate Superforms with sveltekit-flash-message</title></svelte:head>

[Status messages](/concepts/messages) are useful, but redirects will cause them to be lost, because they need to be returned in `{ form }`, usually as a response from a POST request.

Since it's common to redirect after a successful post, especially in backend interfaces, the `form.message` property isn't a general solution for displaying status messages.

The sister library to Superforms is called [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message), a useful addon that handles temporary messages sent with redirects. Just follow the installation and configuration instructions at its repo.

If you want to integrate the flash message more closely with a form, you can do that by importing it when calling `superForm`:

## Usage

```ts
import * as flashModule from 'sveltekit-flash-message/client';

const { form, errors, enhance } = superForm(data.form, {
  syncFlashMessage: false,
  flashMessage: {
    module: flashModule,
    onError?: ({error, message}) => {
      // Error handling for the flash message
      // - error is the ActionResult
      // - message is the flash store
    }
  }
}
```

Then you have access to the following options:

### syncFlashMessage

If set to `true`, when `form.message` is updated, the flash message will be synchronized with it.

### flashMessage.onError

If there is an error, the `onError` callback can be used to transform thrown errors into your flash message type, or leave it out to disregard them.
