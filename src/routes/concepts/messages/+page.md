<script lang="ts">
	import Form from './Form.svelte'
  import Next from '$lib/Next.svelte'
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte'
  import { concepts } from '$lib/navigation/sections'

	export let data;
</script>

# Status messages

<svelte:head><title>Status messages</title></svelte:head>

So far, almost every feature has been on the client! That's where the action is, but you may have noticed that a status message like "Form posted" is displayed when submitting the forms in the examples.

The validation object contains a `message` property used for this:

## Usage

```ts
const { form, message } = superForm(data.form);
```

It is used to display the message on the client, like any other store:

```svelte
{#if $message}
  <div class="message">{$message}</div>
{/if}
```

First we want to sent it from the server though. This is quite easy using the `message` helper function.

## The message helper

```ts
import { message, superValidate } from 'sveltekit-superforms/server';

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, schema);

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

    // Just returns { form } with the message.
    return message(form, 'Valid form!');
  }
};
```

## Strongly typed message

The `message` is of type `any` as default, but you can type it with type parameters in `superValidate`:

```ts
const form = await superValidate<typeof schema, string>(event, schema);
```

A string can be a bit limiting though, more realistically there will be a status as well, so making a `Message` type can be useful for consistency.

```ts
type Message = { status: 'error' | 'success' | 'warning'; text: string };
```

Though if you want to keep it simple with a string, you can use `$page.status` to style the message appropriately:

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  const { form, message } = superForm(data.form);
</script>

{#if $message}
  <div class:success={$page.status == 200} class:error={$page.status >= 400}>
    {$message}
  </div>
{/if}
```

## Event handling in non-JS settings

[Events](/concepts/events) aren't available unless JavaScript and `use:enhance` are enabled. But you can use the message as a simple event handler in non-JS scenarios. Its existence means that the form was submitted, and you can decorate it with extra metadata.

## Limitations

Naturally, redirects will cause the message to be lost. Since it's common to redirect after a successful post, the `message` property isn't a general solution for displaying status messages.

The library [sveltekit-flash-message](https://github.com/ciscoheat/sveltekit-flash-message#readme) is a complete solution that works with redirects however. It can be directly integrated into superforms, [documented here](/flash-messages).

<Next section={concepts} />
