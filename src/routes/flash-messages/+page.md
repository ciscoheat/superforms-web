<script lang="ts">
  import Head from '$lib/Head.svelte'
</script>

# Flash messages

<Head title="Integrate Superforms with sveltekit-flash-message" />

[Status messages](/concepts/messages) are useful, but redirects will cause them to be lost, because they need to be returned in `{ form }`, usually as a response from a POST request.

Since it's common to redirect after a successful post, especially in backend interfaces, the `form.message` property isn't a general solution for displaying status messages.

The sister library to Superforms is called [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message), a useful addon that handles temporary messages sent with redirects.

## Usage

The library works together with Superforms **without any extra configuration**, usually you can replace the Superforms [status messages](/concepts/messages) with the flash message, and that will work very well.

### Example

After a successful post, it's standard practice to [Redirect After Post](https://www.theserverside.com/news/1365146/Redirect-After-Post). Not so much today with progressive enhancement, but for non-JS users it's still important to redirect with a GET request, to avoid double-posting. (And of course, if you need to redirect to another route, it's unavoidable.)

So at the end of the form action, use the `redirect` function from `sveltekit-flash-message`. But you may also want to stay on the same page, displaying a toast message if something went wrong with the form submission. This is easily done with the `setFlash` function:

```ts
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, your_adapter(schema));

    if (!form.valid) {
      // Stay on the same page and set a flash message
      setFlash({ type: 'error', message: "Please check your form data." }, cookies);
      return fail(400, { form });
    }

    // TODO: Do something with the validated form.data

    // All ok, redirect with a flash message on another page
    redirect('/posts', { type: 'success', message: "Post created!" }, cookies);
  }
};
```
