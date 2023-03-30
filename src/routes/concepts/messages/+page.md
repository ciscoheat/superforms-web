<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Status messages

So far, almost every feature has been on the client! That's where the action is, but you may have noticed that a status message like "Form posted" is displayed when submitting the forms in the examples.

The validation object contains a `message` property that is used for this.

## Options

```ts
const { form, message } = superForm(data.form);
```

This is for displaying the message on the client, like any other store:

```svelte
{#if $message}
  <div class="error">{$message}</div>
{/if}
```

But first we want to sent it from the server. This is quite easy using the `message` helper function.

## The message helper

```ts
import { message, superValidate } from 'sveltekit-superforms/server';

export const actions = {
  default: async (event) => {
    const form = await superValidate(event, schema);

    if (!form.valid) {
      // Will return fail(400, { form }) since form isn't valid
      return message(form, 'Invalid form');
    }

    if (form.data.email.includes('spam')) {
      // Will also return fail, since status is >= 400
      return message(form, 'No spam please', {
        status: 403
      });
    }

    // Returns { form }
    return message(form, 'Valid form!');
  }
};
```

## Strongly typed message

The `message` is of type `any` as default, but it's recommended that you type it, by passing a generic parameter to `superValidate`:

```ts
const form = await superValidate<typeof schema, string>(event, schema);
```

A string can be a bit limiting though, more realistically there should be a status connected to it, so making a `Message` type can be useful for consistency.

```ts
type Message = { status: 'error' | 'success'; text: string };
```

## Event handling in non-JS settings

Events aren't available unless JavaScript and `use:enhance` is enabled. But you can use the message as a simple event handler in non-JS scenarios. Its existence means that the form was submitted, and you can decorate it with extra metadata.

## Limitations

Naturally, redirects will cause the message to be lost. Since it's common to redirect after a successful post, the `message` property isn't a general solution for displaying status messages.

The library [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message#readme) is a complete solution that works with redirects however. It can be directly integrated into superforms, [documented here](https://github.com/ciscoheat/sveltekit-superforms#sveltekit-flash-message-support).

<Next section={concepts} />
